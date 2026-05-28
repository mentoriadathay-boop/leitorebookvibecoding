import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { chapters as staticChapters, chapterGroups as staticGroups } from '../data/chapters'

export function useChapters() {
  const [chapters, setChapters] = useState(staticChapters)
  const [chapterGroups, setChapterGroups] = useState(staticGroups)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('*')
          .eq('published', true)
          .order('order_index')

        if (!error && data?.length > 0) {
          setChapters(data.map(ch => ({
            title: ch.title,
            content: ch.content || '',
            page: ch.page || 1,
            readingTime: ch.reading_time || 5,
            glossaryTerms: ch.glossary_terms || [],
            quizQuestions: ch.quiz_questions || [],
          })))

          const seen = {}
          const groups = []
          data.forEach((ch, idx) => {
            const label = ch.group_label || 'Geral'
            if (!seen[label]) { seen[label] = { label, chapters: [] }; groups.push(seen[label]) }
            seen[label].chapters.push(idx)
          })
          setChapterGroups(groups)
        }
      } catch (e) {
        console.error('useChapters:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { chapters, chapterGroups, loading }
}
