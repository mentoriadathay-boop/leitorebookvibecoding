import { useState, useEffect } from 'react'
import { BookOpen, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

function EbookCard({ ebook }) {
  const href = ebook.pdf_url || ebook.external_url
  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
        {ebook.cover_url ? (
          <img src={ebook.cover_url} alt={`Capa de ${ebook.title}`} className="w-full h-full object-cover" />
        ) : (
          <BookOpen size={40} className="text-gray-300 dark:text-gray-600" />
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-playfair font-bold text-sm text-gray-900 dark:text-white leading-snug mb-1">
          {ebook.title}
        </h3>
        {ebook.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 flex-1">
            {ebook.description}
          </p>
        )}
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 mt-auto bg-[#5B2A6E] hover:bg-[#3E1B4D] text-white rounded-xl transition-colors"
          >
            Acessar <ExternalLink size={12} />
          </a>
        ) : (
          <span className="text-xs text-gray-400 mt-auto">Link indisponível</span>
        )}
      </div>
    </div>
  )
}

export default function Ebooks() {
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('ebooks')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data }) => { setEbooks(data || []); setLoading(false) })
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <BookOpen size={22} className="text-[#5B2A6E] dark:text-magic-light" />
          Ebooks
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Clique num ebook para acessar o conteúdo.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#5B2A6E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : ebooks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="w-14 h-14 rounded-2xl bg-[#F2E4FA] dark:bg-[#3E1B4D]/20 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-[#5B2A6E] dark:text-magic-light" />
          </div>
          <h3 className="font-playfair font-bold text-lg text-gray-900 dark:text-white mb-2">
            Nenhum ebook disponível ainda
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Novos ebooks aparecerão aqui em breve.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ebooks.map(e => <EbookCard key={e.id} ebook={e} />)}
        </div>
      )}
    </div>
  )
}
