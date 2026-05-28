import { useState } from 'react'
import { Copy, Check, Search } from 'lucide-react'
import { prompts, PROMPT_CATEGORIES } from '../data/prompts'

function PromptCard({ item }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(item.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-3 hover:border-[#1B6B3A]/50 dark:hover:border-green-700/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug">{item.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
        </div>
        <button
          onClick={copy}
          title="Copiar prompt"
          className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
            copied
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-[#E8F5EE] text-[#1B6B3A] hover:bg-[#1B6B3A] hover:text-white dark:bg-[#0F4A28]/30 dark:text-green-400 dark:hover:bg-[#1B6B3A] dark:hover:text-white'
          }`}
        >
          {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
        </button>
      </div>
      <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 whitespace-pre-wrap font-sans leading-relaxed border border-gray-100 dark:border-gray-700 max-h-48 overflow-y-auto scrollbar-thin">
        {item.prompt}
      </pre>
    </div>
  )
}

export default function PromptLibrary() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [search, setSearch] = useState('')

  const filtered = prompts.filter(p => {
    const matchCat = activeCategory === 'Todos' || p.category === activeCategory
    const q = search.toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.prompt.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  return (
    <div className="max-w-4xl mx-auto px-2 space-y-5">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Biblioteca de Prompts
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Prompts prontos para usar no Claude, ChatGPT ou qualquer IA. Copie, personalize com os colchetes e cole.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar prompt..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-300 placeholder-gray-400"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {['Todos', ...PROMPT_CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-[#1B6B3A] text-white'
                : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#1B6B3A] hover:text-[#1B6B3A] dark:hover:text-green-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {filtered.length} prompt{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Prompts grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">Nenhum prompt encontrado para essa busca.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 pb-6">
          {filtered.map((item, i) => <PromptCard key={i} item={item} />)}
        </div>
      )}
    </div>
  )
}
