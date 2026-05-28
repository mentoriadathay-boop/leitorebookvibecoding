import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useChecklist(userId) {
  const [steps, setSteps] = useState({})

  useEffect(() => {
    if (!userId) return
    supabase
      .from('checklist_steps')
      .select('step_number, completed')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) {
          const map = {}
          data.forEach(r => { map[r.step_number] = r.completed })
          setSteps(map)
        }
      })
  }, [userId])

  const toggleStep = useCallback(async (stepNumber) => {
    if (!userId) return
    const newVal = !steps[stepNumber]
    setSteps(prev => ({ ...prev, [stepNumber]: newVal }))
    await supabase.from('checklist_steps').upsert(
      { user_id: userId, step_number: stepNumber, completed: newVal, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,step_number' }
    )
  }, [userId, steps])

  const completedCount = Object.values(steps).filter(Boolean).length

  return { steps, toggleStep, completedCount }
}
