-- ── Tipos enumerados ─────────────────────────────────────────────────────────
create type user_role    as enum ('admin', 'user');
create type card_status  as enum ('new', 'learning', 'review', 'mastered');
create type deck_color   as enum ('blue', 'violet', 'emerald', 'amber', 'rose', 'cyan');
create type goal_type    as enum ('cards', 'hours');
create type dino_type    as enum ('t-rex', 'triceratops', 'pterodactyl', 'brachiosaurus');
create type dino_size    as enum ('baby', 'young', 'adult', 'elder');
create type dino_habitat as enum ('volcano', 'forest', 'sky', 'savanna');

-- ── Perfis (espelha auth.users) ───────────────────────────────────────────────
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text not null unique,
  display_name text not null,
  email        text,
  role         user_role not null default 'user',
  created_at   timestamptz not null default now()
);
alter table public.users enable row level security;

create policy "users: self read"
  on public.users for select using (auth.uid() = id);

create policy "users: admin read all"
  on public.users for select
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create policy "users: admin update all"
  on public.users for update
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

-- Insert é exclusivo do trigger (service role via Edge Function)
create policy "users: no client insert"
  on public.users for insert with check (false);

-- ── Trigger: cria perfil ao inserir em auth.users ─────────────────────────────
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, username, display_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'email',
    (new.raw_user_meta_data->>'role')::user_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- ── Helper: checar se caller é admin ─────────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

-- ── RPC pública: resolve email sintético pelo username ────────────────────────
create or replace function public.get_auth_email_by_username(p_username text)
returns text language sql security definer stable as $$
  select au.email
  from auth.users au
  join public.users pu on pu.id = au.id
  where lower(pu.username) = lower(p_username)
  limit 1;
$$;
grant execute on function public.get_auth_email_by_username(text) to anon;

-- ── Decks ─────────────────────────────────────────────────────────────────────
create table public.decks (
  id          text primary key,
  user_id     uuid not null references public.users(id) on delete cascade,
  name        text not null,
  description text,
  color       deck_color not null default 'blue',
  icon        text,
  created_at  timestamptz not null,
  updated_at  timestamptz not null
);
alter table public.decks enable row level security;

create policy "decks: owner crud"
  on public.decks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "decks: admin read all"
  on public.decks for select using (public.is_admin());

create policy "decks: admin delete all"
  on public.decks for delete using (public.is_admin());

create index on public.decks (user_id);

-- ── Cards ─────────────────────────────────────────────────────────────────────
create table public.cards (
  id              text primary key,
  user_id         uuid not null references public.users(id) on delete cascade,
  deck_id         text not null references public.decks(id) on delete cascade,
  front           text not null,
  back            text not null,
  hint            text,
  status          card_status not null default 'new',
  interval_days   integer not null default 0,
  ease_factor     numeric(6,4) not null default 2.5,
  repetitions     integer not null default 0,
  due_date        timestamptz not null,
  last_reviewed   timestamptz,
  total_reviews   integer not null default 0,
  correct_reviews integer not null default 0,
  created_at      timestamptz not null,
  updated_at      timestamptz not null
);
alter table public.cards enable row level security;

create policy "cards: owner crud"
  on public.cards for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "cards: admin read all"
  on public.cards for select using (public.is_admin());

create policy "cards: admin delete all"
  on public.cards for delete using (public.is_admin());

create index on public.cards (user_id);
create index on public.cards (deck_id);
create index on public.cards (user_id, due_date);

-- ── Study Goals (1 linha por usuário) ─────────────────────────────────────────
create table public.study_goals (
  user_id              uuid primary key references public.users(id) on delete cascade,
  goal_type            goal_type not null default 'cards',
  daily_card_target    integer not null default 20,
  daily_minutes_target integer not null default 60,
  current_streak       integer not null default 0,
  longest_streak       integer not null default 0,
  last_study_date      date,
  updated_at           timestamptz not null default now()
);
alter table public.study_goals enable row level security;

create policy "study_goals: owner crud"
  on public.study_goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Daily Stats ───────────────────────────────────────────────────────────────
create table public.daily_stats (
  user_id         uuid not null references public.users(id) on delete cascade,
  date            date not null,
  cards_studied   integer not null default 0,
  cards_correct   integer not null default 0,
  minutes_studied integer not null default 0,
  primary key (user_id, date)
);
alter table public.daily_stats enable row level security;

create policy "daily_stats: owner crud"
  on public.daily_stats for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Pomodoro State (1 linha por usuário) ──────────────────────────────────────
create table public.pomodoro_state (
  user_id                  uuid primary key references public.users(id) on delete cascade,
  focus_duration           integer not null default 25,
  short_break_duration     integer not null default 5,
  long_break_duration      integer not null default 15,
  cycles_before_long_break integer not null default 4,
  cycles_completed_today   integer not null default 0,
  last_cycle_date          date,
  updated_at               timestamptz not null default now()
);
alter table public.pomodoro_state enable row level security;

create policy "pomodoro_state: owner crud"
  on public.pomodoro_state for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Schedule Entries ──────────────────────────────────────────────────────────
create table public.schedule_entries (
  id               text primary key,
  user_id          uuid not null references public.users(id) on delete cascade,
  day_of_week      smallint not null check (day_of_week between 0 and 6),
  start_hour       smallint not null check (start_hour between 0 and 23),
  start_minute     smallint not null check (start_minute in (0, 30)),
  duration_minutes integer not null,
  subject          text not null,
  color            text not null
);
alter table public.schedule_entries enable row level security;

create policy "schedule_entries: owner crud"
  on public.schedule_entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "schedule_entries: admin delete all"
  on public.schedule_entries for delete using (public.is_admin());

create index on public.schedule_entries (user_id);

-- ── Schedule Completions ──────────────────────────────────────────────────────
create table public.schedule_completions (
  user_id  uuid not null references public.users(id) on delete cascade,
  entry_id text not null references public.schedule_entries(id) on delete cascade,
  date     date not null,
  primary key (user_id, entry_id, date)
);
alter table public.schedule_completions enable row level security;

create policy "schedule_completions: owner crud"
  on public.schedule_completions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Dinos ─────────────────────────────────────────────────────────────────────
create table public.dinos (
  id               text primary key,
  user_id          uuid not null references public.users(id) on delete cascade,
  type             dino_type not null,
  size             dino_size not null,
  habitat          dino_habitat not null,
  grown_at         timestamptz not null,
  duration_minutes integer not null
);
alter table public.dinos enable row level security;

create policy "dinos: owner crud"
  on public.dinos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "dinos: admin delete all"
  on public.dinos for delete using (public.is_admin());

create index on public.dinos (user_id);

-- ── Active Sessions (1 linha por usuário) ─────────────────────────────────────
create table public.active_sessions (
  user_id        uuid primary key references public.users(id) on delete cascade,
  deck_id        text not null,
  queue          text[] not null,
  current_index  integer not null default 0,
  started_at     timestamptz not null,
  reviewed_count integer not null default 0,
  correct_count  integer not null default 0,
  updated_at     timestamptz not null default now()
);
alter table public.active_sessions enable row level security;

create policy "active_sessions: owner crud"
  on public.active_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
