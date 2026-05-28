import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useBookmarks(userId) {
  const [bookmarks, setBookmarks] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('bookmarks')
      .select('chapter_index')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) setBookmarks(data.map(r => r.chapter_index))
      })
  }, [userId])

  const toggleBookmark = useCallback(async (chapterIndex) => {
    if (!userId) return
    if (bookmarks.includes(chapterIndex)) {
      setBookmarks(prev => prev.filter(i => i !== chapterIndex))
      await supabase.from('bookmarks').delete().eq('user_id', userId).eq('chapter_index', chapterIndex)
    } else {
      setBookmarks(prev => [...prev, chapterIndex])
      await supabase.from('bookmarks').insert({ user_id: userId, chapter_index: chapterIndex })
    }
  }, [userId, bookmarks])

  return { bookmarks, toggleBookmark }
}
