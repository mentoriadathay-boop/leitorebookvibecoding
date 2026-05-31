import { Newspaper, BookOpen, Lightbulb, Cpu, Map, Wrench, Calculator, Zap, FileText, MessageSquare, Layout, FileText as FileText2, Users, FolderOpen, ExternalLink, Mail } from 'lucide-react'

const WhatsAppIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const NAV_ITEMS = [
  { id: 'news',         label: 'Vibe News',        icon: Newspaper },
  { id: 'reading',      label: 'Ebooks',            icon: BookOpen },
  { id: 'ideas',        label: 'Minhas Ideias',     icon: Lightbulb },
  { id: 'generator',    label: 'Gerador de Ideias', icon: Cpu },
  { id: 'tools',        label: 'Jornada SaaS',      icon: Map },
  { id: 'calculator',   label: 'Calculadora',       icon: Calculator },
  { id: 'prompts',      label: 'Prompts',           icon: Zap },
  { id: 'pdf',          label: 'Ler PDF',           icon: FileText },
  { id: 'ai-support',   label: 'Suporte IA',        icon: MessageSquare },
  { id: 'ext-tools',    label: 'Ferramentas',       icon: Wrench },
  { id: 'email',        label: 'Newsletter',        icon: Mail },
]

const NAV_SOON = [
  { id: 'templates',  label: 'Templates',   icon: Layout },
  { id: 'articles',   label: 'Artigos',     icon: FileText2 },
  { id: 'community',  label: 'Comunidade',  icon: Users },
  { id: 'projects',   label: 'Projetos',    icon: FolderOpen },
]

export default function NavSidebar({ activeTab, onNavigate, onClose }) {
  const handleClick = (id) => {
    onNavigate(id)
    onClose?.()
  }

  return (
    <aside className="w-full h-full bg-[#FAFAFA] dark:bg-[#111] flex flex-col border-r border-gray-200 dark:border-gray-800">
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2 px-2 space-y-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs font-medium rounded-lg border transition-all ${
                active
                  ? 'bg-[#B80E02] border-[#B80E02] text-white shadow-sm'
                  : 'bg-white dark:bg-[#1A1A1A] border-[#B80E02]/20 dark:border-[#B80E02]/20 text-gray-700 dark:text-gray-300 hover:border-[#B80E02]/60 hover:bg-red-50 dark:hover:bg-[#B80E02]/10 hover:text-[#B80E02] dark:hover:text-red-400'
              }`}
            >
              <Icon size={15} className="shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
            </button>
          )
        })}

        <div className="mx-1 my-2 border-t border-gray-200 dark:border-gray-700" />

        {NAV_SOON.map(item => {
          const Icon = item.icon
          return (
            <div key={item.id}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-default bg-white dark:bg-[#1A1A1A]">
              <Icon size={15} className="shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              <span className="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide shrink-0">
                em breve
              </span>
            </div>
          )
        })}
      </nav>

      <div className="px-3 py-2.5 border-t border-gray-200 dark:border-gray-700 shrink-0 bg-[#FAFAFA] dark:bg-[#111]">
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://api.whatsapp.com/message/EQIUEI67M7U2N1?autoload=1&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            title="Suporte WhatsApp"
            className="text-[#25D366] hover:text-[#1ebe5d] transition-colors"
          >
            <WhatsAppIcon size={16} />
          </a>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <a
            href="https://thayanefidelis.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#B80E02] dark:hover:text-red-400 transition-colors"
          >
            thayanefidelis.com <ExternalLink size={9} />
          </a>
        </div>
      </div>
    </aside>
  )
}
