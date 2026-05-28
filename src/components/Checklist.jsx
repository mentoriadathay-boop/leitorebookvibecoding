import { CheckCircle, Circle, ExternalLink } from 'lucide-react'
import { chapters } from '../data/chapters'

const steps = [
  { number: 1, title: 'Identificar o Problema', desc: 'Encontrar um problema real, frequente e doloroso', chapterIdx: 7 },
  { number: 2, title: 'Validar a Dor', desc: 'Confirmar que pessoas pagariam pela solução', chapterIdx: 8 },
  { number: 3, title: 'Pesquisar o Mercado', desc: 'Analisar concorrentes e tamanho do mercado', chapterIdx: 9 },
  { number: 4, title: 'Brainstorm com IA', desc: 'Gerar e refinar ideias de produto com IA', chapterIdx: 10 },
  { number: 5, title: 'Arquitetura e Fluxo', desc: 'Mapear como o sistema vai funcionar', chapterIdx: 11 },
  { number: 6, title: 'Interface e UX', desc: 'Definir a experiência do usuário', chapterIdx: 12 },
  { number: 7, title: 'Criar o Protótipo', desc: 'Validar visualmente antes de construir', chapterIdx: 13 },
  { number: 8, title: 'Prompt e PRD', desc: 'Escrever o documento de requisitos do produto', chapterIdx: 14 },
  { number: 9, title: 'Escolher a Plataforma', desc: 'Selecionar as ferramentas de desenvolvimento', chapterIdx: 15 },
  { number: 10, title: 'Segurança e Banco', desc: 'Configurar banco de dados com segurança', chapterIdx: 16 },
  { number: 11, title: 'Validar e Lapidar', desc: 'Testar com usuários reais e iterar', chapterIdx: 17 },
  { number: 12, title: 'Modelo de Negócio', desc: 'Definir como e quanto cobrar', chapterIdx: 18 },
  { number: 13, title: 'Landing Page', desc: 'Criar a página de captação/vendas', chapterIdx: 19 },
  { number: 14, title: 'Plataforma de Pagamento', desc: 'Integrar o sistema de pagamentos', chapterIdx: 20 },
  { number: 15, title: 'Domínio Próprio', desc: 'Registrar e configurar o domínio', chapterIdx: 21 },
  { number: 16, title: 'Treinamento', desc: 'Criar onboarding e materiais de apoio', chapterIdx: 22 },
  { number: 17, title: 'Programa de Afiliados', desc: 'Estruturar o programa de indicações', chapterIdx: 23 },
  { number: 18, title: 'Lançar e Vender', desc: 'Executar a estratégia de lançamento', chapterIdx: 24 },
  { number: 19, title: 'Dicas de Vendas', desc: 'Aplicar estratégias de conversão', chapterIdx: 25 },
  { number: 20, title: 'Monitorar e Iterar', desc: 'Acompanhar métricas e evoluir o produto', chapterIdx: 26 },
]

export default function Checklist({ checklistSteps, onToggleStep, onNavigate }) {
  const completedCount = steps.filter(s => checklistSteps[s.number]).length
  const progress = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="max-w-2xl mx-auto px-2">
      <div className="mb-6">
        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Checklist dos 20 Passos
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Marque cada passo concluído na sua jornada de criação do SaaS.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(to right, #1B6B3A, #C9A84C)' }}
            />
          </div>
          <span className="text-sm font-semibold text-[#0F4A28] dark:text-green-400 whitespace-nowrap">
            {completedCount}/20 ({progress}%)
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {steps.map(step => {
          const done = checklistSteps[step.number]
          return (
            <div
              key={step.number}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                done
                  ? 'bg-[#E8F5EE] dark:bg-[#0F4A28]/20 border-[#1B6B3A]/30'
                  : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-gray-700 hover:border-[#1B6B3A]/40'
              }`}
            >
              <button
                onClick={() => onToggleStep(step.number)}
                className="shrink-0 transition-transform active:scale-90"
              >
                {done
                  ? <CheckCircle size={22} className="text-[#1B6B3A] check-pop" />
                  : <Circle size={22} className="text-gray-300 dark:text-gray-600 hover:text-[#1B6B3A] transition-colors" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] font-bold text-[#B91C1C] dark:text-red-400 uppercase">
                    Passo {String(step.number).padStart(2, '0')}
                  </span>
                  <span className={`text-sm font-semibold truncate ${done ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                    {step.title}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{step.desc}</p>
              </div>
              <button
                onClick={() => onNavigate?.(step.chapterIdx)}
                className="shrink-0 text-gray-400 hover:text-[#1B6B3A] transition-colors"
                title="Ir para o capítulo"
              >
                <ExternalLink size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
