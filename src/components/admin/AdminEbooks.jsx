import { useState, useEffect } from 'react'
import { BookOpen, Upload, Trash2, Loader, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

const BUCKET = 'ebooks'

export default function AdminEbooks() {
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [pdfFile, setPdfFile] = useState(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('ebooks').select('*').order('sort_order').order('created_at', { ascending: false })
    setEbooks(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const uploadFile = async (file, prefix) => {
    const ext = file.name.split('.').pop()
    const path = `${prefix}-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
    if (upErr) throw upErr
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  const resetForm = () => {
    setTitle(''); setDescription(''); setExternalUrl(''); setCoverFile(null); setPdfFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('Título é obrigatório.'); return }
    if (!pdfFile && !externalUrl.trim()) { setError('Envie um PDF ou informe uma URL externa.'); return }

    setSaving(true)
    try {
      let cover_url = null
      let pdf_url = null
      if (coverFile) cover_url = await uploadFile(coverFile, 'cover')
      if (pdfFile) pdf_url = await uploadFile(pdfFile, 'pdf')

      const { error: insertError } = await supabase.from('ebooks').insert({
        title: title.trim(),
        description: description.trim() || null,
        cover_url,
        pdf_url,
        external_url: externalUrl.trim() || null,
        published: true,
      })
      if (insertError) throw insertError

      resetForm()
      load()
    } catch (err) {
      setError(err.message || 'Erro ao salvar ebook.')
    } finally {
      setSaving(false)
    }
  }

  const togglePublished = async (ebook) => {
    await supabase.from('ebooks').update({ published: !ebook.published }).eq('id', ebook.id)
    load()
  }

  const deleteEbook = async (ebook) => {
    if (!confirm(`Excluir "${ebook.title}"? Essa ação não pode ser desfeita.`)) return
    await supabase.from('ebooks').delete().eq('id', ebook.id)
    load()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen size={18} className="text-[#5B2A6E]" /> Ebooks
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Envie a capa e o PDF (ou informe uma URL externa) — o card aparece pra todos os usuários na aba "Ebooks".
        </p>
      </div>

      {/* Formulário de novo ebook */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Título *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nome do ebook"
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#5B2A6E]" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Descrição (opcional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Um resumo curto do ebook"
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#5B2A6E] resize-none" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Capa (imagem)</label>
            <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Arquivo PDF</label>
            <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-500 dark:text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">URL externa (opcional — use se não for enviar o PDF, ou como alternativa)</label>
          <input value={externalUrl} onChange={e => setExternalUrl(e.target.value)} placeholder="https://..."
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#5B2A6E]" />
        </div>

        {error && (
          <p className="text-xs text-coral-600 dark:text-coral-400">{error}</p>
        )}

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3E1B4D] hover:bg-[#5B2A6E] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
          {saving ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
          {saving ? 'Enviando...' : 'Adicionar ebook'}
        </button>
      </form>

      {/* Lista de ebooks existentes */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Ebooks cadastrados
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader size={18} className="animate-spin text-gray-400" />
          </div>
        ) : ebooks.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">Nenhum ebook cadastrado ainda.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {ebooks.map(e => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                {e.cover_url ? (
                  <img src={e.cover_url} alt="" className="w-10 h-12 object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-10 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <BookOpen size={14} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{e.title}</p>
                  {(e.pdf_url || e.external_url) && (
                    <a href={e.pdf_url || e.external_url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-gray-400 hover:text-[#5B2A6E] flex items-center gap-1 truncate">
                      {e.pdf_url ? 'PDF enviado' : 'Link externo'} <ExternalLink size={9} />
                    </a>
                  )}
                </div>
                <button onClick={() => togglePublished(e)} title={e.published ? 'Ocultar' : 'Publicar'}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#5B2A6E] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0">
                  {e.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => deleteEbook(e)} title="Excluir"
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
