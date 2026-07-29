import { Lock, Sparkles } from 'lucide-react'
import { isPremium } from '../lib/isPremium'

/**
 * Selo pequeno de cadeado — mostra sobre a capa de um card.
 * Usar no canto superior direito da imagem do card.
 */
export function PremiumLockCorner() {
  return (
    <span
      title="Conteúdo exclusivo para membros"
      className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 text-[10px] font-bold text-white px-2 py-1 rounded-full shadow-md"
      style={{ background: 'linear-gradient(135deg, #5B2A6E 0%, #C2298A 60%, #F5B942 100%)' }}
    >
      <Lock size={10} /> Premium
    </span>
  )
}

/**
 * Bloqueio de página inteira: exibe um card explicativo em vez do conteúdo.
 * Usa `title` pra dizer o que é o módulo bloqueado.
 */
export function PremiumGate({ profile, title = 'Este módulo é exclusivo para membros', children }) {
  if (isPremium(profile)) return children
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="rounded-3xl overflow-hidden shadow-xl"
        style={{ background: 'linear-gradient(135deg, #5B2A6E 0%, #C2298A 60%, #F5B942 100%)' }}>
        <div className="p-8 md:p-10 text-center text-white">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Lock size={26} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2 inline-block px-3 py-1 rounded-full"
            style={{ background: '#FFD966', color: '#2E1338' }}>
            <Sparkles size={10} className="inline mb-0.5" /> Área premium
          </p>
          <h2 className="font-playfair font-bold text-2xl md:text-3xl mt-2 mb-3">
            {title}
          </h2>
          <p className="text-sm md:text-base text-white/90 max-w-md mx-auto leading-relaxed mb-6">
            Este recurso é liberado apenas para membros pagantes. Fale com a gente pra fazer o upgrade
            do seu plano e destravar tudo que a plataforma oferece.
          </p>
          <a
            href="https://api.whatsapp.com/message/EQIUEI67M7U2N1?autoload=1&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
            style={{ background: '#FFFFFF', color: '#3E1B4D' }}
          >
            Quero fazer upgrade →
          </a>
        </div>
      </div>
    </div>
  )
}
