import { useState, useEffect } from 'react'
import { Bell, Plus, Trash2, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

const TYPES = [
  { value: 'feature', label: 'Novidade',    color: 'bg-[#E8F5EE] text-[#1B6B3A]' },
  { value: 'update',  label: 'Atualização', color: 'bg-blue-100 text-blue-700' },
  { value: 'news',    label: 'Notícia',     color: 'bg-purple-100 text-purple-700' },
  { value: 'alert',   label: 'Aviso',       color: 'bg-red-100 text-red-700' },
]

function typeStyle(type) {
  return TYPES.find(t => t.value === type) || TYPES[0]
}

function fmtDate(d) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', type: 'feature' })
  const [saving, setSaving] = useState(false)
  const [emailStatus, setEmailStatus] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('platform_notifications')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setNotifications(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    const { data } = await supabase
      .from('platform_notifications')
      .insert({ title: form.title.trim(), body: form.body.trim(), type: form.type, published: true })
      .select()
      .single()
    if (data) setNotifications(prev => [data, ...prev])
    setForm({ title: '', body: '', type: 'feature' })
    setShowForm(false)
    setSaving(false)
  }

  const handleDelete = async (id) => {
    await supabase.from('platform_notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
    setDeleteConfirm(null)
  }

  const handleSendEmail = async (notification) => {
    setEmailStatus(prev => ({ ...prev, [notification.id]: 'sending' }))
    try {
      const res = await fetch('https://libjrqfzxfglztxbjfdb.supabase.co/functions/v1/quick-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          notification_id: notification.id,
          title: notification.title,
          body: notification.body,
          type: notification.type,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      setEmailStatus(prev => ({ ...prev, [notification.id]: 'sent' }))
      setNotifications(prev => prev.map(n =>
        n.id === notification.id ? { ...n, email_sent: true } : n
      ))
    } catch (err) {
      console.error('Email send error:', err)
      setEmailStatus(prev => ({ ...prev, [notification.id]: 'error' }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell size={18} className="text-[#1B6B3A]" />
          Notificações
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-xs bg-[#0F4A28] hover:bg-[#1B6B3A] text-white px-3 py-1.5 rounded-full transition-colors font-medium"
        >
          <Plus size={13} /> Nova notificação
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Nova notificação</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                    form.type === t.value
                      ? t.color
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Título da notificação *"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:outline-none focus:border-[#1B6B3A] dark:focus:border-green-500"
            />

            <textarea
              placeholder="Descrição (opcional) — aparece no dropdown do sininho e no email"
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              rows={3}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:outline-none focus:border-[#1B6B3A] dark:focus:border-green-500 resize-none"
            />

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="text-sm bg-[#0F4A28] hover:bg-[#1B6B3A] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                {saving ? 'Publicando...' : 'Publicar'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm({ title: '', body: '', type: 'feature' }) }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-2 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Info box sobre email */}
      <div className="bg-[#FDF6E3] dark:bg-yellow-900/10 border border-[#C9A84C]/30 rounded-xl p-4 text-xs text-gray-600 dark:text-gray-400">
        <p className="font-semibold text-[#C9A84C] mb-1">📧 Envio de email</p>
        <p>
          O botão <strong>Email</strong> dispara a Edge Function <code className="bg-black/5 dark:bg-white/5 px-1 rounded">send-notification-email</code> via Resend.
          Configure os secrets <code className="bg-black/5 dark:bg-white/5 px-1 rounded">RESEND_API_KEY</code> e <code className="bg-black/5 dark:bg-white/5 px-1 rounded">FROM_EMAIL</code> no painel do Supabase → Edge Functions → Secrets.
        </p>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-gray-400 gap-2">
          <Loader size={16} className="animate-spin" /> Carregando...
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700">
          <Bell size={32} className="mx-auto mb-3 text-gray-200 dark:text-gray-700" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma notificação criada ainda.</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Crie uma para avisar seus alunos sobre novidades.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const st = emailStatus[n.id]
            const ts = typeStyle(n.type)
            return (
              <div key={n.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${ts.color}`}>
                        {ts.label}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {fmtDate(n.created_at)}
                      </span>
                      {(n.email_sent || st === 'sent') && (
                        <span className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-0.5">
                          <CheckCircle size={10} /> Email enviado
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{n.title}</p>
                    {n.body && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{n.body}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Botão enviar email */}
                    {!n.email_sent && st !== 'sent' && (
                      <button
                        onClick={() => handleSendEmail(n)}
                        disabled={st === 'sending'}
                        title="Enviar email para todos os usuários ativos"
                        className="flex items-center gap-1 text-xs text-[#1B6B3A] dark:text-green-400 hover:bg-[#E8F5EE] dark:hover:bg-[#0F4A28]/20 px-2 py-1 rounded-lg transition-colors disabled:opacity-50 border border-[#1B6B3A]/30 dark:border-green-700/40"
                      >
                        {st === 'sending' ? (
                          <><Loader size={11} className="animate-spin" /> Enviando</>
                        ) : st === 'error' ? (
                          <><AlertCircle size={11} className="text-red-500" /> Erro</>
                        ) : (
                          <><Send size={11} /> Email</>
                        )}
                      </button>
                    )}

                    {/* Deletar */}
                    {deleteConfirm === n.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg transition-colors"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(n.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Remover notificação"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
