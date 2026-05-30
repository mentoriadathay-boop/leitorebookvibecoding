import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Hub Vibe Coding <noreply@hubvibecoding.com>'

Deno.serve(async (req: Request) => {
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', service: 'send-newsletter' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const { email_id } = await req.json()
  if (!email_id) {
    return new Response(JSON.stringify({ error: 'email_id obrigatório' }), { status: 400 })
  }

  // Busca o email a ser enviado
  const { data: emailData, error: emailError } = await supabase
    .from('email_marketing')
    .select('*')
    .eq('id', email_id)
    .eq('published', true)
    .single()

  if (emailError || !emailData) {
    return new Response(JSON.stringify({ error: 'Email não encontrado ou não publicado' }), { status: 404 })
  }

  // Busca todos os usuários não bloqueados via auth.users + profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, status')
    .neq('status', 'blocked')

  if (!profiles || profiles.length === 0) {
    return new Response(JSON.stringify({ error: 'Nenhum usuário encontrado' }), { status: 404 })
  }

  // Busca emails dos usuários
  const userIds = profiles.map(p => p.id)
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const emailMap: Record<string, string> = {}
  authUsers?.users?.forEach(u => {
    if (u.email && userIds.includes(u.id)) {
      emailMap[u.id] = u.email
    }
  })

  const recipients = profiles
    .filter(p => emailMap[p.id])
    .map(p => ({ id: p.id, email: emailMap[p.id], name: p.display_name || '' }))

  if (recipients.length === 0) {
    return new Response(JSON.stringify({ error: 'Nenhum destinatário com email válido' }), { status: 404 })
  }

  // Monta o HTML do email
  const htmlBody = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${emailData.subject}</title>
  <style>
    body { margin: 0; padding: 0; background: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 620px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    .header { background: #0F4A28; padding: 28px 32px; }
    .header-title { color: #C9A84C; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; margin: 0 0 4px; }
    .header-brand { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; }
    .body { padding: 32px; color: #1f2937; font-size: 15px; line-height: 1.7; }
    .body h1 { font-size: 26px; font-weight: 700; color: #0F4A28; margin: 0 0 16px; }
    .body h2 { font-size: 20px; font-weight: 700; color: #0F4A28; margin: 24px 0 12px; }
    .body h3 { font-size: 17px; font-weight: 600; color: #1B6B3A; margin: 20px 0 8px; }
    .body p { margin: 0 0 14px; }
    .body ul, .body ol { padding-left: 20px; margin: 0 0 14px; }
    .body li { margin: 6px 0; }
    .body blockquote { border-left: 4px solid #C9A84C; padding: 8px 16px; margin: 16px 0; background: #fdf6e3; border-radius: 0 8px 8px 0; color: #374151; font-style: italic; }
    .body a { color: #1B6B3A; font-weight: 600; }
    .body img { max-width: 100%; border-radius: 10px; margin: 16px 0; display: block; }
    .body hr { border: none; border-top: 2px solid #e5e7eb; margin: 24px 0; }
    .body code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: .88em; font-family: monospace; }
    .footer { background: #f3f4f6; padding: 20px 32px; text-align: center; }
    .footer p { margin: 0; font-size: 12px; color: #9ca3af; }
    .footer a { color: #1B6B3A; }
    .btn { display: inline-block; background: #0F4A28; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; text-decoration: none; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <p class="header-title">Newsletter</p>
      <p class="header-brand">Hub Vibe Coding</p>
    </div>
    <div class="body">
      ${emailData.body}
      <p style="margin-top:28px;">
        <a href="https://hubvibecoding.vercel.app" class="btn">Acessar a plataforma →</a>
      </p>
    </div>
    <div class="footer">
      <p>Você recebeu este email por ser aluno do Hub Vibe Coding.<br/>
      <a href="https://hubvibecoding.vercel.app">hubvibecoding.vercel.app</a> · <a href="https://thayanefidelis.com">thayanefidelis.com</a></p>
    </div>
  </div>
</body>
</html>`

  // Envia via Resend (em lotes de 50)
  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (const recipient of recipients) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: recipient.email,
          subject: emailData.subject,
          html: htmlBody,
        }),
      })
      if (res.ok) sent++
      else { failed++; errors.push(`${recipient.email}: ${res.status}`) }
    } catch (e) {
      failed++
      errors.push(`${recipient.email}: ${e}`)
    }
  }

  // Marca o email como enviado
  if (sent > 0) {
    await supabase
      .from('email_marketing')
      .update({ sent: true, sent_at: new Date().toISOString(), sent_count: sent })
      .eq('id', email_id)
  }

  return new Response(
    JSON.stringify({ success: true, sent, failed, total: recipients.length, errors: errors.slice(0, 5) }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
