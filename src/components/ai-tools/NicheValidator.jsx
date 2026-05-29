import { useState } from 'react'
import { Loader2, RefreshCw, Save, ArrowRight, CheckCircle, AlertCircle, TrendingUp, Lightbulb } from 'lucide-react'
import { callAIForJSON } from '../../lib/aiToolsUtils'

const SYSTEM = `Você é um especialista em validação de nichos e produtos digitais para o mercado brasileiro.
Analise criteriosamente o nicho apresentado e retorne APENAS JSON válido sem nenhum texto adicional.`

function buildPrompt(f) {
  return `Analise este nicho de produto digital:

Problema: ${f.problema}
Público-alvo: ${f.publico}
Nicho: ${f.nicho}
Concorrentes: ${f.concorrentes}
Como resolvem hoje: ${f.solucao_atual}
Transformação entregue: ${f.transformacao}
Recorrente: ${f.recorrente}
Dor urgente: ${f.dor_urgente}
Ticket possível: ${f.ticket}
Público compra online: ${f.compra_online}
Comunidade ativa: ${f.comunidade}
Crescimento do nicho: ${f.crescimento}

Retorne APENAS este JSON (sem markdown, sem texto extra):
{
  "score": <número 0-100>,
  "potencial_monetizacao": "baixo"|"médio"|"alto",
  "facilidade_aquisicao": "fácil"|"moderada"|"difícil",
  "saturacao": "oceano vermelho"|"nicho validado"|"oportunidade emergente",
  "tipo_dor": "emocional"|"operacional"|"financeira"|"produtividade"|"vendas"|"gestão",
  "pontos_fortes": ["string",...],
  "pontos_fracos": ["string",...],
  "sugestoes_posicionamento": ["string",...],
  "sugestoes_monetizacao": ["string",...],
  "ideias_derivadas": [
    {"nome": "string", "descricao": "string", "funcionalidades": ["string",...], "angulo_marketing": "string"},
    ...5 itens
  ]
}`
}

const scoreColor = (s) => s >= 70 ? '#1B6B3A' : s >= 45 ? '#C9A84C' : '#B80E02'
const satTag = { 'oceano vermelho': 'bg-red-100 text-red-700', 'nicho validado': 'bg-green-100 text-[#1B6B3A]', 'oportunidade emergente': 'bg-yellow-100 text-yellow-700' }
const potTag = { baixo: 'bg-red-100 text-red-700', médio: 'bg-yellow-100 text-yellow-700', alto: 'bg-green-100 text-[#1B6B3A]' }
const aqTag = { fácil: 'bg-green-100 text-[#1B6B3A]', moderada: 'bg-yellow-100 text-yellow-700', difícil: 'bg-red-100 text-red-700' }

