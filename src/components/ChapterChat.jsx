import { useState, useRef, useEffect } from 'react'
import { Send, Bot, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { askAI } from '../lib/anthropicClient'

function stripMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/^#{1,6}\s/gm, '')
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 800)
}

export default function ChapterChat({ chapter }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Reinicia o chat ao trocar de capítulo
  useEffect(() => {
    setOpen(false)
    setMessages([])
    setInput('')
  }, [chapter.title])

  // Scroll automático
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  const openChat = () => {
    setOpen(true)
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Olá! Estou aqui para tirar suas dúvidas sobre **${chapter.title}**. O que você quer aprofundar ou entender melhor?`,
      }])
    }
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    setInput('')

    const userMsg = { role: 'user', content: q }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const snippet = stripHtml(chapter.content || '')
      const systemPrompt = `Você é um assistente especializado no capítulo "${chapter.title}" do ebook "20 Passos para Criar seu App SaaS com Vibe Coding" de Thayane Fidelis (TFA Soluções com IA). Responda de forma clara, prática e direta em português brasileiro. Máximo 4 frases por resposta. Use o conteúdo do capítulo como referência principal. Contexto do capítulo: ${snippet}`

      const history = messages
        .filter((_, i) => i > 0)
        .concat(userMsg)
        .map(m => ({ role: m.role, content: m.content }))

      const reply = await askAI(history, systemPrompt)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      console.error('[ChapterChat]', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Não consegui conectar com a IA agora. Tente novamente em instantes.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-6">
      {/* Trigger */}
      {!open ? (
        <button
          onClick={openChat}
          className="w-full flex items-center justify-between gap-3 p-4 bg-[#E8F5EE] dark:bg-[#0F4A28]/20 border border-[#1B6B3A]/30 rounded-xl hover:border-[#1B6B3A] hover:bg-[#d4edde] dark:hover:bg-[#0F4A28]/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1B6B3A] flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[#0F4A28] dark:text-green-300">
                Tirar dúvidas sobre este capítulo
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Converse com a IA sobre "{chapter.title}"
              </p>
            </div>
          </div>
          <ChevronDown size={16} className="text-[#1B6B3A] dark:text-green-400 shrink-0 group-hover:translate-y-0.5 transition-transform" />
        </button>
      ) : (
        <div className="border border-[#1B6B3A]/30 dark:border-green-800/40 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#1B6B3A] dark:bg-[#0F4A28]">
            <div className="flex items-center gap-2">
              <Bot size={15} className="text-white" />
              <span className="text-sm font-semibold text-white">IA — {chapter.title}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <ChevronUp size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3 bg-white dark:bg-[#1A1A1A] scrollbar-thin">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] text-sm px-3 py-2.5 rounded-2xl leading-relaxed fade-in ${
                    msg.role === 'user'
                      ? 'bg-[#1B6B3A] text-white rounded-br-sm'
                      : 'bg-[#E8F5EE] dark:bg-[#0F4A28]/30 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                  }`}
                >
                  {stripMarkdown(msg.content)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#E8F5EE] dark:bg-[#0F4A28]/30 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                  <span className="dot1 text-[#1B6B3A]">•</span>
                  <span className="dot2 text-[#1B6B3A]">•</span>
                  <span className="dot3 text-[#1B6B3A]">•</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Sugestões rápidas (só no início) */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
              {[
                'Pode dar um exemplo prático?',
                'Como isso se aplica ao meu SaaS?',
                'Qual o passo a passo?',
              ].map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus() }}
                  className="text-xs px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-300 hover:border-[#1B6B3A] hover:text-[#1B6B3A] dark:hover:text-green-400 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#1A1A1A] border-t border-gray-100 dark:border-gray-700">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Sua dúvida sobre este capítulo..."
              className="flex-1 text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-[#1B6B3A] hover:bg-[#0F4A28] text-white flex items-center justify-center disabled:opacity-40 transition-colors shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
