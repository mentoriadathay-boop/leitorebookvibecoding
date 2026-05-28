import { useState, useEffect } from 'react'
import { BookOpen, Lightbulb, Cpu, CheckSquare, Calculator, Wrench, Newspaper, Zap, Menu, X, PanelLeft, PanelRight } from 'lucide-react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import ChapterContent from '../components/ChapterContent'
import NotesPanel from '../components/NotesPanel'
import AISupportChat from '../components/AISupportChat'
import Checklist from '../components/Checklist'
import RevenueCalculator from '../components/RevenueCalculator'
import ToolsSection from '../components/ToolsSection'
import VibeNews from '../components/VibeNews'
import PromptLibrary from '../components/PromptLibrary'
import MySaas from '../components/MySaas'
import IdeasSection from '../components/IdeasSection'
import { useStreak } from '../hooks/useStreak'
import IdeaGenerator from '../components/IdeaGenerator'
import { useChapters } from '../hooks/useChapters'
import { useProgress } from '../hooks/useProgress'
import { useNotes } from '../hooks/useNotes'
import { useBookmarks } from '../hooks/useBookmarks'
import { useChecklist } from '../hooks/useChecklist'
import { useIdeas } from '../hooks/useIdeas'

const TABS = [
  { id: 'reading', label: 'Leitura', icon: BookOpen },
  { id: 'ideas', label: 'Minhas Ideias', icon: Lightbulb },
  { id: 'generator', label: 'Gerador', icon: Cpu },
  { id: 'checklist', label: 'Checklist', icon: CheckSquare },
  { id: 'calculator', label: 'Calculadora', icon: Calculator },
  { id: 'tools', label: 'Ferramentas', icon: Wrench },
  { id: 'news', label: 'Vibe News', icon: Newspaper },
  { id: 'prompts', label: 'Prompts', icon: Zap },
]

