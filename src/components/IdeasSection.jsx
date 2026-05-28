import { useState } from 'react'
import { Trash2, Download, Tag } from 'lucide-react'

export default function IdeasSection({ ideas, onSaveIdea, onDeleteIdea }) {
  const [text, setText] = useState('')
  const [tag, setTag] = useState('')
  const [filter, setFilter] = useState('all')

  const handleSave = () => {
    if (!text.trim()) return
    onSaveIdea(text.trim(), tag.trim() || 'Geral', 'manual')
    setText('')
    setTag('')
  }

  const filtered = ideas.filter(i => filter === 'all' || i.source === filter)

  const exportTxt = () => {
    const content = ideas.map(i =>
      `[${i.source === 'manual' ? 'Manual' : 'Gerador'}] ${i.tag ? `#${i.tag} ` : ''}${i.text}\n---`
    ).join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'minhas-ideias-saas.txt'
    a.click()
  }

  const tagColors = ['bg-red-100 text-red-700', 'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700']
  const tagColor = (t) => tagColors[Math.abs(t.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % tagColors.length]

  return (
    <div className="max-w-2xl mx-auto px-2">
      <div className="mb-6">
        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1">Minhas Ideias</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Registre e organize suas ideias de SaaS.</p>
      </div>

      {/* Add idea */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-5">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Descreva sua ideia de SaaS..."
          className="w-full h-24 text-sm resize-none border border-gray-200 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400 mb-3"
        />
        <div className="flex gap-2">
          <input
            value={tag}
            onChange={e => setTag(e.target.value)}
            placeholder="Tag (ex: Educação, Saúde)"
            className="flex-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400"
          />
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="px-4 py-2 bg-[#1B6B3A] hover:bg-[#0F4A28] text-white text-sm rounded-lg font-medium disabled:opacity-40 transition-colors"
          >
            Salvar ideia
          </button>
        </div>
      </div>

      {/* Filters and export */}
      {ideas.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {['all', 'manual', 'generator'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  filter === f
                    ? 'bg-[#1B6B3A] text-white border-[#1B6B3A]'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'manual' ? 'Manual' : 'Gerador'}
              </button>
            ))}
          </div>
          <button
            onClick={exportTxt}
            className="flex items-center gap-1 text-xs text-[#1B6B3A] hover:text-[#0F4A28] transition-colors"
          >
            <Download size={12} /> Exportar .txt
          </button>
        </div>
      )}

      {/* Ideas list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            Nenhuma ideia registrada ainda.
          </div>
        ) : filtered.map(idea => (
          <div key={idea.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 p-4 fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  {idea.tag && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${tagColor(idea.tag)}`}>
                      #{idea.tag}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {idea.source === 'generator' ? '🤖 Gerador' : '✍️ Manual'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{idea.text}</p>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  {new Date(idea.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <button
                onClick={() => onDeleteIdea(idea.id)}
                className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors mt-0.5"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
