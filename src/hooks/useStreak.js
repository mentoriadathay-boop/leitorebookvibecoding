import { useState, useEffect } from 'react'

export function useStreak() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    try {
      const stored = JSON.parse(localStorage.getItem('readingStreak') || '{}')
      const { count = 0, lastDate = '' } = stored

      if (lastDate === today) {
        setStreak(count)
        return
      }

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const newCount = lastDate === yesterdayStr ? count + 1 : 1
      localStorage.setItem('readingStreak', JSON.stringify({ count: newCount, lastDate: today }))
      setStreak(newCount)
    } catch {
      setStreak(1)
    }
  }, [])

  return streak
}
