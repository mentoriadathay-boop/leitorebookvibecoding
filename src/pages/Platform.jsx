import { useState, useEffect } from 'react'
import { Menu, PanelLeft, PanelRight } from 'lucide-react'
import Header from '../components/Header'
import NavSidebar from '../components/NavSidebar'
import AISupportChat from '../components/AISupportChat'
import RevenueCalculator from '../components/RevenueCalculator'
import AIToolsHub from '../components/ai-tools/AIToolsHub'
import ToolsSection from '../components/ToolsSection'
import EmailMarketing from '../components/EmailMarketing'
import PromptLibrary from '../components/PromptLibrary'
import MySaas from '../components/MySaas'
import Onboarding from '../components/Onboarding'
import Ebooks from '../components/Ebooks'
import IdeasSection from '../components/IdeasSection'
import IdeaGenerator from '../components/IdeaGenerator'
import VibeLab from '../components/VibeLab'
import SaasPlatforms from '../components/SaasPlatforms'
import { useStreak } from '../hooks/useStreak'
import { useIdeas } from '../hooks/useIdeas'

export default function Platform({ user, profile, onAdminClick }) {
  const [activeTab, setActiveTab] = useState('ideas')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('welcomeSeen'))
  const [journeySeed, setJourneySeed] = useState(null)

  const streak = useStreak()
  const { ideas, saveIdea, deleteIdea } = useIdeas(user?.id)

  const handleNavigate = (tab) => {
    setActiveTab(tab)
    setDrawerOpen(false)
  }

  const sendIdeaToJourney = (payload) => {
    setJourneySeed(payload)
    setActiveTab('tools')
    setDrawerOpen(false)
  }

  const dismissWelcome = () => {
    localStorage.setItem('welcomeSeen', 'true')
    setShowWelcome(false)
  }

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] flex flex-col">
      <Header
        darkMode={darkMode}
        toggleDark={() => setDarkMode(d => !d)}
        progress={0}
        user={user}
        streak={streak}
        onAdminClick={onAdminClick}
      />

      {showWelcome && <Onboarding onClose={dismissWelcome} />}

      {/* Mobile overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      <div className="flex flex-1 pt-16">
        {/* Desktop left sidebar */}
        <div className={`hidden lg:flex flex-col shrink-0 fixed left-0 top-16 bottom-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] transition-all duration-300 overflow-hidden ${
          leftPanelOpen ? 'w-56 xl:w-64' : 'w-0 border-r-0'
        }`}>
          <NavSidebar activeTab={activeTab} onNavigate={handleNavigate} />
        </div>

        {/* Mobile drawer */}
        <div className={`fixed left-0 top-16 bottom-0 z-50 w-72 transition-transform duration-300 lg:hidden shadow-xl ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <NavSidebar activeTab={activeTab} onNavigate={handleNavigate} onClose={() => setDrawerOpen(false)} />
        </div>

        {/* Main content */}
        <main className={`flex-1 min-w-0 transition-all duration-300 ${leftPanelOpen ? 'lg:ml-56 xl:ml-64' : 'lg:ml-0'}`}>

          {/* Sticky top bar */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] sticky top-16 z-30">
            <button
              onClick={() => setLeftPanelOpen(o => !o)}
              title={leftPanelOpen ? 'Recolher menu' : 'Expandir menu'}
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#5B2A6E] dark:hover:text-magic-light hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
            >
              <PanelLeft size={15} />
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setRightPanelOpen(o => !o)}
              title="Meu SaaS"
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#5B2A6E] dark:hover:text-magic-light hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
            >
              <PanelRight size={15} />
            </button>
          </div>

          <div className="p-4 md:p-6 pb-24 lg:pb-8">
            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-lg hover:border-[#5B2A6E] transition-colors"
              >
                <Menu size={13} /> Menu
              </button>
            </div>

            {/* ── Content ── */}

            {activeTab === 'ebooks' && <Ebooks />}

            {activeTab === 'ideas' && (
              <IdeasSection
                ideas={ideas}
                onSaveIdea={saveIdea}
                onDeleteIdea={deleteIdea}
              />
            )}

            {activeTab === 'generator' && (
              <IdeaGenerator onSaveIdea={saveIdea} onSendToJourney={sendIdeaToJourney} />
            )}

            {activeTab === 'tools' && (
              <AIToolsHub
                userId={user?.id}
                seed={journeySeed}
                onSeedConsumed={() => setJourneySeed(null)}
              />
            )}

            {activeTab === 'ext-tools' && <ToolsSection />}

            {activeTab === 'email' && <EmailMarketing />}

            {activeTab === 'calculator' && <RevenueCalculator ideas={ideas} />}

            {activeTab === 'vibe-lab' && <VibeLab userId={user?.id} />}

            {activeTab === 'platforms' && <SaasPlatforms />}

            {activeTab === 'ai-support' && (
              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Suporte IA
                </h2>
                <AISupportChat
                  chapter={{ title: 'Suporte IA' }}
                  containerClass="h-[600px]"
                />
              </div>
            )}

            {activeTab === 'prompts' && <PromptLibrary />}
          </div>

          {/* Page footer */}
          <footer className="border-t border-gray-200 dark:border-gray-700 py-4 px-6 text-center">
            <a
              href="https://thayanefidelis.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-[#5B2A6E] dark:hover:text-magic-light transition-colors"
            >
              thayanefidelis.com
            </a>
          </footer>
        </main>

        {/* Right panel backdrop */}
        {rightPanelOpen && (
          <div
            className="hidden lg:block fixed inset-0 z-20 bg-black/20"
            onClick={() => setRightPanelOpen(false)}
          />
        )}

        {/* Right panel — Meu SaaS */}
        <div className={`hidden lg:flex flex-col w-64 xl:w-80 shrink-0 fixed right-0 top-16 bottom-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] overflow-y-auto scrollbar-thin transition-transform duration-300 z-30 shadow-xl ${rightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="border-b border-gray-100 dark:border-gray-700 shrink-0 py-2.5 px-3">
            <p className="text-xs font-semibold text-[#5B2A6E] dark:text-magic-light">Meu SaaS</p>
          </div>
          <div className="flex-1 p-3 overflow-y-auto scrollbar-thin">
            <MySaas />
          </div>
        </div>
      </div>
    </div>
  )
}
