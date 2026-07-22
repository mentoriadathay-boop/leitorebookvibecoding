import { useState, useEffect } from 'react'
import { Newspaper, Loader, Clock, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

function fmtDate(d) {
  return new Date(d).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

export default function AdminVibeNews() {
  const [editions, setEditions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('vibe_news')
      .select('id, date, created_at')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setEditions(data); setLoading(false) })
  }, [])

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Newspaper size={18} className="text-[#5B2A6E]" /> Vibe News
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          A busca de novidades agora é liberada pra qualquer usuário logado, direto na aba "Vibe News" da plataforma —
          não depende mais de ação do admin. Aqui embaixo fica só o histórico do que já foi gerado.
        </p>
      </div>

      {/* Histórico */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Últimas gerações
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader size={18} className="animate-spin text-gray-400" />
          </div>
        ) : editions.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">
            Nenhuma geração ainda.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {editions.map(e => (
              <div key={e.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {fmtDate(e.date + 'T12:00:00')}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(e.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl px-4 py-3 text-xs text-blue-700 dark:text-blue-400 space-y-1">
        <p className="font-bold">⏰ Geração automática de base (opcional):</p>
        <p>Supabase Dashboard → <strong>Edge Functions</strong> → <strong>vibe-news-cron</strong> → aba <strong>Schedule</strong> → Add Schedule → cron: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">0 10 * * *</code> (10h UTC = 7h Brasília) — garante que sempre exista algo mais recente, mesmo se nenhum usuário buscar no dia.</p>
      </div>
    </div>
  )
}
