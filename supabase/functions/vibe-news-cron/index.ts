import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

Deno.serve(async (req: Request) => {
  // Health check
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', service: 'vibe-news-cron' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Brasília = UTC-3
  const now = new Date()
  const brasiliaOffset = -3 * 60
  const brasiliaTime = new Date(now.getTime() + (brasiliaOffset + now.getTimezoneOffset()) * 60000)
  const today = brasiliaTime.toISOString().split('T')[0]

  console.log(`[vibe-news-cron] Iniciando para data: ${today}`)

  // Evita duplicar se já rodou hoje
  const { data: existing } = await supabase
    .from('vibe_news')
    .select('id')
    .eq('date', today)
    .single()

  if (existing) {
    console.log('[vibe-news-cron] Notícias já geradas hoje.')
    return new Response(JSON.stringify({ message: 'Já gerado hoje', date: today }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── Chamar Claude com web_search ────────────────────────────────
  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'web-search-2025-02-03',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [
        {
          role: 'user',
          content: `Você é curador de notícias tech para brasileiros que criam apps com IA.

Hoje é ${today}. Pesquise as notícias mais relevantes das últimas 24h sobre:
- Vibe coding e desenvolvimento de apps com IA
- Ferramentas de IA para criação de software (Cursor, Windsurf, Claude, GPT, Gemini, Lovable, Bolt etc)
- Lançamentos de modelos de IA
- Tendências de SaaS e no-code/low-code com IA
- Cases de pessoas criando negócios com IA no Brasil e no mundo

Retorne SOMENTE um JSON válido neste formato exato, sem texto antes ou depois, sem markdown:
{
  "summary": "Resumo geral do dia em 3-4 parágrafos em português, narrativo, envolvente e útil para quem está criando seu SaaS",
  "articles": [
    {
      "title": "Título da notícia em português",
      "source": "Nome da fonte",
      "url": "URL original completa",
      "summary": "Resumo em 2-3 linhas em português explicando o impacto prático",
      "category": "ferramenta|modelo|tendencia|case|mercado"
    }
  ]
}

Inclua entre 5 e 8 artigos. Priorize fontes como TechCrunch, The Verge, Wired, VentureBeat, Product Hunt, GitHub Blog, Anthropic Blog, OpenAI Blog, X/Twitter de líderes tech.`,
        },
      ],
    }),
  })

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text()
    console.error('[vibe-news-cron] Erro na API Anthropic:', err)
    return new Response(JSON.stringify({ error: 'Anthropic API error', detail: err }), { status: 500 })
  }

  const anthropicData = await anthropicRes.json()
  console.log('[vibe-news-cron] Resposta recebida da Claude')

  // ── Extrai o texto da resposta (ignora tool_use blocks) ─────────
  const textContent = (anthropicData.content as Array<{ type: string; text?: string }>)
    .filter((c) => c.type === 'text')
    .map((c) => c.text || '')
    .join('')

  if (!textContent) {
    console.error('[vibe-news-cron] Nenhum texto na resposta:', JSON.stringify(anthropicData.content))
    return new Response(JSON.stringify({ error: 'Sem conteúdo de texto na resposta' }), { status: 500 })
  }

  // ── Parse do JSON gerado pela Claude ───────────────────────────
  let newsData: { summary: string; articles: unknown[] }
  try {
    const clean = textContent.replace(/```json|```/g, '').trim()
    newsData = JSON.parse(clean)
  } catch (e) {
    console.error('[vibe-news-cron] Erro ao parsear JSON:', textContent.slice(0, 500))
    return new Response(JSON.stringify({ error: 'JSON inválido na resposta', raw: textContent.slice(0, 500) }), { status: 500 })
  }

  if (!newsData.summary || !Array.isArray(newsData.articles)) {
    return new Response(JSON.stringify({ error: 'Estrutura de dados inválida' }), { status: 500 })
  }

  // ── Salva no Supabase ───────────────────────────────────────────
  const { error: insertError } = await supabase.from('vibe_news').insert({
    date: today,
    summary: newsData.summary,
    articles: newsData.articles,
  })

  if (insertError) {
    console.error('[vibe-news-cron] Erro ao salvar:', insertError.message)
    return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
  }

  console.log(`[vibe-news-cron] Salvo com sucesso: ${newsData.articles.length} artigos`)

  return new Response(
    JSON.stringify({ success: true, date: today, articles: newsData.articles.length }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
