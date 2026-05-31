import { CheckCircle, Circle, ChevronDown, ChevronRight, Download, X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { chapters as defaultChapters, chapterGroups as defaultGroups } from '../data/chapters'

export default function Sidebar({ currentChapter, onSelect, completed, onClose, chapters = defaultChapters, chapterGroups = defaultGroups }) {
  const [collapsed, setCollapsed] = useState({})
  const [showCover, setShowCover] = useState(false)

  const toggle = (label) => setCollapsed(p => ({ ...p, [label]: !p[label] }))

  return (
    <>
      <aside className="w-full h-full overflow-y-auto scrollbar-thin bg-[#FAFAFA] dark:bg-[#111] flex flex-col">

        {/* Capa do ebook */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold mb-1.5">Ebook</p>
          <p className="text-xs font-bold text-gray-800 dark:text-white leading-snug">
            20 Passos para Criar seu App SaaS com Vibe Coding
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
            Do Planejamento à Monetização sem Frustração
          </p>
          <button
            onClick={() => setShowCover(true)}
            className="text-[10px] text-[#B80E02] mt-1.5 font-medium hover:underline"
          >
            Ver capa →
          </button>
        </div>

        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">Sumário</p>
        </div>

        <nav className="flex-1 py-2">
          {chapterGroups.map(group => (
            <div key={group.label} className="mb-1">
              <button
                onClick={() => toggle(group.label)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors uppercase tracking-wide"
              >
                {group.label}
                {collapsed[group.label] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>

              {!collapsed[group.label] && group.chapters.map(chIdx => {
                const ch = chapters[chIdx]
                const isActive = currentChapter === chIdx
                const isDone = completed[chIdx]
                return (
                  <button
                    key={chIdx}
                    onClick={() => { onSelect(chIdx); onClose?.() }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-colors text-xs ${
                      isActive
                        ? 'bg-[#B80E02]/10 border-l-2 border-[#B80E02] text-[#B80E02] font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="shrink-0">
                      {isDone
                        ? <CheckCircle size={13} className="text-[#1B6B3A] dark:text-green-400" />
                        : <Circle size={13} className="text-gray-300 dark:text-gray-600" />
                      }
                    </span>
                    <span className="truncate leading-snug">
                      <span className="block font-medium">{ch.title}</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">p. {ch.page}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-gray-700 shrink-0">
          <a
            href="/ebook-vibe-coding.pdf"
            download="Vibe Coding — 20 Passos para Criar seu SaaS.pdf"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1B6B3A] hover:bg-[#0F4A28] text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <Download size={13} />
            Baixar PDF do Ebook
          </a>
        </div>
      </aside>

      {/* Modal da capa */}
      {showCover && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowCover(false)}
        >
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowCover(false)}
              className="absolute -top-3 -right-3 z-10 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg text-gray-500 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
            <img
              src="/ebook-cover.png"
              alt="Capa do Ebook"
              className="w-full rounded-2xl shadow-2xl"
              onError={e => { e.target.style.display='none' }}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
