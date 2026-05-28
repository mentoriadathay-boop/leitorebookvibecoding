import { useState } from 'react'
import { Sparkles, RotateCcw, Bookmark } from 'lucide-react'
import { askAI } from '../lib/anthropicClient'

const publicoOptions = [
  'Empresas B2B',
  'Consumidor final B2C',
  'Profissionais autônomos',
  'Pequenos empreendedores',
  'Agências e consultores',
]

const disponibilidadeOptions = [
  'Menos de 5h',
  '5 a 10h',
  '10 a 20h',
  'Dedicação integral',
]

function fallbackIdeas(nicho, dor, publico) {
  return [
    {
      title: `${nicho}Flow`,
      body: `Automatiza o processo de ${dor} para ${publico}. Monetizado por assinatura mensal com planos por volume de uso.`,
      tag: nicho.split(' ')[0],
      descricao: ['Automação de tarefas repetitivas', 'Painel de controle centralizado', 'Relatórios automáticos por email'],
      monetizacao: 'Assinatura mensal (R$97-R$297/mês)',
      diferencial: `Foco específico em ${publico}, com onboarding guiado e suporte em português`,
    },
    {
      title: `${nicho}AI`,
      body: `Usa IA para resolver ${dor} automaticamente para ${publico}. Modelo freemium com upgrade para recursos avançados.`,
      tag: 'IA',
      descricao: ['Geração de conteúdo com IA', 'Análise e sugestões inteligentes', 'Integrações com ferramentas populares'],
      monetizacao: 'Freemium + plano Pro (R$147/mês)',
      diferencial: 'Automação com IA nativa, sem necessidade de configuração técnica',
    },
    {
      title: `${nicho}Pro`,
      body: `Dashboard completo para gerenciar ${dor} com analytics em tempo real para ${publico}. Cobra por assento de usuário.`,
      tag: 'Dashboard',
      descricao: ['Dashboard com métricas em tempo real', 'Alertas e notificações automáticas', 'Gestão de equipe e permissões'],
      monetizacao: 'Por assento: R$49/usuário/mês',
      diferencial: 'Relatórios visuais e alertas automáticos que nenhum concorrente oferece',
    },
  ]
}

export default function IdeaGenerator({ onSaveIdea }) {
  const [nicho, setNicho] = useState('')
  const [dor, setDor] = useState('')
  const [publico, setPublico] = useState(publicoOptions[0])
  const [disponibilidade, setDisponibilidade] = useState(disponibilidadeOptions[1])
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState({})

  const generate = async () => {
    if (!nicho.trim() || !dor.trim()) return
    setLoading(true)
    setIdeas([])
    setSaved({})

    try {
      const prompt = `Você é especialista em criação de SaaS com Vibe Coding para o mercado brasileiro.\nGere EXATAMENTE 3 ideias de SaaS em JSON puro, sem markdown, sem texto antes ou depois.\nPerfil do usuário: nicho=${nicho}, dor=${dor}, público=${publico}, disponibilidade=${disponibilidade}.\nFormato obrigatório:\n[{"title":"Nome do SaaS","body":"2 frases: o que resolve e como monetiza","tag":"palavra-chave","descricao":["funcionalidade 1","funcionalidade 2","funcionalidade 3"],"monetizacao":"modelo de monetização resumido","diferencial":"o que torna único"}]\nO campo descricao deve ter exatamente 3 funcionalidades principais e práticas que o app terá.`

      const reply = await askAI(
        [{ role: 'user', content: prompt }],
        'Você é especialista em criação de produtos SaaS para o mercado brasileiro. Responda apenas com JSON válido.'
      )

      const json = JSON.parse(reply.trim())
      setIdeas(json)
    } catch (err) {
      console.error('[IdeaGenerator]', err)
      setIdeas(fallbackIdeas(nicho || 'Seu nicho', dor || 'seu problema', publico))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (idea, i) => {
    const text = `${idea.title}: ${idea.body} | Monetização: ${idea.monetizacao} | Diferencial: ${idea.diferencial}`
    onSaveIdea(text, idea.tag, 'generator')
    setSaved(p => ({ ...p, [i]: true }))
  }

  return (
    <div className="max-w-2xl mx-auto px-2">
      <div className="mb-6">
        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1">Gerador de Ideias de SaaS</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Descreva seu contexto e receba 3 ideias personalizadas.</p>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
              Nicho ou área de atuação *
            </label>
            <input
              value={nicho}
              onChange={e => setNicho(e.target.value)}
              placeholder="Ex: Clínicas odontológicas, academias de ginástica..."
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
              Maior dor que você quer resolver *
            </label>
            <input
              value={dor}
              onChange={e => setDor(e.target.value)}
              placeholder="Ex: Gestão de agendamentos, controle de estoque..."
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Público-alvo</label>
              <select
                value={publico}
                onChange={e => setPublico(e.target.value)}
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300"
              >
                {publicoOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Disponibilidade</label>
              <select
                value={disponibilidade}
                onChange={e => setDisponibilidade(e.target.value)}
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300"
              >
                {disponibilidadeOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || !nicho.trim() || !dor.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#1B6B3A] hover:bg-[#0F4A28] text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="dot1">•</span>
                <span className="dot2">•</span>
                <span className="dot3">•</span>
              </>
            ) : (
              <><Sparkles size={16} /> Gerar minhas ideias de SaaS</>
            )}
          </button>
        </div>
      </div>

      {ideas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-playfair font-semibold text-lg text-gray-900 dark:text-white">Suas 3 ideias</h3>
            <button
              onClick={generate}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1B6B3A] transition-colors"
            >
              <RotateCcw size={12} /> Gerar novas
            </button>
          </div>

          <div className="space-y-4">
            {ideas.map((idea, i) => (
              <div key={i} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5 fade-in">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h4 className="font-playfair font-bold text-lg text-gray-900 dark:text-white">{idea.title}</h4>
                  <span className="shrink-0 text-[11px] bg-[#FEF2F2] dark:bg-red-900/20 text-[#B91C1C] dark:text-red-400 px-2 py-0.5 rounded-full font-semibold">
                    #{idea.tag}
                  </span>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{idea.body}</p>

                {idea.descricao?.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {idea.descricao.map((f, j) => (
                      <span
                        key={j}
                        className="inline-flex items-center gap-1 text-[11px] bg-[#E8F5EE] dark:bg-[#0F4A28]/30 text-[#1B6B3A] dark:text-green-400 px-2.5 py-1 rounded-full font-medium"
                      >
                        <span className="text-[10px]">✓</span> {f}
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="shrink-0 font-semibold text-[#C9A84C] w-24">Monetização:</span>
                    <span className="text-gray-600 dark:text-gray-400">{idea.monetizacao}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="shrink-0 font-semibold text-[#1B6B3A] dark:text-green-400 w-24">Diferencial:</span>
                    <span className="text-gray-600 dark:text-gray-400">{idea.diferencial}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSave(idea, i)}
                  disabled={saved[i]}
                  className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg border transition-all ${
                    saved[i]
                      ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400'
                      : 'border-[#1B6B3A] text-[#1B6B3A] hover:bg-[#E8F5EE] dark:hover:bg-[#0F4A28]/20'
                  }`}
                >
                  <Bookmark size={12} />
                  {saved[i] ? 'Ideia salva!' : 'Salvar esta ideia'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
