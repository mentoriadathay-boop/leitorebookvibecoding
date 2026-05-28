import { useState, useEffect } from 'react'
import { Users, BookOpen, FileText, TrendingUp, Star, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

const PLAN_LABELS = { free: 'Gratuito', monthly: 'Mensal', annual: 'Anual', lifetime: 'Vitalício' }
const PLAN_COLORS = {
  free: 'text-gray-500',
  monthly: 'text-blue-500',
  annual: 'text-[#1B6B3A]',
  lifetime: 'text-orange-500',
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-2xl font-playfair font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        const [
          { count: totalUsers },
          { data: planData },
          { count: totalChapters },
          { count: totalNotes },
          { count: newUsers },
          { count: blockedUsers },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('plan_type'),
          supabase.from('chapters').select('*', { count: 'exact', head: true }).eq('published', true),
          supabase.from('notes').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'blocked'),
        ])

        const plans = { free: 0, monthly: 0, annual: 0, lifetime: 0 }
        planData?.forEach(p => { plans[p.plan_type] = (plans[p.plan_type] || 0) + 1 })

        setStats({ totalUsers, plans, totalChapters, totalNotes, newUsers, blockedUsers })
      } catch (e) {
        console.error('AdminDashboard:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center py-16 text-sm text-gray-400">Carregando dados...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-xl font-bold text-gray-900 dark:text-white">Visão geral</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Users} label="Total de usuários" value={stats?.totalUsers} color="bg-[#1B6B3A]" />
        <StatCard icon={TrendingUp} label="Novos (30 dias)" value={stats?.newUsers} color="bg-blue-500" />
        <StatCard icon={BookOpen} label="Cap. publicados" value={stats?.totalChapters} color="bg-[#C9A84C]" />
        <StatCard icon={FileText} label="Notas salvas" value={stats?.totalNotes} color="bg-purple-500" />
        <StatCard icon={Star} label="Vitalícios" value={stats?.plans?.lifetime} color="bg-orange-500" />
        <StatCard icon={Calendar} label="Bloqueados" value={stats?.blockedUsers} color="bg-red-500" />
      </div>

      {stats?.plans && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-5">Distribuição por plano</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(PLAN_LABELS).map(([key, label]) => {
              const count = stats.plans[key] || 0
              const pct = stats.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex items-end justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                    <span className={`text-lg font-playfair font-bold ${PLAN_COLORS[key]}`}>{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: key === 'lifetime' ? '#f97316' : key === 'annual' ? '#1B6B3A' : key === 'monthly' ? '#3b82f6' : '#9ca3af',
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{pct}% do total</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
