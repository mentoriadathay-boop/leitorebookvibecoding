import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useIdeas(userId) {
  const [ideas, setIdeas] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('saved_ideas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setIdeas(data)
      })
  }, [userId])

  const saveIdea = useCallback(async (text, tag, source = 'manual') => {
    if (!userId) return
    const { data } = await supabase.from('saved_ideas').insert({
      user_id: userId, text, tag, source, created_at: new Date().toISOString()
    }).select().single()
    if (data) setIdeas(prev => [data, ...prev])
  }, [userId])

  const deleteIdea = useCallback(async (id) => {
    if (!userId) return
    setIdeas(prev => prev.filter(i => i.id !== id))
    await supabase.from('saved_ideas').delete().eq('id', id)
  }, [userId])

  return { ideas, saveIdea, deleteIdea }
}
