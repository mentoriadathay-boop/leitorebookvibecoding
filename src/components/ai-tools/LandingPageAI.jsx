import { useState } from 'react'
import { Loader2, RefreshCw, Save, ArrowRight, AlertCircle, Copy, CheckCheck } from 'lucide-react'
import { callAIForJSON } from '../../lib/aiToolsUtils'

const SYSTEM = `Você é especialista em copywriting e landing pages de alta conversão para produtos digitais brasileiros.
Retorne APENAS JSON válido, sem texto extra, sem markdown.`

function buildPrompt(form, niche, mvp) {
  const ctx = []
  if (niche) ctx.push(`Nicho: ${niche.input?.nicho}, Público: ${niche.input?.publico}, Transformação: ${niche.input?.transformacao}, Tipo de dor: ${niche.result?.tipo_dor}`)
  if (mvp) ctx.push(`Produto: ${mvp.result?.nome_mvp}, Descrição: ${mvp.result?.descricao}`)
  return `${ctx.join('\n')}

Dados da landing page:
- Promessa principal: ${form.promessa}
- CTA principal: ${form.cta}
- Tom da marca: ${form.tom}
- Tipo de funil: ${form.funil}

Crie uma landing page de alta conversão. Retorne APENAS este JSON:
{
  "hero": {"headline": "string", "subheadline": "string", "cta": "string"},
  "secao_dores": ["string"],
  "beneficios": [{"titulo": "string", "descricao": "string"}],
  "objecoes": [{"objecao": "string", "resposta": "string"}],
  "prova_social": ["string"],
  "oferta": {"titulo": "string", "descricao": "string", "preco_sugerido": "string", "garantia": "string"},
  "faq": [{"pergunta": "string", "resposta": "string"}],
  "cta_final": "string",
  "copy_emocional": "string",
  "copy_racional": "string",
  "prompt_lovable": "string",
  "prompt_bolt": "string"
}`
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <button onClick={copy} title="Copiar" className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-[#1B6B3A]">
      {copied ? <CheckCheck size={13} className="text-[#1B6B3A]" /> : <Copy size={13} />}
    </button>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">{title}</h4>
      {children}
    </div>
  )
}

