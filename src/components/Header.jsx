import { Moon, Sun, Menu, X, Shield } from 'lucide-react'
import NotificationBell from './NotificationBell'

const WhatsAppIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Header({ darkMode, toggleDark, progress, user, onMenuToggle, onAdminClick, streak }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo + Brand */}
        <a
          href="https://thayanefidelis.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-[#0F4A28] flex items-center justify-center text-white font-playfair font-bold text-sm">
            T
          </div>
          <div className="hidden sm:block">
            <div className="font-playfair font-bold text-[#0F4A28] dark:text-green-400 text-sm leading-tight">
              Hub Vibe Coding
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
              TFA Soluções com IA
            </div>
          </div>
        </a>

        {/* Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-2">
          {onAdminClick && (
            <button onClick={onAdminClick}
              className="flex items-center gap-1.5 text-xs bg-[#0F4A28] hover:bg-[#1B6B3A] text-white px-3 py-1.5 rounded-full transition-colors font-medium">
              <Shield size={12} /> Admin
            </button>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div title={`${streak} dia${streak !== 1 ? 's' : ''} seguido${streak !== 1 ? 's' : ''} de leitura`}
              className="hidden sm:flex items-center gap-1 text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-800/40 font-semibold">
              🔥 {streak}
            </div>
          )}
          <NotificationBell user={user} />

          <button
            onClick={toggleDark}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Alternar tema"
          >
            {darkMode ? (
              <Sun size={16} className="text-yellow-400" />
            ) : (
              <Moon size={16} className="text-gray-500" />
            )}
          </button>

          {user && (
            <button
              onClick={handleLogout}
              className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors px-2 py-1"
            >
              Sair
            </button>
          )}

          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => { setMenuOpen(!menuOpen); onMenuToggle?.(!menuOpen) }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(to right, #1B6B3A, #C9A84C)',
          }}
        />
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex flex-col gap-2">
          {user && (
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 py-2 text-left"
            >
              Sair
            </button>
          )}
        </div>
      )}
    </header>
  )
}
