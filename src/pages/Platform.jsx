import { useState, useEffect, useRef } from 'react'
import { BookOpen, FileText, Menu, PanelLeft, PanelRight, Maximize2, Minimize2, ArrowLeft, Clock, CheckCircle2, Volume2, VolumeX, Square, Headphones } from 'lucide-react'
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

function ReadingHub({ chapters, currentChapter, completedCount, onEnterReading, onEnterAudio, onEnterPDF }) {
  const total = chapters.length
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0
  const chapter = chapters[currentChapter]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <BookOpen size={22} className="text-[#1B6B3A] dark:text-green-400" />
          Ebooks
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Selecione um ebook para começar ou continuar.</p>
      </div>

      {/* ── Ebook: 20 Passos ── */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header do ebook — capa + título */}
        <div className="flex items-center gap-4 p-5 border-b border-gray-100 dark:border-gray-700">
          <img
            src="/ebook-cover.png"
            alt="Capa do Ebook 20 Passos"
            className="w-16 h-20 object-cover rounded-xl shadow-md shrink-0"
            onError={e => { e.target.style.display = 'none' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Ebook</p>
            <h3 className="font-playfair font-bold text-sm text-gray-900 dark:text-white leading-snug mb-1">
              20 Passos para Criar seu App SaaS com Vibe Coding
            </h3>
            <p className="text-[10px] text-gray-400 leading-snug">Do Planejamento à Monetização sem Frustração</p>

            {/* Progresso */}
            {total > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, background: 'linear-gradient(to right, #1B6B3A, #C9A84C)' }} />
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{completedCount}/{total}</span>
              </div>
            )}
          </div>
        </div>

        {/* Continuar lendo */}
        {chapter && (
          <button onClick={onEnterReading}
            className="w-full text-left px-5 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5 flex items-center gap-1">
              <Clock size={9} /> Continuar lendo
            </p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#1B6B3A] dark:group-hover:text-green-400 transition-colors truncate">
              {chapter.title}
            </p>
          </button>
        )}

        {/* Opções */}
        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-700">
          <button onClick={onEnterReading}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group text-left">
            <div className="w-9 h-9 rounded-xl bg-[#E8F5EE] dark:bg-[#0F4A28]/30 flex items-center justify-center shrink-0">
              <BookOpen size={16} className="text-[#1B6B3A] dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-[#1B6B3A] dark:group-hover:text-green-400 transition-colors">
                Leitura Interativa
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">Progresso e anotações</p>
            </div>
          </button>

          <button onClick={onEnterAudio}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group text-left">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
              <Headphones size={16} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Leitura com Áudio
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">Ouça enquanto lê</p>
            </div>
          </button>

          <button onClick={onEnterPDF}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group text-left">
            <div className="w-9 h-9 rounded-xl bg-[#FDF6E3] dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
              <FileText size={16} className="text-[#C9A84C]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-[#1B6B3A] dark:group-hover:text-green-400 transition-colors">
                Ler em PDF
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">Versão completa em PDF</p>
            </div>
          </button>
        </div>
      </div>

      {/* Placeholder para futuros ebooks */}
      <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
        <p className="text-xs text-gray-400 dark:text-gray-500">Mais ebooks em breve</p>
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
  const [audioMode, setAudioMode] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const audioUttRef = useRef(null)
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

  const stopAudio = () => {
    window.speechSynthesis.cancel()
    setAudioPlaying(false)
  }

  const handleEnterReading = () => {
    stopAudio()
    setAudioMode(false)
    setReadingMode(true)
    setActiveTab('reading')
  }

  const handleEnterAudio = () => {
    setAudioMode(true)
    setReadingMode(true)
    setActiveTab('reading')
  }

  const playChapterAudio = (chapter) => {
    stopAudio()
    if (!chapter?.content) return
    const text = chapter.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'pt-BR'
    utt.rate = 0.92
    utt.onend = () => setAudioPlaying(false)
    utt.onerror = () => setAudioPlaying(false)
    audioUttRef.current = utt
    window.speechSynthesis.speak(utt)
    setAudioPlaying(true)
  }

  const handleEnterPDF = () => {
    setActiveTab('pdf')
    setReadingMode(false)
  }

  const handleBackToMenu = () => { stopAudio(); setReadingMode(false); setAudioMode(false) }

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
          onChecklist={() => { handleNavigate('checklist'); onClose?.() }}
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
                onEnterAudio={handleEnterAudio}
                onEnterPDF={handleEnterPDF}
              />
            )}

            {activeTab === 'reading' && readingMode && audioMode && (
              <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40 rounded-xl">
                <Headphones size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">Modo áudio ativo</p>
                  <p className="text-[10px] text-purple-500 dark:text-purple-400 truncate">{chapters[currentChapter]?.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!audioPlaying ? (
                    <button onClick={() => playChapterAudio(chapters[currentChapter])}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                      <Volume2 size={12} /> Reproduzir
                    </button>
                  ) : (
                    <button onClick={stopAudio}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                      <Square size={12} /> Parar
                    </button>
                  )}
                  <button onClick={() => { stopAudio(); setAudioMode(false) }}
                    className="text-[10px] text-purple-400 hover:text-purple-600 transition-colors px-1">
                    Desativar
                  </button>
                </div>
              </div>
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
