import './index.css'
import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Platform from './pages/Platform'
import Admin from './pages/Admin'
import SalesPage from './pages/SalesPage'
import { BookOpen } from 'lucide-react'
import { supabase } from './lib/supabaseClient'

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2E4FA] dark:bg-[#1F1425]">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl bg-[#3E1B4D] flex items-center justify-center mx-auto mb-3">
          <BookOpen size={18} className="text-white" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
      </div>
    </div>
  )
}

function Blocked() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2E4FA] dark:bg-[#1F1425] px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚫</span>
        </div>
        <h2 className="font-playfair text-xl font-bold text-gray-900 dark:text-white mb-2">Acesso bloqueado</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Sua conta foi suspensa. Entre em contato com o suporte para mais informações.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm text-coral-600 hover:underline"
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

  // Rota pública /hub — landing de vendas, acessível sem login.
  // (Como o app é uma SPA sem router, roteia direto pelo pathname.)
  const isSalesRoute = typeof window !== 'undefined' && window.location.pathname === '/hub'
  if (isSalesRoute) return <SalesPage />

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
