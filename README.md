# Estudo Concurso

SPA de flashcards com algoritmo de repetição espaçada (SM-2) para preparação de concursos públicos.

![Stack](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)
![Tests](https://img.shields.io/badge/testes-115%20passando-22c55e?style=flat-square)

---

## Funcionalidades

- **Flashcards com SRS** — algoritmo SM-2 calibrado com status: novo → aprendizado → revisão
- **Decks por matéria** — organize cartões com cores, ícones e estatísticas individuais
- **Multi-usuário** — dados isolados por namespace, sessão persistida localmente
- **Pomodoro integrado** — timer focado com ciclos configuráveis e contagem diária
- **Cronograma de estudos** — planeje sessões e marque conclusões
- **Sistema de dinossauros** — evolução visual conforme o progresso na sessão de foco
- **Streak e metas** — acompanhamento de sequência diária e meta de cartões/minutos

---

## Stack

| Camada | Tecnologia |
|---|---|
| UI | React 18 + TypeScript strict |
| Build | Vite 5 |
| Estado | Zustand |
| Estilos | Tailwind CSS |
| Animações | Framer Motion |
| Ícones | Lucide React |
| Testes | Vitest + Testing Library |

---

## Estrutura

```
src/
├── components/       # UI por feature (cards, decks, flashcard, focus, layout, pomodoro, schedule, ui)
├── pages/            # Home, Study, Manage, Focus, Schedule, Login, Admin
├── store/            # Estado global Zustand (deck, study, auth, pomodoro, focus, schedule)
├── lib/              # Domínio: srs.ts, storage.ts, streak.ts, utils.ts
├── data/             # Dados de exemplo (petrobras.ts, seed.ts)
├── types/            # Tipos compartilhados
└── constants/        # Constantes do algoritmo SRS
```

---

## Como rodar

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
npm run dev

# Rodar testes (115 testes)
npm test

# Build de produção
npm run build

# Lint
npm run lint
```

---

## Algoritmo SRS

O núcleo do sistema está em `src/lib/srs.ts`. Implementa o SM-2 com três ratings:

| Rating | Efeito |
|---|---|
| `again` | Reinicia intervalo, reduz ease factor |
| `hard` | Aumenta intervalo com penalidade |
| `correct` | Progressão normal pelo SM-2 |

Cartões passam pelos status `new → learning → review` conforme o desempenho.

---

## Persistência

Todos os dados ficam no `localStorage` com namespace por usuário (`chave_userId`), sem dependência de backend. O módulo `src/lib/storage.ts` centraliza todas as operações de leitura e escrita.
