import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

Deno.serve(async (req: Request) => {
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', service: 'vibe-news-cron' }), {
      headers: { 'Content-Type': 'application/json' },
    })
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
    return new Response(JSON.stringify({ message: 'Já gerado hoje', date: today }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── Chamar Claude (sem web_search para máxima compatibilidade) ──────
  const prompt = `Você é um curador de conteúdo tech para brasileiros que criam SaaS e apps com IA (vibe coding).

Hoje é ${today}. Com base no seu conhecimento atualizado sobre o ecossistema de IA, vibe coding e desenvolvimento de software, crie uma curadoria de notícias relevantes cobrindo:
- Novidades de ferramentas de vibe coding (Cursor, Windsurf, Lovable, Bolt, v0, Replit, etc.)
- Lançamentos e atualizações de modelos de IA (Claude, GPT, Gemini, Llama, etc.)
- Tendências de SaaS, no-code e automação com IA
- Cases e estratégias de negócios digitais com IA
- Mercado e oportunidades para criadores de produtos digitais

Crie artigos plausíveis e informativos baseados em tendências reais do mercado. Seja específico com nomes de ferramentas, números e impactos práticos.

Retorne APENAS JSON válido, sem markdown, sem texto extra:
{
  "summary": "Resumo narrativo do dia em 3-4 parágrafos em português, envolvente e útil para quem cria SaaS",
  "articles": [
    {
      "title": "Título da notícia em português",
      "source": "Nome da fonte (ex: TechCrunch, Anthropic Blog, Product Hunt)",
      "url": "https://exemplo.com/noticia",
      "summary": "Resumo em 2-3 linhas explicando o impacto prático para criadores de SaaS",
      "category": "ferramenta"
    }
  ]
}

Categorias disponíveis: ferramenta | modelo | tendencia | case | mercado
Inclua exatamente 6 artigos.`

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
    console.error('[vibe-news-cron] Erro na API Anthropic:', err)
    return new Response(
      JSON.stringify({ error: 'Erro na API Anthropic', detail: err.slice(0, 300) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const anthropicData = await anthropicRes.json()
  console.log('[vibe-news-cron] Resposta recebida:', anthropicData.stop_reason)

  const textContent = anthropicData.content
    ?.filter((c: { type: string }) => c.type === 'text')
    ?.map((c: { text?: string }) => c.text || '')
    ?.join('') || ''

  if (!textContent) {
    console.error('[vibe-news-cron] Sem texto na resposta:', JSON.stringify(anthropicData.content))
    return new Response(
      JSON.stringify({ error: 'Sem conteúdo de texto na resposta' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Parse JSON — tenta extrair de qualquer posição
  let newsData: { summary: string; articles: unknown[] }
  try {
    const cleaned = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    newsData = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned)
  } catch (e) {
    console.error('[vibe-news-cron] JSON inválido:', textContent.slice(0, 300))
    return new Response(
      JSON.stringify({ error: 'JSON inválido na resposta', preview: textContent.slice(0, 200) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!newsData.summary || !Array.isArray(newsData.articles) || newsData.articles.length === 0) {
    console.error('[vibe-news-cron] Estrutura inválida:', JSON.stringify(newsData).slice(0, 200))
    return new Response(
      JSON.stringify({ error: 'Estrutura inválida', preview: JSON.stringify(newsData).slice(0, 200) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Salva no Supabase
  const { error: insertError } = await supabase.from('vibe_news').insert({
    date: today,
    summary: newsData.summary,
    articles: newsData.articles,
  })

  if (insertError) {
    console.error('[vibe-news-cron] Erro ao salvar:', insertError.message)
    return new Response(
      JSON.stringify({ error: insertError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  console.log(`[vibe-news-cron] Salvo com sucesso: ${newsData.articles.length} artigos para ${today}`)
  return new Response(
    JSON.stringify({ success: true, date: today, articles: newsData.articles.length }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
