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

  try {
  let force = false
  try {
    const body = await req.json()
    force = body?.force === true
  } catch { /* corpo vazio é ok */ }

  // Data em horário de Brasília (UTC-3)
  const now = new Date()
  const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  const today = brasiliaTime.toISOString().split('T')[0]

  console.log(`[vibe-news-cron] Iniciando para data: ${today}${force ? ' (force)' : ''}`)

  // Evita duplicar se já rodou hoje — a menos que seja um regeneração forçada
  const { data: existing } = await supabase
    .from('vibe_news')
    .select('id')
    .eq('date', today)
    .single()

  if (existing && !force) {
    console.log('[vibe-news-cron] Notícias já geradas hoje.')
    return json({ message: 'Já gerado hoje', date: today })
  }

  if (existing && force) {
    console.log('[vibe-news-cron] Regenerando edição de hoje (force=true).')
    await supabase.from('vibe_news').delete().eq('id', existing.id)
  }

  // Busca as últimas edições para evitar repetir os mesmos temas/ferramentas
  const { data: recentEditions } = await supabase
    .from('vibe_news')
    .select('date, articles')
    .order('date', { ascending: false })
    .limit(10)

  const recentTopics = (recentEditions || [])
    .flatMap((e: { articles?: { title?: string; source?: string }[] }) => e.articles || [])
    .map((a) => `${a.title} (${a.source})`)
    .slice(0, 60)

  const recentTopicsBlock = recentTopics.length
    ? `\n\nTEMAS JÁ COBERTOS NOS ÚLTIMOS DIAS — NÃO REPITA ESTAS MESMAS NOTÍCIAS, busque ângulos e fatos NOVOS e mais recentes:\n${recentTopics.map(t => `- ${t}`).join('\n')}\n`
    : ''

  // Chama Claude para gerar as notícias
  const prompt = `Você é o curador oficial da Vibe News — o boletim diário de tecnologia da plataforma Hub Vibe Coding, voltado para brasileiros que criam SaaS e apps com IA (vibe coding).

Hoje é ${today}. Use a ferramenta web_search para pesquisar as notícias REAIS e MAIS RECENTES antes de escrever qualquer coisa. Faça várias buscas diferentes (pelo menos 5) cobrindo temas distintos — nunca escreva um artigo sem antes ter encontrado a fonte real pela busca.

TEMAS PRINCIPAIS (cobrir obrigatoriamente, buscando notícias recentes e específicas de cada um):
1. Vibe Coding: novidades de Cursor, Windsurf, Lovable, Bolt.new, v0.dev, Replit, Trae, Firebase Studio, Framer e outras ferramentas de desenvolvimento com IA
2. Modelos de IA: lançamentos, benchmarks, atualizações e comparativos de Claude, GPT, Gemini, Llama, Mistral, Grok e outros
3. Infraestrutura & Backend: Supabase, Neon, Vercel, Railway, Fly.io — novidades relevantes
4. Negócios com IA: cases de indie hackers, MRR, crescimento, estratégias de monetização com IA
5. Mercado: investimentos, aquisições, tendências de SaaS com IA, oportunidades para criadores
${recentTopicsBlock}
RESUMO DO DIA:
Escreva um resumo jornalístico rico com 5 a 6 parágrafos longos e detalhados, baseado apenas no que você encontrou nas buscas de hoje. Cada parágrafo deve:
- Ter no mínimo 4-5 frases completas
- Conectar as notícias do dia em uma narrativa fluida e contextualizada
- Explicar o impacto prático para quem está criando seu SaaS com IA agora
- Mencionar números, comparações, tendências e implicações de mercado
- Usar linguagem profissional mas acessível, com energia e entusiasmo

ARTIGOS:
Crie 8 artigos específicos e informativos, cada um baseado em uma notícia real encontrada na busca. Cada um deve ter um resumo de 3-4 linhas com impacto real.

Retorne APENAS JSON válido, sem markdown, sem texto fora do JSON:
{
  "summary": "Resumo narrativo extenso em 5-6 parágrafos longos e detalhados em português brasileiro, conectando as principais notícias do dia com contexto, números e impacto prático para criadores de SaaS com IA",
  "articles": [
    {
      "title": "Título da notícia em português",
      "source": "Nome real da fonte (TechCrunch, Anthropic Blog, OpenAI Blog, The Verge, VentureBeat, Product Hunt, GitHub Blog, etc.)",
      "url": "URL EXATA retornada pela ferramenta web_search para esta notícia — copie o link literalmente, sem alterar nenhum caractere",
      "summary": "Resumo em 3-4 linhas em português explicando o que mudou, por que importa e qual o impacto prático para criadores de SaaS e apps com IA",
      "category": "ferramenta"
    }
  ]
}

Categorias disponíveis: ferramenta | modelo | tendencia | case | mercado
Inclua exatamente 8 artigos variados entre as 5 categorias, todos sobre notícias diferentes entre si.

REGRA CRÍTICA SOBRE URLs: NUNCA invente, complete ou "adivinhe" uma URL. Use exclusivamente URLs que vieram literalmente dos resultados da ferramenta web_search. Se não tiver certeza absoluta da URL exata de um resultado de busca, deixe o campo "url" como string vazia "" — nesse caso o app vai gerar automaticamente um link de busca seguro. Um campo "url" vazio é sempre preferível a uma URL inventada.`

  // Tenta primeiro com web_search para URLs reais
  let anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'web-search-2025-03-05',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      temperature: 1,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 8 }],
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  // Fallback sem web_search se beta não disponível
  if (!anthropicRes.ok || anthropicRes.status === 400) {
    console.log('[vibe-news-cron] web_search indisponível, usando fallback sem busca')
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        temperature: 1,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
  }

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

  // Coleta as URLs reais retornadas pela ferramenta web_search para validar
  // as URLs que a IA colocou no JSON — nunca confiamos cegamente no texto gerado.
  const realUrls = new Set<string>()
  for (const block of anthropicData.content || []) {
    if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
      for (const result of block.content) {
        if (result?.url) realUrls.add(String(result.url).replace(/\/$/, ''))
      }
    }
  }

  function googleFallback(title: string) {
    return `https://www.google.com/search?q=${encodeURIComponent(title)}+site:techcrunch.com+OR+site:theverge.com+OR+site:anthropic.com+OR+site:openai.com`
  }

  let newsData: { summary: string; articles: { title: string; source?: string; url?: string; summary?: string; category?: string }[] }
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

  // Valida cada URL contra os resultados reais da busca; se não bater com nenhum
  // resultado real (ou não tiver sido preenchida), cai para um link de busca —
  // isso garante que nenhum artigo aponte para uma URL inventada/quebrada.
  const seen = new Set<string>()
  const sanitizedArticles = newsData.articles
    .filter((a) => a?.title)
    .map((a) => {
      const cleanUrl = (a.url || '').trim().replace(/\/$/, '')
      const verified = cleanUrl && realUrls.has(cleanUrl)
      return { ...a, url: verified ? cleanUrl : googleFallback(a.title) }
    })
    .filter((a) => {
      const key = a.url || a.title
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

  const { error: insertError } = await supabase.from('vibe_news').insert({
    date: today,
    summary: newsData.summary,
    articles: sanitizedArticles,
  })

  if (insertError) {
    console.error('[vibe-news-cron] Erro ao salvar:', insertError.message)
    return json({ error: insertError.message }, 500)
  }

  console.log(`[vibe-news-cron] Sucesso: ${sanitizedArticles.length} artigos para ${today}`)
  return json({ success: true, date: today, articles: sanitizedArticles.length })
  } catch (err) {
    console.error('[vibe-news-cron] Erro inesperado:', err instanceof Error ? err.stack : err)
    return json({
      error: 'Erro inesperado',
      detail: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? (err.stack || '').slice(0, 800) : undefined,
    }, 500)
  }
})
