import { useState, useEffect } from 'react'
import { Plus, Search, Ban, CheckCircle, Trash2, X, AlertCircle, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

const PLANS = ['free', 'monthly', 'annual', 'lifetime']
const PLAN_LABELS = { free: 'Gratuito', monthly: 'Mensal', annual: 'Anual', lifetime: 'Vitalício' }
const PLAN_BADGE = {
  free: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  monthly: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  annual: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  lifetime: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
}

function planExpiry(plan) {
  if (plan === 'monthly') { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString() }
  if (plan === 'annual') { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString() }
  return null
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', plan: 'monthly' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [{ data: authData, error: authErr }, { data: profiles }] = await Promise.all([
        supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        supabase.from('profiles').select('*'),
      ])

      if (authErr) throw authErr
      const profileMap = {}
      profiles?.forEach(p => { profileMap[p.id] = p })

      setUsers((authData?.users || []).map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        display_name: profileMap[u.id]?.display_name || u.email?.split('@')[0] || '—',
        role: profileMap[u.id]?.role || 'user',
        plan_type: profileMap[u.id]?.plan_type || 'free',
        plan_started_at: profileMap[u.id]?.plan_started_at,
        plan_expires_at: profileMap[u.id]?.plan_expires_at,
        status: profileMap[u.id]?.status || 'active',
      })))
    } catch (e) {
      console.error('AdminUsers load:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.email.toLowerCase().includes(q) || u.display_name.toLowerCase().includes(q)
    const matchPlan = filterPlan === 'all' || u.plan_type === filterPlan
    const matchStatus = filterStatus === 'all' || u.status === filterStatus
    return matchSearch && matchPlan && matchStatus
  })

  const toggleBlock = async (u) => {
    const newStatus = u.status === 'active' ? 'blocked' : 'active'
    await supabase.from('profiles').update({ status: newStatus }).eq('id', u.id)
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: newStatus } : x))
  }

  const deleteUser = async (userId) => {
    await supabase.auth.admin.deleteUser(userId)
    setUsers(prev => prev.filter(u => u.id !== userId))
    setConfirmDelete(null)
  }

  const addUser = async (e) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError('')
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: addForm.email,
        password: addForm.password,
        email_confirm: true,
        user_metadata: { display_name: addForm.name },
      })
      if (error) throw error

      await supabase.from('profiles').update({
        display_name: addForm.name,
        plan_type: addForm.plan,
        plan_started_at: new Date().toISOString(),
        plan_expires_at: planExpiry(addForm.plan),
        status: 'active',
      }).eq('id', data.user.id)

      setShowAdd(false)
      setAddForm({ name: '', email: '', password: '', plan: 'monthly' })
      await load()
    } catch (err) {
      setAddError(err.message || 'Erro ao criar usuário.')
    } finally {
      setAddLoading(false)
    }
  }

  const fmt = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-playfair text-xl font-bold text-gray-900 dark:text-white">
          Gestão de Usuários
        </h2>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-gray-400 hover:text-[#1B6B3A] transition-colors" title="Atualizar">
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B6B3A] hover:bg-[#0F4A28] text-white text-sm rounded-xl font-medium transition-colors"
          >
            <Plus size={14} /> Adicionar usuário
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por email ou nome..."
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-300 w-60"
          />
        </div>
        <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-300 focus:outline-none">
          <option value="all">Todos os planos</option>
          {PLANS.map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-300 focus:outline-none">
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="blocked">Bloqueados</option>
        </select>
        <span className="text-xs text-gray-400">{filtered.length} usuário{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-sm text-gray-400">Carregando usuários...</div>
      ) : (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {['Nome', 'Email', 'Cadastro', 'Plano', 'Expira em', 'Status', 'Ações'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-sm text-gray-400">Nenhum usuário encontrado</td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {u.display_name}
                      {u.role === 'admin' && (
                        <span className="ml-1.5 text-[9px] bg-[#E8F5EE] text-[#1B6B3A] px-1.5 py-0.5 rounded-full font-bold">ADMIN</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{fmt(u.created_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${PLAN_BADGE[u.plan_type]}`}>
                        {PLAN_LABELS[u.plan_type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmt(u.plan_expires_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                        u.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {u.status === 'active' ? 'Ativo' : 'Bloqueado'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleBlock(u)} title={u.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.status === 'active'
                              ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                              : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}>
                          {u.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
                        </button>
                        <button onClick={() => setConfirmDelete(u)} title="Excluir"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-playfair font-bold text-lg text-gray-900 dark:text-white">Adicionar usuário</h3>
              <button onClick={() => { setShowAdd(false); setAddError('') }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={18} /></button>
            </div>

            {addError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-start gap-2">
                <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                <span className="text-xs text-red-600 dark:text-red-400">{addError}</span>
              </div>
            )}

            <form onSubmit={addUser} className="space-y-4">
              {[
                { label: 'Nome completo', key: 'name', type: 'text', placeholder: 'Maria Silva' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'email@exemplo.com' },
                { label: 'Senha inicial', key: 'password', type: 'password', placeholder: 'Mínimo 6 caracteres' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">{f.label}</label>
                  <input type={f.type} required minLength={f.key === 'password' ? 6 : undefined}
                    value={addForm[f.key]} onChange={e => setAddForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400" />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Plano</label>
                <select value={addForm.plan} onChange={e => setAddForm(p => ({ ...p, plan: e.target.value }))}
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300">
                  {PLANS.map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowAdd(false); setAddError('') }}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={addLoading}
                  className="flex-1 py-2.5 bg-[#1B6B3A] hover:bg-[#0F4A28] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {addLoading ? 'Criando...' : 'Criar usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="font-playfair font-bold text-lg text-gray-900 dark:text-white mb-2">Excluir usuário?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              <strong>{confirmDelete.email}</strong> será excluído permanentemente com todos os seus dados.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancelar
              </button>
              <button onClick={() => deleteUser(confirmDelete.id)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
