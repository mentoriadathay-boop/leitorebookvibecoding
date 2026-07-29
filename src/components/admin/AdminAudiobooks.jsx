import { useState, useEffect } from 'react'
import { Headphones, Upload, Trash2, Loader, ExternalLink, Eye, EyeOff, Lock, Unlock } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

const BUCKET = 'audiobooks'

export default function AdminAudiobooks() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [isPremium, setIsPremium] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('audiobooks').select('*').order('sort_order').order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const uploadFile = async (file, prefix) => {
    const ext = file.name.split('.').pop()
    const path = `${prefix}-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
    if (upErr) throw upErr
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  }

  const resetForm = () => {
    setTitle(''); setDescription(''); setExternalUrl(''); setCoverFile(null); setAudioFile(null); setIsPremium(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('Título é obrigatório.'); return }
    if (!audioFile && !externalUrl.trim()) { setError('Envie um arquivo de áudio ou informe uma URL externa.'); return }

    setSaving(true)
    try {
      let cover_url = null
      let audio_url = null
      if (coverFile) cover_url = await uploadFile(coverFile, 'cover')
      if (audioFile) audio_url = await uploadFile(audioFile, 'audio')

      const { error: insertError } = await supabase.from('audiobooks').insert({
        title: title.trim(),
        description: description.trim() || null,
        cover_url,
        audio_url,
        external_url: externalUrl.trim() || null,
        published: true,
        is_premium: isPremium,
      })
      if (insertError) throw insertError
      resetForm()
      load()
    } catch (err) {
      setError(err.message || 'Erro ao salvar audiobook.')
    } finally {
      setSaving(false)
    }
  }

  const togglePublished = async (a) => {
    await supabase.from('audiobooks').update({ published: !a.published }).eq('id', a.id)
    load()
  }

  const togglePremium = async (a) => {
    await supabase.from('audiobooks').update({ is_premium: !a.is_premium }).eq('id', a.id)
    load()
  }

  const deleteAudiobook = async (a) => {
    if (!confirm(`Excluir "${a.title}"? Essa ação não pode ser desfeita.`)) return
    await supabase.from('audiobooks').delete().eq('id', a.id)
    load()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Headphones size={18} className="text-[#5B2A6E]" /> Audiobooks
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Envie a capa e o arquivo de áudio (ou informe uma URL externa) — o card aparece em Estudos Vibe → Audiobooks.
        </p>
      </div>

      <form onSubmit={submit} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Título *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nome do audiobook"
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#5B2A6E]" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Descrição (opcional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Um resumo curto do audiobook"
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#5B2A6E] resize-none" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Capa (imagem)</label>
            <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Arquivo de áudio (mp3, m4a, wav...)</label>
            <input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-500 dark:text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">URL externa (opcional — use se não for enviar o áudio, ou como alternativa)</label>
          <input value={externalUrl} onChange={e => setExternalUrl(e.target.value)} placeholder="https://..."
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#5B2A6E]" />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)}
            className="w-4 h-4 accent-[#5B2A6E]" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <Lock size={12} className="text-[#5B2A6E]" /> Conteúdo Premium (aparece com cadeado — só membros pagos acessam)
          </span>
        </label>

        {error && <p className="text-xs text-coral-600 dark:text-coral-400">{error}</p>}

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3E1B4D] hover:bg-[#5B2A6E] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
          {saving ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
          {saving ? 'Enviando...' : 'Adicionar audiobook'}
        </button>
      </form>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Audiobooks cadastrados</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader size={18} className="animate-spin text-gray-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">Nenhum audiobook cadastrado ainda.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {items.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                {a.cover_url ? (
                  <img src={a.cover_url} alt="" className="w-10 h-10 object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <Headphones size={14} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                    {a.title}
                    {a.is_premium && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #5B2A6E 0%, #C2298A 100%)' }}>
                        <Lock size={8} /> Premium
                      </span>
                    )}
                  </p>
                  {(a.audio_url || a.external_url) && (
                    <a href={a.audio_url || a.external_url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-gray-400 hover:text-[#5B2A6E] flex items-center gap-1 truncate">
                      {a.audio_url ? 'Áudio enviado' : 'Link externo'} <ExternalLink size={9} />
                    </a>
                  )}
                </div>
                <button onClick={() => togglePremium(a)} title={a.is_premium ? 'Tornar gratuito' : 'Tornar Premium'}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#5B2A6E] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0">
                  {a.is_premium ? <Lock size={14} className="text-[#5B2A6E]" /> : <Unlock size={14} />}
                </button>
                <button onClick={() => togglePublished(a)} title={a.published ? 'Ocultar' : 'Publicar'}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#5B2A6E] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0">
                  {a.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => deleteAudiobook(a)} title="Excluir"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-coral-600 hover:bg-coral-50 dark:hover:bg-coral-900/20 transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
