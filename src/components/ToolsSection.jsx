import { ExternalLink, TrendingUp, AlertTriangle, Star } from 'lucide-react'

const TOOLS = [
  {
    category: 'Inteligência Artificial',
    color: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/40',
    headerColor: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
    items: [
      {
        name: 'Claude',
        emoji: '🤖',
        desc: 'A IA que a Thayane usa para desenvolver SaaS do zero. Melhor para raciocínio, código complexo e contextos longos. Supera o GPT-4o em tarefas de engenharia e análise de negócios.',
        tag: 'Recomendada no ebook',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://claude.ai',
        badge: 'top',
      },
      {
        name: 'Claude Code',
        emoji: '💻',
        desc: 'CLI oficial da Anthropic que roda no terminal e executa tarefas de desenvolvimento de forma autônoma. Cresceu 6x em 6 meses (abr/2025 → jan/2026) — 18% de adoção entre devs. Melhor que Cursor para automação de ponta a ponta.',
        tag: 'Mencionado no ebook',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://claude.ai/code',
        badge: 'top',
      },
      {
        name: 'Cursor',
        emoji: '⚡',
        desc: 'Editor favorito dos desenvolvedores vibe coders. Indexa o repositório local com alta precisão (92%), multi-file editing com o Composer, 8 agentes paralelos. Melhor flow state do mercado. Mais caro que concorrentes ($20-200/mês).',
        tag: 'Mencionado no ebook',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://cursor.com',
        badge: 'top',
      },
      {
        name: 'Windsurf',
        emoji: '🏄',
        desc: 'Alternativa ao Cursor com "Cascade" — sistema que executa comandos no terminal e corrige erros automaticamente, sem lag. 90% de precisão. Plano gratuito mais generoso que Cursor. Pior: ecossistema menor e mais novo.',
        tag: 'Alternativa ao Cursor',
        tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        url: 'https://windsurf.com',
      },
      {
        name: 'GitHub Copilot',
        emoji: '🐙',
        desc: 'Maior adoção corporativa (29% das empresas). Integrado nativamente ao VS Code. Copilot Workspace (mai/2025) atribui issues do GitHub direto para IA. Pior que Cursor em contexto local e raciocínio complexo. Melhor para times grandes.',
        tag: 'Corporativo',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://github.com/features/copilot',
      },
      {
        name: 'Codeium',
        emoji: '🆓',
        desc: 'Tier gratuito ilimitado, 1000+ integrações, resposta mais rápida (30ms vs 45ms do Cursor). Menor precisão (85%) e contexto mais fraco. Ótimo para quem está começando e quer testar sem pagar.',
        tag: 'Gratuito',
        tagColor: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        url: 'https://codeium.com',
      },
      {
        name: 'ChatGPT',
        emoji: '💬',
        desc: 'IA da OpenAI. Boa para brainstorming, copywriting e tarefas mais simples. GPT-4o tem raciocínio competitivo, mas perde para Claude em tarefas de engenharia complexa. Plano Pro tem acesso prioritário.',
        tag: 'Alternativa',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://chatgpt.com',
      },
      {
        name: 'Gemini',
        emoji: '✨',
        desc: 'IA do Google. Contexto de 1M de tokens — melhor do mercado para analisar bases de código grandes. Gratuito com limites generosos. Integra bem com Google Workspace. Raciocínio ainda atrás de Claude em engenharia.',
        tag: 'Contexto longo',
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
        name: 'Lovable',
        emoji: '💜',
        desc: 'Melhor para quem quer subir um SaaS completo sem código. Full-stack real: auth, banco, pagamentos. Testado: entregou app funcional do zero enquanto Bolt falhou no mesmo prompt. Saltou para o top 3 do mercado em 2026. Créditos de mensagens podem ser escassos para projetos pesados.',
        tag: 'Mencionado no ebook',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://lovable.dev',
        badge: 'top',
      },
      {
        name: 'Bolt.new',
        emoji: '⚡',
        desc: 'Criação de apps full-stack no navegador. Bom para prototipar UI rapidamente. Pior que Lovable e v0 em testes diretos (2025) — apps complexos não ficaram 100% funcionais. Melhor para iteração visual rápida e validações.',
        tag: 'Prototipagem',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://bolt.new',
      },
      {
        name: 'v0.dev',
        emoji: '🎨',
        desc: 'Gerador de UI da Vercel. A melhor qualidade visual do mercado — componentes React/Tailwind impecáveis a partir de texto ou imagem. Fraqueza: quase zero de backend. Não faz auth, banco ou lógica de negócio. Use junto com Supabase.',
        tag: 'UI/Frontend',
        tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        url: 'https://v0.dev',
        badge: 'top',
      },
      {
        name: 'Replit',
        emoji: '🔁',
        desc: 'Ambiente completo: código, banco, auth e hospedagem em um só lugar. Replit Agent 3 cria apps web completos a partir de linguagem natural. Melhor para educação e times. Curva de aprendizado maior que Lovable/Bolt. Mais lock-in no ecossistema.',
        tag: 'Mencionado no ebook',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://replit.com',
      },
      {
        name: 'Framer',
        emoji: '🖼️',
        desc: 'Do design ao site publicado sem sair da plataforma. CMS integrado, animações sem código, responsivo por padrão. Cresceu como alternativa ao Figma após o aumento de preços de 33% em 2025. Fraco em apps com lógica de negócio complexa.',
        tag: 'Sites & Landing Pages',
        tagColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
        url: 'https://framer.com',
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
        desc: 'Stack completo: PostgreSQL, auth, storage, realtime e edge functions. Padrão do mercado indie hacker. Open source com mínimo lock-in. 500 MB de banco gratuito. Melhor quando você precisa de tudo junto.',
        tag: 'Usado nesta plataforma',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://supabase.com',
        badge: 'top',
      },
      {
        name: 'Neon',
        emoji: '🔆',
        desc: 'PostgreSQL serverless com scale-to-zero. Após atualização de preços em ago/2025 ($5+/mês), virou a escolha recomendada para apps Next.js em 2026. Database branching (igual ao git) é diferencial único. 3 projetos gratuitos com 10 GB.',
        tag: 'Recomendado Next.js',
        tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        url: 'https://neon.tech',
        badge: 'rising',
      },
      {
        name: 'Turso',
        emoji: '⚡',
        desc: 'SQLite na borda (edge). Bancos ilimitados, 8 GB/mês gratuito, replicação multi-região. Ideal para apps leves, read-heavy ou mobile sync. Pior: não substitui Postgres para dados relacionais complexos ou alta concorrência de escrita.',
        tag: 'Edge / Leve',
        tagColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        url: 'https://turso.tech',
        badge: 'rising',
      },
      {
        name: 'Firebase',
        emoji: '🔥',
        desc: 'Backend do Google. Realtime sync nativo, excelente para mobile. Problema: lock-in severo, preço imprevisível em escala e não é mais o padrão para apps web em 2025 — a comunidade migrou para Supabase.',
        tag: 'Mobile / Realtime',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://firebase.google.com',
      },
      {
        name: 'PlanetScale',
        emoji: '🪐',
        desc: 'MySQL serverless altamente escalável (base Vitess). Removeu o plano gratuito em 2024, perdendo muito do mercado indie hacker. Ainda é referência para performance extrema em MySQL. Melhor para grandes empresas.',
        tag: 'Empresarial',
        tagColor: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        url: 'https://planetscale.com',
        badge: 'alert',
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
        desc: 'Criadora do Next.js. Melhor DX para frontend e SSR. Deploy automático a cada push. $200M ARR em 2025. Fraqueza: muito ruim para backend (Rails, Django, APIs pesadas) e caro em escala. Use para front, não para back.',
        tag: 'Usado nesta plataforma',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://vercel.com',
      },
      {
        name: 'Railway',
        emoji: '🚂',
        desc: 'Experiência de deploy mais rápida do mercado para backend. Captou $100M em jan/2026. Pricing por uso (sem surpresas), flexível. Melhor que Vercel para APIs e servidores. Fraqueza: transparência de custo em escala alta.',
        tag: 'Backend',
        tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
        url: 'https://railway.app',
        badge: 'top',
      },
      {
        name: 'Fly.io',
        emoji: '✈️',
        desc: 'Melhor custo-benefício para apps em produção. 30+ regiões globais, controle total de infraestrutura, mais barato que Vercel. Mais difícil de configurar que Railway. Ideal para quem já validou e quer escalar com custo controlado.',
        tag: 'Produção / Escala',
        tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        url: 'https://fly.io',
        badge: 'rising',
      },
      {
        name: 'Render',
        emoji: '🌐',
        desc: 'Custo mensal previsível, deploy simples, site estático gratuito. Mais lento no deploy que Railway, mas mais barato para projetos com tráfego constante. Boa opção para quem quer previsibilidade de custo sem surpresas.',
        tag: 'Custo previsível',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://render.com',
      },
      {
        name: 'Netlify',
        emoji: '🟢',
        desc: 'Pioneiro no JAMstack. Bom para sites estáticos e front-end. Plano gratuito generoso. Perdeu protagonismo para Vercel em apps React/Next. Boa opção para sites de conteúdo, landing pages e projetos simples.',
        tag: 'Sites estáticos',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://netlify.com',
      },
    ],
  },
  {
    category: 'Pagamentos & Vendas',
    color: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/40',
    headerColor: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    items: [
      {
        name: 'Stripe',
        emoji: '💳',
        desc: 'Padrão global de pagamentos para SaaS. API robusta, planos recorrentes, trials e upgrades nativos. 3,99% + R$0,39 (2025). Melhor para SaaS internacional. Fraqueza no Brasil: sem PIX nativo ainda, integração com Mercado Pago separada.',
        tag: 'Mencionado no ebook',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://stripe.com',
      },
      {
        name: 'LemonSqueezy',
        emoji: '🍋',
        desc: 'Favorito dos indie hackers globais. 21 métodos de pagamento, checkout moderno, 5% + 50¢ (mais barato que Stripe). Adquirido pela Stripe em abr/2024. Fraqueza: sem Mercado Pago ainda — principal pedido da comunidade brasileira.',
        tag: 'Indie Hackers',
        tagColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        url: 'https://lemonsqueezy.com',
        badge: 'top',
      },
      {
        name: 'Kiwify',
        emoji: '🥝',
        desc: 'Estrela em ascensão no Brasil. Menor taxa do mercado nacional (7,9%), checkout com melhor conversão que Hotmart, interface mais limpa. Crescendo aceleradamente e comendo market share da Hotmart em 2025-2026.',
        tag: 'Melhor taxa Brasil',
        tagColor: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        url: 'https://kiwify.com.br',
        badge: 'rising',
      },
      {
        name: 'Hotmart',
        emoji: '🔥',
        desc: 'Plataforma brasileira mais conhecida de produtos digitais. 9,9% + R$1. Aumentou taxa de parcelamento de 2,89% para 3,49% em 2025, gerando insatisfação. Perdendo terreno para Kiwify. Ainda tem o maior ecossistema de afiliados do Brasil.',
        tag: 'Mencionado no ebook',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://hotmart.com',
        badge: 'alert',
      },
      {
        name: 'Mercado Pago',
        emoji: '💙',
        desc: 'PIX nativo, boleto e cartão parcelado. Ecossistema brasileiro completo. 3,49% + R$0,99 por transação. Indispensável se seu público é brasileiro e você quer oferecer PIX. Pior: DX da API menos refinada que Stripe.',
        tag: 'PIX / Brasil',
        tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        url: 'https://mercadopago.com.br',
      },
      {
        name: 'Pagar.me',
        emoji: '🇧🇷',
        desc: 'Gateway brasileiro da Stone. PIX, boleto, cartão com suporte a split de pagamento. Boa opção para marketplaces e SaaS com múltiplos vendedores. Documentação em PT-BR. Suporte nacional focado.',
        tag: 'Marketplace / Split',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://pagar.me',
      },
    ],
  },
  {
    category: 'Automação & Integração',
    color: 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/40',
    headerColor: 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
    items: [
      {
        name: 'n8n',
        emoji: '🔗',
        desc: 'Automação open source auto-hospedável com 70 nós LangChain — o melhor para workflows com IA. 40-50% mais barato que Zapier em escala. Pode orquestrar múltiplos modelos de IA. Pior: curva de aprendizado maior e comunidade menor.',
        tag: 'IA-nativo',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://n8n.io',
        badge: 'top',
      },
      {
        name: 'Make',
        emoji: '⚙️',
        desc: 'Meio-termo entre n8n e Zapier. Interface visual excelente, 1000+ integrações. Bom para receber webhook da Hotmart e criar usuário no Supabase. Melhor que Zapier em preço, pior que n8n em IA e controle.',
        tag: 'Mencionado no ebook',
        tagColor: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400',
        url: 'https://make.com',
      },
      {
        name: 'Zapier',
        emoji: '⚡',
        desc: 'O mais fácil de usar com 8000+ integrações. Padrão para usuários de negócio. Muito mais caro que n8n em escala (cobra por tarefa). Sem capacidades IA nativas relevantes. Melhor quando simplicidade importa mais que custo.',
        tag: 'Mais apps integrados',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://zapier.com',
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
        desc: 'Padrão da indústria para design de UI. Figma AI (2025) gera protótipos e interfaces por texto. Figma Sites é o novo no-code builder. Problema: aumentou preços em 33% em jan/2025 com bundling forçado, gerando migração para Framer.',
        tag: 'Padrão do mercado',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://figma.com',
        badge: 'alert',
      },
      {
        name: 'Framer',
        emoji: '🖼️',
        desc: 'Do design ao site publicado numa só plataforma. CMS integrado, animações sem código, responsivo. Cresceu como alternativa direta ao Figma após alta de preços 2025. Melhor que Figma para criar e publicar sites de produto.',
        tag: 'Alternativa ao Figma',
        tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
        url: 'https://framer.com',
        badge: 'rising',
      },
      {
        name: 'v0.dev',
        emoji: '✦',
        desc: 'Gera componentes React/Tailwind da Vercel a partir de texto ou imagem. Melhor qualidade visual do mercado para geração de UI. Complementa Figma/Framer com code output direto. Sem backend — use junto com Supabase.',
        tag: 'Geração de UI',
        tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        url: 'https://v0.dev',
      },
      {
        name: 'Canva',
        emoji: '✏️',
        desc: 'Design visual sem habilidade técnica. Ótimo para landing pages, posts, materiais de marketing e apresentações. Não substitui Figma para UI/UX complexo, mas é imbatível para marketing content.',
        tag: 'Marketing Visual',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://canva.com',
      },
      {
        name: 'Whimsical',
        emoji: '🗺️',
        desc: 'Fluxogramas e mapas de fluxo de usuário rápidos. Essencial para planejar a arquitetura do app antes de construir. Mais simples que Figma para diagramas. Use antes de entrar em qualquer plataforma de vibe coding.',
        tag: 'Fluxo & Planejamento',
        tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        url: 'https://whimsical.com',
      },
    ],
  },
]