function Badge({ label, colorClass }) {
  return <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${colorClass}`}>{label}</span>
}

function StringList({ items, icon: Icon, color }) {
  return (
    <ul className="space-y-1.5">
      {items?.map((s, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
          <Icon size={12} className={`shrink-0 mt-0.5 ${color}`} />
          {s}
        </li>
      ))}
    </ul>
  )
}

function ResultCard({ title, children }) {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">{title}</h4>
      {children}
    </div>
  )
}

export default function NicheValidator({ project, onSave, onNext }) {
  const saved = project?.niche_data
  const [form, setForm] = useState({
    problema: saved?.input?.problema || '',
    publico: saved?.input?.publico || '',
    nicho: saved?.input?.nicho || '',
    concorrentes: saved?.input?.concorrentes || '',
    solucao_atual: saved?.input?.solucao_atual || '',
    transformacao: saved?.input?.transformacao || '',
    recorrente: saved?.input?.recorrente || 'sim',
    dor_urgente: saved?.input?.dor_urgente || 'sim',
    ticket: saved?.input?.ticket || 'médio',
    compra_online: saved?.input?.compra_online || 'sim',
    comunidade: saved?.input?.comunidade || 'sim',
    crescimento: saved?.input?.crescimento || '',
  })
  const [result, setResult] = useState(saved?.result || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved_ok, setSavedOk] = useState(!!saved)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const analyze = async () => {
    if (!form.problema || !form.nicho) { setError('Preencha pelo menos o Problema e o Nicho.'); return }
    setError(''); setLoading(true)
    try {
      const res = await callAIForJSON(buildPrompt(form), SYSTEM)
      setResult(res)
      setSavedOk(false)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!result || !project) return
    await onSave('niche_data', { input: form, result })
    setSavedOk(true)
  }

  const Field = ({ label, k, placeholder, multiline }) => (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {multiline
        ? <textarea value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder} rows={2}
            className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none" />
        : <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder}
            className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400" />
      }
    </div>
  )

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
      {/* Form */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Dados do Nicho</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Qual problema resolve? *" k="problema" placeholder="Ex: freelancers perdem tempo com contratos" multiline />
          <Field label="Para quem? *" k="publico" placeholder="Ex: designers e fotógrafos autônomos" multiline />
          <Field label="Qual nicho? *" k="nicho" placeholder="Ex: gestão de contratos para criativos" />
          <Field label="Já existem concorrentes?" k="concorrentes" placeholder="Ex: Honeybook, Dubsado (mas caros)" />
          <Field label="Como resolvem hoje?" k="solucao_atual" placeholder="Ex: planilhas, WhatsApp e e-mail" multiline />
          <Field label="Qual transformação entrega?" k="transformacao" placeholder="Ex: contratos assinados em 2 minutos" multiline />
          <Select label="É recorrente?" k="recorrente" opts={[{value:'sim',label:'Sim'},{value:'não',label:'Não'}]} />
          <Select label="Resolve dor urgente?" k="dor_urgente" opts={[{value:'sim',label:'Sim'},{value:'não',label:'Não'}]} />
          <Select label="Ticket possível?" k="ticket" opts={[{value:'baixo',label:'Baixo (até R$50/mês)'},{value:'médio',label:'Médio (R$50-200/mês)'},{value:'alto',label:'Alto (R$200+/mês)'}]} />
          <Select label="Público compra online?" k="compra_online" opts={[{value:'sim',label:'Sim'},{value:'não',label:'Não'},{value:'parcialmente',label:'Parcialmente'}]} />
          <Select label="Existe comunidade ativa?" k="comunidade" opts={[{value:'sim',label:'Sim'},{value:'não',label:'Não'}]} />
          <Field label="O nicho cresce ou está saturado?" k="crescimento" placeholder="Ex: cresce com boom de freelancers pós-pandemia" />
        </div>
        {error && <p className="mt-3 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
        <button
          onClick={analyze} disabled={loading}
          className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-[#0F4A28] hover:bg-[#1B6B3A] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? <><Loader2 size={13} className="animate-spin" />Analisando...</> : 'Analisar Nicho →'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Score */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full flex items-center justify-center shrink-0 border-4"
                  style={{ borderColor: scoreColor(result.score) }}>
                  <span className="text-2xl font-bold" style={{ color: scoreColor(result.score) }}>{result.score}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Score de Potencial</p>
                  <p className="font-playfair font-bold text-lg text-gray-900 dark:text-white">
                    {result.score >= 70 ? 'Nicho Promissor! 🚀' : result.score >= 45 ? 'Nicho com Potencial ⚠️' : 'Nicho Desafiador 🔴'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{result.nicho}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge label={`Monetização: ${result.potencial_monetizacao}`} colorClass={potTag[result.potencial_monetizacao] || 'bg-gray-100 text-gray-600'} />
                <Badge label={`Aquisição: ${result.facilidade_aquisicao}`} colorClass={aqTag[result.facilidade_aquisicao] || 'bg-gray-100 text-gray-600'} />
                <Badge label={result.saturacao} colorClass={satTag[result.saturacao] || 'bg-gray-100 text-gray-600'} />
                <Badge label={`Dor: ${result.tipo_dor}`} colorClass="bg-purple-100 text-purple-700" />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <ResultCard title="Pontos Fortes">
              <StringList items={result.pontos_fortes} icon={CheckCircle} color="text-[#1B6B3A]" />
            </ResultCard>
            <ResultCard title="Pontos Fracos">
              <StringList items={result.pontos_fracos} icon={AlertCircle} color="text-[#B80E02]" />
            </ResultCard>
            <ResultCard title="Sugestões de Posicionamento">
              <StringList items={result.sugestoes_posicionamento} icon={TrendingUp} color="text-[#C9A84C]" />
            </ResultCard>
            <ResultCard title="Sugestões de Monetização">
              <StringList items={result.sugestoes_monetizacao} icon={TrendingUp} color="text-[#1B6B3A]" />
            </ResultCard>
          </div>

          {/* Ideias derivadas */}
          <ResultCard title={`${result.ideias_derivadas?.length || 0} Ideias Derivadas`}>
            <div className="grid sm:grid-cols-2 gap-3">
              {result.ideias_derivadas?.map((idea, i) => (
                <div key={i} className="bg-gray-50 dark:bg-[#111] rounded-lg p-3 space-y-1">
                  <p className="text-xs font-bold text-[#0F4A28] dark:text-green-400">{idea.nome}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{idea.descricao}</p>
                  <p className="text-[10px] text-[#C9A84C] font-medium flex items-center gap-1"><Lightbulb size={10}/> {idea.angulo_marketing}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {idea.funcionalidades?.map((f, j) => (
                      <span key={j} className="text-[9px] bg-[#E8F5EE] dark:bg-[#0F4A28]/30 text-[#1B6B3A] px-1.5 py-0.5 rounded">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={analyze} disabled={loading}
              className="flex items-center gap-1.5 text-xs px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#1B6B3A] hover:text-[#1B6B3A] rounded-xl transition-colors">
              <RefreshCw size={12} /> Regenerar
            </button>
            <button onClick={handleSave}
              className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl transition-colors ${saved_ok ? 'bg-[#E8F5EE] text-[#1B6B3A]' : 'bg-[#C9A84C] hover:bg-yellow-600 text-white'}`}>
              <Save size={12} /> {saved_ok ? 'Salvo!' : 'Salvar Resultado'}
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
