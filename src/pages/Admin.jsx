import { useState } from 'react'
import { LayoutDashboard, Users, BookOpen, ArrowLeft, Shield } from 'lucide-react'
import AdminDashboard from '../components/admin/AdminDashboard'
import AdminUsers from '../components/admin/AdminUsers'
import AdminContent from '../components/admin/AdminContent'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'content', label: 'Conteúdo', icon: BookOpen },
]

export default function Admin({ profile, onExit }) {
  const [tab, setTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] flex flex-col">
      <header className="bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-700 px-4 h-14 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0F4A28] flex items-center justify-center">
            <Shield size={15} className="text-white" />
          </div>
          <span className="font-playfair font-bold text-gray-900 dark:text-white text-sm">Painel Admin</span>
          <span className="text-[10px] bg-[#E8F5EE] dark:bg-[#0F4A28]/30 text-[#1B6B3A] dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">
            {profile?.display_name || profile?.id?.slice(0, 8)}
          </span>
        </div>
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1B6B3A] dark:hover:text-green-400 transition-colors"
        >
          <ArrowLeft size={13} /> Voltar à plataforma
        </button>
      </header>

      <div className="bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-700 px-4">
        <div className="flex overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  tab === t.id
                    ? 'border-[#1B6B3A] text-[#1B6B3A] dark:text-green-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={15} /> {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {tab === 'dashboard' && <AdminDashboard />}
        {tab === 'users' && <AdminUsers />}
        {tab === 'content' && <AdminContent />}
      </main>
    </div>
  )
}
