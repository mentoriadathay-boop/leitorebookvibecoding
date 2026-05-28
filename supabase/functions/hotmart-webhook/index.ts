import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Eventos que ATIVAM o acesso ───────────────────────────────────
const APPROVE_EVENTS = ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']

// ── Eventos que BLOQUEIAM o acesso ───────────────────────────────
const BLOCK_EVENTS = [
  'PURCHASE_REFUNDED',
  'PURCHASE_CANCELED',
  'PURCHASE_CHARGEBACK',
  'PURCHASE_PROTEST',
  'SUBSCRIPTION_CANCELLATION',
]

// ── Detecta o plano a partir do payload da Hotmart ────────────────
function detectPlan(data: Record<string, unknown>): 'monthly' | 'annual' | 'lifetime' {
  const sub = (data?.subscription as Record<string, unknown> | undefined)
  const planName = ((sub?.plan as Record<string, unknown>)?.name as string || '').toLowerCase()

  if (planName.includes('vitalíc') || planName.includes('vitalic') || planName.includes('lifetime')) return 'lifetime'
  if (planName.includes('anual') || planName.includes('annual') || planName.includes('ano')) return 'annual'
  if (planName.includes('mensal') || planName.includes('monthly') || planName.includes('mês')) return 'monthly'

  // Sem assinatura = compra única (ebook) → vitalício
  if (!sub) return 'lifetime'

  // Fallback por preço
  const purchase = data?.purchase as Record<string, unknown> | undefined
  const price = (purchase?.full_price as Record<string, unknown>)?.value as number || 0
  if (price >= 400) return 'lifetime'
  if (price >= 150) return 'annual'
  return 'monthly'
}

function calcExpiry(plan: string): string | null {
  if (plan === 'lifetime') return null
  const d = new Date()
  if (plan === 'annual') d.setFullYear(d.getFullYear() + 1)
  if (plan === 'monthly') d.setMonth(d.getMonth() + 1)
  return d.toISOString()
}

// ── Handler principal ─────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // Health check
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', service: 'hotmart-webhook' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // ── Validação do token Hotmart ──────────────────────────────────
  const hottok = req.headers.get('X-Hotmart-Hottok')
  const expectedToken = Deno.env.get('HOTMART_TOKEN')

  if (!expectedToken || hottok !== expectedToken) {
    console.error('[hotmart-webhook] Token inválido:', hottok)
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // ── Parse do payload ───────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const event = body.event as string
  const data = body.data as Record<string, unknown>
  const buyer = data?.buyer as Record<string, unknown> | undefined
  const email = (buyer?.email as string || '').toLowerCase().trim()
  const buyerName = (buyer?.name as string) || (buyer?.first_name as string) || email

  console.log(`[hotmart-webhook] Evento: ${event} | Email: ${email}`)

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email não encontrado no payload' }), { status: 400 })
  }

  // ── Cliente Supabase com service role ─────────────────────────
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // ── BLOQUEAR USUÁRIO ──────────────────────────────────────────
  if (BLOCK_EVENTS.includes(event)) {
    const { data: { users } } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const user = users?.find((u) => u.email?.toLowerCase() === email)

    if (user) {
      await supabase.from('profiles').update({ status: 'blocked' }).eq('id', user.id)
      console.log(`[hotmart-webhook] Usuário bloqueado: ${email}`)
      return new Response(JSON.stringify({ ok: true, action: 'blocked', email }), { status: 200 })
    }

    console.log(`[hotmart-webhook] Usuário não encontrado para bloquear: ${email}`)
    return new Response(JSON.stringify({ ok: true, action: 'user_not_found', email }), { status: 200 })
  }

  // ── ATIVAR / CRIAR USUÁRIO ────────────────────────────────────
  if (APPROVE_EVENTS.includes(event)) {
    const planType = detectPlan(data)
    const planStartedAt = new Date().toISOString()
    const planExpiresAt = calcExpiry(planType)

    // Tenta criar via convite (envia email automaticamente ao comprador)
    const { data: invited, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { display_name: buyerName },
      redirectTo: 'https://leitorebookvibecoding.vercel.app',
    })

    let userId: string | null = invited?.user?.id || null

    if (inviteError) {
      // Usuário já existe → busca e atualiza
      console.log(`[hotmart-webhook] Invite falhou (${inviteError.message}), buscando usuário existente...`)
      const { data: { users } } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
      const existing = users?.find((u) => u.email?.toLowerCase() === email)
      if (existing) {
        userId = existing.id
        console.log(`[hotmart-webhook] Usuário existente encontrado: ${email}`)
      } else {
        console.error(`[hotmart-webhook] Erro ao criar usuário: ${inviteError.message}`)
        return new Response(JSON.stringify({ error: inviteError.message }), { status: 500 })
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId não resolvido' }), { status: 500 })
    }

    // Atualiza ou cria o profile com plano e status
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: buyerName,
      plan_type: planType,
      plan_started_at: planStartedAt,
      plan_expires_at: planExpiresAt,
      status: 'active',
    })

    if (profileError) {
      console.error(`[hotmart-webhook] Erro ao salvar profile: ${profileError.message}`)
      return new Response(JSON.stringify({ error: profileError.message }), { status: 500 })
    }

    const action = inviteError ? 'plan_updated' : 'user_created'
    console.log(`[hotmart-webhook] ${action}: ${email} | plano: ${planType}`)

    return new Response(
      JSON.stringify({ ok: true, action, email, plan: planType }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // Evento desconhecido — retorna 200 para não gerar reenvio pela Hotmart
  console.log(`[hotmart-webhook] Evento ignorado: ${event}`)
  return new Response(JSON.stringify({ ok: true, action: 'ignored', event }), { status: 200 })
})
