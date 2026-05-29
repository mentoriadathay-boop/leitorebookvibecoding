import { useState } from 'react'
import { Loader2, RefreshCw, Save, AlertCircle, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { callAIForJSON } from '../../lib/aiToolsUtils'

const SYSTEM = `Você é especialista em monetização e crescimento de SaaS para o mercado brasileiro.
Retorne APENAS JSON válido, sem texto extra, sem markdown.`

function buildPrompt(form, niche, mvp, roadmap) {
  const ctx = []
  if (niche) ctx.push(`Nicho: ${niche.input?.nicho}, Público: ${niche.input?.publico}`)
  if (mvp) ctx.push(`Produto: ${mvp.result?.nome_mvp}`)
  if (roadmap) ctx.push(`Objetivo: ${roadmap.input?.objetivo_financeiro}`)
  return `${ctx.join('\n')}

Dados atuais do negócio:
- Tráfego mensal: ${form.trafego}
- Ticket médio: ${form.ticket}
- Taxa de conversão: ${form.conversao}%
- Canais de aquisição: ${form.canais}
- Taxa de retenção: ${form.retencao}%
- Funil atual: ${form.funil}

Faça um diagnóstico completo. Retorne APENAS este JSON:
{
  "scores": {
    "oferta": <0-10>,
    "conversao": <0-10>,
    "escalabilidade": <0-10>,
    "retencao": <0-10>,
    "posicionamento": <0-10>
  },
  "score_geral": <0-100>,
  "gargalos": [
    {"problema": "string", "impacto": "alto"|"médio"|"baixo", "solucao": "string"}
  ],
  "plano_30_dias": [
    {"semana": "Semana 1", "acoes": ["string"]}
  ],
  "modelo_assinatura_ideal": "string",
  "estrategia_aquisicao": "string",
  "funil_ideal": "string",
  "upsells_sugeridos": ["string"]
}`
}

const impactColor = { alto: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', médio: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', baixo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' }

function ScoreBar({ label, value }) {
  const color = value >= 7 ? '#1B6B3A' : value >= 5 ? '#C9A84C' : '#B80E02'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 dark:text-gray-400 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value * 10}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{value}/10</span>
    </div>
  )
}

