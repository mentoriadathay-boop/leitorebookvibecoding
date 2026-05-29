import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ExternalLink, RefreshCw, Newspaper, Clock, Bookmark } from 'lucide-react'
import AISupportChat from './AISupportChat'

const CATEGORIES = {
  ferramenta: { label: 'Ferramenta', color: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400' },
  modelo:     { label: 'Modelo IA',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  tendencia:  { label: 'Tendência',  color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
  case:       { label: 'Case',       color: 'bg-[#FDF6E3] text-[#C9A84C] dark:bg-yellow-900/20 dark:text-yellow-400' },
  mercado:    { label: 'Mercado',    color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
}

function fmtDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function ArticleCard({ article, newsDate, isSaved, savedId, onSave, onUnsave }) {
  const cat = CATEGORIES[article.category] || CATEGORIES.mercado

  const handleBookmark = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSaved) onUnsave(savedId)
    else onSave(newsDate, article)
  }

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-[#1B6B3A] dark:hover:border-green-600 hover:shadow-md transition-all fade-in"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cat.color}`}>
            {cat.label}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">{article.source}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(onSave || onUnsave) && (
            <button
              onClick={handleBookmark}
              title={isSaved ? 'Remover dos salvos' : 'Salvar notícia'}
              className={`transition-colors ${isSaved ? 'text-[#C9A84C]' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 hover:text-[#C9A84C]'}`}
            >
              <Bookmark size={13} className={isSaved ? 'fill-[#C9A84C]' : ''} />
            </button>
          )}
          <ExternalLink size={13} className="text-gray-300 group-hover:text-[#1B6B3A] dark:group-hover:text-green-400 shrink-0 transition-colors" />
        </div>
      </div>
      <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug group-hover:text-[#1B6B3A] dark:group-hover:text-green-400 transition-colors">
        {article.title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{article.summary}</p>
    </a>
  )
}

export default function VibeNews({ user, savedNews = [], onSaveNews, onUnsaveNews, isNewsSaved, getSavedId }) {
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [view, setView] = useState('today')

  const fetchNews = async () => {
    const now = new Date()
    const brasiliaOffset = -3 * 60
    const brasiliaTime = new Date(now.getTime() + (brasiliaOffset + now.getTimezoneOffset()) * 60000)
    const today = brasiliaTime.toISOString().split('T')[0]

    const { data } = await supabase
      .from('vibe_news')
      .select('*')
      .eq('date', today)
      .single()

    setNews(data || null)
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetchNews() }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchNews()
  }

  const savedByDate = savedNews.reduce((acc, entry) => {
    const date = entry.news_date
    if (!acc[date]) acc[date] = []
    acc[date].push(entry)
    return acc
  }, {})
  const sortedDates = Object.keys(savedByDate).sort((a, b) => b.localeCompare(a))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-[#0F4A28] flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Newspaper size={18} className="text-white" />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">Carregando notícias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-2 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Newspaper size={22} className="text-[#1B6B3A] dark:text-green-400" />
            Vibe News
          </h2>
          {news && view === 'today' && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <Clock size={11} />
              <span className="capitalize">{fmtDate(news.date)}</span>
            </div>
          )}
        </div>
        {view === 'today' && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-[#1B6B3A] dark:hover:text-green-400 transition-colors disabled:opacity-50"
            title="Atualizar"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {/* Sub-tabs (só para usuários logados) */}
      {user && (
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setView('today')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-all ${
              view === 'today'
                ? 'border-[#1B6B3A] text-[#1B6B3A] dark:text-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-[#1B6B3A] dark:hover:text-green-400'
            }`}
          >
            <Newspaper size={12} />
            Hoje
          </button>
          <button
            onClick={() => setView('saved')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-all ${
              view === 'saved'
                ? 'border-[#C9A84C] text-[#C9A84C]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-[#C9A84C]'
            }`}
          >
            <Bookmark
              size={12}
              className={savedNews.length > 0 ? 'fill-[#C9A84C] text-[#C9A84C]' : ''}
            />
            Notícias Salvas
            {savedNews.length > 0 && (
              <span className="bg-[#C9A84C] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold leading-none">
                {savedNews.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* View: Notícias Salvas */}
      {view === 'saved' && (
        <div className="space-y-6">
          {savedNews.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="w-14 h-14 rounded-2xl bg-[#FDF6E3] dark:bg-yellow-900/20 flex items-center justify-center mx-auto mb-4">
                <Bookmark size={24} className="text-[#C9A84C]" />
              </div>
              <h3 className="font-playfair font-bold text-lg text-gray-900 dark:text-white mb-2">
                Nenhuma notícia salva ainda
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Clique no ícone de marcador nos cards para salvar notícias.
              </p>
            </div>
          ) : (
            sortedDates.map(date => (
              <div key={date}>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 capitalize">
                  {fmtDate(date)}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {savedByDate[date].map(entry => (
                    <ArticleCard
                      key={entry.id}
                      article={entry.article}
                      newsDate={entry.news_date}
                      isSaved={true}
                      savedId={entry.id}
                      onSave={null}
                      onUnsave={onUnsaveNews}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View: Hoje */}
      {view === 'today' && (
        <>
          {!news ? (
            <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="w-14 h-14 rounded-2xl bg-[#E8F5EE] dark:bg-[#0F4A28]/20 flex items-center justify-center mx-auto mb-4">
                <Newspaper size={24} className="text-[#1B6B3A] dark:text-green-400" />
              </div>
              <h3 className="font-playfair font-bold text-lg text-gray-900 dark:text-white mb-2">
                As notícias de hoje ainda estão sendo preparadas
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                A curadoria é gerada automaticamente todo dia às 7h (horário de Brasília).
              </p>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 mx-auto text-sm px-4 py-2 border border-[#1B6B3A] text-[#1B6B3A] hover:bg-[#E8F5EE] dark:hover:bg-[#0F4A28]/20 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                Verificar novamente
              </button>
            </div>
          ) : (
            <>
              {/* Resumo do dia */}
              <div className="bg-[#E8F5EE] dark:bg-[#0F4A28]/20 border-l-4 border-[#1B6B3A] rounded-xl p-5">
                <p className="text-xs font-bold text-[#1B6B3A] dark:text-green-400 uppercase tracking-wider mb-3">
                  Resumo do dia
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {news.summary}
                </p>
              </div>

              {/* Cards de artigos */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {news.articles?.length} notícias selecionadas
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {news.articles?.map((article, i) => (
                    <ArticleCard
                      key={i}
                      article={article}
                      newsDate={news.date}
                      isSaved={user ? isNewsSaved(article.title) : false}
                      savedId={user ? getSavedId(article.title) : null}
                      onSave={user ? onSaveNews : null}
                      onUnsave={user ? onUnsaveNews : null}
                    />
                  ))}
                </div>
              </div>

              <p className="text-center text-[10px] text-gray-400 dark:text-gray-600">
                Curadoria gerada por IA · Atualiza todo dia às 7h (Brasília) · Verifique as fontes antes de compartilhar
              </p>

              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Aprofunde com a IA
                </p>
                <AISupportChat
                  chapter={{ title: 'Vibe News', content: news.summary || '' }}
                  initialMessage="Oi! Pode me perguntar sobre qualquer notícia de hoje, tendências de IA ou como aplicar isso no seu projeto."
                  placeholder="Pergunte sobre as notícias de hoje..."
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
