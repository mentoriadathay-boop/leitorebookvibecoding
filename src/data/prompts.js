export const PROMPT_CATEGORIES = [
  'Ideação',
  'Planejamento',
  'Desenvolvimento',
  'Design & UI',
  'Backend',
  'SEO & Performance',
  'Vendas & Copy',
  'Marketing',
  'Crescimento',
]

export const prompts = [
  // ── Ideação ──────────────────────────────────────────────────────
  {
    category: 'Ideação',
    title: 'Validar ideia de SaaS',
    desc: 'Analisa se sua ideia tem potencial real de mercado',
    prompt: `Quero criar um SaaS para [descreva seu nicho]. O problema que ele resolve é [descreva o problema]. Meu público-alvo são [descreva o público].

Analise criticamente:
1. Esse problema é real e recorrente o suficiente para virar um produto?
2. Quem já resolve isso hoje? Liste concorrentes diretos e indiretos.
3. Qual seria meu diferencial competitivo?
4. Qual o modelo de monetização mais adequado?
5. Qual o potencial de mercado no Brasil?

Seja honesto, inclusive se a ideia não parecer viável.`,
  },
  {
    category: 'Ideação',
    title: 'Encontrar dores do nicho',
    desc: 'Descobre os maiores problemas de um segmento específico',
    prompt: `Você é especialista em pesquisa de mercado. Quero entender profundamente as dores do segmento de [nicho/setor].

Liste as 10 maiores dores que essas pessoas enfrentam no dia a dia, especialmente:
- Problemas operacionais que consomem tempo
- Processos manuais que poderiam ser automatizados
- Informações difíceis de centralizar ou acessar
- Dificuldades de comunicação ou gestão

Para cada dor, indique: frequência (diária/semanal/mensal), impacto financeiro estimado e se já existe solução satisfatória no mercado.`,
  },
  {
    category: 'Ideação',
    title: 'Analisar concorrentes',
    desc: 'Mapeia o cenário competitivo do seu SaaS',
    prompt: `Faça uma análise competitiva detalhada para um SaaS de [descreva seu produto] voltado para [público-alvo] no mercado brasileiro.

Para cada concorrente relevante, liste:
- Nome e URL
- Pontos fortes
- Pontos fracos
- Faixa de preço
- Público que atende melhor

Ao final, identifique:
1. O gap de mercado que eu posso explorar
2. O ângulo de posicionamento mais diferenciado
3. Funcionalidades que nenhum concorrente oferece bem`,
  },

  // ── Planejamento ─────────────────────────────────────────────────
  {
    category: 'Planejamento',
    title: 'Criar PRD completo',
    desc: 'Gera o documento de requisitos do produto (Product Requirements Document)',
    prompt: `Crie um PRD (Product Requirements Document) completo para o seguinte SaaS:

Nome: [nome do produto]
Problema: [problema que resolve]
Público: [quem vai usar]
Objetivo principal: [resultado que o usuário deve alcançar]

O PRD deve incluir:
1. Visão geral e proposta de valor
2. Personas dos usuários (com dores e objetivos)
3. Funcionalidades do MVP (essencial para lançar)
4. Funcionalidades da versão 2.0
5. Jornada do usuário (do cadastro ao resultado)
6. Requisitos técnicos básicos
7. Métricas de sucesso (KPIs)
8. Riscos e mitigações

Seja específico e prático, como se fosse um documento real para começar a construir hoje.`,
  },
  {
    category: 'Planejamento',
    title: 'Definir MVP realista',
    desc: 'Define o mínimo necessário para lançar e validar',
    prompt: `Tenho a ideia de criar [descreva o SaaS]. Quero lançar em [prazo, ex: 30 dias] sem sócio técnico, usando IA para desenvolver.

Me ajude a definir o MVP mais enxuto possível que ainda entregue valor real para o usuário:

1. Quais são as 3-5 funcionalidades absolutamente essenciais?
2. O que posso deixar para depois sem comprometer a proposta de valor?
3. O que posso fazer manualmente no início antes de automatizar?
4. Qual seria o fluxo mínimo do usuário (do cadastro ao resultado)?
5. Como posso validar se as pessoas pagariam antes de construir?`,
  },
  {
    category: 'Planejamento',
    title: 'Arquitetura e fluxo do sistema',
    desc: 'Desenha como o sistema vai funcionar por dentro',
    prompt: `Preciso planejar a arquitetura do meu SaaS antes de começar a construir. Ele é: [descreva o produto].

Me ajude a mapear:
1. Quais telas/páginas o sistema precisa ter (interface do usuário e do admin)
2. Qual o fluxo principal do usuário passo a passo
3. Quais dados precisam ser armazenados (entidades do banco)
4. Quais integrações externas serão necessárias (pagamento, email, etc.)
5. Qual stack tecnológica você recomenda para construir com IA sem ser desenvolvedor?
6. Quais são os maiores riscos técnicos e como mitigá-los?`,
  },

  // ── Desenvolvimento ───────────────────────────────────────────────
  {
    category: 'Desenvolvimento',
    title: 'Prompt inicial do projeto',
    desc: 'Ponto de partida para criar o projeto no Claude/Cursor/Bolt',
    prompt: `Vou construir um SaaS chamado [nome]. Aqui está o contexto completo:

**O que é:** [descrição em 1-2 frases]
**Problema que resolve:** [problema específico]
**Público-alvo:** [quem vai usar]
**Funcionalidades do MVP:**
- [funcionalidade 1]
- [funcionalidade 2]
- [funcionalidade 3]

**Stack desejada:** React + Tailwind + Supabase + Vercel

**Tela inicial:** Quero começar pela [tela de login / dashboard / tela principal].

Crie a estrutura inicial do projeto com código completo, funcional e pronto para eu continuar desenvolvendo. Use boas práticas, componentes organizados e design clean e moderno.`,
  },
  {
    category: 'Desenvolvimento',
    title: 'Criar nova funcionalidade',
    desc: 'Adiciona uma feature específica ao projeto existente',
    prompt: `No meu projeto [nome do projeto], preciso implementar a seguinte funcionalidade:

**O que precisa fazer:** [descreva a funcionalidade]
**Onde fica na interface:** [tela/seção onde vai aparecer]
**Dados que usa:** [quais informações essa feature precisa]
**Comportamento esperado:** [o que acontece quando o usuário interage]

Escreva o código completo para implementar isso, incluindo:
- Componente React
- Lógica de estado
- Integração com Supabase se necessário
- Estilos com Tailwind

Mantenha consistência com o restante do projeto.`,
  },
  {
    category: 'Desenvolvimento',
    title: 'Debugar erro',
    desc: 'Resolve erros e bugs no código',
    prompt: `Estou com o seguinte erro no meu projeto:

**Mensagem de erro:**
[cole a mensagem de erro aqui]

**O que eu estava tentando fazer:**
[descreva o que você foi fazer quando o erro apareceu]

**Código relevante:**
[cole o trecho de código com problema]

**O que já tentei:**
[o que você já tentou para resolver]

Identifique a causa raiz do problema e me dê a solução completa com o código corrigido.`,
  },
  {
    category: 'Desenvolvimento',
    title: 'Revisar e melhorar código',
    desc: 'Analisa o código e sugere melhorias de qualidade',
    prompt: `Revise este código e me ajude a melhorá-lo:

[cole seu código aqui]

Analise e sugira melhorias em:
1. Performance e eficiência
2. Organização e legibilidade
3. Tratamento de erros
4. Segurança (se aplicável)
5. Boas práticas do React/JavaScript

Reescreva o código com as melhorias aplicadas e explique o que mudou e por quê.`,
  },

  // ── Design & UI ───────────────────────────────────────────────────
  {
    category: 'Design & UI',
    title: 'Criar sistema de design',
    desc: 'Define paleta de cores, tipografia e estilo visual do produto',
    prompt: `Preciso definir o sistema de design do meu SaaS chamado [nome]. Ele é voltado para [público] e transmite [3 adjetivos: ex: profissional, moderno, confiável].

Crie um sistema de design completo com:
1. Paleta de cores (primária, secundária, neutros, feedback)
2. Tipografia (fontes e tamanhos para títulos, corpo, labels)
3. Espaçamentos e bordas padrão
4. Estilo dos componentes principais (botões, inputs, cards, badges)
5. Tom visual geral

Me entregue isso em formato de variáveis CSS ou configuração do Tailwind para implementar diretamente.`,
  },
  {
    category: 'Design & UI',
    title: 'Criar tela completa',
    desc: 'Gera o código de uma tela/página completa',
    prompt: `Crie o código React completo da seguinte tela do meu SaaS:

**Tela:** [nome da tela, ex: Dashboard, Configurações, Relatórios]
**O que o usuário precisa ver:** [liste as informações e ações disponíveis]
**Dados que aparecerão:** [descreva os dados que serão exibidos]
**Ações possíveis:** [o que o usuário pode fazer nessa tela]

Use Tailwind CSS, design moderno e responsivo. A tela deve ser profissional, com boa hierarquia visual e fácil de usar. Inclua estados vazios (empty state) quando fizer sentido.`,
  },

  // ── Backend ───────────────────────────────────────────────────────
  {
    category: 'Backend',
    title: 'Modelar banco de dados',
    desc: 'Cria o schema do banco de dados no Supabase',
    prompt: `Preciso modelar o banco de dados para meu SaaS: [descreva o produto].

As principais entidades são:
- [entidade 1, ex: usuários]
- [entidade 2, ex: projetos]
- [entidade 3]

Crie o SQL completo para o Supabase com:
1. Criação das tabelas com todos os campos necessários
2. Tipos de dados corretos
3. Chaves primárias e estrangeiras
4. Row Level Security (RLS) para proteger os dados
5. Políticas de acesso (cada usuário vê só os seus dados)
6. Índices para queries frequentes

Entregue o SQL pronto para rodar no Supabase SQL Editor.`,
  },
  {
    category: 'Backend',
    title: 'Criar autenticação completa',
    desc: 'Implementa login, cadastro e proteção de rotas',
    prompt: `Preciso implementar autenticação no meu SaaS usando Supabase Auth + React.

Requisitos:
- Login com email e senha
- [opcional: cadastro / apenas admin cria usuários]
- Proteção de rotas (usuário não logado não acessa o sistema)
- Persistência da sessão (não precisa logar toda vez)
- Logout

Crie o código completo incluindo:
1. Hook useAuth para gerenciar o estado de autenticação
2. Componente de Login com formulário
3. Proteção de rotas no App.jsx
4. Integração com Supabase

Use React + Supabase JS v2.`,
  },
  {
    category: 'Backend',
    title: 'Integrar pagamentos com Stripe',
    desc: 'Adiciona cobrança recorrente ao SaaS',
    prompt: `Quero adicionar pagamentos ao meu SaaS usando Stripe. Os planos são:
- [Plano 1]: R$[valor]/mês — inclui [features]
- [Plano 2]: R$[valor]/mês — inclui [features]
- [Plano 3]: R$[valor] único — vitalício

Me explique e crie o código para:
1. Criar os produtos e planos no Stripe
2. Checkout page para o usuário assinar
3. Webhook para atualizar o status do usuário após pagamento
4. Como verificar se o usuário tem acesso ativo
5. Como gerenciar cancelamentos e reembolsos

Stack: React + Supabase + Vercel (para os webhooks).`,
  },

  // ── Vendas & Copy ─────────────────────────────────────────────────
  {
    category: 'Vendas & Copy',
    title: 'Criar headline irresistível',
    desc: 'Gera opções de headline para landing page',
    prompt: `Crie 10 opções de headline para a landing page do meu SaaS:

Produto: [nome]
O que faz: [descrição em 1 frase]
Público: [quem vai comprar]
Principal resultado que entrega: [resultado específico e mensurável]
Principal dor que resolve: [dor mais forte do público]

As headlines devem:
- Falar diretamente com a dor ou o desejo do público
- Ser específicas (números e resultados quando possível)
- Ter variações: voltada à dor, ao resultado, à curiosidade, ao tempo
- Estar em português coloquial, não corporativo

Depois de gerar as 10, indique qual você consideraria mais forte e por quê.`,
  },
  {
    category: 'Vendas & Copy',
    title: 'Escrever landing page completa',
    desc: 'Gera o copy de todas as seções da landing page',
    prompt: `Escreva o copy completo da landing page do meu SaaS:

Produto: [nome]
O que é: [descrição]
Público: [quem é o cliente ideal]
Principal dor: [problema que resolve]
Principal resultado: [o que o cliente conquista]
Planos e preços: [liste os planos]
Depoimentos disponíveis: [liste se tiver, ou diga "ainda não tenho"]

Estrutura que quero:
1. Hero section (headline + subheadline + CTA)
2. Seção de dores (problemas que o cliente enfrenta hoje)
3. Como funciona (3-4 passos simples)
4. Benefícios principais (não features, mas transformações)
5. Prova social / depoimentos
6. Seção de preços
7. FAQ (5 perguntas e respostas)
8. CTA final

Escreva em português coloquial, persuasivo e sem exageros.`,
  },
  {
    category: 'Vendas & Copy',
    title: 'Criar pitch de 30 segundos',
    desc: 'Descreve seu SaaS de forma clara e convincente',
    prompt: `Crie um pitch de 30 segundos para o meu SaaS chamado [nome].

Contexto:
- O que faz: [descrição]
- Para quem: [público]
- Principal resultado: [resultado]
- Preço: [valor]

Crie 3 versões do pitch:
1. Para investidor (foco em mercado e potencial)
2. Para cliente potencial (foco em dor e resultado)
3. Para parceiro (foco em proposta de valor e diferencial)

Cada versão deve ter no máximo 4-5 frases, ser memorável e terminar com uma pergunta ou CTA.`,
  },

  // ── Marketing ─────────────────────────────────────────────────────
  {
    category: 'Marketing',
    title: 'Plano de lançamento',
    desc: 'Estratégia semana a semana para lançar o SaaS',
    prompt: `Crie um plano de lançamento de 4 semanas para o meu SaaS:

Produto: [nome e descrição]
Público: [onde estão e o que consomem]
Canais disponíveis: [Instagram, LinkedIn, YouTube, email, etc.]
Audiência atual: [tamanho e engajamento]
Meta de lançamento: [número de clientes ou receita no primeiro mês]

Para cada semana, detalhe:
- Objetivo da semana
- Conteúdos a publicar (com temas específicos)
- Ações de vendas diretas
- Email marketing se aplicável
- Métricas para acompanhar

Seja específico, com ações concretas, não genéricas.`,
  },
  {
    category: 'Marketing',
    title: 'Criar conteúdo para redes sociais',
    desc: 'Gera posts prontos para Instagram e LinkedIn',
    prompt: `Crie 5 posts para [Instagram / LinkedIn] para divulgar meu SaaS chamado [nome].

Contexto:
- O que é: [descrição]
- Público: [quem segue e quer atingir]
- Tom de voz: [informal/formal, motivacional/educativo]

Para cada post, escreva:
- Gancho (primeira linha que prende atenção)
- Desenvolvimento (2-4 parágrafos)
- CTA (o que quero que a pessoa faça)
- Hashtags relevantes

Varie os formatos: 1 educativo, 1 de prova social, 1 bastidores, 1 de dor/solução, 1 direto de oferta.`,
  },
  {
    category: 'Marketing',
    title: 'Sequência de email de lançamento',
    desc: 'Cria emails automáticos para converter leads em clientes',
    prompt: `Crie uma sequência de 5 emails de lançamento para o meu SaaS [nome]:

Produto: [descrição]
Público: [quem são os leads]
Período de lançamento: [ex: 7 dias]

Email 1 (Dia 1 — Abertura): Anunciar o produto com história e proposta de valor
Email 2 (Dia 2 — Educação): Aprofundar o problema que resolve
Email 3 (Dia 3 — Prova): Mostrar resultados e depoimentos
Email 4 (Dia 5 — Objeções): Responder as principais dúvidas/medos
Email 5 (Dia 7 — Urgência): Último dia / encerramento de oferta

Para cada email: assunto, preview text e corpo completo. Tom: próximo, honesto e sem pressão excessiva.`,
  },

  // ── Crescimento ───────────────────────────────────────────────────
  {
    category: 'Crescimento',
    title: 'Reduzir churn (cancelamentos)',
    desc: 'Estratégias para reter mais clientes',
    prompt: `Meu SaaS [nome] tem taxa de cancelamento de [X%] ao mês. Os principais motivos de cancelamento que identifiquei são: [liste os motivos].

Crie um plano completo para reduzir o churn:
1. Emails de retenção automáticos (quando e o que enviar)
2. Como melhorar o onboarding para os primeiros 7 dias
3. Como identificar clientes em risco antes de cancelarem
4. Estratégia de win-back (recuperar clientes que já saíram)
5. Mudanças de produto que poderiam reduzir o churn

Seja específico com templates de emails e ações concretas.`,
  },
  {
    category: 'Crescimento',
    title: 'Criar programa de indicações',
    desc: 'Transforma clientes em vendedores do seu produto',
    prompt: `Quero criar um programa de indicações para o meu SaaS [nome] onde clientes indicam outros clientes em troca de recompensas.

Me ajude a estruturar:
1. Qual recompensa faz mais sentido para meu produto (desconto, crédito, mês grátis, dinheiro)?
2. Como funcionaria mecanicamente (link exclusivo, código, etc.)?
3. Qual o copy para apresentar o programa aos clientes?
4. Como integrar isso tecnicamente de forma simples?
5. Como medir se o programa está funcionando?

Considere que ainda sou pequeno e quero algo simples de operar.`,
  },
  {
    category: 'Crescimento',
    title: 'Criar FAQ estratégico',
    desc: 'Perguntas frequentes que quebram objeções de compra',
    prompt: `Crie um FAQ estratégico para a landing page do meu SaaS [nome].

Contexto:
- Produto: [descrição]
- Preço: [valor]
- Público: [quem compra]
- Principais objeções que recebo: [liste as objeções mais comuns]

Crie 8-10 perguntas e respostas que:
- Respondam dúvidas reais
- Quebrem objeções de forma natural (sem parecer defesa)
- Aumentem a confiança antes da compra
- Incluam perguntas sobre preço, resultado, suporte e cancelamento

As respostas devem ser diretas, honestas e em tom próximo.`,
  },

  // ── SEO & Performance ─────────────────────────────────────────────
  {
    category: 'SEO & Performance',
    title: 'Prompt SEO Profissional para Vibe Coding',
    desc: 'Cole antes de qualquer projeto: garante Next.js, SEO completo, rastreamento, performance, segurança e acessibilidade',
    prompt: `Crie este projeto com as seguintes especificações técnicas obrigatórias:

TECNOLOGIA E RENDERIZAÇÃO
Utilize Next.js como framework principal para garantir renderização no servidor (SSR) e compatibilidade total com indexação pelo Google e pelas IAs de busca. Não utilize React puro com renderização exclusiva no cliente.

SEO ESTRUTURAL
Implemente meta tags de título e descrição únicas em cada página. Configure Open Graph completo para compartilhamento correto em redes sociais. Gere o arquivo sitemap.xml automaticamente com todas as páginas do projeto. Configure o arquivo robots.txt permitindo a indexação correta pelos mecanismos de busca. Adicione Schema Markup em JSON-LD nas páginas principais para resultados ricos no Google. Garanta que todas as imagens tenham atributo alt descritivo. Utilize tags HTML semânticas corretamente em toda a estrutura, com hierarquia correta de H1, H2 e H3. Configure URLs amigáveis e limpas em todas as páginas.

RASTREAMENTO E CONVERSÃO
Reserve um espaço no cabeçalho de todas as páginas para inserção do pixel do Meta, do Google Tag Manager e do Google Analytics 4. O espaço deve estar identificado com comentários no código indicando exatamente onde cada código deve ser inserido. Quando eu fornecer os IDs, faça a instalação completa e confirme que os eventos estão sendo disparados corretamente.

PERFORMANCE
Otimize todas as imagens com compressão e lazy loading. Minimize os arquivos CSS e JavaScript. Garanta que o site atinja boas métricas no Google PageSpeed Insights, priorizando a velocidade de carregamento tanto em desktop quanto em dispositivos móveis.

SEGURANÇA
Configure o certificado SSL. Adicione os headers de segurança HTTP recomendados, incluindo Content Security Policy, X-Frame-Options e X-Content-Type-Options. Configure as regras de acesso ao banco de dados para que cada usuário acesse apenas os dados que pertencem a ele. Garanta que nenhuma chave de API, senha ou dado sensível fique exposto no código, utilizando variáveis de ambiente para tudo.

ACESSIBILIDADE
Garanta contraste adequado entre texto e fundo. Adicione atributos ARIA onde necessário. Certifique que o site é navegável por teclado.

ANTES DE FINALIZAR
Apresente um checklist confirmando que cada um dos itens acima foi implementado. Aponte qualquer configuração que precise ser feita manualmente por mim após a entrega, como inserção de IDs de pixel, apontamento de domínio ou verificação no Google Search Console, e explique exatamente como fazer cada uma delas.

---
Como usar: cole esse prompt no início de qualquer projeto novo no Claude Code, antes de descrever o site ou a landing page que você quer criar. Depois disso, descreva normalmente o projeto, o objetivo, o público e o design que deseja. O Claude vai usar essas especificações como base obrigatória para tudo que construir.`,
  },
]
