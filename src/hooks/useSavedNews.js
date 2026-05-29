import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useSavedNews(userId) {
  const [savedNews, setSavedNews] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('saved_news')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })
      .then(({ data }) => {
        if (data) setSavedNews(data)
      })
  }, [userId])

  const saveNews = useCallback(async (newsDate, article) => {
    if (!userId) return
    const { data } = await supabase.from('saved_news').insert({
      user_id: userId,
      news_date: newsDate,
      article,
    }).select().single()
    if (data) setSavedNews(prev => [data, ...prev])
  }, [userId])

  const unsaveNews = useCallback(async (id) => {
    if (!userId) return
    setSavedNews(prev => prev.filter(n => n.id !== id))
    await supabase.from('saved_news').delete().eq('id', id)
  }, [userId])

  const isNewsSaved = useCallback((articleTitle) => {
    return savedNews.some(n => n.article?.title === articleTitle)
  }, [savedNews])

  const getSavedId = useCallback((articleTitle) => {
    return savedNews.find(n => n.article?.title === articleTitle)?.id
  }, [savedNews])

  return { savedNews, saveNews, unsaveNews, isNewsSaved, getSavedId }
}
