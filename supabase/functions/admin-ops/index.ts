import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Cria cliente com as credenciais do caller para verificar identidade
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Não autenticado' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const callerClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user: caller } } = await callerClient.auth.getUser()
  if (!caller) {
    return new Response(JSON.stringify({ error: 'Sessão inválida' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { data: callerProfile } = await callerClient
    .from('users')
    .select('role')
    .eq('id', caller.id)
    .single()

  if (callerProfile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Acesso negado' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Cliente com service role — acesso total, nunca exposto ao browser
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const body = await req.json()
  const { action } = body

  try {
    if (action === 'create') {
      const { username, displayName, email, password, role } = body
      const syntheticEmail = `${username.toLowerCase().trim()}@estudo.internal`

      const { data, error } = await adminClient.auth.admin.createUser({
        email: syntheticEmail,
        password,
        email_confirm: true,
        user_metadata: {
          username: username.trim(),
          display_name: displayName.trim(),
          email: email?.trim() || null,
          role: role ?? 'user',
        },
      })

      if (error) {
        const msg = error.message.includes('already registered')
          ? 'Nome de usuário já existe'
          : error.message
        return new Response(JSON.stringify({ error: msg }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ id: data.user.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'updatePassword') {
      const { userId, password } = body
      const { error } = await adminClient.auth.admin.updateUserById(userId, { password })
      if (error) return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete') {
      const { userId } = body
      // Não pode excluir a si mesmo
      if (userId === caller.id) {
        return new Response(JSON.stringify({ error: 'Não é possível excluir a própria conta' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      // Excluir de auth.users — CASCADE remove public.users e todos os dados via FK
      const { error } = await adminClient.auth.admin.deleteUser(userId)
      if (error) return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Ação desconhecida' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
