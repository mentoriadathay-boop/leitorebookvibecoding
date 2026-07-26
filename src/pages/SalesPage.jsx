import { useState, useEffect } from 'react'
import {
  Sparkles, ArrowRight, CheckCircle2, Lightbulb, Cpu, Map, Calculator, Wrench, Zap,
  FlaskConical, Rocket, MessageSquare, GraduationCap, ShieldCheck, Star, ChevronDown,
  Target, Compass, TrendingUp,
} from 'lucide-react'
import SignupForm from '../components/SignupForm'

// ── Paleta enxuta (só o essencial) ─────────────────────────────────────────
const C = {
  magic: '#5B2A6E', magicDark: '#3E1B4D',
  blossom: '#C2298A',
  gold: '#F5B942', goldSoft: '#FFD966',
  sand: '#F7F6F3',            // Areia Clara — fundo padrão
  lilac: '#F7EEFB',           // Lilás Alva — fundo alternativo
  lilacBaby: '#F2E4FA',       // Lilás Bebê — cards de destaque
  lavender: '#EDE7F6',        // Lavanda Suave — painéis
  ink: '#2E1338', inkMuted: '#7A6584',
}
const gradientMagic = `linear-gradient(135deg, ${C.magic} 0%, ${C.blossom} 60%, ${C.gold} 100%)`

// Contorno padrão pros cards da landing — Roxo Magia com baixa opacidade.
const cardBorder = `1px solid ${C.magic}22`

// ── Dados ──────────────────────────────────────────────────────────────────
const MODULES = [
  { icon: GraduationCap, title: 'Estudos Vibe', desc: 'Ebooks, audiobooks, newsletters e vídeos curados sobre IA e vibe coding.' },
  { icon: Lightbulb,     title: 'Minhas Ideias', desc: 'Guarde todas as suas ideias de SaaS num só lugar — organizadas e prontas pra evoluir.' },
  { icon: Cpu,           title: 'Gerador de Ideias', desc: 'A IA cria 3 ideias de SaaS personalizadas para seu nicho, dor e público.' },
  { icon: Map,           title: 'Jornada SaaS', desc: '5 ferramentas de IA que se conectam: valida nicho, define MVP, cria roadmap, gera landing e diagnostica monetização.' },
  { icon: Calculator,    title: 'Calculadora', desc: 'Projete MRR, ARR e crescimento do seu SaaS em 12 meses com dados reais.' },
  { icon: Wrench,        title: 'Ferramentas Vibe', desc: 'Curadoria das melhores ferramentas de IA para vibe coding, com prós e contras de cada uma.' },
  { icon: Zap,           title: 'Prompts', desc: 'Biblioteca de prompts prontos para criar landing pages, backends, marketing e mais.' },
  { icon: FlaskConical,  title: 'Laboratório Vibe', desc: 'Registre seus experimentos com IA (acertos e erros). A IA analisa e devolve lições acionáveis.' },
  { icon: Rocket,        title: 'Plataformas SaaS TFA', desc: 'Conheça as plataformas que criamos e participe do programa de afiliados com 40% de comissão recorrente.' },
  { icon: MessageSquare, title: 'Suporte IA', desc: 'Tire dúvidas com a IA a qualquer momento — como se tivesse um mentor 24/7.' },
]

const STEPS = [
  { n: '1', title: 'Crie sua conta grátis', desc: 'Cadastro rápido, sem cartão. Confirma o e-mail e já está dentro.' },
  { n: '2', title: 'Escolha seu caminho', desc: 'Da ideia à monetização — cada módulo puxa dados do anterior pra você não recomeçar do zero.' },
  { n: '3', title: 'Crie seu SaaS ou Soluções para o seu Negócio', desc: 'Use os prompts, a Jornada SaaS e as Plataformas TFA como trampolim pra sair do papel.' },
]

const BONUSES = [
  'Jornada SaaS completa (5 ferramentas de IA conectadas)',
  'Biblioteca completa de prompts prontos para vibe coding',
  'Newsletters exclusivas com bastidores e novidades semanais',
  'Acesso ao programa de afiliados TFA (40% de comissão recorrente)',
  'Ebooks, audiobooks e vídeos atualizados constantemente',
  'Suporte com IA 24/7 dentro da plataforma',
]

