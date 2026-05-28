import { useState, useCallback } from 'react'

const key = (chapterIndex) => `highlights_ch_${chapterIndex}`

export function useHighlights(chapterIndex) {
  const [highlights, setHighlights] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key(chapterIndex)) || '[]')
    } catch {
      return []
    }
  })

  const add = useCallback((text) => {
    const trimmed = text.trim()
    if (!trimmed || trimmed.length < 5) return
    setHighlights(prev => {
      if (prev.includes(trimmed)) return prev
      const next = [...prev, trimmed]
      localStorage.setItem(key(chapterIndex), JSON.stringify(next))
      return next
    })
  }, [chapterIndex])

  const remove = useCallback((text) => {
    setHighlights(prev => {
      const next = prev.filter(h => h !== text)
      localStorage.setItem(key(chapterIndex), JSON.stringify(next))
      return next
    })
  }, [chapterIndex])

  const clear = useCallback(() => {
    localStorage.removeItem(key(chapterIndex))
    setHighlights([])
  }, [chapterIndex])

  return { highlights, add, remove, clear }
}
