import { useState, useEffect } from 'react'
import { Rocket, ExternalLink, HandCoins, Lock } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { isPremium } from '../lib/isPremium'
import { PremiumLockCorner } from './PremiumBadge'

function PlatformCard({ platform, userIsPremium }) {
  const locked = platform.is_premium && !userIsPremium
  const href = locked
    ? 'https://api.whatsapp.com/message/EQIUEI67M7U2N1?autoload=1&app_absent=0'
    : platform.url
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-[#5B2A6E] dark:hover:border-magic-light transition-colors relative"
    >
      <div className="aspect-video bg-gradient-to-br from-[#F2E4FA] to-[#FCE4F1] dark:from-[#3E1B4D]/40 dark:to-[#5B2A6E]/20 flex items-center justify-center overflow-hidden relative">
        {platform.is_premium && <PremiumLockCorner />}
        {platform.logo_url ? (
          <img src={platform.logo_url} alt={`Logo ${platform.name}`}
            className={`max-h-24 object-contain ${locked ? 'grayscale opacity-70' : ''}`} />
        ) : (
          <Rocket size={42} className="text-[#5B2A6E] dark:text-magic-light opacity-40" />
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-playfair font-bold text-sm text-gray-900 dark:text-white mb-1 group-hover:text-[#5B2A6E] dark:group-hover:text-magic-light transition-colors">
          {platform.name}
        </h3>
        {platform.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 flex-1">
            {platform.description}
          </p>
        )}
        {locked ? (
          <span className="mt-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 text-white rounded-xl"
            style={{ background: 'linear-gradient(135deg, #5B2A6E 0%, #C2298A 60%, #F5B942 100%)' }}>
            <Lock size={12} /> Fazer upgrade
          </span>
        ) : (
          <span className="mt-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 bg-[#5B2A6E] group-hover:bg-[#3E1B4D] text-white rounded-xl transition-colors">
            Acessar <ExternalLink size={12} />
          </span>
        )}
      </div>
    </a>
  )
}

export default function SaasPlatforms({ profile }) {
  const userIsPremium = isPremium(profile)
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('saas_platforms')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPlatforms(data || []); setLoading(false) })
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Rocket size={22} className="text-[#5B2A6E] dark:text-magic-light" />
          Plataformas SaaS TFA
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Conheça as plataformas que criamos e acesse cada uma delas.
        </p>
      </div>

      {/* Banner de afiliados */}
      <div className="rounded-2xl p-5 text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, #5B2A6E 0%, #C2298A 60%, #F5B942 100%)' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
            <HandCoins size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1">Programa de Afiliados</p>
            <h3 className="font-playfair font-bold text-lg mb-1">Torne-se um afiliado das nossas plataformas</h3>
            <p className="text-sm text-white/90 leading-relaxed">
              Ganhe <strong>comissões recorrentes de 40%</strong> indicando nossas soluções — receita todo mês enquanto seus indicados continuarem ativos.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#5B2A6E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : platforms.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="w-14 h-14 rounded-2xl bg-[#F2E4FA] dark:bg-[#3E1B4D]/20 flex items-center justify-center mx-auto mb-4">
            <Rocket size={24} className="text-[#5B2A6E] dark:text-magic-light" />
          </div>
          <h3 className="font-playfair font-bold text-lg text-gray-900 dark:text-white mb-2">
            Em breve novidades por aqui
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            As plataformas serão anunciadas em breve.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {platforms.map(p => <PlatformCard key={p.id} platform={p} userIsPremium={userIsPremium} />)}
        </div>
      )}
    </div>
  )
}