export default function Platform({ user, profile, onAdminClick }) {
  const [activeTab, setActiveTab] = useState('reading')
  const [currentChapter, setCurrentChapter] = useState(0)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [rightPanelTab, setRightPanelTab] = useState('notes')
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('welcomeSeen'))

  const { chapters, chapterGroups } = useChapters()
  const streak = useStreak()
  const { completed, completedCount, markCompleted } = useProgress(user?.id)
  const { notes, saveNote, noteCount } = useNotes(user?.id)
  const { bookmarks, toggleBookmark } = useBookmarks(user?.id)
  const { steps: checklistSteps, toggleStep } = useChecklist(user?.id)
  const { ideas, saveIdea, deleteIdea } = useIdeas(user?.id)

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const readingProgress = Math.round((completedCount / chapters.length) * 100)

  const handleChapterSelect = (idx) => {
    setCurrentChapter(idx)
    setActiveTab('reading')
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleChapterRead = () => {
    markCompleted(currentChapter)
  }

  const dismissWelcome = () => {
    localStorage.setItem('welcomeSeen', 'true')
    setShowWelcome(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] flex flex-col">
      <Header
        darkMode={darkMode}
        toggleDark={() => setDarkMode(d => !d)}
        progress={readingProgress}
        user={user}
        streak={streak}
        onAdminClick={onAdminClick}
      />

      {/* Welcome modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl max-w-md w-full p-6 fade-in">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-xl bg-[#0F4A28] flex items-center justify-center mx-auto mb-3">
                <BookOpen size={22} className="text-white" />
              </div>
              <h2 className="font-playfair font-bold text-xl text-gray-900 dark:text-white mb-2">
                Bem-vinda à plataforma!
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Você tem acesso ao ebook interativo <strong>"20 Passos para Criar seu App SaaS com Vibe Coding"</strong>.
                Explore os capítulos, anote suas reflexões, use o suporte IA e gere ideias de SaaS personalizadas.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-5">
              {['Áudio em PT-BR', 'Anotações salvas', 'Suporte IA', 'Gerador de SaaS', 'Modo foco', 'Calculadora'].map(f => (
                <div key={f} className="flex items-center gap-1.5 bg-[#E8F5EE] dark:bg-[#0F4A28]/20 rounded-lg px-2.5 py-2">
                  <span className="text-[#1B6B3A]">✓</span> {f}
                </div>
              ))}
            </div>
            <button
              onClick={dismissWelcome}
              className="w-full py-2.5 bg-[#1B6B3A] hover:bg-[#0F4A28] text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Começar a ler
            </button>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 pt-16">
        {/* Desktop sidebar */}
        <div className={`hidden lg:flex flex-col shrink-0 fixed left-0 top-16 bottom-0 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden ${
          leftPanelOpen ? 'w-56 xl:w-64' : 'w-0 border-r-0'
        }`}>
          <Sidebar
            currentChapter={currentChapter}
            onSelect={handleChapterSelect}
            completed={completed}
            chapters={chapters}
            chapterGroups={chapterGroups}
          />
        </div>

        {/* Mobile sidebar drawer */}
        <div
          className={`fixed left-0 top-16 bottom-0 z-50 w-72 transition-transform duration-300 lg:hidden border-r border-gray-200 dark:border-gray-700 shadow-xl ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar
            currentChapter={currentChapter}
            onSelect={handleChapterSelect}
            completed={completed}
            onClose={() => setSidebarOpen(false)}
            chapters={chapters}
            chapterGroups={chapterGroups}
          />
        </div>

        {/* Main content */}
        <main className={`flex-1 transition-all duration-300 ${leftPanelOpen ? 'lg:ml-56 xl:ml-64' : 'lg:ml-0'} ${rightPanelOpen ? 'lg:mr-64 xl:mr-72' : 'lg:mr-0'}`}>
          {/* Tab bar (desktop) */}
          <div className="hidden lg:flex items-center gap-1 px-3 pt-4 pb-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] sticky top-16 z-30">
            {/* Toggle sidebar esquerda */}
            <button
              onClick={() => setLeftPanelOpen(o => !o)}
              title={leftPanelOpen ? 'Recolher sumário' : 'Expandir sumário'}
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#1B6B3A] dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0 mr-1"
            >
              <PanelLeft size={15} />
            </button>

            {/* Tabs — scroll horizontal para não quebrar */}
            <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide flex-1">
              {TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-2.5 text-xs font-medium border-b-2 -mb-px transition-all whitespace-nowrap shrink-0 ${
                      activeTab === tab.id
                        ? 'border-[#1B6B3A] text-[#1B6B3A] dark:text-green-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-[#1B6B3A] dark:hover:text-green-400'
                    }`}
                  >
                    <Icon size={13} /> {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Toggle painel direito */}
            <button
              onClick={() => setRightPanelOpen(o => !o)}
              title={rightPanelOpen ? 'Recolher painel' : 'Expandir painel'}
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#1B6B3A] dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0 ml-1"
            >
              <PanelRight size={15} />
            </button>
          </div>

          <div className="p-4 md:p-6 pb-20 lg:pb-6">
            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-lg hover:border-[#1B6B3A]"
              >
                <Menu size={13} /> Sumário
              </button>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-playfair italic truncate">
                {chapters[currentChapter]?.title}
              </span>
            </div>

            {activeTab === 'reading' && (
              <ChapterContent
                chapter={chapters[currentChapter]}
                chapterIndex={currentChapter}
                hasNext={currentChapter < chapters.length - 1}
                hasPrev={currentChapter > 0}
                onNext={() => { setCurrentChapter(i => i + 1); handleChapterRead(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                onPrev={() => { setCurrentChapter(i => i - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                onChapterRead={handleChapterRead}
              />
            )}

            {activeTab === 'ideas' && (
              <IdeasSection
                ideas={ideas.filter(i => i.source !== 'generator' || true)}
                onSaveIdea={saveIdea}
                onDeleteIdea={deleteIdea}
              />
            )}

            {activeTab === 'generator' && (
              <IdeaGenerator onSaveIdea={saveIdea} />
            )}

            {activeTab === 'checklist' && (
              <Checklist
                checklistSteps={checklistSteps}
                onToggleStep={toggleStep}
                onNavigate={(idx) => { handleChapterSelect(idx) }}
              />
            )}

            {activeTab === 'calculator' && (
              <RevenueCalculator />
            )}

            {activeTab === 'tools' && (
              <ToolsSection />
            )}

            {activeTab === 'news' && (
              <VibeNews />
            )}

            {activeTab === 'prompts' && (
              <PromptLibrary />
            )}
          </div>
        </main>

        {/* Right panel (desktop) */}
        <div className={`hidden lg:flex flex-col w-64 xl:w-72 shrink-0 fixed right-0 top-16 bottom-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] overflow-y-auto scrollbar-thin transition-transform duration-300 ${rightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex border-b border-gray-100 dark:border-gray-700 shrink-0">
            {[
              { id: 'notes', label: 'Anotações' },
              { id: 'ai', label: 'Suporte IA' },
              { id: 'saas', label: 'Meu SaaS' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setRightPanelTab(t.id)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  rightPanelTab === t.id
                    ? 'text-[#1B6B3A] dark:text-green-400 border-b-2 border-[#1B6B3A]'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-3 overflow-y-auto scrollbar-thin">
            {rightPanelTab === 'notes' && (
              <NotesPanel
                chapterIndex={currentChapter}
                notes={notes}
                onSaveNote={saveNote}
                bookmarks={bookmarks}
                onToggleBookmark={toggleBookmark}
                completedCount={completedCount}
                totalChapters={chapters.length}
                noteCount={noteCount}
                ideasCount={ideas.length}
              />
            )}
            {rightPanelTab === 'ai' && <AISupportChat chapter={chapters[currentChapter]} />}
            {rightPanelTab === 'saas' && <MySaas />}
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-gray-700 flex">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                activeTab === tab.id
                  ? 'text-[#1B6B3A] dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <Icon size={18} />
              <span className="text-[9px] leading-tight">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
