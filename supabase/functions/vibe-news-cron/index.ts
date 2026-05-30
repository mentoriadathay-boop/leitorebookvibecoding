import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Health check
  if (req.method === 'GET') {
    return json({ status: 'ok', service: 'vibe-news-cron' })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Data em horário de Brasília (UTC-3)
  const now = new Date()
  const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000)
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
    return json({ message: 'Já gerado hoje', date: today })
  }

  // Chama Claude para gerar as notícias
  const prompt = `Você é um curador de conteúdo tech para brasileiros que criam SaaS e apps com IA (vibe coding).

Hoje é ${today}. Crie uma curadoria de notícias relevantes cobrindo:
- Novidades de ferramentas de vibe coding (Cursor, Windsurf, Lovable, Bolt, v0, Replit, Trae, etc.)
- Lançamentos e atualizações de modelos de IA (Claude, GPT, Gemini, Llama, etc.)
- Tendências de SaaS, no-code e automação com IA
- Cases e estratégias de negócios digitais com IA
- Mercado e oportunidades para criadores de produtos digitais

Crie artigos informativos e plausíveis baseados em tendências reais do mercado de IA. Seja específico com nomes de ferramentas, funcionalidades e impactos práticos.

Retorne APENAS JSON válido, sem markdown, sem texto fora do JSON:
{
  "summary": "Resumo narrativo do dia em 3-4 parágrafos em português brasileiro, envolvente e útil para quem cria SaaS com IA",
  "articles": [
    {
      "title": "Título da notícia em português",
      "source": "Nome da fonte (ex: TechCrunch, Anthropic Blog, Product Hunt, The Verge)",
      "url": "https://exemplo.com/noticia",
      "summary": "Resumo em 2-3 linhas em português explicando o impacto prático para criadores de SaaS",
      "category": "ferramenta"
    }
  ]
}

Categorias: ferramenta | modelo | tendencia | case | mercado
Inclua exatamente 6 artigos variados entre as categorias.`

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text()
    console.error('[vibe-news-cron] Erro Anthropic:', err)
    return json({ error: 'Erro na API Anthropic', detail: err.slice(0, 300) }, 500)
  }

  const anthropicData = await anthropicRes.json()
  const textContent: string = anthropicData.content
    ?.filter((c: { type: string }) => c.type === 'text')
    ?.map((c: { text?: string }) => c.text || '')
    ?.join('') || ''

  if (!textContent) {
    return json({ error: 'Sem conteúdo de texto na resposta da Claude' }, 500)
  }

  let newsData: { summary: string; articles: unknown[] }
  try {
    const cleaned = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    newsData = JSON.parse(match ? match[0] : cleaned)
  } catch {
    console.error('[vibe-news-cron] JSON inválido:', textContent.slice(0, 300))
    return json({ error: 'JSON inválido na resposta', preview: textContent.slice(0, 200) }, 500)
  }

  if (!newsData.summary || !Array.isArray(newsData.articles) || newsData.articles.length === 0) {
    return json({ error: 'Estrutura inválida', preview: JSON.stringify(newsData).slice(0, 200) }, 500)
  }

  const { error: insertError } = await supabase.from('vibe_news').insert({
    date: today,
    summary: newsData.summary,
    articles: newsData.articles,
  })

  if (insertError) {
    console.error('[vibe-news-cron] Erro ao salvar:', insertError.message)
    return json({ error: insertError.message }, 500)
  }

  console.log(`[vibe-news-cron] Sucesso: ${newsData.articles.length} artigos para ${today}`)
  return json({ success: true, date: today, articles: newsData.articles.length })
})
