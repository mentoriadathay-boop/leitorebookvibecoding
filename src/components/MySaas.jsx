import { useState, useEffect } from 'react'
import { Rocket, Save, Pencil, Check } from 'lucide-react'

const EMPTY = { name: '', niche: '', problem: '', audience: '', status: 'ideia' }
const STATUS_OPTS = [
  { value: 'ideia', label: '💡 Ideia' },
  { value: 'desenvolvimento', label: '⚙️ Desenvolvendo' },
  { value: 'lancado', label: '🚀 Lançado' },
]

export default function MySaas() {
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('mysaas') || 'null')
      if (stored?.name) { setForm(stored); setEditing(false) }
    } catch {}
  }, [])

  const save = () => {
    if (!form.name.trim()) return
    localStorage.setItem('mysaas', JSON.stringify(form))
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const fields = [
    { key: 'name', label: 'Nome do SaaS', placeholder: 'Ex: AgendaFácil, ContratoIA...' },
    { key: 'niche', label: 'Nicho / setor', placeholder: 'Ex: Clínicas odontológicas, academias...' },
    { key: 'problem', label: 'Problema que resolve', placeholder: 'Descreva a dor principal que você resolve' },
    { key: 'audience', label: 'Público-alvo', placeholder: 'Quem vai usar e pagar pelo produto' },
  ]

  if (!editing && form.name) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1B6B3A] flex items-center justify-center">
              <Rocket size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{form.name}</p>
              <p className="text-[10px] text-gray-400">
                {STATUS_OPTS.find(s => s.value === form.status)?.label}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#1B6B3A] dark:hover:text-green-400 transition-colors"
          >
            <Pencil size={12} /> Editar
          </button>
        </div>

        <div className="space-y-2.5">
          {[
            { label: 'Nicho', value: form.niche },
            { label: 'Problema', value: form.problem },
            { label: 'Público', value: form.audience },
          ].map(f => f.value ? (
            <div key={f.label}>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-0.5">{f.label}</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{f.value}</p>
            </div>
          ) : null)}
        </div>

        <div className="p-3 bg-[#E8F5EE] dark:bg-[#0F4A28]/20 rounded-lg border border-[#1B6B3A]/20">
          <p className="text-[10px] text-[#1B6B3A] dark:text-green-400 font-semibold mb-1">💡 Dica</p>
          <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
            O chat de IA já conhece seu projeto e vai usar esse contexto para responder de forma personalizada.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Rocket size={15} className="text-[#1B6B3A] dark:text-green-400" />
        <p className="text-sm font-semibold text-gray-800 dark:text-white">
          {form.name ? 'Editar meu SaaS' : 'Cadastrar meu SaaS'}
        </p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        A IA vai usar essas informações para personalizar as respostas ao seu projeto.
      </p>

      <div className="space-y-3">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              {f.label}
            </label>
            <input
              value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400"
            />
          </div>
        ))}

        <div>
          <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Status atual
          </label>
          <div className="flex gap-2">
            {STATUS_OPTS.map(s => (
              <button
                key={s.value}
                onClick={() => setForm(p => ({ ...p, status: s.value }))}
                className={`flex-1 text-[11px] py-1.5 rounded-lg border transition-colors ${
                  form.status === s.value
                    ? 'bg-[#1B6B3A] text-white border-[#1B6B3A]'
                    : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-[#1B6B3A]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={save}
        disabled={!form.name.trim()}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          saved
            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-[#1B6B3A] hover:bg-[#0F4A28] text-white disabled:opacity-40'
        }`}
      >
        {saved ? <><Check size={14} /> Salvo!</> : <><Save size={14} /> Salvar</>}
      </button>
    </div>
  )
}
