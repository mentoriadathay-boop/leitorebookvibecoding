import { useState, useEffect } from 'react'
import { Save, Bookmark, BookmarkCheck, CheckCircle, Circle } from 'lucide-react'
import { chapters } from '../data/chapters'

export default function NotesPanel({
  chapterIndex,
  notes,
  onSaveNote,
  bookmarks,
  onToggleBookmark,
  completedCount,
  totalChapters,
  noteCount,
  ideasCount,
}) {
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setText(notes[chapterIndex] || '')
    setSaved(false)
  }, [chapterIndex, notes])

  const handleSave = async () => {
    await onSaveNote(chapterIndex, text)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const progress = Math.round((completedCount / totalChapters) * 100)

  return (
    <div className="space-y-4">
      {/* Progress card */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Meu Progresso</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Capítulos lidos', value: completedCount },
            { label: '% Concluído', value: `${progress}%` },
            { label: 'Notas salvas', value: noteCount },
            { label: 'Ideias geradas', value: ideasCount || 0 },
          ].map(item => (
            <div key={item.label} className="bg-[#E8F5EE] dark:bg-[#0F4A28]/20 rounded-lg p-2.5 text-center">
              <div className="font-playfair font-bold text-xl text-[#0F4A28] dark:text-green-400">{item.value}</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(to right, #1B6B3A, #C9A84C)' }}
          />
        </div>
      </div>

      {/* Notes card */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Minhas Anotações</h3>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Suas reflexões sobre este capítulo..."
          className="w-full h-28 text-xs resize-none border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400"
        />
        <button
          onClick={handleSave}
          className={`mt-2 w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition-all font-medium ${
            saved
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-[#1B6B3A] hover:bg-[#0F4A28] text-white'
          }`}
        >
          <Save size={12} />
          {saved ? 'Salvo!' : 'Salvar anotação'}
        </button>
      </div>

      {/* Bookmarks card */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Marcadores</h3>
        <button
          onClick={() => onToggleBookmark(chapterIndex)}
          className={`w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border transition-all ${
            bookmarks.includes(chapterIndex)
              ? 'bg-[#C9A84C] text-white border-[#C9A84C]'
              : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#C9A84C]'
          }`}
        >
          {bookmarks.includes(chapterIndex)
            ? <><BookmarkCheck size={12} /> Marcado</>
            : <><Bookmark size={12} /> Marcar este capítulo</>
          }
        </button>

        {bookmarks.length > 0 && (
          <div className="mt-3 space-y-1">
            {bookmarks.map(bi => (
              <div key={bi} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 py-1">
                <Bookmark size={10} className="text-[#C9A84C] shrink-0" />
                <span className="truncate">{chapters[bi]?.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
