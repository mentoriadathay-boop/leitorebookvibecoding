import { useState, useEffect, useRef } from 'react'
import { Mail, ChevronDown, ChevronUp, Volume2, VolumeX, Square } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import AISupportChat from './AISupportChat'

const CATEGORIES = {
  newsletter: { label: 'Newsletter',  color: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400' },
  bastidores: { label: 'Bastidores',  color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
  lancamento: { label: 'Lançamento',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  dica:       { label: 'Dica',        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' },
  promocao:   { label: 'Promoção',    color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function AudioButton({ text }) {
  const [playing, setPlaying] = useState(false)
  const uttRef = useRef(null)

  const toggle = () => {
    if (playing) {
      window.speechSynthesis.cancel()
      setPlaying(false)
      return
    }
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'pt-BR'
    utt.rate = 0.95
    utt.onend = () => setPlaying(false)
    utt.onerror = () => setPlaying(false)
    uttRef.current = utt
    window.speechSynthesis.speak(utt)
    setPlaying(true)
  }

  useEffect(() => () => window.speechSynthesis.cancel(), [])

  return (
    <button
      onClick={e => { e.stopPropagation(); toggle() }}
      title={playing ? 'Parar áudio' : 'Ouvir email'}
      className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
        playing
          ? 'bg-[#B80E02] text-white border-[#B80E02]'
          : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-[#B80E02] hover:text-[#B80E02]'
      }`}
    >
      {playing ? <><Square size={9} /> Parar</> : <><Volume2 size={10} /> Ouvir</>}
    </button>
  )
}

export default function EmailMarketing() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('todos')
  const [showChat, setShowChat] = useState(null)

  useEffect(() => {
    supabase
      .from('email_marketing')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setEmails(data)
        setLoading(false)
      })
  }, [])

  const categories = ['todos', ...new Set(emails.map(e => e.category))]
  const filtered = filter === 'todos' ? emails : emails.filter(e => e.category === filter)

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 rounded-xl bg-[#0F4A28] flex items-center justify-center animate-pulse">
        <Mail size={18} className="text-white" />
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Mail size={22} className="text-[#1B6B3A] dark:text-green-400" />
          Newsletter
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Arquivo dos emails enviados para a audiência — conteúdo, bastidores e estratégias.
        </p>
      </div>

      {/* Filtros */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const info = cat === 'todos' ? null : CATEGORIES[cat]
            const active = filter === cat
            return (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
                  active
                    ? 'bg-[#0F4A28] text-white border-[#0F4A28]'
                    : 'bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-[#1B6B3A]'
                }`}
              >
                {cat === 'todos' ? 'Todos' : (info?.label || cat)}
              </button>
            )
          })}
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F5EE] dark:bg-[#0F4A28]/20 flex items-center justify-center mx-auto mb-4">
            <Mail size={24} className="text-[#1B6B3A] dark:text-green-400" />
          </div>
          <h3 className="font-playfair font-bold text-lg text-gray-900 dark:text-white mb-2">Nenhum email ainda</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Em breve o conteúdo aparecerá aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(email => {
            const cat = CATEGORIES[email.category] || CATEGORIES.newsletter
            const isOpen = expanded === email.id
            const plainText = stripHtml(email.body)
            return (
              <div key={email.id}
                className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-[#1B6B3A] dark:hover:border-green-600 transition-all">

                {/* Header clicável */}
                <button onClick={() => { setExpanded(isOpen ? null : email.id); setShowChat(null) }}
                  className="w-full text-left p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${cat.color}`}>
                          {cat.label}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">{fmtDate(email.created_at)}</span>
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug">
                        {email.subject}
                      </h3>
                    </div>
                    <span className="shrink-0 text-gray-400 dark:text-gray-500 mt-0.5">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </button>

                {/* Conteúdo expandido */}
                {isOpen && (
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    {/* Barra de ações */}
                    <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#111]">
                      <AudioButton text={plainText} />
                      <button
                        onClick={() => setShowChat(v => v === email.id ? null : email.id)}
                        className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                          showChat === email.id
                            ? 'bg-[#0F4A28] text-white border-[#0F4A28]'
                            : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-[#1B6B3A] hover:text-[#1B6B3A]'
                        }`}
                      >
                        💬 Perguntar à IA
                      </button>
                    </div>

                    {/* Conteúdo HTML */}
                    <div className="px-5 py-4">
                      <div
                        className="email-content"
                        dangerouslySetInnerHTML={{
                          __html: email.body.includes('<')
                            ? email.body
                            : email.body.split('\n').map(l => l.trim() ? `<p>${l}</p>` : '').join('')
                        }}
                      />
                    </div>

                    {/* Chat IA */}
                    {showChat === email.id && (
                      <div className="px-5 pb-5">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Aprofunde com a IA</p>
                        <AISupportChat
                          chapter={{ title: email.subject, content: plainText.slice(0, 500) }}
                          initialMessage={`Olá! Posso te ajudar com dúvidas sobre o email "${email.subject}". O que quer saber?`}
                          placeholder="Pergunte sobre este email..."
                          containerClass="h-72"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* CSS para renderização correta do HTML dos emails */}
      <style>{`
        .email-content { font-size: 0.9rem; line-height: 1.75; color: #374151; }
        .dark .email-content { color: #d1d5db; }
        .email-content h1 { font-size: 1.6rem; font-weight: 700; margin: 1.2rem 0 0.6rem; color: #111827; }
        .email-content h2 { font-size: 1.3rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #111827; }
        .email-content h3 { font-size: 1.1rem; font-weight: 600; margin: 0.8rem 0 0.4rem; color: #111827; }
        .dark .email-content h1, .dark .email-content h2, .dark .email-content h3 { color: #f9fafb; }
        .email-content p  { margin: 0 0 0.85rem; }
        .email-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0 0.85rem; }
        .email-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0 0.85rem; }
        .email-content li { margin: 0.3rem 0; }
        .email-content strong, .email-content b { font-weight: 700; }
        .email-content em, .email-content i { font-style: italic; }
        .email-content a { color: #1B6B3A; text-decoration: underline; }
        .email-content blockquote { border-left: 4px solid #C9A84C; padding: 8px 16px; margin: 1rem 0; background: #fdf6e3; border-radius: 0 8px 8px 0; color: #4b5563; font-style: italic; }
        .dark .email-content blockquote { background: rgba(201,168,76,.1); color: #9ca3af; }
        .email-content hr { border: none; border-top: 2px solid #e5e7eb; margin: 1.2rem 0; }
        .dark .email-content hr { border-color: #374151; }
        .email-content img { max-width: 100%; border-radius: 10px; margin: 1rem 0; display: block; }
        .email-content pre, .email-content code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.85em; }
        .dark .email-content pre, .dark .email-content code { background: #374151; color: #d1fae5; }
        .email-content table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .email-content th, .email-content td { padding: 8px 12px; border: 1px solid #e5e7eb; text-align: left; }
        .dark .email-content th, .dark .email-content td { border-color: #374151; }
        .email-content th { background: #f9fafb; font-weight: 600; }
        .dark .email-content th { background: #1f2937; }
      `}</style>
    </div>
  )
}
