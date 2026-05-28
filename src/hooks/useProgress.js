import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useProgress(userId) {
  const [completed, setCompleted] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    supabase
      .from('reading_progress')
      .select('chapter_index, completed')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) {
          const map = {}
          data.forEach(r => { map[r.chapter_index] = r.completed })
          setCompleted(map)
        }
        setLoading(false)
      })
  }, [userId])

  const markCompleted = useCallback(async (chapterIndex) => {
    if (!userId) return
    const newState = { ...completed, [chapterIndex]: true }
    setCompleted(newState)
    await supabase.from('reading_progress').upsert(
      { user_id: userId, chapter_index: chapterIndex, completed: true, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,chapter_index' }
    )
  }, [userId, completed])

  const completedCount = Object.values(completed).filter(Boolean).length

  return { completed, completedCount, markCompleted, loading }
}
