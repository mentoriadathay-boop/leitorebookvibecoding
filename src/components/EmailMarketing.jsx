import { useState, useEffect } from 'react'
import { Mail, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const CATEGORIES = {
  newsletter: { label: 'Newsletter',  color: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400' },
  bastidores: { label: 'Bastidores',  color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
  lancamento: { label: 'Lançamento',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  dica:       { label: 'Dica',        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' },
  promocao:   { label: 'Promoção',    color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function EmailMarketing() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('todos')

  useEffect(() => {
    supabase
      .from('email_marketing')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setEmails(data)
        setLoading(false)
      })
  }, [])

  const categories = ['todos', ...new Set(emails.map(e => e.category))]
  const filtered = filter === 'todos' ? emails : emails.filter(e => e.category === filter)

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 rounded-xl bg-[#0F4A28] flex items-center justify-center animate-pulse">
        <Mail size={18} className="text-white" />
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Mail size={22} className="text-[#1B6B3A] dark:text-green-400" />
          Newsletter
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Arquivo dos emails enviados para a audiência — conteúdo, bastidores e estratégias.
        </p>
      </div>

      {/* Filtros */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const info = cat === 'todos' ? null : CATEGORIES[cat]
            const active = filter === cat
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
                  active
                    ? 'bg-[#0F4A28] text-white border-[#0F4A28]'
                    : 'bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-[#1B6B3A]'
                }`}
              >
                {cat === 'todos' ? 'Todos' : (info?.label || cat)}
              </button>
            )
          })}
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F5EE] dark:bg-[#0F4A28]/20 flex items-center justify-center mx-auto mb-4">
            <Mail size={24} className="text-[#1B6B3A] dark:text-green-400" />
          </div>
          <h3 className="font-playfair font-bold text-lg text-gray-900 dark:text-white mb-2">
            Nenhum email publicado ainda
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Em breve o conteúdo dos emails aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(email => {
            const cat = CATEGORIES[email.category] || CATEGORIES.newsletter
            const isOpen = expanded === email.id
            return (
              <div key={email.id}
                className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-[#1B6B3A] dark:hover:border-green-600 transition-all">
                <button
                  onClick={() => setExpanded(isOpen ? null : email.id)}
                  className="w-full text-left p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${cat.color}`}>
                          {cat.label}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          {fmtDate(email.created_at)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug">
                        {email.subject}
                      </h3>
                    </div>
                    <span className="shrink-0 text-gray-400 dark:text-gray-500 mt-0.5">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700">
                    <div
                      className="pt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: email.body.includes('<')
                          ? email.body
                          : email.body.replace(/\n/g, '<br/>')
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
