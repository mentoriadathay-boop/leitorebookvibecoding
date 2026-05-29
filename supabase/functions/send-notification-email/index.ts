// Edge Function: send-notification-email
//
// Secrets necessários (Supabase Dashboard → Edge Functions → Secrets):
//   RESEND_API_KEY    → sua chave da API do Resend (resend.com)
//   FROM_EMAIL        → ex: "Hub Vibe Coding <noreply@seudominio.com>"
//
// O domínio remetente precisa estar verificado no Resend.
// Durante testes, você pode usar o domínio sandbox do Resend: onboarding@resend.dev

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Hub Vibe Coding <noreply@hubvibecoding.com>'

const TYPE_LABEL: Record<string, string> = {
  feature: '🌟 Novidade na plataforma',
  update:  '🔄 Atualização',
  news:    '📰 Notícia',
  alert:   '⚠️ Aviso importante',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', service: 'send-notification-email' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { notification_id, title, body: notifBody, type } = body

  if (!notification_id || !title) {
    return new Response(JSON.stringify({ error: 'notification_id and title are required' }), { status: 400 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Busca todos os usuários ativos com email
  const [{ data: authData, error: authErr }, { data: profiles }] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabase.from('profiles').select('id, display_name').neq('status', 'blocked'),
  ])

  if (authErr) {
    return new Response(JSON.stringify({ error: authErr.message }), { status: 500 })
  }

  const activeIds = new Set((profiles || []).map((p: { id: string }) => p.id))
  const profileMap = Object.fromEntries(
    (profiles || []).map((p: { id: string; display_name: string }) => [p.id, p])
  )

  const recipients = (authData?.users || []).filter(u => activeIds.has(u.id) && u.email)

  if (recipients.length === 0) {
    return new Response(JSON.stringify({ message: 'Nenhum destinatário encontrado', sent: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  console.log(`[send-notification-email] Enviando para ${recipients.length} usuários`)

  const typeLabel = TYPE_LABEL[type] || '🔔 Novidade'
  let sent = 0
  let errors = 0

  for (const user of recipients) {
    const name = profileMap[user.id]?.display_name || user.email!.split('@')[0] || 'Olá'

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;">
        <!-- Header -->
        <tr>
          <td style="background:#0F4A28;padding:28px 32px;text-align:center;">
            <p style="margin:0;color:#C9A84C;font-size:22px;font-weight:bold;letter-spacing:0.02em;">Hub Vibe Coding</p>
            <p style="margin:6px 0 0;color:#ffffff99;font-size:12px;">TFA Soluções com IA</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 24px;">
            <p style="margin:0 0 20px;color:#555;font-size:15px;">Olá, <strong style="color:#111;">${name}</strong>!</p>
            <div style="background:#E8F5EE;border-left:4px solid #1B6B3A;padding:20px 24px;border-radius:8px;margin-bottom:28px;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#1B6B3A;text-transform:uppercase;letter-spacing:0.06em;">${typeLabel}</p>
              <h2 style="margin:0 0 ${notifBody ? '12px' : '0'};font-size:18px;color:#111;line-height:1.4;">${title}</h2>
              ${notifBody ? `<p style="margin:0;font-size:14px;color:#555;line-height:1.7;">${notifBody}</p>` : ''}
            </div>
            <a href="https://hubvibecoding.vercel.app" style="display:inline-block;background:#0F4A28;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.02em;">
              Acessar a plataforma →
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0;font-size:11px;color:#aaa;">Hub Vibe Coding · TFA Soluções com IA</p>
            <p style="margin:4px 0 0;font-size:10px;color:#ccc;">Você está recebendo este email por ser aluno da plataforma.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: user.email,
          subject: `${title} — Hub Vibe Coding`,
          html,
        }),
      })

      if (res.ok) {
        sent++
      } else {
        const err = await res.json().catch(() => ({}))
        console.error(`Erro ao enviar para ${user.email}:`, err)
        errors++
      }
    } catch (e) {
      console.error(`Exceção ao enviar para ${user.email}:`, e)
      errors++
    }
  }

  // Marca email_sent = true na notificação
  await supabase
    .from('platform_notifications')
    .update({ email_sent: true })
    .eq('id', notification_id)

  console.log(`[send-notification-email] Resultado: ${sent} enviados, ${errors} erros`)

  return new Response(
    JSON.stringify({ sent, errors, total: recipients.length }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