const badgeConfig = {
  top:     { label: '⭐ Top 2025',      className: 'bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/40 dark:text-green-400' },
  rising:  { label: '📈 Em alta',       className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  alert:   { label: '⚠️ Atenção',       className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
}

function ToolCard({ item }) {
  const badge = item.badge ? badgeConfig[item.badge] : null
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
      <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
        <span className={`self-start text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.tagColor}`}>
          {item.tag}
        </span>
        {badge && (
          <span className={`self-start text-[10px] px-2 py-0.5 rounded-full font-semibold ${badge.className}`}>
            {badge.label}
          </span>
        )}
      </div>
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
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Ecossistema completo para criar seu SaaS — com avaliação comparativa baseada em feedback real do mercado em 2025-2026.
        </p>
        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="flex items-center gap-1 bg-[#E8F5EE] dark:bg-[#0F4A28]/30 text-[#1B6B3A] dark:text-green-400 px-2.5 py-1 rounded-full font-semibold">⭐ Top 2025 — destaque do mercado</span>
          <span className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-semibold">📈 Em alta — crescendo rápido</span>
          <span className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2.5 py-1 rounded-full font-semibold">⚠️ Atenção — mudança recente</span>
        </div>
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
        Avaliações baseadas em testes e feedback da comunidade de devs em 2025-2026 · Links externos · Preços podem mudar
      </p>
    </div>
  )
}
