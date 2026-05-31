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
  const prompt = `Você é o curador oficial da Vibe News — o boletim diário de tecnologia da plataforma Hub Vibe Coding, voltado para brasileiros que criam SaaS e apps com IA (vibe coding).

Hoje é ${today}. Crie uma curadoria completa, detalhada e envolvente focada em:

TEMAS PRINCIPAIS (cobrir obrigatoriamente):
1. Vibe Coding: novidades de Cursor, Windsurf, Lovable, Bolt.new, v0.dev, Replit, Trae, Firebase Studio, Framer e outras ferramentas de desenvolvimento com IA
2. Modelos de IA: lançamentos, benchmarks, atualizações e comparativos de Claude, GPT, Gemini, Llama, Mistral, Grok e outros
3. Infraestrutura & Backend: Supabase, Neon, Vercel, Railway, Fly.io — novidades relevantes
4. Negócios com IA: cases de indie hackers, MRR, crescimento, estratégias de monetização com IA
5. Mercado: investimentos, aquisições, tendências de SaaS com IA, oportunidades para criadores

RESUMO DO DIA:
Escreva um resumo jornalístico rico com 5 a 6 parágrafos longos e detalhados. Cada parágrafo deve:
- Ter no mínimo 4-5 frases completas
- Conectar as notícias do dia em uma narrativa fluida e contextualizada
- Explicar o impacto prático para quem está criando seu SaaS com IA agora
- Mencionar números, comparações, tendências e implicações de mercado
- Usar linguagem profissional mas acessível, com energia e entusiasmo

ARTIGOS:
Crie 8 artigos específicos e informativos. Cada um deve ter um resumo de 3-4 linhas com impacto real.

Retorne APENAS JSON válido, sem markdown, sem texto fora do JSON:
{
  "summary": "Resumo narrativo extenso em 5-6 parágrafos longos e detalhados em português brasileiro, conectando as principais notícias do dia com contexto, números e impacto prático para criadores de SaaS com IA",
  "articles": [
    {
      "title": "Título da notícia em português",
      "source": "Nome da fonte real (TechCrunch, Anthropic Blog, OpenAI Blog, The Verge, VentureBeat, Product Hunt, GitHub Blog, etc.)",
      "url": "https://exemplo.com/noticia-real",
      "summary": "Resumo em 3-4 linhas em português explicando o que mudou, por que importa e qual o impacto prático para criadores de SaaS e apps com IA",
      "category": "ferramenta"
    }
  ]
}

Categorias disponíveis: ferramenta | modelo | tendencia | case | mercado
Inclua exatamente 8 artigos variados entre as 5 categorias.`

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
