import { useState, useEffect } from 'react'
import { BookOpen, FileText, Menu, PanelLeft, PanelRight, Maximize2, Minimize2, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react'
import Header from '../components/Header'
import NavSidebar from '../components/NavSidebar'
import Sidebar from '../components/Sidebar'
import ChapterContent from '../components/ChapterContent'
import NotesPanel from '../components/NotesPanel'
import AISupportChat from '../components/AISupportChat'
import Checklist from '../components/Checklist'
import RevenueCalculator from '../components/RevenueCalculator'
import AIToolsHub from '../components/ai-tools/AIToolsHub'
import ToolsSection from '../components/ToolsSection'
import EmailMarketing from '../components/EmailMarketing'
import VibeNews from '../components/VibeNews'
import PromptLibrary from '../components/PromptLibrary'
import PDFReader from '../components/PDFReader'
import MySaas from '../components/MySaas'
import Onboarding from '../components/Onboarding'
import IdeasSection from '../components/IdeasSection'
import IdeaGenerator from '../components/IdeaGenerator'
import { useStreak } from '../hooks/useStreak'
import { useChapters } from '../hooks/useChapters'
import { useProgress } from '../hooks/useProgress'
import { useNotes } from '../hooks/useNotes'
import { useBookmarks } from '../hooks/useBookmarks'
import { useChecklist } from '../hooks/useChecklist'
import { useIdeas } from '../hooks/useIdeas'

function ComingSoon({ label }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🚧</span>
        </div>
        <h2 className="font-playfair text-xl font-bold text-gray-900 dark:text-white mb-2">{label}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Esta seção está sendo preparada e chegará em breve.</p>
      </div>
    </div>
  )
}

