const fs = require('fs');
const data = JSON.parse(fs.readFileSync('extracted_pages.json', 'utf8'));

// Detect if a line is a doubled-char artifact (decorative header from PDF font)
function isDoubledLine(line) {
  const words = line.match(/[A-Za-zÀ-ÿ]{4,}/g) || [];
  if (words.length === 0) return false;
  let doubledCount = 0;
  for (const word of words) {
    let pairs = 0;
    let i = 0;
    while (i < word.length - 1) {
      if (word[i].toLowerCase() === word[i + 1].toLowerCase()) { pairs++; i += 2; }
      else i++;
    }
    if ((pairs * 2) / word.length >= 0.5) doubledCount++;
  }
  return doubledCount / words.length >= 0.5;
}

function clean(text) {
  let t = text;
  // Fix "C " artifacts from PDF font (C before lowercase)
  t = t.replace(/\bC ([a-záéíóúàâêôãõüç])/g, 'C$1');
  t = t.replace(/\bG ([a-záéíóúàâêôãõüçA-Z])/g, 'G$1');
  // Fix spaced numbers: "4 7" → "47", "1 0 0" → "100"
  t = t.replace(/(\d) (\d) (\d) (\d)/g, '$1$2$3$4');
  t = t.replace(/(\d) (\d) (\d)/g, '$1$2$3');
  t = t.replace(/(\d) (\d)/g, '$1$2');
  // Fix "R $ " → "R$"
  t = t.replace(/R \$ /g, 'R$');
  // Fix spaced punctuation
  t = t.replace(/ , /g, ', ');
  t = t.replace(/ \. /g, '. ');
  t = t.replace(/ : /g, ': ');
  t = t.replace(/ ; /g, '; ');
  t = t.replace(/ \? /g, '? ');
  t = t.replace(/ \! /g, '! ');
  t = t.replace(/\( /g, '(');
  t = t.replace(/ \)/g, ')');
  t = t.replace(/ - /g, ' — ');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

function getPageText(pageNum) {
  const page = data.find(p => p.page === pageNum);
  if (!page) return '';
  return page.lines
    .filter(l => l && l.trim() && !/^\d+$/.test(l.trim()) && !isDoubledLine(l))
    .map(clean)
    .join('\n');
}

function pagesToHtml(pageNums) {
  const lines = [];
  pageNums.forEach(pn => {
    const page = data.find(p => p.page === pn);
    if (!page) return;
    const filtered = page.lines
      .filter(l => {
        const t = l.trim();
        if (!t) return false;
        if (/^\d{1,3}$/.test(t)) return false; // standalone page numbers
        if (/^\d{1,3}\s+\d{1,3}$/.test(t)) return false; // spaced page numbers like "1 7"
        if (isDoubledLine(l)) return false;
        return true;
      })
      .map(clean)
      // After clean(), remove leftover standalone numbers from text boundaries
      .map(l => l.replace(/\s+\d{1,3}\s*$/, '').replace(/^\s*\d{1,3}\s+/, '').trim())
      .filter(l => l.length > 0);
    lines.push(...filtered);
  });

  let html = '';
  let para = [];
  let inQuote = false;
  let quoteParts = [];

  for (const line of lines) {
    if (!line.trim()) {
      if (inQuote) { quoteParts.push(line); }
      else if (para.length) { html += `<p>${para.join(' ')}</p>\n`; para = []; }
      continue;
    }
    const startsQuote = line.startsWith('"') || line.startsWith('“');
    const endsQuote = line.endsWith('"') || line.endsWith('”') || line.endsWith('."') || line.endsWith('.”');

    if (!inQuote && startsQuote) {
      if (para.length) { html += `<p>${para.join(' ')}</p>\n`; para = []; }
      inQuote = true;
      quoteParts = [line];
      if (endsQuote && line.length > 5) {
        html += `<blockquote>${quoteParts.join(' ')}</blockquote>\n`;
        inQuote = false; quoteParts = [];
      }
    } else if (inQuote) {
      quoteParts.push(line);
      // Force-close blockquote if it gets too long (column-layout PDF artifact) or closes naturally
      if (endsQuote || quoteParts.length >= 6) {
        html += `<blockquote>${quoteParts.join(' ')}</blockquote>\n`;
        inQuote = false; quoteParts = [];
      }
    } else {
      para.push(line);
    }
  }

  if (inQuote && quoteParts.length) html += `<blockquote>${quoteParts.join(' ')}</blockquote>\n`;
  if (para.length) html += `<p>${para.join(' ')}</p>\n`;

  return html.trim();
}

// Chapter definitions: [id, tag, title, page, readingTime, pageNums[], glossaryTerms[]]
const chapterDefs = [
  [0, 'Introdução', 'Sobre a Autora', 4, 4, [4], ['Vibe Coding', 'SaaS']],
  [1, 'Introdução', 'Minha Paixão com Vibe Coding', 5, 8, [5,6,7,8,9,10,11], ['Vibe Coding', 'SaaS']],
  [2, 'Introdução', 'Da Facilidade à Frustração', 12, 6, [12,13,14,15,16], ['Vibe Coding', 'Deploy', 'Frontend', 'Backend']],
  [3, 'Introdução', 'Erros que Cometi', 17, 4, [17,18,19], ['MVP', 'Deploy']],
  [4, 'Introdução', 'O que é Vibe Coding', 20, 5, [20,21,28,29,30,31], ['Vibe Coding', 'Frontend', 'Backend']],
  [5, 'Introdução', 'O Mercado do Vibe Coding', 22, 8, [22,23,24,25,26,27], ['SaaS', 'Vibe Coding']],
  [6, 'Introdução', 'O que é um SaaS', 32, 6, [32,33,34,35], ['SaaS', 'API', 'Backend', 'Frontend']],
  [7, 'Passo 01', 'Identificar o Problema', 37, 5, [37,38,39], ['SaaS', 'MVP']],
  [8, 'Passo 02', 'Validar a Dor', 40, 4, [40], ['MVP']],
  [9, 'Passo 03', 'Pesquisar o Mercado', 41, 4, [41], ['SaaS', 'MVP']],
  [10, 'Passo 04', 'Brainstorm com IA', 42, 4, [42], ['Vibe Coding', 'PRD']],
  [11, 'Passo 05', 'Arquitetura e Fluxo do App', 43, 5, [43], ['Backend', 'Frontend', 'API']],
  [12, 'Passo 06', 'Planejar a Interface e UX', 44, 4, [44], ['Frontend', 'MVP']],
  [13, 'Passo 07', 'Criar o Protótipo do App', 45, 4, [45], ['MVP', 'Frontend']],
  [14, 'Passo 08', 'Criar e Validar o Prompt e PRD', 46, 6, [46,47,48], ['PRD', 'Vibe Coding']],
  [15, 'Passo 09', 'Escolher a Plataforma', 49, 5, [49,50], ['Vibe Coding', 'Deploy']],
  [16, 'Passo 10', 'Segurança, Banco de Dados e Proteção', 51, 6, [51,52,53,54], ['Supabase', 'Backend', 'API']],
  [17, 'Passo 11', 'Validar, Testar e Lapidar', 55, 4, [55], ['MVP', 'Deploy']],
  [18, 'Passo 12', 'Definir o Modelo de Negócio', 56, 4, [56], ['SaaS']],
  [19, 'Passo 13', 'Criar a Landing Page de Vendas', 57, 4, [57], ['Frontend', 'MVP']],
  [20, 'Passo 14', 'Integrar a Plataforma de Pagamento', 58, 3, [58], ['Webhook', 'SaaS', 'API']],
  [21, 'Passo 15', 'Integrar com Domínio Próprio', 59, 3, [59], ['Deploy']],
  [22, 'Passo 16', 'Criar Treinamento da Plataforma', 60, 3, [60], ['SaaS', 'Frontend']],
  [23, 'Passo 17', 'Criar Programa de Afiliados', 61, 3, [61], ['SaaS', 'Webhook']],
  [24, 'Passo 18', 'Lançar e Começar as Vendas', 62, 4, [62], ['SaaS', 'MVP']],
  [25, 'Passo 19', 'Dicas Práticas de Como Vender', 63, 4, [63], ['SaaS']],
  [26, 'Passo 20', 'Monitorar Métricas, Lapidar e Iterar', 64, 4, [64], ['SaaS', 'API']],
  [27, 'Conclusão', 'Conclusão', 67, 5, [67,68,69], ['Vibe Coding', 'SaaS', 'MVP']],
];

// Keep existing quiz questions (they're good)
const quizMap = {
  0: [
    { question: 'Qual é o foco principal de Thayane com IA?', options: ['Substituir desenvolvedores', 'IA com visão humanizada para negócios reais', 'IA apenas para grandes empresas', 'Programação tradicional'], correctIndex: 1, explanation: 'Thayane defende IA com visão humanizada — tecnologia a serviço de pessoas reais, com problemas reais.' },
    { question: 'Quantos apps Thayane criou antes de escrever este ebook?', options: ['5', '10', 'mais de 30', '100'], correctIndex: 2, explanation: 'Thayane criou mais de 30 apps com soluções diversas para seus negócios e clientes antes de escrever o ebook.' },
  ],
  1: [
    { question: 'Como nasceu o Carrosséis Mágicos?', options: ['De uma encomenda de cliente', 'Da frustração com ferramentas existentes e necessidade do próprio negócio', 'De uma parceria com desenvolvedores', 'De um hackathon'], correctIndex: 1, explanation: 'O Carrosséis Mágicos nasceu da dor real de criar artes em carrossel de forma rápida e com qualidade — e nenhuma ferramenta existente resolvia.' },
    { question: 'O que transformou a relação de Thayane com o Vibe Coding?', options: ['Comprar um plano mais caro', 'Ver uma ideia tomar vida e funcionar', 'Contratar um dev para ajudar', 'Fazer um curso técnico'], correctIndex: 1, explanation: 'Quando a ideia finalmente toma vida e funciona, todo o esforço vale a pena — essa é a paixão pelo Vibe Coding.' },
  ],
  2: [
    { question: 'O que ninguém conta sobre Vibe Coding?', options: ['Que é caro', 'Que soluções complexas exigem processo, não só prompts', 'Que as IAs não funcionam', 'Que precisa saber programar'], correctIndex: 1, explanation: 'Criar soluções complexas não é só colocar 5 linhas na IA. Existe um processo mais profundo por trás disso tudo.' },
    { question: 'O que diferencia um app que as pessoas pagam de um protótipo bonito?', options: ['A tecnologia usada', 'A visão refinada do fluxo, lógica e experiência do usuário', 'O número de telas', 'O custo de desenvolvimento'], correctIndex: 1, explanation: 'O que diferencia quem constrói produtos pagos é a visão refinada de cada detalhe, do fluxo, da lógica e do problema resolvido de verdade.' },
  ],
  3: [
    { question: 'Qual foi o erro mais frequente de Thayane?', options: ['Usar IA ruim', 'Avançar sem ter o fluxo e processo claros', 'Investir pouco', 'Não ter parceiros'], correctIndex: 1, explanation: 'Agir apenas com conhecimento, intenção e intuição — sem processo — gerou bugs, retrabalho e desperdício de créditos.' },
  ],
  4: [
    { question: 'O que é Vibe Coding segundo Andrej Karpathy?', options: ['Programar em equipe', 'Descrever em linguagem natural o que quer construir e a IA escreve o código', 'Usar templates prontos', 'Programar sem testes'], correctIndex: 1, explanation: 'Karpathy criou o conceito: você descreve pela intenção, não pela sintaxe — e a IA faz acontecer.' },
    { question: 'O que realmente importa no Vibe Coding?', options: ['Escolher a ferramenta certa', 'Saber o que você quer e conseguir descrever com clareza', 'Ter formação técnica', 'Ter uma equipe grande'], correctIndex: 1, explanation: 'O que passa a importar é saber o que você quer, conseguir descrever isso com clareza e iterar rápido.' },
    { question: 'O que é "contexto" no Vibe Coding?', options: ['O idioma usado no prompt', 'O conjunto completo de informações que permite à IA entender profundamente o que você precisa', 'O tamanho do prompt', 'O número de mensagens enviadas'], correctIndex: 1, explanation: 'Contexto rico e específico é o segredo: ele inclui o problema, para quem, como deve funcionar e as regras do negócio.' },
  ],
  5: [
    { question: 'Qual o tamanho estimado do mercado de Vibe Coding em 2026?', options: ['US$100 milhões', 'US$4,7 bilhões', 'US$50 bilhões', 'US$200 milhões'], correctIndex: 1, explanation: 'O mercado de Vibe Coding foi estimado em US$4,7 bilhões em 2026, com projeção de US$12,3 bilhões em 2027.' },
    { question: 'Quem são os principais usuários de ferramentas de Vibe Coding?', options: ['Apenas desenvolvedores sêniores', '63% são não-desenvolvedores: empreendedores, consultores, gestores', 'Somente startups de tecnologia', 'Exclusivamente acadêmicos'], correctIndex: 1, explanation: '63% dos usuários dessas ferramentas não são desenvolvedores — são profissionais de diversas áreas transformando expertise em produto.' },
  ],
  6: [
    { question: 'O que diferencia um SaaS de um app comum?', options: ['A tecnologia mais avançada', 'O modelo de negócio com receita recorrente e problema que existe todo mês', 'O design mais bonito', 'A equipe maior'], correctIndex: 1, explanation: 'Um SaaS resolve um problema específico de forma contínua para um público específico, com assinatura recorrente.' },
    { question: 'Qual o potencial de receita de um SaaS com 300 clientes a R$97/mês?', options: ['R$9.700', 'R$29.100', 'R$97.000', 'R$1.000'], correctIndex: 1, explanation: 'Com 300 clientes pagando R$97/mês, o MRR seria R$29.100 — sem equipe grande, escritório ou estoque.' },
    { question: 'O que é fundamental para um SaaS ter assinatura sustentável?', options: ['Muitas funcionalidades', 'O problema que ele resolve existir todo mês, toda semana ou todo dia', 'Design premiado', 'Investimento externo'], correctIndex: 1, explanation: 'SaaS funciona quando o problema que ele resolve é recorrente — se some depois de uma vez, o modelo de assinatura não se sustenta.' },
  ],
  7: [
    { question: 'Por onde deve começar a criação de um SaaS?', options: ['Por um nome de domínio bacana', 'Por uma dor concreta, recorrente, que alguém sente e quer resolver', 'Por escolher a tecnologia', 'Por fazer um logo bonito'], correctIndex: 1, explanation: 'Tudo começa com uma dor real — não com uma ideia de app, uma funcionalidade ou algo que você viu alguém fazer.' },
    { question: 'Como nasceu o Carrosséis Mágicos?', options: ['Por encomenda', 'Da dor de criar carrosséis de qualidade rápido — e nenhuma ferramenta existente resolvia', 'De uma parceria', 'De um hackathon'], correctIndex: 1, explanation: 'O app nasceu de uma dor operacional real do próprio negócio — testou várias ferramentas, nenhuma funcionava como precisava.' },
  ],
  8: [
    { question: 'O que é um grande termômetro de validação segundo o ebook?', options: ['Pesquisas formais de mercado', 'Sua própria dor diante do negócio como cliente ou usuário', 'Análise de concorrentes', 'Opinião de especialistas'], correctIndex: 1, explanation: 'Confie também no seu fílen — sua própria experiência como usuário ou cliente é um termômetro poderoso de validação.' },
    { question: 'Qual é o passo mais pulado por quem está empolgado com uma ideia?', options: ['Criar o protótipo', 'Validar a dor com pessoas reais', 'Escolher a tecnologia', 'Fazer o logo'], correctIndex: 1, explanation: 'A validação com pessoas reais é o passo mais pulado — e é exatamente o que salva tempo, dinheiro e energia.' },
  ],
  9: [
    { question: 'Quando é mais inteligente assinar uma solução existente do que criar?', options: ['Nunca — sempre crie', 'Quando a solução existente é boa o suficiente para o que você precisa', 'Quando é cara', 'Quando tem muitos usuários'], correctIndex: 1, explanation: 'Thayane tomou essa decisão com uma ferramenta de gravação de tela — analisou o mercado e assinar foi a decisão certa.' },
  ],
  10: [
    { question: 'Por que não abrir várias conversas sobre o mesmo projeto com a IA?', options: ['Gasta mais créditos', 'A continuidade do contexto é o que permite que a IA ajude com mais precisão', 'É mais lento', 'A IA fica confusa com múltiplas abas'], correctIndex: 1, explanation: 'Registre tudo em uma única conversa — a continuidade do contexto é fundamental para resultados precisos.' },
  ],
  11: [
    { question: 'Qual erro Thayane cometeu e que você não precisa cometer?', options: ['Usar a IA errada', 'Começar a construir sem ter o fluxo claro', 'Não fazer protótipo', 'Cobrar muito barato'], correctIndex: 1, explanation: 'Começar sem o fluxo claro resulta em um app que funciona em partes mas não funciona como um todo.' },
  ],
  12: [
    { question: 'Quais dois tipos de interface precisam ser planejados desde o início?', options: ['Mobile e desktop', 'A do usuário e a do administrador', 'A gratuita e a paga', 'A de login e a de cadastro'], correctIndex: 1, explanation: 'Você vai ter dois tipos de interface para planejar: a do usuário e a do administrador — as duas desde o início.' },
  ],
  13: [
    { question: 'Por que não avançar sem aprovar o protótipo?', options: ['Por questões de direito autoral', 'Cada ajuste feito no protótipo economiza horas de retrabalho no desenvolvimento', 'Para ter um portfólio', 'Para mostrar para investidores'], correctIndex: 1, explanation: 'Lapide no protótipo o quanto for necessário — cada ajuste aqui economiza horas de retrabalho no desenvolvimento real.' },
  ],
  14: [
    { question: 'O que é um PRD?', options: ['Um plano de marketing', 'O documento que descreve tudo que o app precisa ser, fazer e entregar', 'Um contrato com clientes', 'Um relatório financeiro'], correctIndex: 1, explanation: 'PRD é o Product Requirements Document — descreve tudo antes de qualquer linha de código ser gerada.' },
    { question: 'Como criar o PRD do seu app?', options: ['Contratar um consultor técnico', 'Em uma conversa com o Claude, descrevendo o produto e pedindo para estruturar', 'Usando planilhas', 'Com equipe de desenvolvimento'], correctIndex: 1, explanation: 'Você pode criar o PRD do seu app em uma conversa com o Claude — esse documento se torna o prompt mestre do desenvolvimento.' },
  ],
  15: [
    { question: 'Qual critério é fundamental ao escolher uma plataforma de Vibe Coding?', options: ['O mais popular nas redes sociais', 'Capacidade técnica, estabilidade e controle sobre o código', 'O mais barato', 'O que mais tem usuários'], correctIndex: 1, explanation: 'A escolha deve considerar capacidade técnica, qualidade da interface entregue, facilidade de manutenção e controle sobre o código.' },
  ],
  16: [
    { question: 'Por que chaves de API nunca devem estar no código visível?', options: ['Por questões de performance', 'Porque qualquer pessoa pode ver e abusar, gerando custos e riscos', 'Por limitação técnica', 'Para economizar memória'], correctIndex: 1, explanation: 'Chaves e credenciais expostas no código frontend são visíveis a qualquer pessoa — use sempre variáveis de ambiente.' },
    { question: 'O que protege legalmente seu produto de cópias?', options: ['Segredo total', 'Registro do nome no INPI e termos de uso bem estruturados', 'Código complexo', 'Muitos usuários'], correctIndex: 1, explanation: 'O registro no INPI dá respaldo legal para proteger a marca, e termos de uso especificam o que é permitido.' },
  ],
  17: [
    { question: 'Como fazer correções de forma eficiente com a IA?', options: ['Pedir tudo de uma vez', 'Ser muito específico, descrevendo exatamente o erro e o comportamento correto esperado', 'Reescrever o app inteiro', 'Trocar de plataforma'], correctIndex: 1, explanation: 'Ao pedir correção, seja muito específico: descreva exatamente o que está errado, onde acontece e qual deveria ser o comportamento correto.' },
  ],
  18: [
    { question: 'Qual modelo de monetização gera caixa rápido mas elimina recorrência?', options: ['Assinatura mensal', 'Freemium', 'Acesso vitalício', 'Por assento'], correctIndex: 2, explanation: 'O acesso vitalício gera caixa rápido no lançamento, mas elimina a recorrência — deve ser usado com cautela e em momentos estratégicos.' },
  ],
  19: [
    { question: 'O que deve ser o foco da headline da landing page?', options: ['As tecnologias usadas', 'A dor do público, não o app em si', 'Os fundadores da empresa', 'O número de funcionalidades'], correctIndex: 1, explanation: 'A headline deve falar diretamente com a dor do público — não fale do app, fale do problema que ele resolve.' },
  ],
  20: [
    { question: 'O que é o webhook na integração de pagamentos?', options: ['Um formulário de pagamento', 'O mecanismo que comunica ao app quando um pagamento é confirmado, cancelado ou vencido', 'Um relatório de vendas', 'Uma chave de API'], correctIndex: 1, explanation: 'O webhook transforma o app num negócio autônomo — ele libera ou bloqueia o acesso automaticamente conforme o status do pagamento.' },
  ],
  21: [
    { question: 'Qual a estrutura recomendada de domínios para um SaaS?', options: ['Um único domínio para tudo', 'Landing page no domínio principal + app no subdomínio (app.seusite.com)', 'Subdomínio para a landing page', 'Domínios completamente diferentes'], correctIndex: 1, explanation: 'Landing page em www.seuproduto.com e app em app.seuproduto.com — mantém organização e evita conflitos de configuração.' },
  ],
  22: [
    { question: 'Por que criar treinamento da plataforma?', options: ['Por obrigação legal', 'Quem aprende a usar bem usa mais, percebe mais valor e não cancela', 'Para ter conteúdo nas redes sociais', 'Para reduzir suporte apenas'], correctIndex: 1, explanation: 'Treinamento investe em retenção: quem usa mais percebe mais valor, não cancela e ainda indica.' },
  ],
  23: [
    { question: 'Quando estruturar o programa de afiliados?', options: ['Depois de ter 1000 usuários', 'Desde o início, não depois que o produto já estiver no ar', 'Apenas após o breakeven', 'Quando surgir demanda espontânea'], correctIndex: 1, explanation: 'O programa de afiliados é uma das principais alavancas de crescimento — deve ser estruturado desde o início.' },
  ],
  24: [
    { question: 'O que fazer para conseguir os primeiros usuários?', options: ['Esperar o algoritmo trabalhar', 'Buscar ativamente, falando diretamente com pessoas que têm o perfil ideal', 'Investir alto em tráfego pago desde o início', 'Esperar o produto estar perfeito'], correctIndex: 1, explanation: 'Busque os primeiros usuários ativamente — não espere o algoritmo trabalhar por você no início.' },
  ],
  25: [
    { question: 'Qual estratégia de venda converte mais segundo o ebook?', options: ['Anúncios pagos genéricos', 'Alguém usar o produto, ter resultado real e contar para outra pessoa', 'E-mail marketing em massa', 'Influenciadores com milhões de seguidores'], correctIndex: 1, explanation: 'A venda mais poderosa acontece quando alguém usa, tem resultado real e conta para outra pessoa — foco na experiência dos primeiros usuários.' },
  ],
  26: [
    { question: 'Como lapidar um SaaS de forma inteligente?', options: ['Implementar todas as melhorias de uma vez', 'Fazer alterações em lotes pequenos, testar e comunicar novidades aos usuários', 'Redesenhar o app a cada mês', 'Só mudar quando os usuários reclamam'], correctIndex: 1, explanation: 'Alterações em lotes pequenos, testadas antes de avançar, com comunicação das novidades — cada melhoria é motivo para continuar pagando.' },
  ],
  27: [
    { question: 'O que diferencia soluções que as pessoas pagam mês após mês?', options: ['Tecnologia avançada', 'Maturidade profissional, visão estratégica e empatia profunda com o problema do usuário', 'Mais funcionalidades', 'Preço mais baixo'], correctIndex: 1, explanation: 'Soluções com complexidade real exigem o que nenhuma IA entrega: maturidade profissional, visão estratégica e empatia com o usuário.' },
    { question: 'Qual é o ativo mais valioso de um especialista de nicho no Vibe Coding?', options: ['Habilidade técnica de codificar', 'O conhecimento profundo de uma dor real do nicho', 'A rede de contatos', 'O capital de investimento'], correctIndex: 1, explanation: 'Quem tem 10, 20 ou 30 anos de experiência em um nicho carrega um ativo que nenhum desenvolvedor generalista consegue replicar.' },
  ],
};

let output = `export const chapters = [\n`;

for (const [id, tag, title, page, readingTime, pageNums, glossaryTerms] of chapterDefs) {
  const content = pagesToHtml(pageNums);
  const quiz = quizMap[id] || [];
  const contentEscaped = content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');

  output += `  {\n`;
  output += `    id: ${id},\n`;
  output += `    tag: ${JSON.stringify(tag)},\n`;
  output += `    title: ${JSON.stringify(title)},\n`;
  output += `    page: ${page},\n`;
  output += `    readingTime: ${readingTime},\n`;
  output += `    glossaryTerms: ${JSON.stringify(glossaryTerms)},\n`;
  output += `    content: \`${contentEscaped}\`,\n`;
  output += `    quizQuestions: ${JSON.stringify(quiz, null, 6)},\n`;
  output += `  },\n`;
}

output += `]\n\n`;
output += `export const chapterGroups = [\n`;
output += `  { label: 'Introdução', chapters: [0, 1, 2, 3, 4, 5, 6] },\n`;
output += `  { label: 'Os 20 Passos', chapters: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27] },\n`;
output += `]\n`;

fs.writeFileSync('../vibe-coding-ebook/src/data/chapters.js', output, 'utf8');
console.log('chapters.js generated successfully!');
