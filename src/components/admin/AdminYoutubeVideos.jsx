import { useState, useEffect } from 'react'
import { Video, Plus, Trash2, Loader, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

function youtubeId(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1)
    if (u.hostname.includes('youtube.com')) {
      if (u.searchParams.get('v')) return u.searchParams.get('v')
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts') return parts[1]
    }
  } catch { /* ignore */ }
  return null
}

export default function AdminYoutubeVideos() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('youtube_videos').select('*').order('sort_order').order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => { setTitle(''); setDescription(''); setUrl('') }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('Título é obrigatório.'); return }
    if (!youtubeId(url)) { setError('Cole uma URL válida do YouTube (ex.: https://www.youtube.com/watch?v=... ou https://youtu.be/...)'); return }

    setSaving(true)
    try {
      const { error: insertError } = await supabase.from('youtube_videos').insert({
        title: title.trim(),
        description: description.trim() || null,
        url: url.trim(),
        published: true,
      })
      if (insertError) throw insertError
      resetForm()
      load()
    } catch (err) {
      setError(err.message || 'Erro ao salvar vídeo.')
    } finally {
      setSaving(false)
    }
  }

  const togglePublished = async (v) => {
    await supabase.from('youtube_videos').update({ published: !v.published }).eq('id', v.id)
    load()
  }

  const deleteVideo = async (v) => {
    if (!confirm(`Excluir "${v.title}"? Essa ação não pode ser desfeita.`)) return
    await supabase.from('youtube_videos').delete().eq('id', v.id)
    load()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Video size={18} className="text-[#5B2A6E]" /> Vídeos YouTube
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Cole a URL de um vídeo do YouTube — a plataforma faz o embed automaticamente em Estudos Vibe → Vídeos.
        </p>
      </div>

      <form onSubmit={submit} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Título *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do vídeo"
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#5B2A6E]" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Descrição (opcional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Breve descrição do conteúdo"
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#5B2A6E] resize-none" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">URL do YouTube *</label>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#5B2A6E]" />
        </div>

        {error && <p className="text-xs text-coral-600 dark:text-coral-400">{error}</p>}

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3E1B4D] hover:bg-[#5B2A6E] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
          {saving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
          {saving ? 'Salvando...' : 'Adicionar vídeo'}
        </button>
      </form>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Vídeos cadastrados</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader size={18} className="animate-spin text-gray-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">Nenhum vídeo cadastrado ainda.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {items.map(v => {
              const id = youtubeId(v.url)
              return (
                <div key={v.id} className="flex items-center gap-3 px-4 py-3">
                  {id ? (
                    <img src={`https://i.ytimg.com/vi/${id}/default.jpg`} alt="" className="w-16 h-10 object-cover rounded shrink-0" />
                  ) : (
                    <div className="w-16 h-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                      <Video size={14} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{v.title}</p>
                    <a href={v.url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-gray-400 hover:text-[#5B2A6E] flex items-center gap-1 truncate">
                      {v.url} <ExternalLink size={9} />
                    </a>
                  </div>
                  <button onClick={() => togglePublished(v)} title={v.published ? 'Ocultar' : 'Publicar'}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#5B2A6E] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0">
                    {v.published ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => deleteVideo(v)} title="Excluir"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-coral-600 hover:bg-coral-50 dark:hover:bg-coral-900/20 transition-colors shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
