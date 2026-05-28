import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const STEPS = [
  {
    emoji: '👋',
    tag: 'Bem-vinda',
    title: 'Bem-vinda ao Hub Vibe Coding!',
    desc: 'Você acaba de entrar na plataforma completa para criar seu SaaS com IA — do planejamento ao lançamento. Em menos de 2 minutos você vai conhecer tudo que está disponível para você.',
    features: null,
    highlight: null,
  },
  {
    emoji: '📖',
    tag: 'Leitura',
    title: 'Ebook interativo — muito além do PDF',
    desc: 'Cada capítulo foi pensado para ser consumido da forma que você preferir.',
    features: [
      { icon: '🎧', label: 'Narração em áudio', text: 'Ouça o capítulo com voz feminina em PT-BR — controle velocidade e voz' },
      { icon: '🎯', label: 'Modo Foco', text: 'Realça um parágrafo por vez para leitura sem distração' },
      { icon: '✍️', label: 'Grifos', text: 'Selecione qualquer trecho e salve destaques — ficam por capítulo' },
      { icon: '🧩', label: 'Quiz', text: 'Perguntas de fixação ao final de cada capítulo' },
    ],
    highlight: 'Use a aba Leitura e explore o sumário lateral.',
  },
  {
    emoji: '🤖',
    tag: 'IA',
    title: 'IA como sua mentora pessoal',
    desc: 'Dois chats de IA disponíveis para você — sem limitar as respostas ao ebook.',
    features: [
      { icon: '💬', label: 'Chat do capítulo', text: 'Aparece abaixo de cada capítulo — pergunte sobre o que acabou de ler' },
      { icon: '🧠', label: 'Suporte IA', text: 'No painel lateral — responde qualquer dúvida: tech, negócios, marketing' },
      { icon: '🎯', label: 'Contexto do seu SaaS', text: 'Cadastre seu projeto em "Meu SaaS" e a IA personaliza cada resposta' },
    ],
    highlight: 'Cadastre seu SaaS no painel direito → aba "Meu SaaS".',
  },
  {
    emoji: '🚀',
    tag: 'Ferramentas',
    title: 'Ferramentas para construir seu SaaS',
    desc: 'Tudo que você precisa do planejamento ao lançamento está aqui.',
    features: [
      { icon: '💡', label: 'Gerador de Ideias', text: 'Descreva seu nicho e receba 3 ideias de SaaS personalizadas com IA' },
      { icon: '✅', label: 'Checklist', text: 'Os 20 passos do ebook para acompanhar seu progresso passo a passo' },
      { icon: '📊', label: 'Calculadora', text: 'Simule MRR, ARR e projeção de receita para os próximos 12 meses' },
      { icon: '⚡', label: 'Prompts', text: '22 prompts prontos para copiar e usar no Claude, ChatGPT ou qualquer IA' },
    ],
    highlight: 'Use as abas no menu superior para acessar cada ferramenta.',
  },
  {
    emoji: '🌐',
    tag: 'Recursos',
    title: 'Recursos que se atualizam',
    desc: 'A plataforma cresce com você — conteúdo novo todo dia.',
    features: [
      { icon: '📰', label: 'Vibe News', text: 'Curadoria diária de notícias tech com IA — atualiza às 7h todo dia' },
      { icon: '🛠️', label: 'Ferramentas', text: '21 ferramentas do ecossistema Vibe Coding com links diretos' },
      { icon: '📄', label: 'Leitor PDF', text: 'Leia o ebook em formato PDF com grifos e marcação de onde parou — estilo Kindle' },
      { icon: '🔥', label: 'Streak', text: 'Contador de dias seguidos de leitura — apareça todo dia e mantenha a sequência' },
    ],
    highlight: null,
  },
  {
    emoji: '🎯',
    tag: 'Começar',
    title: 'Tudo pronto. Vamos criar seu SaaS!',
    desc: null,
    tip: {
      icon: '💡',
      text: 'Dica de ouro: comece pelo Checklist dos 20 Passos. Ele te guia do planejamento ao lançamento — capítulo por capítulo, na ordem certa.',
    },
    features: [
      { icon: '🏷️', label: 'Primeiro passo', text: 'Cadastre seu projeto em "Meu SaaS" no painel lateral direito' },
      { icon: '📖', label: 'Segundo passo', text: 'Leia o Capítulo 1 e use o chat de IA para tirar dúvidas' },
      { icon: '✅', label: 'Terceiro passo', text: 'Abra o Checklist e marque seu progresso conforme avança' },
    ],
    cta: 'Começar agora',
  },
]

export default function Onboarding({ onClose }) {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1) // 1 = forward, -1 = back

  const current = STEPS[step]
  const isLast  = step === STEPS.length - 1
  const isFirst = step === 0

  const go = (d) => {
    setDir(d)
    setStep(s => s + d)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B6B3A] dark:text-green-400 bg-[#E8F5EE] dark:bg-[#0F4A28]/30 px-2 py-0.5 rounded-full">
              {current.tag}
            </span>
            <span className="text-[10px] text-gray-400">{step + 1} de {STEPS.length}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">

          {/* Emoji */}
          <div className="text-5xl mb-4 text-center">{current.emoji}</div>

          {/* Title */}
          <h2 className="font-playfair text-xl font-bold text-gray-900 dark:text-white text-center mb-2 leading-snug">
            {current.title}
          </h2>

          {/* Desc */}
          {current.desc && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed mb-5">
              {current.desc}
            </p>
          )}

          {/* Tip box (last step) */}
          {current.tip && (
            <div className="mb-5 p-4 bg-[#E8F5EE] dark:bg-[#0F4A28]/20 border border-[#1B6B3A]/30 rounded-xl flex items-start gap-3">
              <span className="text-xl shrink-0">{current.tip.icon}</span>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{current.tip.text}</p>
            </div>
          )}

          {/* Features */}
          {current.features && (
            <div className="space-y-2.5">
              {current.features.map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <span className="text-xl shrink-0 leading-none mt-0.5">{f.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white leading-none mb-0.5">{f.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Hint */}
          {current.highlight && (
            <div className="mt-4 flex items-center gap-2 text-xs text-[#1B6B3A] dark:text-green-400 bg-[#E8F5EE] dark:bg-[#0F4A28]/20 px-3 py-2 rounded-lg">
              <span className="text-base">👉</span>
              {current.highlight}
            </div>
          )}
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 pb-3 shrink-0">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => { setDir(i > step ? 1 : -1); setStep(i) }}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-5 h-2 bg-[#1B6B3A] dark:bg-green-400'
                  : 'w-2 h-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Footer nav */}
        <div className="px-5 pb-5 shrink-0 flex items-center gap-3">
          {!isFirst ? (
            <button onClick={() => go(-1)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-gray-300">
              <ChevronLeft size={15} /> Voltar
            </button>
          ) : (
            <button onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-3 py-2.5">
              Pular tour
            </button>
          )}

          {isLast ? (
            <button onClick={onClose}
              className="flex-1 py-2.5 bg-[#1B6B3A] hover:bg-[#0F4A28] text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              🚀 {current.cta}
            </button>
          ) : (
            <button onClick={() => go(1)}
              className="flex-1 py-2.5 bg-[#1B6B3A] hover:bg-[#0F4A28] text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-1.5">
              {step === 0 ? 'Conhecer a plataforma' : 'Próximo'} <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
