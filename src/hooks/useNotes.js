import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useNotes(userId) {
  const [notes, setNotes] = useState({})

  useEffect(() => {
    if (!userId) return
    supabase
      .from('notes')
      .select('chapter_index, content')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) {
          const map = {}
          data.forEach(r => { map[r.chapter_index] = r.content })
          setNotes(map)
        }
      })
  }, [userId])

  const saveNote = useCallback(async (chapterIndex, content) => {
    if (!userId) return
    setNotes(prev => ({ ...prev, [chapterIndex]: content }))
    await supabase.from('notes').upsert(
      { user_id: userId, chapter_index: chapterIndex, content, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,chapter_index' }
    )
  }, [userId])

  const noteCount = Object.values(notes).filter(n => n && n.trim()).length

  return { notes, saveNote, noteCount }
}
