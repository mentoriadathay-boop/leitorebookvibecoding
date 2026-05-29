import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'

const TYPE_STYLES = {
  feature: { label: 'Novidade',      color: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400' },
  update:  { label: 'Atualização',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  news:    { label: 'Notícia',       color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
  alert:   { label: 'Aviso',         color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
}

function fmtRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min atrás`
  if (hours < 24) return `${hours}h atrás`
  if (days < 7) return `${days}d atrás`
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export default function NotificationBell({ user }) {
  const [open, setOpen] = useState(false)
  // Guarda quais notificações estavam não lidas ao abrir o painel (para manter o ponto verde)
  const [sessionUnread, setSessionUnread] = useState(new Set())
  const ref = useRef(null)
  const { notifications, reads, unreadCount, markAllRead } = useNotifications(user?.id)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    if (!open) {
      const currentUnread = new Set(notifications.filter(n => !reads.has(n.id)).map(n => n.id))
      setSessionUnread(currentUnread)
      if (currentUnread.size > 0) markAllRead()
    }
    setOpen(o => !o)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notificações"
      >
        <Bell
          size={16}
          className={unreadCount > 0 ? 'text-[#0F4A28] dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}
        />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none px-0.5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-y-auto bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-[#1A1A1A]">
            <span className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
              <Bell size={13} className="text-[#1B6B3A] dark:text-green-400" />
              Novidades
            </span>
            {notifications.length > 0 && unreadCount === 0 && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">Tudo em dia ✓</span>
            )}
          </div>

          {/* Lista */}
          {notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell size={28} className="mx-auto mb-2 text-gray-200 dark:text-gray-700" />
              <p className="text-xs text-gray-400 dark:text-gray-500">Nenhuma novidade por enquanto</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {notifications.map(n => {
                const isSessionUnread = sessionUnread.has(n.id)
                const type = TYPE_STYLES[n.type] || TYPE_STYLES.update
                return (
                  <div
                    key={n.id}
                    className={`px-4 py-3 transition-colors ${isSessionUnread ? 'bg-[#E8F5EE]/50 dark:bg-[#0F4A28]/10' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${type.color}`}>
                        {type.label}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">
                        {fmtRelative(n.created_at)}
                      </span>
                      {isSessionUnread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1B6B3A] dark:bg-green-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                        {n.body}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