const FAQ = [
  { q: 'A plataforma é realmente gratuita?', a: 'Sim — a maioria dos conteúdos são gratuitos e algumas funções são exclusivas para membros.' },
  { q: 'Preciso saber programar pra usar?', a: 'Não. O Hub Vibe Coding foi desenhado pra quem quer criar SaaS com IA (vibe coding) — mesmo sem experiência prévia com código. A gente te guia com prompts, jornadas e ferramentas visuais.' },
  { q: 'Vou receber acesso na hora?', a: 'Sim. Após confirmar seu e-mail pelo link que te enviamos, o acesso é liberado imediatamente.' },
  { q: 'Que tipo de SaaS posso criar?', a: 'Qualquer produto digital com receita recorrente — desde ferramentas simples pra nichos específicos até plataformas mais complexas. O foco é te ajudar a validar, construir e monetizar.' },
  { q: 'Consigo cancelar depois?', a: 'A qualquer momento. Sem multa, sem burocracia. E como o acesso inicial é gratuito, você só decide continuar depois de já conhecer tudo por dentro.' },
  { q: 'Como funciona o suporte?', a: 'Você tem uma IA dedicada dentro da plataforma pra tirar dúvidas 24/7, além do canal de suporte via WhatsApp com nossa equipe.' },
]

const NAV_SECTIONS = [
  { id: 'modulos',    label: 'Recursos' },
  { id: 'como',       label: 'Como funciona' },
  { id: 'sobre',      label: 'Sobre' },
  { id: 'oferta',     label: 'Oferta' },
  { id: 'faq',        label: 'FAQ' },
]

// ── Componentes ─────────────────────────────────────────────────────────────

function Section({ bg, children, className = '', id }) {
  return (
    <section id={id} style={{ backgroundColor: bg }} className={`py-16 md:py-20 px-4 scroll-mt-24 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  )
}

function Btn({ children, onClick, variant = 'primary', size = 'md' }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all'
  const sizes = { md: 'px-6 py-3 text-sm', lg: 'px-8 py-4 text-base' }
  const styles = {
    primary: { background: '#FFFFFF', color: C.magicDark },
    magic:   { background: gradientMagic, color: '#FFFFFF' },
    outline: { background: 'transparent', color: '#FFFFFF', border: `2px solid #FFFFFF` },
  }
  return (
    <button onClick={onClick} className={`${base} ${sizes[size]} hover:opacity-90 hover:scale-[1.02]`} style={styles[variant]}>
      {children}
    </button>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: cardBorder, backgroundColor: '#FFFFFF' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between text-left px-5 py-4 hover:opacity-90 transition-opacity">
        <span className="font-semibold text-sm md:text-base" style={{ color: C.ink }}>{q}</span>
        <ChevronDown size={18} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: C.magic }} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: C.inkMuted }}>{a}</div>
      )}
    </div>
  )
}