export default function LandingPageAI({ project, onSave, onNext }) {
  const nicheData = project?.niche_data
  const mvpData = project?.mvp_data
  const savedLanding = project?.landing_data

  const [form, setForm] = useState({
    promessa: savedLanding?.input?.promessa || nicheData?.input?.transformacao || '',
    cta: savedLanding?.input?.cta || 'Quero começar agora',
    tom: savedLanding?.input?.tom || 'profissional',
    funil: savedLanding?.input?.funil || 'SaaS',
  })
  const [result, setResult] = useState(savedLanding?.result || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedOk, setSavedOk] = useState(!!savedLanding)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const generate = async () => {
    if (!form.promessa) { setError('Preencha a promessa principal.'); return }
    setError(''); setLoading(true)
    try {
      const res = await callAIForJSON(buildPrompt(form, nicheData, mvpData), SYSTEM)
      setResult(res)
      setSavedOk(false)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!result || !project) return
    await onSave('landing_data', { input: form, result })
    setSavedOk(true)
  }

  return (
    <div className="space-y-6">
      {(nicheData || mvpData) && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#E8F5EE] dark:bg-[#0F4A28]/20 rounded-xl text-xs text-[#1B6B3A] dark:text-green-400 font-medium">
          ✓ Dados das ferramentas anteriores importados
        </div>
      )}

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Dados da Landing Page</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Promessa principal *</label>
            <input value={form.promessa} onChange={e => set('promessa', e.target.value)} placeholder="Ex: Crie e assine contratos em 2 minutos sem sair do celular"
              className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">CTA principal</label>
            <input value={form.cta} onChange={e => set('cta', e.target.value)} placeholder="Ex: Começar grátis"
              className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tom da marca</label>
            <select value={form.tom} onChange={e => set('tom', e.target.value)}
              className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300">
              <option value="profissional">Profissional</option>
              <option value="descontraído">Descontraído</option>
              <option value="urgente">Urgente</option>
              <option value="inspiracional">Inspiracional</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de funil</label>
            <select value={form.funil} onChange={e => set('funil', e.target.value)}
              className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300">
              {['SaaS','ebook','mentoria','automação','lead magnet','webinar','waitlist'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="mt-3 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
        <button onClick={generate} disabled={loading}
          className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-[#0F4A28] hover:bg-[#1B6B3A] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50">
          {loading ? <><Loader2 size={13} className="animate-spin" />Gerando...</> : 'Gerar Landing Page →'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Hero */}
          <div className="bg-gradient-to-br from-[#0F4A28] to-[#1B6B3A] rounded-2xl p-6 text-white">
            <p className="text-[10px] uppercase tracking-wider opacity-60 mb-2">Hero Section</p>
            <h3 className="font-playfair text-xl font-bold mb-2">{result.hero?.headline}</h3>
            <p className="text-sm opacity-80 mb-4">{result.hero?.subheadline}</p>
            <span className="inline-block bg-[#C9A84C] text-white text-xs font-bold px-4 py-2 rounded-xl">{result.hero?.cta}</span>
          </div>

          {/* Copy versions */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Section title="Copy Emocional">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">{result.copy_emocional}</p>
            </Section>
            <Section title="Copy Racional">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.copy_racional}</p>
            </Section>
          </div>

          {/* Dores */}
          <Section title="Seção de Dores">
            <ul className="space-y-2">
              {result.secao_dores?.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                  <span className="text-[#B80E02] shrink-0">✗</span>{d}
                </li>
              ))}
            </ul>
          </Section>

          {/* Benefícios */}
          <Section title="Benefícios">
            <div className="grid sm:grid-cols-2 gap-3">
              {result.beneficios?.map((b, i) => (
                <div key={i} className="p-3 bg-[#E8F5EE] dark:bg-[#0F4A28]/20 rounded-lg">
                  <p className="text-xs font-bold text-[#0F4A28] dark:text-green-400 mb-1">✓ {b.titulo}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{b.descricao}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Oferta */}
          <div className="border-2 border-[#C9A84C] rounded-2xl p-5 bg-yellow-50/40 dark:bg-yellow-900/10">
            <p className="text-[10px] uppercase tracking-wider text-[#C9A84C] font-bold mb-2">Oferta</p>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{result.oferta?.titulo}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{result.oferta?.descricao}</p>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-[#1B6B3A]">{result.oferta?.preco_sugerido}</span>
              <span className="text-xs text-gray-500">• {result.oferta?.garantia}</span>
            </div>
          </div>

          {/* Objeções */}
          <Section title="Quebra de Objeções">
            <div className="space-y-3">
              {result.objecoes?.map((o, i) => (
                <div key={i} className="p-3 bg-gray-50 dark:bg-[#111] rounded-lg">
                  <p className="text-xs font-bold text-[#B80E02] mb-1">❝ {o.objecao}</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{o.resposta}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* FAQ */}
          <Section title="FAQ">
            <div className="space-y-3">
              {result.faq?.map((f, i) => (
                <div key={i}>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">Q: {f.pergunta}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">A: {f.resposta}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Prompts */}
          <Section title="Prompts para Construir">
            {[['Lovable', result.prompt_lovable], ['Bolt', result.prompt_bolt]].map(([label, prompt]) => (
              <div key={label} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-[#C9A84C]">{label}</span>
                  {prompt && <CopyButton text={prompt} />}
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#111] rounded-lg p-3 leading-relaxed">{prompt}</p>
              </div>
            ))}
          </Section>

          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={generate} disabled={loading}
              className="flex items-center gap-1.5 text-xs px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#1B6B3A] hover:text-[#1B6B3A] rounded-xl transition-colors">
              <RefreshCw size={12} /> Regenerar
            </button>
            <button onClick={handleSave}
              className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl transition-colors ${savedOk ? 'bg-[#E8F5EE] text-[#1B6B3A]' : 'bg-[#C9A84C] hover:bg-yellow-600 text-white'}`}>
              <Save size={12} /> {savedOk ? 'Salvo!' : 'Salvar Resultado'}
            </button>
            {project && (
              <button onClick={onNext}
                className="ml-auto flex items-center gap-1.5 text-xs px-5 py-2 bg-[#0F4A28] hover:bg-[#1B6B3A] text-white rounded-xl transition-colors font-semibold">
                Próxima ferramenta <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
