import { useState, useRef, useEffect } from 'react'
import { Send, Bot } from 'lucide-react'
import { askAI } from '../lib/anthropicClient'

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500)
}

export default function AISupportChat({ chapter }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! Sou o assistente do ebook. Tire dúvidas sobre qualquer capítulo ou conceito.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    setInput('')

    const userMsg = { role: 'user', content: q }
    const history = [...messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0), userMsg]
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const contextSnippet = stripHtml(chapter?.content || '')
      const systemPrompt = `Você é o assistente do ebook "20 Passos para Criar seu App SaaS com Vibe Coding" de Thayane Fidelis (TFA Soluções com IA). Responda de forma objetiva, calorosa e em português brasileiro. Máximo 3 frases por resposta. Contexto do capítulo atual — "${chapter?.title}": ${contextSnippet}`

      const apiMessages = history.map(m => ({ role: m.role, content: m.content }))
      const reply = await askAI(apiMessages, systemPrompt)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      console.error('[AISupportChat]', err)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Não consegui conectar com a IA agora. Tente novamente em instantes!',
        },
      ])
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
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col h-64">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 shrink-0">
        <Bot size={14} className="text-[#1B6B3A]" />
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Suporte IA</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-xs max-w-[85%] px-2.5 py-2 rounded-xl leading-relaxed fade-in ${
              msg.role === 'assistant'
                ? 'bg-[#E8F5EE] dark:bg-[#0F4A28]/30 text-gray-700 dark:text-gray-200 self-start'
                : 'bg-[#1B6B3A] text-white ml-auto'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="text-xs bg-[#E8F5EE] dark:bg-[#0F4A28]/30 text-gray-500 dark:text-gray-400 px-3 py-2 rounded-xl max-w-[60%]">
            <span className="dot1">•</span>
            <span className="dot2">•</span>
            <span className="dot3">•</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 dark:border-gray-700 shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Sua dúvida..."
          className="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="w-7 h-7 rounded-lg bg-[#1B6B3A] hover:bg-[#0F4A28] text-white flex items-center justify-center disabled:opacity-40 transition-colors"
        >
          <Send size={12} />
        </button>
      </div>
    </div>
  )
}