export default function MonetizationDiag({ project, onSave }) {
  const nicheData = project?.niche_data
  const mvpData = project?.mvp_data
  const roadmapData = project?.roadmap_data
  const savedMon = project?.monetization_data

  const [form, setForm] = useState({
    trafego: savedMon?.input?.trafego || '0',
    ticket: savedMon?.input?.ticket || '0',
    conversao: savedMon?.input?.conversao || '0',
    canais: savedMon?.input?.canais || '',
    retencao: savedMon?.input?.retencao || '0',
    funil: savedMon?.input?.funil || '',
  })
  const [result, setResult] = useState(savedMon?.result || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedOk, setSavedOk] = useState(!!savedMon)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const analyze = async () => {
    setError(''); setLoading(true)
    try {
      const res = await callAIForJSON(buildPrompt(form, nicheData, mvpData, roadmapData), SYSTEM)
      setResult(res)
      setSavedOk(false)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!result || !project) return
    await onSave('monetization_data', { input: form, result })
    setSavedOk(true)
  }

  const numField = (label, k, suffix = '') => (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="number" min="0" value={form[k]} onChange={e => set(k, e.target.value)}
          className="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300" />
        {suffix && <span className="text-xs text-gray-500 shrink-0">{suffix}</span>}
      </div>
    </div>
  )

  const scoreGeral = result?.score_geral || 0
  const scoreColor = scoreGeral >= 70 ? '#1B6B3A' : scoreGeral >= 45 ? '#C9A84C' : '#B80E02'

  return (
    <div className="space-y-6">
      {(nicheData || mvpData) && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#E8F5EE] dark:bg-[#0F4A28]/20 rounded-xl text-xs text-[#1B6B3A] dark:text-green-400 font-medium">
          ✓ Dados das ferramentas anteriores importados
        </div>
      )}

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Dados Atuais do Negócio</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {numField('Tráfego mensal (visitas/mês)', 'trafego')}
          {numField('Ticket médio (R$)', 'ticket', 'R$')}
          {numField('Taxa de conversão atual', 'conversao', '%')}
          {numField('Taxa de retenção (clientes que ficam)', 'retencao', '%')}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Canais de aquisição</label>
            <input value={form.canais} onChange={e => set('canais', e.target.value)} placeholder="Ex: Instagram, Google Ads, indicação"
              className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Descreva seu funil atual</label>
            <textarea value={form.funil} onChange={e => set('funil', e.target.value)} rows={2}
              placeholder="Ex: anúncio → landing page → trial 7 dias → plano pago"
              className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none" />
          </div>
        </div>
        {error && <p className="mt-3 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
        <button onClick={analyze} disabled={loading}
          className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-[#0F4A28] hover:bg-[#1B6B3A] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50">
          {loading ? <><Loader2 size={13} className="animate-spin" />Diagnosticando...</> : 'Diagnosticar Monetização →'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Score geral */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-6 mb-5">
              <div className="w-20 h-20 rounded-full flex items-center justify-center shrink-0 border-4" style={{ borderColor: scoreColor }}>
                <span className="text-2xl font-bold" style={{ color: scoreColor }}>{scoreGeral}</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Score de Monetização</p>
                <p className="font-playfair font-bold text-lg text-gray-900 dark:text-white">
                  {scoreGeral >= 70 ? 'Motor de Crescimento 🚀' : scoreGeral >= 45 ? 'Potencial Inexplorado ⚠️' : 'Precisa de Ajuste 🔴'}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <ScoreBar label="Oferta" value={result.scores?.oferta || 0} />
              <ScoreBar label="Conversão" value={result.scores?.conversao || 0} />
              <ScoreBar label="Escalabilidade" value={result.scores?.escalabilidade || 0} />
              <ScoreBar label="Retenção" value={result.scores?.retencao || 0} />
              <ScoreBar label="Posicionamento" value={result.scores?.posicionamento || 0} />
            </div>
          </div>

          {/* Gargalos */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Gargalos Identificados</h4>
            <div className="space-y-3">
              {result.gargalos?.map((g, i) => (
                <div key={i} className="p-3 bg-gray-50 dark:bg-[#111] rounded-lg">
                  <div className="flex items-start gap-2 mb-1">
                    <AlertTriangle size={12} className="text-[#B80E02] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{g.problema}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${impactColor[g.impacto] || ''}`}>{g.impacto}</span>
                      </div>
                      <p className="text-xs text-[#1B6B3A] dark:text-green-400 flex items-start gap-1">
                        <CheckCircle size={11} className="shrink-0 mt-0.5" />{g.solucao}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plano 30 dias */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Plano de 30 Dias</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {result.plano_30_dias?.map((semana, i) => (
                <div key={i} className={`p-3 rounded-lg border-l-4 ${['border-[#0F4A28] bg-[#E8F5EE]/40 dark:bg-[#0F4A28]/10','border-[#1B6B3A] bg-green-50/30 dark:bg-green-900/10','border-[#C9A84C] bg-yellow-50/30 dark:bg-yellow-900/10','border-[#B80E02] bg-red-50/30 dark:bg-red-900/10'][i % 4]}`}>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mb-2">{semana.semana}</p>
                  <ul className="space-y-1">
                    {semana.acoes?.map((a, j) => <li key={j} className="text-xs text-gray-600 dark:text-gray-400">→ {a}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Estratégias */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Modelo de Assinatura Ideal</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{result.modelo_assinatura_ideal}</p>
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Funil Ideal</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{result.funil_ideal}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Estratégia de Aquisição</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">{result.estrategia_aquisicao}</p>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Upsells Sugeridos</h4>
            <div className="flex flex-wrap gap-2">
              {result.upsells_sugeridos?.map((u, i) => (
                <span key={i} className="text-xs bg-[#E8F5EE] dark:bg-[#0F4A28]/20 text-[#1B6B3A] dark:text-green-400 px-3 py-1 rounded-full">
                  <TrendingUp size={10} className="inline mr-1" />{u}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={analyze} disabled={loading}
              className="flex items-center gap-1.5 text-xs px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#1B6B3A] hover:text-[#1B6B3A] rounded-xl transition-colors">
              <RefreshCw size={12} /> Regenerar
            </button>
            <button onClick={handleSave}
              className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl transition-colors ${savedOk ? 'bg-[#E8F5EE] text-[#1B6B3A]' : 'bg-[#C9A84C] hover:bg-yellow-600 text-white'}`}>
              <Save size={12} /> {savedOk ? 'Salvo!' : 'Salvar Resultado'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
