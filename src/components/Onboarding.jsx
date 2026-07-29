import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const STEPS = [
  {
    emoji: '👋',
    tag: 'Bem-vinda',
    title: 'Bem-vinda ao Hub Vibe Coding!',
    desc: 'Você acaba de entrar na plataforma completa pra criar SaaS e soluções com IA — do planejamento ao lançamento. Em menos de 2 minutos vou te mostrar tudo que está por aqui.',
    features: null,
    highlight: null,
  },
  {
    emoji: '🎓',
    tag: 'Estudos Vibe',
    title: 'Estudos Vibe — tudo pra aprender',
    desc: 'Um hub único com quatro sub-abas: você absorve como preferir.',
    features: [
      { icon: '📖', label: 'Ebooks',       text: 'Catálogo com capa e descrição — clique pra baixar/abrir o PDF' },
      { icon: '🎧', label: 'Audiobooks',   text: 'Ouça direto na plataforma — controles de play/pause por card' },
      { icon: '📰', label: 'Newsletters',  text: 'Arquivo das newsletters já enviadas — conteúdo pra ler quando quiser' },
      { icon: '🎬', label: 'Vídeos',       text: 'Vídeos curados do YouTube — player embedado sem sair do app' },
    ],
    highlight: 'Alguns conteúdos são premium (aparecem com um cadeado).',
  },
  {
    emoji: '💡',
    tag: 'Ideias',
    title: 'Da faísca ao projeto pronto',
    desc: 'Duas ferramentas que conversam entre si pra transformar ideia em SaaS.',
    features: [
      { icon: '🧠', label: 'Gerador de Ideias', text: 'Descreva seu nicho, dor e público e receba 3 ideias personalizadas por IA' },
      { icon: '💾', label: 'Minhas Ideias',     text: 'Todas as ideias que você salva ficam guardadas — organizadas por tag' },
      { icon: '➡️', label: 'Levar pra Jornada', text: 'Cada ideia tem botão que abre a Jornada SaaS já pré-preenchida com seus dados' },
    ],
    highlight: null,
  },
  {
    emoji: '🗺️',
    tag: 'Jornada SaaS',
    title: 'Jornada SaaS — 5 ferramentas conectadas',
    desc: 'Cada uma puxa dados da anterior — você não recomeça do zero em nenhuma etapa.',
    features: [
      { icon: '🎯', label: 'Validador de Nicho',       text: 'A IA analisa seu nicho e devolve um score de potencial' },
      { icon: '🧩', label: 'Gerador de MVP',            text: 'Define as funcionalidades essenciais + prompts prontos pro Cursor/Lovable' },
      { icon: '📅', label: 'Criador de Roadmap',        text: 'Roadmap realista baseado no seu tempo e nível técnico' },
      { icon: '🚀', label: 'IA para Landing Pages',     text: 'Copy de alta conversão, hero section, FAQ e prompts pra construir' },
      { icon: '💰', label: 'Diagnóstico de Monetização',text: 'Gargalos, score e plano de 30 dias pra escalar' },
    ],
    highlight: null,
  },
  {
    emoji: '🧰',
    tag: 'Ferramentas',
    title: 'Ferramentas Vibe, Calculadora e Prompts',
    desc: 'Suporte prático pro dia a dia de quem constrói com IA.',
    features: [
      { icon: '🛠️', label: 'Ferramentas Vibe', text: 'Curadoria das melhores ferramentas de IA — com prós e contras de cada uma' },
      { icon: '📊', label: 'Calculadora',      text: 'Simule MRR, ARR e crescimento em 12 meses — e importe uma ideia salva' },
      { icon: '⚡', label: 'Prompts',          text: 'Biblioteca de prompts prontos pra landing pages, backends, marketing e mais' },
    ],
    highlight: null,
  },
  {
    emoji: '🧪',
    tag: 'Premium',
    title: 'Laboratório Vibe — só pra membros',
    desc: 'Um espaço pra registrar seus experimentos criando com IA — acertos, erros e insights.',
    features: [
      { icon: '📝', label: 'Registre experiências', text: 'Anote o que aconteceu num experimento com IA (tipo: acerto/erro/insight)' },
      { icon: '🤖', label: 'IA analisa por você',   text: 'Botão "Analisar com IA" devolve resumo, causa-raiz, lições e checklist' },
      { icon: '📚', label: 'Histórico',              text: 'Seus registros e análises ficam salvos e organizados por data' },
    ],
    highlight: 'Este módulo aparece com cadeado 🔒 até você fazer upgrade.',
  },
  {
    emoji: '🚀',
    tag: 'Plataformas',
    title: 'Plataformas SaaS TFA + Suporte IA',
    desc: 'Conheça o que construímos e tire dúvidas quando precisar.',
    features: [
      { icon: '🌐', label: 'Plataformas SaaS TFA', text: 'Catálogo das plataformas que criamos com breve apresentação e link' },
      { icon: '💸', label: 'Programa de Afiliados', text: 'Torne-se afiliado e ganhe 40% de comissão recorrente indicando' },
      { icon: '💬', label: 'Suporte IA',            text: 'Chat com IA sempre disponível pra tirar qualquer dúvida — como um mentor 24/7' },
    ],
    highlight: null,
  },
  {
    emoji: '🎯',
    tag: 'Começar',
    title: 'Pronto! Bora criar seu SaaS?',
    desc: null,
    tip: {
      icon: '💡',
      text: 'Dica: comece pelo Gerador de Ideias — ele te dá 3 ideias já mapeadas pra o seu nicho, e cada uma pode ser levada direto pra Jornada SaaS.',
    },
    features: [
      { icon: '1️⃣', label: 'Primeiro passo', text: 'Vá em "Gerador de Ideias" e descreva seu nicho, dor e público' },
      { icon: '2️⃣', label: 'Segundo passo',  text: 'Escolha uma ideia gerada e clique em "Levar pra Jornada SaaS"' },
      { icon: '3️⃣', label: 'Terceiro passo', text: 'Siga as 5 ferramentas da Jornada até chegar no diagnóstico de monetização' },
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
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B2A6E] dark:text-magic-light bg-[#F2E4FA] dark:bg-[#3E1B4D]/30 px-2 py-0.5 rounded-full">
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
            <div className="mb-5 p-4 bg-[#F2E4FA] dark:bg-[#3E1B4D]/20 border border-[#5B2A6E]/30 rounded-xl flex items-start gap-3">
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
            <div className="mt-4 flex items-center gap-2 text-xs text-[#5B2A6E] dark:text-magic-light bg-[#F2E4FA] dark:bg-[#3E1B4D]/20 px-3 py-2 rounded-lg">
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
                  ? 'w-5 h-2 bg-[#5B2A6E] dark:bg-magic-light'
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
              className="flex-1 py-2.5 bg-[#5B2A6E] hover:bg-[#3E1B4D] text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              🚀 {current.cta}
            </button>
          ) : (
            <button onClick={() => go(1)}
              className="flex-1 py-2.5 bg-[#5B2A6E] hover:bg-[#3E1B4D] text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-1.5">
              {step === 0 ? 'Conhecer a plataforma' : 'Próximo'} <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
