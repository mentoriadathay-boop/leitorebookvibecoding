import { useState, useEffect } from 'react'
import { Newspaper, RefreshCw, CheckCircle, AlertCircle, Loader, Clock, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

function fmtDate(d) {
  return new Date(d).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

export default function AdminVibeNews() {
  const [editions, setEditions] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('vibe_news')
      .select('id, date, created_at')
      .order('date', { ascending: false })
      .limit(10)
    if (data) setEditions(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const brasiliaToday = () => {
    const now = new Date()
    const offset = -3 * 60
    const bt = new Date(now.getTime() + (offset + now.getTimezoneOffset()) * 60000)
    return bt.toISOString().split('T')[0]
  }

  const hasToday = editions.some(e => e.date === brasiliaToday())

  const handleGenerate = async () => {
    setGenerating(true)
    setResult(null)
    try {
      const session = (await supabase.auth.getSession()).data.session
      const res = await fetch(
        'https://libjrqfzxfglztxbjfdb.supabase.co/functions/v1/vibe-news-cron',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: '{}',
        }
      )
      const json = await res.json()
      setResult({ ok: res.ok, status: res.status, ...json })
      if (res.ok) load()
    } catch (e) {
      setResult({ ok: false, error: e.message })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Newspaper size={18} className="text-[#1B6B3A]" /> Vibe News
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Geração automática às 7h (Brasília). Use o botão abaixo para gerar manualmente quando necessário.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || hasToday}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0F4A28] hover:bg-[#1B6B3A] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 shrink-0"
        >
          {generating
            ? <><Loader size={14} className="animate-spin" /> Gerando...</>
            : hasToday
            ? <><CheckCircle size={14} /> Já gerada hoje</>
            : <><RefreshCw size={14} /> Gerar notícias de hoje</>
          }
        </button>
      </div>

      {/* Status do dia */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
        hasToday
          ? 'bg-[#E8F5EE] dark:bg-[#0F4A28]/20 border-[#1B6B3A]/30 text-[#1B6B3A] dark:text-green-400'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400'
      }`}>
        {hasToday
          ? <><CheckCircle size={16} /> Notícia de hoje já foi gerada ✓</>
          : <><AlertCircle size={16} /> Notícia de hoje ainda não foi gerada — clique em "Gerar notícias de hoje"</>
        }
      </div>

      {/* Resultado da geração */}
      {result && (
        <div className={`px-4 py-3 rounded-xl text-sm flex items-start gap-2 ${
          result.ok
            ? 'bg-[#E8F5EE] dark:bg-[#0F4A28]/20 text-[#1B6B3A] dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          {result.ok
            ? <><CheckCircle size={15} className="shrink-0 mt-0.5" />
                {result.message
                  ? `${result.message} (${result.date})`
                  : `✓ ${result.articles} artigos gerados para ${result.date}`
                }</>
            : <div>
                <div className="flex items-center gap-1.5 font-semibold mb-1">
                  <AlertCircle size={15} className="shrink-0" />
                  Erro (status {result.status})
                </div>
                <p className="text-xs opacity-80 font-mono break-all">
                  {result.error || result.detail || result.preview || 'Falha desconhecida'}
                </p>
              </div>
          }
        </div>
      )}

      {/* Histórico */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Últimas edições
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader size={18} className="animate-spin text-gray-400" />
          </div>
        ) : editions.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">
            Nenhuma edição gerada ainda.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {editions.map(e => {
              const isToday = e.date === brasiliaToday()
              return (
                <div key={e.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {fmtDate(e.date + 'T12:00:00')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isToday && (
                      <span className="text-[10px] bg-[#E8F5EE] dark:bg-[#0F4A28]/30 text-[#1B6B3A] dark:text-green-400 px-2 py-0.5 rounded-full font-bold">hoje</span>
                    )}
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(e.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl px-4 py-3 text-xs text-blue-700 dark:text-blue-400 space-y-1">
        <p className="font-bold">⏰ Para geração automática às 7h:</p>
        <p>Supabase Dashboard → <strong>Edge Functions</strong> → <strong>vibe-news-cron</strong> → aba <strong>Schedule</strong> → Add Schedule → cron: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">0 10 * * *</code> (10h UTC = 7h Brasília)</p>
      </div>
    </div>
  )
}
