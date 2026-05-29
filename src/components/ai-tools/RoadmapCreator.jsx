import { useState } from 'react'
import { Loader2, RefreshCw, Save, ArrowRight, AlertCircle, Flag, Wrench, BarChart2 } from 'lucide-react'
import { callAIForJSON } from '../../lib/aiToolsUtils'

const SYSTEM = `Você é especialista em estratégia de lançamento de SaaS para empreendedores brasileiros.
Retorne APENAS JSON válido, sem texto extra, sem markdown.`

function buildPrompt(form, niche, mvp) {
  const ctx = []
  if (niche) ctx.push(`Nicho: ${niche.input?.nicho}, Problema: ${niche.input?.problema}, Público: ${niche.input?.publico}`)
  if (mvp) ctx.push(`MVP: ${mvp.result?.nome_mvp}, ${mvp.result?.descricao}, Tempo estimado: ${mvp.result?.tempo_estimado}`)
  return `${ctx.join('\n')}

Perfil do empreendedor:
- Estágio: ${form.estagio}
- Conhecimento técnico: ${form.conhecimento}
- Objetivo financeiro: ${form.objetivo_financeiro}
- Tempo disponível: ${form.tempo_disponivel}h/semana

Crie um roadmap realista e detalhado. Retorne APENAS este JSON:
{
  "fases": [
    {
      "nome": "string",
      "duracao": "string",
      "objetivo": "string",
      "tarefas": ["string"],
      "ferramentas": ["string"],
      "indicadores": ["string"]
    }
  ],
  "metas_semanais": ["string"],
  "tempo_total_estimado": "string",
  "conteudos_hub_relacionados": ["string"]
}`
}

const phaseColors = [
  'border-l-[#0F4A28] bg-[#E8F5EE]/40 dark:bg-[#0F4A28]/10',
  'border-l-[#1B6B3A] bg-[#E8F5EE]/30 dark:bg-[#1B6B3A]/10',
  'border-l-[#C9A84C] bg-yellow-50/40 dark:bg-yellow-900/10',
  'border-l-[#B80E02] bg-red-50/40 dark:bg-red-900/10',
  'border-l-purple-600 bg-purple-50/40 dark:bg-purple-900/10',
]

export default function RoadmapCreator({ project, onSave, onNext }) {
  const nicheData = project?.niche_data
  const mvpData = project?.mvp_data
  const savedRoadmap = project?.roadmap_data

  const [form, setForm] = useState({
    estagio: savedRoadmap?.input?.estagio || 'iniciante',
    conhecimento: savedRoadmap?.input?.conhecimento || 'básico',
    objetivo_financeiro: savedRoadmap?.input?.objetivo_financeiro || 'renda extra',
    tempo_disponivel: savedRoadmap?.input?.tempo_disponivel || '10',
  })
  const [result, setResult] = useState(savedRoadmap?.result || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedOk, setSavedOk] = useState(!!savedRoadmap)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const generate = async () => {
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
    await onSave('roadmap_data', { input: form, result })
    setSavedOk(true)
  }

  const Select = ({ label, k, opts }) => (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <select value={form[k]} onChange={e => set(k, e.target.value)}
        className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300">
        {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )

  return (
    <div className="space-y-6">
      {(nicheData || mvpData) && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#E8F5EE] dark:bg-[#0F4A28]/20 rounded-xl text-xs text-[#1B6B3A] dark:text-green-400 font-medium">
          ✓ Dados das ferramentas anteriores importados
        </div>
      )}

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Seu Perfil</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Estágio atual" k="estagio" opts={[
            {value:'iniciante',label:'Iniciante (nunca lancei nada)'},
            {value:'intermediário',label:'Intermediário (já lancei algo)'},
            {value:'avançado',label:'Avançado (tenho receita)'},
          ]} />
          <Select label="Conhecimento técnico" k="conhecimento" opts={[
            {value:'nenhum',label:'Nenhum (só arrasto e solto)'},
            {value:'básico',label:'Básico (já usei Lovable/Bolt)'},
            {value:'intermediário',label:'Intermediário (sei um pouco de código)'},
          ]} />
          <Select label="Objetivo financeiro" k="objetivo_financeiro" opts={[
            {value:'renda extra',label:'Renda extra (R$1k-3k/mês)'},
            {value:'substituir salário',label:'Substituir salário (R$5k-15k/mês)'},
            {value:'escalar negócio',label:'Escalar negócio (R$30k+/mês)'},
          ]} />
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tempo disponível/semana</label>
            <div className="flex items-center gap-2">
              <input type="number" min="1" max="60" value={form.tempo_disponivel} onChange={e => set('tempo_disponivel', e.target.value)}
                className="w-20 text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300" />
              <span className="text-xs text-gray-500">horas</span>
            </div>
          </div>
        </div>
        {error && <p className="mt-3 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
        <button onClick={generate} disabled={loading}
          className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-[#0F4A28] hover:bg-[#1B6B3A] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50">
          {loading ? <><Loader2 size={13} className="animate-spin" />Criando Roadmap...</> : 'Criar Roadmap →'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#0F4A28] text-white rounded-xl">
            <span className="text-sm font-bold">⏱ {result.tempo_total_estimado}</span>
            <span className="text-xs opacity-80">— {result.fases?.length} fases</span>
          </div>

          {/* Fases */}
          {result.fases?.map((fase, i) => (
            <div key={i} className={`border-l-4 rounded-xl p-5 ${phaseColors[i % phaseColors.length]}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Fase {i + 1}</span>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{fase.nome}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{fase.objetivo}</p>
                </div>
                <span className="text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 shrink-0">{fase.duracao}</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><Flag size={9} />Tarefas</p>
                  <ul className="space-y-1">
                    {fase.tarefas?.map((t, j) => <li key={j} className="text-xs text-gray-700 dark:text-gray-300">• {t}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><Wrench size={9} />Ferramentas</p>
                  <div className="flex flex-wrap gap-1">
                    {fase.ferramentas?.map((f, j) => (
                      <span key={j} className="text-[9px] bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">{f}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><BarChart2 size={9} />Indicadores</p>
                  <ul className="space-y-1">
                    {fase.indicadores?.map((ind, j) => <li key={j} className="text-xs text-[#1B6B3A] dark:text-green-400">✓ {ind}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}

          {/* Metas semanais */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Metas Semanais</h4>
            <div className="grid sm:grid-cols-2 gap-2">
              {result.metas_semanais?.map((m, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                  <span className="text-[#C9A84C] shrink-0">→</span>{m}
                </div>
              ))}
            </div>
          </div>

          {result.conteudos_hub_relacionados?.length > 0 && (
            <div className="bg-[#E8F5EE] dark:bg-[#0F4A28]/20 rounded-xl p-4">
              <p className="text-xs font-bold text-[#1B6B3A] dark:text-green-400 mb-2">📚 Conteúdos do Hub relacionados</p>
              <ul className="space-y-1">
                {result.conteudos_hub_relacionados?.map((c, i) => (
                  <li key={i} className="text-xs text-gray-700 dark:text-gray-300">• {c}</li>
                ))}
              </ul>
            </div>
          )}

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
