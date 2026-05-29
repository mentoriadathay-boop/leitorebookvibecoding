import { useState } from 'react'
import { Loader2, RefreshCw, Save, ArrowRight, Copy, CheckCheck, AlertCircle } from 'lucide-react'
import { callAIForJSON } from '../../lib/aiToolsUtils'

const SYSTEM = `Você é especialista em desenvolvimento de MVPs para SaaS com Vibe Coding.
Retorne APENAS JSON válido, sem texto extra, sem markdown.`

function buildPrompt(form, niche) {
  const nicheCtx = niche ? `
Dados do nicho validado:
- Problema: ${niche.input?.problema}
- Público: ${niche.input?.publico}
- Nicho: ${niche.input?.nicho}
- Score: ${niche.result?.score}/100
- Tipo de dor: ${niche.result?.tipo_dor}
` : ''

  return `${nicheCtx}
Dados do projeto:
- Nome: ${form.nome}
- Objetivo principal: ${form.objetivo}
- Tipo de usuário: ${form.tipo_usuario}
- Problema principal: ${form.problema}

Retorne APENAS este JSON:
{
  "nome_mvp": "string",
  "descricao": "string (2-3 frases)",
  "funcionalidades_essenciais": [
    {"nome": "string", "descricao": "string", "prioridade": "must"|"should"|"could"}
  ],
  "stack_recomendada": ["string"],
  "tempo_estimado": "string",
  "prompts_para_construir": ["string (prompt completo pronto para usar no Cursor/Lovable/Bolt)"]
}`
}

const prioColor = { must: 'bg-red-100 text-red-700', should: 'bg-yellow-100 text-yellow-700', could: 'bg-blue-100 text-blue-700' }

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} title="Copiar" className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-[#1B6B3A]">
      {copied ? <CheckCheck size={13} className="text-[#1B6B3A]" /> : <Copy size={13} />}
    </button>
  )
}

export default function MVPGenerator({ project, onSave, onNext }) {
  const nicheData = project?.niche_data
  const savedMVP = project?.mvp_data

  const [form, setForm] = useState({
    nome: savedMVP?.input?.nome || project?.name || '',
    objetivo: savedMVP?.input?.objetivo || nicheData?.input?.transformacao || '',
    tipo_usuario: savedMVP?.input?.tipo_usuario || nicheData?.input?.publico || '',
    problema: savedMVP?.input?.problema || nicheData?.input?.problema || '',
  })
  const [result, setResult] = useState(savedMVP?.result || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedOk, setSavedOk] = useState(!!savedMVP)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const generate = async () => {
    if (!form.nome || !form.objetivo) { setError('Preencha pelo menos o Nome e o Objetivo.'); return }
    setError(''); setLoading(true)
    try {
      const res = await callAIForJSON(buildPrompt(form, nicheData), SYSTEM)
      setResult(res)
      setSavedOk(false)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!result || !project) return
    await onSave('mvp_data', { input: form, result })
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

  return (
    <div className="space-y-6">
      {nicheData && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#E8F5EE] dark:bg-[#0F4A28]/20 rounded-xl text-xs text-[#1B6B3A] dark:text-green-400 font-medium">
          ✓ Dados do Validador de Nicho importados automaticamente
        </div>
      )}

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Dados do Projeto</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nome do projeto *" k="nome" placeholder="Ex: ContractFlow" />
          <Field label="Tipo de usuário *" k="tipo_usuario" placeholder="Ex: designer freelancer" />
          <Field label="Objetivo principal *" k="objetivo" placeholder="Ex: enviar e assinar contratos em 2 min" multiline />
          <Field label="Problema principal" k="problema" placeholder="Ex: criar contratos é burocrático e lento" multiline />
        </div>
        {error && <p className="mt-3 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
        <button onClick={generate} disabled={loading}
          className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-[#0F4A28] hover:bg-[#1B6B3A] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50">
          {loading ? <><Loader2 size={13} className="animate-spin" />Gerando...</> : 'Gerar MVP →'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-playfair text-xl font-bold text-[#0F4A28] dark:text-green-400">{result.nome_mvp}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result.descricao}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">⏱ {result.tempo_estimado}</span>
              <div className="flex flex-wrap gap-1">
                {result.stack_recomendada?.map((s, i) => (
                  <span key={i} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Funcionalidades */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Funcionalidades</h4>
            <div className="space-y-2">
              {result.funcionalidades_essenciais?.map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#111] rounded-lg">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 mt-0.5 ${prioColor[f.prioridade] || 'bg-gray-100 text-gray-600'}`}>{f.prioridade}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{f.nome}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{f.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">must = obrigatório · should = importante · could = desejável</p>
          </div>

          {/* Prompts */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Prompts Prontos para Construir</h4>
            <div className="space-y-3">
              {result.prompts_para_construir?.map((p, i) => (
                <div key={i} className="flex items-start gap-2 bg-gray-50 dark:bg-[#111] rounded-lg p-3">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-[#C9A84C] mb-1">Prompt {i + 1}</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{p}</p>
                  </div>
                  <CopyButton text={p} />
                </div>
              ))}
            </div>
          </div>

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
