import { ExternalLink } from 'lucide-react'

const TOOLS = [
  {
    category: 'Inteligência Artificial',
    color: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/40',
    headerColor: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
    items: [
      {
        name: 'Claude',
        emoji: '🤖',
        desc: 'A IA que a Thayane usa para desenvolver SaaS do zero. Melhor para raciocínio, código complexo e contextos longos.',
        tag: 'Recomendada no ebook',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://claude.ai',
      },
      {
        name: 'Claude Code',
        emoji: '💻',
        desc: 'CLI oficial da Anthropic que roda no terminal e executa tarefas de desenvolvimento de forma autônoma — o que você está usando agora.',
        tag: 'Mencionado no ebook',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://claude.ai/code',
      },
      {
        name: 'ChatGPT',
        emoji: '💬',
        desc: 'IA da OpenAI. Boa para brainstorming, copywriting e tarefas mais simples. Plano Pro tem acesso ao GPT-4o.',
        tag: 'Alternativa',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://chatgpt.com',
      },
      {
        name: 'Gemini',
        emoji: '✨',
        desc: 'IA do Google com contexto longo e boa integração com Google Workspace. Gratuito com limites generosos.',
        tag: 'Alternativa',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://gemini.google.com',
      },
    ],
  },
  {
    category: 'Plataformas Vibe Coding',
    color: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/40',
    headerColor: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    items: [
      {
        name: 'Cursor',
        emoji: '⚡',
        desc: 'Editor de código com IA embutida. Você escreve em linguagem natural e ele gera, corrige e refatora código em tempo real.',
        tag: 'Mencionado no ebook',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://cursor.com',
      },
      {
        name: 'Lovable',
        emoji: '💜',
        desc: 'Transforma descrição em texto em um app React completo. Ideal para criar o MVP inicial do seu SaaS rapidamente.',
        tag: 'Mencionado no ebook',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://lovable.dev',
      },
      {
        name: 'Bolt.new',
        emoji: '⚡',
        desc: 'Cria apps full-stack do zero a partir de um prompt. Gera front-end, back-end e banco de dados com IA no navegador.',
        tag: 'Popular',
        tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        url: 'https://bolt.new',
      },
      {
        name: 'Replit',
        emoji: '🔁',
        desc: 'IDE online com IA integrada. Permite criar, rodar e publicar apps sem instalar nada no computador.',
        tag: 'Mencionado no ebook',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://replit.com',
      },
      {
        name: 'v0.dev',
        emoji: '🎨',
        desc: 'Gera componentes de interface React/Tailwind a partir de descrição ou imagem. Da Vercel. Ótimo para criar telas rapidamente.',
        tag: 'UI',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://v0.dev',
      },
      {
        name: 'Windsurf',
        emoji: '🏄',
        desc: 'Editor de código com IA da Codeium. Alternativa ao Cursor com plano gratuito mais generoso.',
        tag: 'Alternativa',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://windsurf.com',
      },
    ],
  },
  {
    category: 'Backend & Banco de Dados',
    color: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/40',
    headerColor: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    items: [
      {
        name: 'Supabase',
        emoji: '🗄️',
        desc: 'Backend completo: banco de dados PostgreSQL, autenticação, storage e funções serverless. Open source e gratuito para começar.',
        tag: 'Usado nesta plataforma',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://supabase.com',
      },
      {
        name: 'Firebase',
        emoji: '🔥',
        desc: 'Backend do Google. Banco NoSQL em tempo real, autenticação e hospedagem. Boa opção para apps que precisam de sync instantâneo.',
        tag: 'Alternativa',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://firebase.google.com',
      },
      {
        name: 'PlanetScale',
        emoji: '🪐',
        desc: 'Banco MySQL serverless altamente escalável. Boa opção quando o projeto cresce e precisa de performance.',
        tag: 'Escalável',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://planetscale.com',
      },
    ],
  },
  {
    category: 'Deploy & Hospedagem',
    color: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/40',
    headerColor: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    items: [
      {
        name: 'Vercel',
        emoji: '▲',
        desc: 'Deploy automático de apps React, Next.js e outros frameworks. Conecta ao GitHub e publica a cada push. Gratuito para projetos pessoais.',
        tag: 'Usado nesta plataforma',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://vercel.com',
      },
      {
        name: 'Railway',
        emoji: '🚂',
        desc: 'Deploy de back-end, APIs e bancos de dados. Simples e rápido. Ótimo para subir um servidor Node.js ou um webhook.',
        tag: 'Back-end',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://railway.app',
      },
      {
        name: 'Render',
        emoji: '🌐',
        desc: 'Hospedagem de aplicações web, APIs e bancos. Tem plano gratuito e é fácil de configurar.',
        tag: 'Alternativa',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://render.com',
      },
    ],
  },
  {
    category: 'Pagamentos & Vendas',
    color: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/40',
    headerColor: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    items: [
      {
        name: 'Hotmart',
        emoji: '🔥',
        desc: 'Plataforma brasileira de vendas de produtos digitais. Processa pagamentos, gerencia afiliados e envia webhooks na compra.',
        tag: 'Mencionado no ebook',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://hotmart.com',
      },
      {
        name: 'Stripe',
        emoji: '💳',
        desc: 'Processador de pagamentos global. Melhor para SaaS com assinatura recorrente. API robusta com suporte a planos, trials e upgrades.',
        tag: 'Mencionado no ebook',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://stripe.com',
      },
      {
        name: 'Kiwify',
        emoji: '🥝',
        desc: 'Alternativa brasileira ao Hotmart. Taxas menores, interface simples e suporte a assinatura recorrente.',
        tag: 'Alternativa',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://kiwify.com.br',
      },
    ],
  },
  {
    category: 'Automação & Integração',
    color: 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/40',
    headerColor: 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
    items: [
      {
        name: 'Make',
        emoji: '⚙️',
        desc: 'Conecta apps e automatiza fluxos sem código. Perfeito para receber webhook da Hotmart e criar usuário no Supabase automaticamente.',
        tag: 'Automação',
        tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        url: 'https://make.com',
      },
      {
        name: 'Zapier',
        emoji: '⚡',
        desc: 'Alternativa ao Make. Mais simples, com mais integrações nativas. Plano gratuito limitado.',
        tag: 'Alternativa',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://zapier.com',
      },
      {
        name: 'n8n',
        emoji: '🔗',
        desc: 'Automação open source. Pode ser auto-hospedado, sem custo por execução. Ótimo para quem quer controle total.',
        tag: 'Open Source',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://n8n.io',
      },
    ],
  },
  {
    category: 'Design & Prototipação',
    color: 'bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800/40',
    headerColor: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400',
    items: [
      {
        name: 'Figma',
        emoji: '🎨',
        desc: 'Design de interfaces colaborativo no navegador. Plano gratuito generoso. Padrão da indústria para protótipos de UI.',
        tag: 'Design',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://figma.com',
      },
      {
        name: 'Canva',
        emoji: '✏️',
        desc: 'Design visual sem precisar de habilidade técnica. Ótimo para landing pages, apresentações e materiais de marketing.',
        tag: 'Design',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://canva.com',
      },
      {
        name: 'Whimsical',
        emoji: '🗺️',
        desc: 'Criação de fluxogramas e mapas de fluxo de usuário. Útil para planejar a arquitetura do app antes de construir.',
        tag: 'Fluxo',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://whimsical.com',
      },
    ],
  },
]

function ToolCard({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-[#1B6B3A] dark:hover:border-green-600 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{item.emoji}</span>
          <span className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-[#1B6B3A] dark:group-hover:text-green-400 transition-colors">
            {item.name}
          </span>
        </div>
        <ExternalLink size={12} className="text-gray-400 group-hover:text-[#1B6B3A] dark:group-hover:text-green-400 shrink-0 mt-0.5 transition-colors" />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
      <span className={`self-start text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.tagColor}`}>
        {item.tag}
      </span>
    </a>
  )
}

export default function ToolsSection() {
  return (
    <div className="max-w-5xl mx-auto px-2 space-y-8">
      <div className="mb-2">
        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Ferramentas de Vibe Coding
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Todas as ferramentas do ecossistema para criar seu SaaS — as mesmas usadas e recomendadas no ebook.
        </p>
      </div>

      {TOOLS.map(group => (
        <div key={group.category} className={`rounded-2xl border p-5 ${group.color}`}>
          <h3 className={`inline-flex text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 ${group.headerColor}`}>
            {group.category}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.items.map(item => (
              <ToolCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      ))}

      <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 pb-4">
        Links externos — cada ferramenta tem seus próprios planos e preços. Verifique antes de contratar.
      </p>
    </div>
  )
}
