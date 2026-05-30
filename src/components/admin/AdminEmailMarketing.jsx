import { useState, useEffect } from 'react'
import { Mail, Plus, Trash2, Eye, EyeOff, Send, CheckCircle, AlertCircle, Loader, Users } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import RichTextEditor from '../RichTextEditor'

const CATEGORIES = [
  { value: 'newsletter', label: 'Newsletter',  color: 'bg-[#E8F5EE] text-[#1B6B3A]' },
  { value: 'bastidores', label: 'Bastidores',  color: 'bg-purple-100 text-purple-700' },
  { value: 'lancamento', label: 'Lançamento',  color: 'bg-blue-100 text-blue-700' },
  { value: 'dica',       label: 'Dica',        color: 'bg-yellow-100 text-yellow-700' },
  { value: 'promocao',   label: 'Promoção',    color: 'bg-red-100 text-red-700' },
]

function catStyle(cat) { return CATEGORIES.find(c => c.value === cat) || CATEGORIES[0] }
function fmtDate(d) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const EMPTY = { title: '', subject: '', body: '', category: 'newsletter', published: true }

export default function AdminEmailMarketing() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [preview, setPreview] = useState(null)
  const [sending, setSending] = useState(null)
  const [sendResult, setSendResult] = useState(null)
  const [sendConfirm, setSendConfirm] = useState(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('email_marketing')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setEmails(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.subject.trim() || !form.body || form.body === '<p></p>') {
      setError('Preencha título, assunto e o corpo do email.')
      return
    }
    setError('')
    setSaving(true)
    const { data, error: err } = await supabase
      .from('email_marketing')
      .insert({ title: form.title.trim(), subject: form.subject.trim(), body: form.body, category: form.category, published: form.published })
      .select()
      .single()
    if (err) { setError(err.message); setSaving(false); return }
    if (data) setEmails(prev => [data, ...prev])
    setForm(EMPTY)
    setShowForm(false)
    setSaving(false)
  }

  const togglePublished = async (email) => {
    const { data } = await supabase
      .from('email_marketing')
      .update({ published: !email.published })
      .eq('id', email.id)
      .select()
      .single()
    if (data) setEmails(prev => prev.map(e => e.id === email.id ? data : e))
  }

  const handleDelete = async (id) => {
    await supabase.from('email_marketing').delete().eq('id', id)
    setEmails(prev => prev.filter(e => e.id !== id))
    setDeleteConfirm(null)
  }

  const handleSendEmail = async (email) => {
    setSending(email.id)
    setSendResult(null)
    setSendConfirm(null)
    try {
      const session = (await supabase.auth.getSession()).data.session
      const res = await fetch('https://libjrqfzxfglztxbjfdb.supabase.co/functions/v1/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ email_id: email.id }),
      })
      const result = await res.json()
      setSendResult({ id: email.id, ...result })
      if (result.sent > 0) {
        setEmails(prev => prev.map(e => e.id === email.id ? { ...e, sent: true } : e))
      }
    } catch (e) {
      setSendResult({ id: email.id, error: e.message })
    } finally {
      setSending(null)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail size={18} className="text-[#1B6B3A]" /> Newsletter
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Publique emails para sua audiência — aparecem na aba Newsletter da plataforma. Use o botão Enviar para disparar via Resend.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(f => !f); setError('') }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F4A28] hover:bg-[#1B6B3A] text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus size={14} /> Novo email
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Novo email</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Título interno (só você vê) *</label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Newsletter maio/2025"
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Assunto do email *</label>
            <input
              value={form.subject}
              onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              placeholder="Ex: 3 erros que impedem seu SaaS de crescer"
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Corpo do email *</label>
            <RichTextEditor
              value={form.body}
              onChange={v => setForm(p => ({ ...p, body: v }))}
              placeholder="Escreva o conteúdo do email aqui... Use a barra de ferramentas para formatar texto, adicionar imagens e links."
            />
            <p className="text-[10px] text-gray-400 mt-1">Para imagens, cole a URL pública (Supabase Storage, Imgur, etc.) usando o botão 🖼</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} className="w-4 h-4 accent-[#1B6B3A]" />
            <span className="text-xs text-gray-700 dark:text-gray-300">Publicar imediatamente (visível para alunos)</span>
          </label>

          {error && <p className="flex items-center gap-1.5 text-xs text-red-600"><AlertCircle size={12} /> {error}</p>}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#0F4A28] hover:bg-[#1B6B3A] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
              {saving ? <><Loader size={13} className="animate-spin" /> Salvando...</> : <><CheckCircle size={13} /> Salvar</>}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); setError('') }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-8 justify-center">
          <Loader size={16} className="animate-spin" /> Carregando...
        </div>
      ) : emails.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700">
          <Mail size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum email publicado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map(email => {
            const cat = catStyle(email.category)
            const isSending = sending === email.id
            const result = sendResult?.id === email.id ? sendResult : null
            return (
              <div key={email.id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${cat.color}`}>{cat.label}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${email.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {email.published ? 'Publicado' : 'Rascunho'}
                      </span>
                      {email.sent && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                          <Send size={9} /> Enviado {email.sent_count ? `(${email.sent_count})` : ''}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">{fmtDate(email.created_at)}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mb-0.5">{email.title}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{email.subject}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                    {/* Visualizar */}
                    <button onClick={() => setPreview(preview?.id === email.id ? null : email)}
                      title="Visualizar conteúdo"
                      className="p-2 rounded-lg text-gray-400 hover:text-[#1B6B3A] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Eye size={14} />
                    </button>

                    {/* Publicar/Despublicar */}
                    <button onClick={() => togglePublished(email)}
                      title={email.published ? 'Despublicar' : 'Publicar'}
                      className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${email.published ? 'text-green-600' : 'text-gray-400'}`}>
                      {email.published ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>

                    {/* Enviar email */}
                    {sendConfirm === email.id ? (
                      <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-2 py-1.5">
                        <Users size={12} className="text-blue-600" />
                        <span className="text-[10px] text-blue-700 dark:text-blue-400 font-medium">Enviar para todos?</span>
                        <button onClick={() => handleSendEmail(email)} className="text-[10px] text-white bg-blue-600 hover:bg-blue-700 font-bold px-2 py-0.5 rounded transition-colors">Sim</button>
                        <button onClick={() => setSendConfirm(null)} className="text-[10px] text-gray-400 hover:text-gray-600">Não</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSendConfirm(email.id)}
                        disabled={isSending}
                        title="Enviar por email para todos os alunos"
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold bg-[#0F4A28] hover:bg-[#1B6B3A] text-white rounded-lg transition-colors disabled:opacity-50">
                        {isSending ? <Loader size={11} className="animate-spin" /> : <Send size={11} />}
                        {isSending ? 'Enviando...' : 'Enviar'}
                      </button>
                    )}

                    {/* Excluir */}
                    {deleteConfirm === email.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(email.id)} className="text-xs text-red-600 font-bold px-2">Sim</button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-400 px-2">Não</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(email.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Resultado do envio */}
                {result && (
                  <div className={`mt-3 px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${result.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {result.error
                      ? <><AlertCircle size={13} /> Erro: {result.error}</>
                      : <><CheckCircle size={13} /> Enviado para {result.sent} de {result.total} alunos {result.failed > 0 ? `(${result.failed} falhas)` : ''}</>
                    }
                  </div>
                )}

                {/* Prévia do conteúdo */}
                {preview?.id === email.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3">Prévia</p>
                    <div
                      className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none max-h-80 overflow-y-auto scrollbar-thin"
                      dangerouslySetInnerHTML={{ __html: email.body }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
