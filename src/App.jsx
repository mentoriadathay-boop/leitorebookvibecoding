import './index.css'
import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Platform from './pages/Platform'
import Admin from './pages/Admin'
import { BookOpen } from 'lucide-react'
import { supabase } from './lib/supabaseClient'

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8F5EE] dark:bg-[#0a1a0f]">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl bg-[#0F4A28] flex items-center justify-center mx-auto mb-3">
          <BookOpen size={18} className="text-white" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
      </div>
    </div>
  )
}

function Blocked() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8F5EE] dark:bg-[#0a1a0f] px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚫</span>
        </div>
        <h2 className="font-playfair text-xl font-bold text-gray-900 dark:text-white mb-2">Acesso bloqueado</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Sua conta foi suspensa. Entre em contato com o suporte para mais informações.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm text-red-600 hover:underline"
        >
          Sair da conta
        </button>
      </div>
    </div>
  )
}

function App() {
  const { user, profile, loading } = useAuth()
  const [adminView, setAdminView] = useState(false)

  if (loading) return <Loading />
  if (!user) return <Login />
  if (profile?.status === 'blocked') return <Blocked />

  if (adminView && profile?.role === 'admin') {
    return <Admin profile={profile} onExit={() => setAdminView(false)} />
  }

  return (
    <Platform
      user={user}
      profile={profile}
      onAdminClick={profile?.role === 'admin' ? () => setAdminView(true) : null}
    />
  )
}

export default App
