import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [reads, setReads] = useState(new Set())

  useEffect(() => {
    supabase
      .from('platform_notifications')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setNotifications(data) })

    // Realtime: nova notificação aparece em tempo real para usuários online
    const channel = supabase
      .channel('platform_notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'platform_notifications' }, ({ new: n }) => {
        if (n.published) setNotifications(prev => [n, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('notification_reads')
      .select('notification_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) setReads(new Set(data.map(r => r.notification_id)))
      })
  }, [userId])

  const unreadCount = notifications.filter(n => !reads.has(n.id)).length

  const markAllRead = useCallback(async () => {
    if (!userId) return
    const unread = notifications.filter(n => !reads.has(n.id))
    if (unread.length === 0) return
    const inserts = unread.map(n => ({ user_id: userId, notification_id: n.id }))
    await supabase.from('notification_reads').upsert(inserts, { onConflict: 'user_id,notification_id' })
    setReads(new Set(notifications.map(n => n.id)))
  }, [userId, notifications, reads])

  return { notifications, reads, unreadCount, markAllRead }
}
