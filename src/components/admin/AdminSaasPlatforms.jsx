import { useState, useEffect } from 'react'
import { Rocket, Upload, Trash2, Loader, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

const BUCKET = 'platforms'

export default function AdminSaasPlatforms() {
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [logoFile, setLogoFile] = useState(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('saas_platforms').select('*').order('sort_order').order('created_at', { ascending: false })
    setPlatforms(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const uploadFile = async (file) => {
    const ext = file.name.split('.').pop()
    const path = `logo-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
    if (upErr) throw upErr
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  }

  const resetForm = () => {
    setName(''); setDescription(''); setUrl(''); setLogoFile(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Nome é obrigatório.'); return }
    if (!url.trim()) { setError('URL de acesso é obrigatória.'); return }

    setSaving(true)
    try {
      let logo_url = null
      if (logoFile) logo_url = await uploadFile(logoFile)

      const { error: insertError } = await supabase.from('saas_platforms').insert({
        name: name.trim(),
        description: description.trim() || null,
        url: url.trim(),
        logo_url,
        published: true,
      })
      if (insertError) throw insertError
      resetForm()
      load()
    } catch (err) {
      setError(err.message || 'Erro ao salvar plataforma.')
    } finally {
      setSaving(false)
    }
  }

  const togglePublished = async (p) => {
    await supabase.from('saas_platforms').update({ published: !p.published }).eq('id', p.id)
    load()
  }

  const deletePlatform = async (p) => {
    if (!confirm(`Excluir "${p.name}"? Essa ação não pode ser desfeita.`)) return
    await supabase.from('saas_platforms').delete().eq('id', p.id)
    load()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Rocket size={18} className="text-[#5B2A6E]" /> Plataformas SaaS TFA
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Cadastre as plataformas que aparecem em "Plataformas SaaS" no menu — nome, logo, apresentação curta e URL de acesso.
        </p>
      </div>

      <form onSubmit={submit} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Nome *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome da plataforma"
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#5B2A6E]" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Apresentação curta</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="O que a plataforma faz, para quem, principais benefícios."
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#5B2A6E] resize-none" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Logo (imagem)</label>
            <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">URL de acesso *</label>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#5B2A6E]" />
          </div>
        </div>

        {error && <p className="text-xs text-coral-600 dark:text-coral-400">{error}</p>}

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3E1B4D] hover:bg-[#5B2A6E] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
          {saving ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
          {saving ? 'Enviando…' : 'Adicionar plataforma'}
        </button>
      </form>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Plataformas cadastradas
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader size={18} className="animate-spin text-gray-400" />
          </div>
        ) : platforms.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">Nenhuma plataforma cadastrada ainda.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {platforms.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                {p.logo_url ? (
                  <img src={p.logo_url} alt="" className="w-10 h-10 object-contain rounded-lg bg-gray-50 dark:bg-gray-800 shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <Rocket size={14} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.name}</p>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-gray-400 hover:text-[#5B2A6E] flex items-center gap-1 truncate">
                      {p.url} <ExternalLink size={9} />
                    </a>
                  )}
                </div>
                <button onClick={() => togglePublished(p)} title={p.published ? 'Ocultar' : 'Publicar'}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#5B2A6E] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0">
                  {p.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => deletePlatform(p)} title="Excluir"
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
