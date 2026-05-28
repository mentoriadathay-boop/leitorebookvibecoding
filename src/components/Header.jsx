import { Moon, Sun, BookOpen, Menu, X, Shield } from 'lucide-react'
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
              Vibe Coding
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
          <a
            href="https://thayanefidelis.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full transition-colors font-medium"
          >
            thayanefidelis.com
          </a>
          <a
            href="https://carrosseismagicos.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white px-3 py-1.5 rounded-full transition-colors font-medium"
            style={{ backgroundColor: '#9a2278' }}
          >
            Carrosséis Mágicos
          </a>
          <a
            href="https://api.whatsapp.com/message/EQIUEI67M7U2N1?autoload=1&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-[#C9A84C] text-white px-3 py-1.5 rounded-full hover:bg-yellow-600 transition-colors font-medium"
          >
            WhatsApp
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div title={`${streak} dia${streak !== 1 ? 's' : ''} seguido${streak !== 1 ? 's' : ''} de leitura`}
              className="hidden sm:flex items-center gap-1 text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-800/40 font-semibold">
              🔥 {streak}
            </div>
          )}
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
          <a
            href="https://thayanefidelis.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-red-600 font-medium py-2"
          >
            thayanefidelis.com
          </a>
          <a
            href="https://carrosseismagicos.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium py-2"
            style={{ color: '#9a2278' }}
          >
            Carrosséis Mágicos
          </a>
          <a
            href="https://api.whatsapp.com/message/EQIUEI67M7U2N1?autoload=1&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#C9A84C] font-medium py-2"
          >
            WhatsApp
          </a>
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
