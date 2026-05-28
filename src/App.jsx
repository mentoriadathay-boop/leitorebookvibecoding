import './index.css'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Platform from './pages/Platform'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8F5EE] dark:bg-[#0a1a0f]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-[#0F4A28] flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-playfair font-bold text-lg">V</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Login />
  return <Platform user={user} />
}

export default App
