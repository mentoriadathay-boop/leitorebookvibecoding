import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const GEMINI_MODEL = 'gemini-2.5-flash'

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

  // Qualquer usuário autenticado da plataforma pode gerar — não é mais
  // exclusivo de admin. Só exige estar logado (ou ser o cron automático,
  // que usa a service role key).
  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const isServiceRole = token === SUPABASE_SERVICE_ROLE_KEY

  if (!isServiceRole) {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return json({ error: 'Não autenticado' }, 401)
    }
  }

  try {
    // Data em horário de Brasília (UTC-3), usada só pra registro/histórico
    const now = new Date()
    const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    const today = brasiliaTime.toISOString().split('T')[0]

    console.log(`[vibe-news-cron] Gerando notícias ao vivo (${today})`)

    const prompt = `Você é o curador oficial da Vibe News — o boletim de tecnologia da plataforma Hub Vibe Coding, voltado para brasileiros que criam SaaS e apps com IA (vibe coding).

Pesquise agora mesmo, usando a busca do Google, as notícias REAIS e MAIS RECENTES sobre:
1. Vibe Coding: novidades de Cursor, Windsurf, Lovable, Bolt.new, v0.dev, Replit, Trae, Firebase Studio, Framer e outras ferramentas de desenvolvimento com IA
2. Modelos de IA: lançamentos, benchmarks, atualizações e comparativos de Claude, GPT, Gemini, Llama, Mistral, Grok e outros
3. Infraestrutura & Backend: Supabase, Neon, Vercel, Railway, Fly.io — novidades relevantes
4. Negócios com IA: cases de indie hackers, MRR, crescimento, estratégias de monetização com IA
5. Mercado: investimentos, aquisições, tendências de SaaS com IA, oportunidades para criadores

RESUMO DO DIA:
Escreva um resumo jornalístico rico com 5 a 6 parágrafos longos e detalhados, baseado apenas no que você encontrar na busca agora. Cada parágrafo deve:
- Ter no mínimo 4-5 frases completas
- Conectar as notícias numa narrativa fluida e contextualizada
- Explicar o impacto prático para quem está criando seu SaaS com IA agora
- Mencionar números, comparações, tendências e implicações de mercado
- Usar linguagem profissional mas acessível, com energia e entusiasmo

ARTIGOS:
Crie 8 artigos específicos e informativos, cada um baseado numa notícia real encontrada na busca. Cada um deve ter um resumo de 3-4 linhas com impacto real.

Responda APENAS com JSON válido, sem markdown, sem texto fora do JSON:
{
  "summary": "Resumo narrativo extenso em 5-6 parágrafos longos e detalhados em português brasileiro, conectando as principais notícias com contexto, números e impacto prático para criadores de SaaS com IA",
  "articles": [
    {
      "title": "Título da notícia em português",
      "source": "Nome real da fonte (TechCrunch, Anthropic Blog, OpenAI Blog, The Verge, VentureBeat, Product Hunt, GitHub Blog, etc.)",
      "url": "URL EXATA encontrada na busca para esta notícia — copie o link literalmente, sem alterar nenhum caractere",
      "summary": "Resumo em 3-4 linhas em português explicando o que mudou, por que importa e qual o impacto prático para criadores de SaaS e apps com IA",
      "category": "ferramenta"
    }
  ]
}

Categorias disponíveis: ferramenta | modelo | tendencia | case | mercado
Inclua exatamente 8 artigos variados entre as 5 categorias, todos sobre notícias diferentes entre si.

REGRA CRÍTICA SOBRE URLs: NUNCA invente, complete ou "adivinhe" uma URL. Use exclusivamente URLs que vieram literalmente dos resultados da busca. Se não tiver certeza absoluta da URL exata, deixe o campo "url" como string vazia "" — nesse caso o app vai gerar automaticamente um link de busca seguro. Um campo "url" vazio é sempre preferível a uma URL inventada.`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 1, maxOutputTokens: 8192 },
        }),
      },
    )

    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      console.error('[vibe-news-cron] Erro Gemini:', err)
      return json({ error: 'Erro na API do Gemini', detail: err.slice(0, 300) }, 500)
    }

    const geminiData = await geminiRes.json()
    const candidate = geminiData?.candidates?.[0]
    const textContent: string = (candidate?.content?.parts || [])
      .map((p: { text?: string }) => p.text || '')
      .join('')

    if (!textContent) {
      console.error('[vibe-news-cron] Resposta sem texto:', JSON.stringify(geminiData).slice(0, 300))
      return json({ error: 'Sem conteúdo de texto na resposta do Gemini' }, 500)
    }

    // Coleta as URLs reais retornadas pela busca do Google (grounding) para
    // validar as URLs que a IA colocou no JSON — nunca confiamos cegamente
    // no texto gerado.
    const realUrls = new Set<string>()
    const chunks = candidate?.groundingMetadata?.groundingChunks || []
    for (const chunk of chunks) {
      const uri = chunk?.web?.uri
      if (uri) realUrls.add(String(uri).replace(/\/$/, ''))
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

    // Valida cada URL contra os resultados reais da busca; se não bater com
    // nenhum resultado real (ou não tiver sido preenchida), cai para um link
    // de busca — garante que nenhum artigo aponte para URL inventada/quebrada.
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

    // Registra no histórico (sem trava nem upsert — cada geração é um
    // registro novo, qualquer usuário pode gerar quantas vezes quiser).
    const { error: insertError } = await supabase.from('vibe_news').insert({
      date: today,
      summary: newsData.summary,
      articles: sanitizedArticles,
    })

    if (insertError) {
      console.error('[vibe-news-cron] Erro ao salvar:', insertError.message)
      // Não bloqueia o usuário por um erro de histórico — devolve o resultado
      // gerado mesmo assim.
    }

    console.log(`[vibe-news-cron] Sucesso: ${sanitizedArticles.length} artigos`)
    return json({
      success: true,
      date: today,
      summary: newsData.summary,
      articles: sanitizedArticles,
    })
  } catch (err) {
    console.error('[vibe-news-cron] Erro inesperado:', err instanceof Error ? err.stack : err)
    return json({
      error: 'Erro inesperado',
      detail: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? (err.stack || '').slice(0, 800) : undefined,
    }, 500)
  }
})