export default function SalesPage() {
  const [signup, setSignup] = useState(false)
  const [showSubnav, setShowSubnav] = useState(false)
  const openSignup = () => setSignup(true)

  // Só mostra o menu de âncoras depois de sair do hero — evita competição visual.
  useEffect(() => {
    const onScroll = () => setShowSubnav(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="font-dm" style={{ backgroundColor: C.sand, color: C.ink }}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur-md" style={{ backgroundColor: `${C.sand}ee`, borderBottom: `1px solid ${C.lavender}` }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-playfair font-bold text-sm" style={{ background: gradientMagic }}>T</div>
            <div className="hidden sm:block">
              <div className="font-playfair font-bold text-sm leading-tight" style={{ color: C.ink }}>Hub Vibe Coding</div>
              <div className="text-[10px] leading-tight" style={{ color: C.inkMuted }}>TFA Soluções com IA</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="hidden sm:inline-block text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity" style={{ color: C.magic }}>
              Já tenho conta
            </a>
            <button onClick={openSignup}
              className="text-xs font-semibold px-4 py-2 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ background: gradientMagic }}>
              Criar conta grátis
            </button>
          </div>
        </div>
        {/* Sub-nav de âncoras — aparece só depois do hero */}
        {showSubnav && (
          <div className="border-t hidden md:block" style={{ borderColor: C.lavender, backgroundColor: `${C.sand}f2` }}>
            <div className="max-w-6xl mx-auto flex items-center justify-center gap-6 px-4 h-10">
              {NAV_SECTIONS.map(s => (
                <button key={s.id} onClick={() => scrollTo(s.id)}
                  className="text-xs font-medium hover:opacity-70 transition-opacity"
                  style={{ color: C.inkMuted }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ─── Gradiente Mágico (destaque total) ────────────── */}
      <section className="relative overflow-hidden gradient-flow" style={{ background: gradientMagic }}>
        {/* Overlay decorativo sutil */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,217,102,0.2) 0%, transparent 50%)' }} />

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32 text-center text-white">
          <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
            style={{ background: C.goldSoft, color: C.ink }}>
            <Sparkles size={12} /> TFA · Soluções com IA
          </span>
          <h1 className="font-playfair font-bold text-3xl md:text-5xl lg:text-6xl leading-tight mb-6 text-white">
            Crie seu SaaS com IA<br className="hidden sm:block" /> em semanas — não em meses
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Um hub completo pra sair do zero: da ideia à monetização, com <strong style={{ color: C.goldSoft }}>ferramentas de IA</strong>,
            estudos guiados, prompts prontos e uma comunidade focada em Vibe Coding.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <Btn variant="primary" size="lg" onClick={openSignup}>
              Criar conta grátis <ArrowRight size={16} />
            </Btn>
            <Btn variant="outline" size="lg" onClick={() => scrollTo('modulos')}>
              Ver o que tem dentro
            </Btn>
          </div>
          <p className="text-xs text-white/80">
            <span className="inline-block px-2 py-0.5 rounded-full mr-1 soft-pulse" style={{ background: C.goldSoft, color: C.ink }}>GRÁTIS</span>
            por tempo limitado · sem cartão · acesso imediato
          </p>
        </div>
      </section>

      {/* ── Faixa de tecnologias ──────────────────────────────────── */}
      <Section bg={C.sand}>
        <p className="text-center text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: C.inkMuted }}>
          Curado com o melhor do vibe coding
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold" style={{ color: C.magic }}>
          {['Cursor', 'Lovable', 'Windsurf', 'Bolt.new', 'v0.dev', 'Supabase', 'Claude', 'GPT'].map(t => (
            <span key={t} className="opacity-80">{t}</span>
          ))}
        </div>
      </Section>

      {/* ── Dor / Problema ────────────────────────────────────────── */}
      <Section bg={C.lilac}>
        <div className="text-center mb-10">
          <h2 className="font-playfair font-bold text-2xl md:text-4xl mb-3" style={{ color: C.ink }}>
            Você quer criar seu SaaS com IA, mas…
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: C.inkMuted }}>
            Se identificou com alguma dessas situações? Você não está sozinho(a).
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Compass, title: 'Se perde entre 200 vídeos', desc: 'Cada guru fala uma coisa diferente. Você começa, para, começa de novo — e nunca sai do lugar.' },
            { icon: Target,  title: 'Não sabe qual ferramenta usar', desc: 'Cursor? Lovable? Bolt? Cada dia sai uma nova promessa e você fica sem saber por onde começar.' },
            { icon: TrendingUp, title: 'Trava na monetização', desc: 'Cria o produto, mas não sabe cobrar quanto, como vender, nem quem é o público certo.' },
          ].map((d, i) => (
            <div key={i} className="rounded-2xl p-6 reveal-up hover-lift"
              style={{ backgroundColor: C.sand, border: cardBorder, animationDelay: `${i * 120}ms` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 float-y" style={{ backgroundColor: C.lilacBaby, animationDelay: `${i * 400}ms` }}>
                <d.icon size={20} style={{ color: C.magic }} />
              </div>
              <h3 className="font-playfair font-bold text-lg mb-2" style={{ color: C.ink }}>{d.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: C.inkMuted }}>{d.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Solução ───────────────────────────────────────────────── */}
      <Section bg={C.sand}>
        <div className="text-center">
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4" style={{ background: C.lilacBaby, color: C.magic }}>
            A solução
          </span>
          <h2 className="font-playfair font-bold text-2xl md:text-4xl mb-4" style={{ color: C.ink }}>
            O Hub Vibe Coding reúne tudo num só lugar
          </h2>
          <p className="text-base md:text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: C.inkMuted }}>
            Um passo a passo <strong style={{ color: C.ink }}>guiado por IA</strong>, com estudos, ferramentas conectadas,
            prompts prontos e comunidade — pra você <strong style={{ color: C.ink }}>parar de pular de aula em aula</strong> e finalmente construir.
          </p>
        </div>
      </Section>

      {/* ── Módulos ───────────────────────────────────────────────── */}
      <Section bg={C.lavender} id="modulos">
        <div className="text-center mb-10">
          <h2 className="font-playfair font-bold text-2xl md:text-4xl mb-3" style={{ color: C.ink }}>
            Uma Jornada com 10 Recursos pra você sair do zero ao seu App SaaS ou Soluções Vibe Coding para o seu Negócio
          </h2>
          <p className="text-base max-w-3xl mx-auto" style={{ color: C.inkMuted }}>
            Um ambiente para leigos em códigos e experts em conhecimento de negócios.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {MODULES.map((m, i) => (
            <div key={m.title} className="rounded-2xl p-5 flex flex-col reveal-up hover-lift"
              style={{ backgroundColor: C.sand, border: cardBorder, animationDelay: `${i * 70}ms` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: gradientMagic }}>
                <m.icon size={18} className="text-white" />
              </div>
              <h3 className="font-playfair font-bold text-sm mb-1.5" style={{ color: C.ink }}>{m.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: C.inkMuted }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Como funciona ────────────────────────────────────────── */}
      <Section bg={C.sand} id="como">
        <div className="text-center mb-10">
          <h2 className="font-playfair font-bold text-2xl md:text-4xl" style={{ color: C.ink }}>Como funciona em 3 passos</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={i} className="rounded-2xl p-6 text-center reveal-up hover-lift"
              style={{ backgroundColor: C.lilac, border: cardBorder, animationDelay: `${i * 150}ms` }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 font-playfair font-bold text-2xl text-white gradient-flow" style={{ background: gradientMagic }}>
                {s.n}
              </div>
              <h3 className="font-playfair font-bold text-lg mb-2" style={{ color: C.ink }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: C.inkMuted }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Autoridade / Sobre ────────────────────────────────────── */}
      <Section bg={C.lilac} id="sobre">
        <div className="grid md:grid-cols-[220px_1fr] gap-8 items-center">
          <div className="rounded-2xl aspect-square mx-auto md:mx-0 flex items-center justify-center overflow-hidden shadow-xl w-48 md:w-full gradient-flow shimmer" style={{ background: gradientMagic }}>
            <span className="font-playfair font-bold text-5xl text-white">TF</span>
          </div>
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ background: C.lilacBaby, color: C.magic }}>
              Sobre a criadora
            </span>
            <h2 className="font-playfair font-bold text-2xl md:text-3xl mb-3" style={{ color: C.ink }}>
              Thayane Fidelis — TFA Soluções com IA
            </h2>
            <p className="text-base leading-relaxed mb-3" style={{ color: C.inkMuted }}>
              Criadora de soluções digitais com IA para empreendedores brasileiros. Com o Hub Vibe Coding, entrego
              tudo o que aprendi criando meus próprios SaaS — em formato prático, direto ao ponto, sem enrolação.
            </p>
            <p className="text-base leading-relaxed" style={{ color: C.inkMuted }}>
              Aqui você aprende <strong style={{ color: C.ink }}>fazendo</strong> — não só assistindo.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Oferta principal ──────────────────────────────────────── */}
      <Section bg={C.sand} id="oferta">
        <div className="rounded-3xl overflow-hidden shadow-2xl gradient-flow shimmer" style={{ background: gradientMagic }}>
          <div className="p-8 md:p-12 text-center text-white">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4" style={{ background: C.goldSoft, color: C.ink }}>
              🎁 Período de lançamento
            </span>
            <h2 className="font-playfair font-bold text-3xl md:text-5xl mb-4 text-white">
              GRÁTIS por tempo limitado
            </h2>
            <p className="text-base md:text-lg max-w-xl mx-auto mb-6 text-white/90">
              Acesso completo a todos os módulos, sem cartão de crédito. Depois do período de lançamento,
              o acesso passa a ser <span className="line-through">R$ 97/mês</span> — mas quem entrar agora garante condições especiais.
            </p>

            <div className="inline-block rounded-2xl px-8 py-6 mb-6" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-white/70 line-through text-lg">R$ 97</span>
                <span className="text-5xl md:text-6xl font-bold text-white">R$ 0</span>
              </div>
              <p className="text-xs text-white/80">agora, no lançamento</p>
            </div>

            <div className="flex justify-center">
              <Btn variant="primary" size="lg" onClick={openSignup}>
                Garantir meu acesso grátis <ArrowRight size={18} />
              </Btn>
            </div>
            <p className="text-xs mt-4 text-white/70">
              Cadastro em 30 segundos · confirmação por e-mail · sem cobrança agora
            </p>
          </div>
        </div>
      </Section>

      {/* ── Tudo incluído ─────────────────────────────────────────── */}
      <Section bg={C.lilacBaby}>
        <div className="text-center mb-8">
          <h2 className="font-playfair font-bold text-2xl md:text-4xl mb-3" style={{ color: C.ink }}>
            Tudo isso está incluído
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto">
          {BONUSES.map((b, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl px-4 py-3 reveal-up hover-lift"
              style={{ backgroundColor: C.sand, border: cardBorder, animationDelay: `${i * 90}ms` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: C.lilacBaby }}>
                <CheckCircle2 size={16} style={{ color: C.magic }} />
              </div>
              <span className="text-sm leading-snug pt-1" style={{ color: C.ink }}>{b}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Garantia ─────────────────────────────────────────────── */}
      <Section bg={C.sand}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white float-y gradient-flow" style={{ background: gradientMagic }}>
            <ShieldCheck size={36} />
          </div>
          <h2 className="font-playfair font-bold text-2xl md:text-3xl mb-3" style={{ color: C.ink }}>
            Zero risco, zero compromisso
          </h2>
          <p className="text-base leading-relaxed" style={{ color: C.inkMuted }}>
            Sem cartão de crédito, sem cobrança recorrente automática, sem letra miúda.
            Você entra grátis agora e só decide continuar depois de já ter usado tudo por dentro.
          </p>
        </div>
      </Section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <Section bg={C.lilac} id="faq">
        <div className="text-center mb-8">
          <h2 className="font-playfair font-bold text-2xl md:text-4xl" style={{ color: C.ink }}>Perguntas frequentes</h2>
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </Section>

      {/* ── CTA final ─────────────────────────────────────────────── */}
      <section style={{ background: gradientMagic }} className="py-16 md:py-20 px-4 gradient-flow">
        <div className="max-w-3xl mx-auto text-center text-white">
          <Star size={36} className="mx-auto mb-4" style={{ color: C.goldSoft }} />
          <h2 className="font-playfair font-bold text-3xl md:text-5xl mb-4 text-white">
            Sua próxima ideia pode virar SaaS ainda esta semana
          </h2>
          <p className="text-base md:text-lg text-white/90 mb-8 max-w-xl mx-auto">
            Crie sua conta grátis agora e entre pra dentro do Hub Vibe Coding.
          </p>
          <Btn variant="primary" size="lg" onClick={openSignup}>
            Quero acessar agora <ArrowRight size={18} />
          </Btn>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{ background: C.magicDark }} className="py-8 px-4 text-white/80">
        <div className="max-w-6xl mx-auto text-center text-sm">
          <p className="mb-2">
            <a href="https://thayanefidelis.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-90" style={{ color: C.goldSoft }}>
              thayanefidelis.com
            </a>
            <span className="mx-2 text-white/40">·</span>
            <a href="https://api.whatsapp.com/message/EQIUEI67M7U2N1?autoload=1&app_absent=0" target="_blank" rel="noopener noreferrer" className="hover:opacity-90 text-white">
              Suporte WhatsApp
            </a>
          </p>
          <p className="text-xs text-white/60 mt-3">© TFA Soluções com IA · Hub Vibe Coding</p>
        </div>
      </footer>

      {signup && <SignupForm onClose={() => setSignup(false)} />}
    </div>
  )
}
