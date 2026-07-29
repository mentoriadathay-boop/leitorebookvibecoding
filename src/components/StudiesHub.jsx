import { useState } from 'react'
import { GraduationCap, BookOpen, Headphones, Mail, Video } from 'lucide-react'
import Ebooks from './Ebooks'
import Audiobooks from './Audiobooks'
import EmailMarketing from './EmailMarketing'
import YoutubeVideos from './YoutubeVideos'

const TABS = [
  { id: 'ebooks',      label: 'Ebooks',       icon: BookOpen,   component: Ebooks },
  { id: 'audiobooks',  label: 'Audiobooks',   icon: Headphones, component: Audiobooks },
  { id: 'newsletters', label: 'Newsletters',  icon: Mail,       component: EmailMarketing },
  { id: 'videos',      label: 'Vídeos',       icon: Video,      component: YoutubeVideos },
]

export default function StudiesHub({ profile }) {
  const [tab, setTab] = useState('ebooks')
  const Active = TABS.find(t => t.id === tab)?.component || Ebooks

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <GraduationCap size={22} className="text-[#5B2A6E] dark:text-magic-light" />
          Estudos Vibe
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ebooks, audiobooks, newsletters e vídeos — tudo pra aprofundar seus estudos com IA.
        </p>
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-all whitespace-nowrap ${
                active
                  ? 'border-[#5B2A6E] text-[#5B2A6E] dark:text-magic-light'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-[#5B2A6E] dark:hover:text-magic-light'
              }`}>
              <Icon size={13} /> {t.label}
            </button>
          )
        })}
      </div>

      <Active profile={profile} />
    </div>
  )
}
