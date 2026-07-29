import { useState, useEffect, useCallback } from 'react'
import { FlaskConical, Plus, Sparkles, Trash2, Loader2, CheckCircle2, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { callAIForJSON } from '../lib/aiToolsUtils'
import { PremiumGate } from './PremiumBadge'

const OUTCOME_TAGS = {
  acerto:  { label: 'Acerto',  color: 'bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-300', icon: CheckCircle2 },
  erro:    { label: 'Erro',    color: 'bg-coral-100 text-coral-700 dark:bg-coral-900/20 dark:text-coral-400',           icon: AlertTriangle },
  insight: { label: 'Insight', color: 'bg-stargold-100 text-stargold-700 dark:bg-stargold-900/20 dark:text-stargold-400', icon: Lightbulb },
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const AI_SYSTEM = `Você é um mentor de experimentos com IA. Analise o relato de aprendizado e retorne APENAS JSON válido, sem markdown, sem texto fora do JSON.`

function buildAIPrompt(entry) {
  return `Analise esta experiência de um empreendedor criando soluções com IA:

Título: ${entry.title}
Tipo: ${entry.outcome}
Relato: ${entry.body}

Devolva estritamente este JSON:
{
  "resumo": "1-2 frases resumindo o que aconteceu",
  "causa_raiz": "a causa-raiz do resultado (positivo ou negativo)",
  "licoes": ["lição 1 acionável", "lição 2 acionável", "lição 3 acionável"],
  "checklist": ["passo 1 para replicar/evitar", "passo 2", "passo 3", "passo 4"]
}`
}

function EntryCard({ entry, onDelete, onAnalyze }) {
  const [expanded, setExpanded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const tag = OUTCOME_TAGS[entry.outcome] || OUTCOME_TAGS.insight
  const TagIcon = tag.icon
  const hasAnalysis = !!entry.ai_analysis

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try { await onAnalyze(entry) }
    finally { setAnalyzing(false) }
  }

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${tag.color}`}>
              <TagIcon size={10} /> {tag.label}
            </span>
            <span className="text-[10px] text-gray-400">{fmtDate(entry.created_at)}</span>
          </div>
          <h3 className="font-playfair font-bold text-sm text-gray-900 dark:text-white">{entry.title}</h3>
        </div>
        <button onClick={() => onDelete(entry.id)} title="Excluir"
          className="p-1.5 rounded-lg text-gray-400 hover:text-coral-600 hover:bg-coral-50 dark:hover:bg-coral-900/20 transition-colors shrink-0">
          <Trash2 size={13} />
        </button>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{entry.body}</p>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={handleAnalyze} disabled={analyzing}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#3E1B4D] hover:bg-[#5B2A6E] text-white rounded-lg transition-colors disabled:opacity-50">
          {analyzing ? <><Loader2 size={12} className="animate-spin" /> Analisando…</> : <><Sparkles size={12} /> {hasAnalysis ? 'Reanalisar com IA' : 'Analisar com IA'}</>}
        </button>
        {hasAnalysis && (
          <button onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-xs text-[#5B2A6E] dark:text-magic-light hover:underline">
            {expanded ? <><ChevronUp size={12} /> Recolher análise</> : <><ChevronDown size={12} /> Ver análise</>}
          </button>
        )}
      </div>

      {hasAnalysis && expanded && (
        <div className="mt-2 space-y-3 bg-[#F2E4FA] dark:bg-[#3E1B4D]/20 border-l-4 border-[#5B2A6E] rounded-lg p-4 fade-in">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B2A6E] dark:text-magic-light mb-1">Resumo</p>
            <p className="text-xs text-gray-700 dark:text-gray-300">{entry.ai_analysis.resumo}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B2A6E] dark:text-magic-light mb-1">Causa-raiz</p>
            <p className="text-xs text-gray-700 dark:text-gray-300">{entry.ai_analysis.causa_raiz}</p>
          </div>
          {entry.ai_analysis.licoes?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B2A6E] dark:text-magic-light mb-1.5">Lições</p>
              <ul className="space-y-1">
                {entry.ai_analysis.licoes.map((l, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                    <Lightbulb size={11} className="text-[#F5B942] shrink-0 mt-0.5" />{l}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {entry.ai_analysis.checklist?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B2A6E] dark:text-magic-light mb-1.5">Como replicar / evitar</p>
              <ul className="space-y-1">
                {entry.ai_analysis.checklist.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                    <CheckCircle2 size={11} className="text-[#5B2A6E] dark:text-magic-light shrink-0 mt-0.5" />{c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {entry.ai_analyzed_at && (
            <p className="text-[10px] text-gray-400 text-right">Analisado em {fmtDate(entry.ai_analyzed_at)}</p>
          )}
        </div>
      )}
    </div>
  )
}

function VibeLabInner({ userId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [outcome, setOutcome] = useState('acerto')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('vibe_lab_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!title.trim() || !body.trim()) { setError('Preencha título e relato.'); return }
    setSaving(true)
    try {
      const { data, error: insErr } = await supabase.from('vibe_lab_entries').insert({
        user_id: userId,
        title: title.trim(),
        body: body.trim(),
        outcome,
      }).select().single()
      if (insErr) throw insErr
      setEntries(prev => [data, ...prev])
      setTitle(''); setBody(''); setOutcome('acerto')
      setShowForm(false)
    } catch (err) {
      setError(err.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const deleteEntry = async (id) => {
    if (!confirm('Excluir este registro?')) return
    await supabase.from('vibe_lab_entries').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const analyze = async (entry) => {
    try {
      const analysis = await callAIForJSON(buildAIPrompt(entry), AI_SYSTEM)
      const { data } = await supabase
        .from('vibe_lab_entries')
        .update({ ai_analysis: analysis, ai_analyzed_at: new Date().toISOString() })
        .eq('id', entry.id)
        .select()
        .single()
      if (data) setEntries(prev => prev.map(e => e.id === entry.id ? data : e))
    } catch (err) {
      alert(err.message || 'A IA não conseguiu analisar agora — tente novamente em alguns segundos.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <FlaskConical size={22} className="text-[#5B2A6E] dark:text-magic-light" />
            Laboratório Vibe
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Registre suas experiências criando com IA — acertos, erros e insights.
            Peça pra IA analisar cada aprendizado e virar lição acionável.
          </p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 bg-[#3E1B4D] hover:bg-[#5B2A6E] text-white rounded-xl transition-colors shrink-0">
            <Plus size={14} /> Novo registro
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4 fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Novo aprendizado</h3>
            <button type="button" onClick={() => { setShowForm(false); setError('') }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={14} /></button>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(OUTCOME_TAGS).map(([key, t]) => {
              const TagIcon = t.icon
              const active = outcome === key
              return (
                <button key={key} type="button" onClick={() => setOutcome(key)}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${active ? t.color + ' border-transparent' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-[#5B2A6E]'}`}>
                  <TagIcon size={12} /> {t.label}
                </button>
              )
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: consegui gerar copy melhor mudando o prompt"
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#5B2A6E]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">O que aconteceu?</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder="Conte o experimento: contexto, o que testou, o que deu certo/errado, o que aprendeu."
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#5B2A6E] resize-none" />
          </div>

          {error && <p className="text-xs text-coral-600">{error}</p>}

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#3E1B4D] hover:bg-[#5B2A6E] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {saving ? 'Salvando…' : 'Salvar registro'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-[#5B2A6E]" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="w-14 h-14 rounded-2xl bg-[#F2E4FA] dark:bg-[#3E1B4D]/20 flex items-center justify-center mx-auto mb-4">
            <FlaskConical size={24} className="text-[#5B2A6E] dark:text-magic-light" />
          </div>
          <h3 className="font-playfair font-bold text-lg text-gray-900 dark:text-white mb-2">
            Nenhum experimento registrado ainda
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Clique em "Novo registro" pra guardar seu primeiro aprendizado.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(e => <EntryCard key={e.id} entry={e} onDelete={deleteEntry} onAnalyze={analyze} />)}
        </div>
      )}
    </div>
  )
}

export default function VibeLab({ userId, profile }) {
  return (
    <PremiumGate profile={profile} title="Laboratório Vibe é exclusivo para membros">
      <VibeLabInner userId={userId} />
    </PremiumGate>
  )
}