function ReadingHub({ chapters, currentChapter, completedCount, onEnterReading, onEnterPDF }) {
  const total = chapters.length
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0
  const chapter = chapters[currentChapter]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <BookOpen size={22} className="text-[#1B6B3A] dark:text-green-400" />
          Leitura
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Escolha como quer ler o ebook.</p>
      </div>

      {/* Continuar lendo */}
      {chapter && (
        <button
          onClick={onEnterReading}
          className="w-full text-left bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:border-[#1B6B3A] dark:hover:border-green-600 hover:shadow-md transition-all group"
        >
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2 flex items-center gap-1">
            <Clock size={10} /> Continuar lendo
          </p>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-[#1B6B3A] dark:group-hover:text-green-400 transition-colors mb-3 leading-snug">
            {chapter.title}
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: 'linear-gradient(to right, #1B6B3A, #C9A84C)' }}
              />
            </div>
            <span className="text-[10px] text-gray-400 shrink-0 flex items-center gap-1">
              <CheckCircle2 size={10} /> {completedCount}/{total}
            </span>
          </div>
        </button>
      )}

      {/* Dois cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <button
          onClick={onEnterReading}
          className="text-left bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-[#1B6B3A] dark:hover:border-green-600 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] dark:bg-[#0F4A28]/30 flex items-center justify-center mb-4">
            <BookOpen size={18} className="text-[#1B6B3A] dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-[#1B6B3A] dark:group-hover:text-green-400 transition-colors mb-1">
            Leitura Interativa
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Leia capítulo a capítulo com marcação de progresso, anotações e suporte IA.
          </p>
        </button>

        <button
          onClick={onEnterPDF}
          className="text-left bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-[#1B6B3A] dark:hover:border-green-600 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FDF6E3] dark:bg-yellow-900/20 flex items-center justify-center mb-4">
            <FileText size={18} className="text-[#C9A84C]" />
          </div>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-[#1B6B3A] dark:group-hover:text-green-400 transition-colors mb-1">
            Ler em PDF
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Acesse o ebook completo em PDF direto no navegador.
          </p>
        </button>
      </div>
    </div>
  )
}

export default function Platform({ user, profile, onAdminClick }) {
  const [activeTab, setActiveTab] = useState('news')
  const [currentChapter, setCurrentChapter] = useState(0)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState('notes')
  const [readingMode, setReadingMode] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('welcomeSeen'))

  const { chapters, chapterGroups } = useChapters()
  const streak = useStreak()
  const { completed, completedCount, markCompleted } = useProgress(user?.id)
  const { notes, saveNote, noteCount } = useNotes(user?.id)
  const { bookmarks, toggleBookmark } = useBookmarks(user?.id)
  const { steps: checklistSteps, toggleStep } = useChecklist(user?.id)
  const { ideas, saveIdea, deleteIdea } = useIdeas(user?.id)

  const readingProgress = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0

  const handleNavigate = (tab) => {
    setActiveTab(tab)
    if (tab !== 'reading') setReadingMode(false)
    setDrawerOpen(false)
  }

  const handleChapterSelect = (idx) => {
    setCurrentChapter(idx)
    setReadingMode(true)
    setActiveTab('reading')
    setDrawerOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleChapterRead = () => markCompleted(currentChapter)

  const handleEnterReading = () => {
    setReadingMode(true)
    setActiveTab('reading')
  }

  const handleEnterPDF = () => {
    setActiveTab('pdf')
    setReadingMode(false)
  }

  const handleBackToMenu = () => setReadingMode(false)

  const toggleFocusMode = () => {
    setFocusMode(f => {
      const next = !f
      if (next) { setLeftPanelOpen(false); setRightPanelOpen(false) }
      else setLeftPanelOpen(true)
      return next
    })
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

  const showChapterSidebar = activeTab === 'reading' && readingMode

  const SidebarContent = ({ onClose }) => showChapterSidebar ? (
    <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-[#111]">
      <button
        onClick={() => { handleBackToMenu(); onClose?.() }}
        className="flex items-center gap-2 px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-[#B80E02] border-b border-gray-100 dark:border-gray-700 transition-colors shrink-0"
      >
        <ArrowLeft size={13} /> Voltar ao menu
      </button>
      <div className="flex-1 overflow-hidden">
        <Sidebar
          currentChapter={currentChapter}
          onSelect={handleChapterSelect}
          completed={completed}
          onClose={onClose}
          chapters={chapters}
          chapterGroups={chapterGroups}
        />
      </div>
    </div>
  ) : (
    <NavSidebar activeTab={activeTab} onNavigate={handleNavigate} onClose={onClose} />
  )

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

      {showWelcome && <Onboarding onClose={dismissWelcome} />}

      {/* Mobile overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      <div className="flex flex-1 pt-16">
        {/* Desktop left sidebar */}
        <div className={`hidden lg:flex flex-col shrink-0 fixed left-0 top-16 bottom-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] transition-all duration-300 overflow-hidden ${
          leftPanelOpen && !focusMode ? 'w-56 xl:w-64' : 'w-0 border-r-0'
        }`}>
          <SidebarContent />
        </div>

        {/* Mobile drawer */}
        <div className={`fixed left-0 top-16 bottom-0 z-50 w-72 transition-transform duration-300 lg:hidden shadow-xl ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <SidebarContent onClose={() => setDrawerOpen(false)} />
        </div>

        {/* Main content */}
        <main className={`flex-1 min-w-0 transition-all duration-300 ${leftPanelOpen && !focusMode ? 'lg:ml-56 xl:ml-64' : 'lg:ml-0'}`}>

          {/* Sticky top bar */}
          {!focusMode && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] sticky top-16 z-30">
              <button
                onClick={() => setLeftPanelOpen(o => !o)}
                title={leftPanelOpen ? 'Recolher menu' : 'Expandir menu'}
                className="p-1.5 rounded-lg text-gray-400 hover:text-[#1B6B3A] dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
              >
                <PanelLeft size={15} />
              </button>
              {showChapterSidebar && (
                <button
                  onClick={handleBackToMenu}
                  className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-[#1B6B3A] dark:hover:text-green-400 transition-colors"
                >
                  <ArrowLeft size={13} /> Leitura
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={() => setRightPanelOpen(o => !o)}
                title="Anotações / Meu SaaS"
                className="p-1.5 rounded-lg text-gray-400 hover:text-[#1B6B3A] dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
              >
                <PanelRight size={15} />
              </button>
              {showChapterSidebar && (
                <button
                  onClick={toggleFocusMode}
                  title="Modo foco"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#1B6B3A] dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
                >
                  <Maximize2 size={15} />
                </button>
              )}
            </div>
          )}

          <div className="p-4 md:p-6 pb-24 lg:pb-8">
            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-lg hover:border-[#1B6B3A] transition-colors"
              >
                <Menu size={13} /> Menu
              </button>
              {showChapterSidebar && (
                <span className="text-xs text-gray-400 dark:text-gray-500 font-playfair italic truncate">
                  {chapters[currentChapter]?.title}
                </span>
              )}
            </div>

            {/* Focus mode exit */}
            {focusMode && showChapterSidebar && (
              <div className="hidden lg:flex justify-end mb-3">
                <button
                  onClick={toggleFocusMode}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1B6B3A] dark:hover:text-green-400 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-lg hover:border-[#1B6B3A] transition-colors"
                >
                  <Minimize2 size={13} /> Sair do foco
                </button>
              </div>
            )}

            {/* ── Content ── */}

            {activeTab === 'news' && <VibeNews />}

            {activeTab === 'reading' && !readingMode && (
              <ReadingHub
                chapters={chapters}
                currentChapter={currentChapter}
                completedCount={completedCount}
                onEnterReading={handleEnterReading}
                onEnterPDF={handleEnterPDF}
              />
            )}

            {activeTab === 'reading' && readingMode && (
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
                ideas={ideas}
                onSaveIdea={saveIdea}
                onDeleteIdea={deleteIdea}
              />
            )}

            {activeTab === 'generator' && <IdeaGenerator onSaveIdea={saveIdea} />}

            {activeTab === 'tools' && <AIToolsHub userId={user?.id} />}

            {activeTab === 'ext-tools' && <ToolsSection />}

            {activeTab === 'email' && <EmailMarketing />}

            {activeTab === 'checklist' && (
              <Checklist
                checklistSteps={checklistSteps}
                onToggleStep={toggleStep}
                onNavigate={(idx) => handleChapterSelect(idx)}
              />
            )}

            {activeTab === 'calculator' && <RevenueCalculator />}

            {activeTab === 'ai-support' && (
              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Suporte IA
                </h2>
                <AISupportChat
                  chapter={chapters[currentChapter]}
                  containerClass="h-[600px]"
                />
              </div>
            )}

            {activeTab === 'prompts' && <PromptLibrary />}

            {activeTab === 'pdf' && <PDFReader />}

            {['projects', 'templates', 'articles', 'community'].includes(activeTab) && (
              <ComingSoon label={
                activeTab === 'projects' ? 'Projetos'
                : activeTab === 'templates' ? 'Templates'
                : activeTab === 'articles' ? 'Artigos'
                : 'Comunidade'
              } />
            )}
          </div>

          {/* Page footer */}
          <footer className="border-t border-gray-200 dark:border-gray-700 py-4 px-6 text-center">
            <a
              href="https://thayanefidelis.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-[#1B6B3A] dark:hover:text-green-400 transition-colors"
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

        {/* Right panel — Anotações + Meu SaaS */}
        <div className={`hidden lg:flex flex-col w-64 xl:w-80 shrink-0 fixed right-0 top-16 bottom-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] overflow-y-auto scrollbar-thin transition-transform duration-300 z-30 shadow-xl ${rightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex border-b border-gray-100 dark:border-gray-700 shrink-0">
            {[{ id: 'notes', label: 'Anotações' }, { id: 'saas', label: 'Meu SaaS' }].map(t => (
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
            {rightPanelTab === 'saas' && <MySaas />}
          </div>
        </div>
      </div>
    </div>
  )
}
