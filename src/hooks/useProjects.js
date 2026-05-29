import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useProjects(userId) {
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProjectState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    supabase
      .from('user_projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setProjects(data)
          const saved = localStorage.getItem('activeProjectId')
          const found = saved ? data.find(p => p.id === saved) : null
          setActiveProjectState(found || data[0])
        }
        setLoading(false)
      })
  }, [userId])

  const setActiveProject = useCallback((project) => {
    setActiveProjectState(project)
    if (project) localStorage.setItem('activeProjectId', project.id)
  }, [])

  const createProject = useCallback(async (name) => {
    if (!userId) return null
    const { data, error } = await supabase
      .from('user_projects')
      .insert({ user_id: userId, name })
      .select()
      .single()
    if (error || !data) return null
    setProjects(prev => [data, ...prev])
    setActiveProject(data)
    return data
  }, [userId, setActiveProject])

  const saveToolData = useCallback(async (projectId, field, value) => {
    const { data } = await supabase
      .from('user_projects')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .select()
      .single()
    if (data) {
      setProjects(prev => prev.map(p => p.id === projectId ? data : p))
      setActiveProjectState(prev => prev?.id === projectId ? data : prev)
    }
    return data
  }, [])

  const deleteProject = useCallback(async (projectId) => {
    await supabase.from('user_projects').delete().eq('id', projectId)
    setProjects(prev => {
      const next = prev.filter(p => p.id !== projectId)
      setActiveProjectState(next[0] || null)
      return next
    })
  }, [])

  return { projects, activeProject, setActiveProject, loading, createProject, saveToolData, deleteProject }
}
