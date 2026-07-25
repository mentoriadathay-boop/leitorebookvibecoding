import { useState } from 'react'
import { LayoutDashboard, Users, BookOpen, Bell, Mail, Newspaper, ArrowLeft, Shield, Rocket } from 'lucide-react'
import AdminDashboard from '../components/admin/AdminDashboard'
import AdminUsers from '../components/admin/AdminUsers'
import AdminEbooks from '../components/admin/AdminEbooks'
import AdminSaasPlatforms from '../components/admin/AdminSaasPlatforms'
import AdminNotifications from '../components/admin/AdminNotifications'
import AdminEmailMarketing from '../components/admin/AdminEmailMarketing'
import AdminVibeNews from '../components/admin/AdminVibeNews'

const TABS = [
  { id: 'dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'users',          label: 'Usuários',          icon: Users },
  { id: 'ebooks',         label: 'Ebooks',            icon: BookOpen },
  { id: 'platforms',      label: 'Plataformas SaaS',  icon: Rocket },
  { id: 'notifications',  label: 'Notificações',      icon: Bell },
  { id: 'email',          label: 'Newsletter',        icon: Mail },
  { id: 'vibenews',       label: 'Vibe News',         icon: Newspaper },
]

export default function Admin({ profile, onExit }) {
  const [tab, setTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] flex flex-col">
      <header className="bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-700 px-4 h-14 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#3E1B4D] flex items-center justify-center">
            <Shield size={15} className="text-white" />
          </div>
          <span className="font-playfair font-bold text-gray-900 dark:text-white text-sm">Painel Admin</span>
          <span className="text-[10px] bg-[#F2E4FA] dark:bg-[#3E1B4D]/30 text-[#5B2A6E] dark:text-magic-light px-2 py-0.5 rounded-full font-semibold">
            {profile?.display_name || profile?.id?.slice(0, 8)}
          </span>
        </div>
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#5B2A6E] dark:hover:text-magic-light transition-colors"
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
                    ? 'border-[#5B2A6E] text-[#5B2A6E] dark:text-magic-light'
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
        {tab === 'dashboard'     && <AdminDashboard />}
        {tab === 'users'         && <AdminUsers />}
        {tab === 'ebooks'        && <AdminEbooks />}
        {tab === 'platforms'     && <AdminSaasPlatforms />}
        {tab === 'notifications' && <AdminNotifications />}
        {tab === 'email'         && <AdminEmailMarketing />}
        {tab === 'vibenews'      && <AdminVibeNews />}
      </main>
    </div>
  )
}
