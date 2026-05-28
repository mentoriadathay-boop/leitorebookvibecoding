import { useState, useMemo } from 'react'
import { TrendingUp } from 'lucide-react'

const TOOLTIPS = {
  mrr: 'MRR — Monthly Recurring Revenue. É a receita que o seu SaaS gera todo mês com os clientes ativos. Fórmula: Clientes × Valor do plano.',
  arr: 'ARR — Annual Recurring Revenue. É a projeção anual da sua receita atual (MRR × 12), assumindo que nenhum cliente entra ou sai.',
  mrr12: 'MRR projetado após 12 meses, aplicando mês a mês a taxa de crescimento e a taxa de cancelamento (churn) configuradas acima.',
  clients12: 'Total de clientes estimado no mês 12, após crescimento e cancelamentos acumulados ao longo do ano.',
}

function Tooltip({ text }) {
  return (
    <span className="relative group inline-flex items-center ml-1 align-middle">
      <span className="w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-[9px] font-bold flex items-center justify-center cursor-help select-none leading-none">
        !
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-gray-800 dark:bg-gray-950 text-white text-[10px] leading-relaxed rounded-lg px-2.5 py-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 text-left whitespace-normal">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-950" />
      </span>
    </span>
  )
}

function fmt(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

function fmtN(v) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v)
}

function SliderField({ label, min, max, step, value, onChange, display }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-600 dark:text-gray-400 font-medium">{label}</span>
        <span className="font-semibold text-[#0F4A28] dark:text-green-400">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[#1B6B3A] h-1.5 rounded-full"
      />
    </div>
  )
}

export default function RevenueCalculator() {
  const [clients, setClients] = useState(100)
  const [price, setPrice] = useState(97)
  const [churn, setChurn] = useState(5)
  const [growth, setGrowth] = useState(10)

  const { mrr, arr, months } = useMemo(() => {
    const mrr0 = clients * price
    const arr = mrr0 * 12
    const months = []
    let cur = clients
    for (let i = 1; i <= 12; i++) {
      cur = cur * (1 + growth / 100) * (1 - churn / 100)
      months.push({ month: i, clients: Math.round(cur), mrr: Math.round(cur * price) })
    }
    return { mrr: mrr0, arr, months }
  }, [clients, price, churn, growth])

  const maxMrr = Math.max(...months.map(m => m.mrr), mrr)

  return (
    <div className="max-w-2xl mx-auto px-2">
      <div className="mb-6">
        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Calculadora de Receita SaaS
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Simule o potencial financeiro do seu SaaS com dados reais.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-5 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Parâmetros</h3>

          <SliderField
            label="Número de clientes"
            min={0} max={5000} step={10}
            value={clients}
            onChange={setClients}
            display={fmtN(clients)}
          />

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Valor do plano mensal (R$)</span>
              <span className="font-semibold text-[#0F4A28] dark:text-green-400">{fmt(price)}</span>
            </div>
            <input
              type="number"
              min={1}
              value={price}
              onChange={e => setPrice(Math.max(1, Number(e.target.value)))}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300"
            />
          </div>

          <SliderField
            label="Taxa de cancelamento mensal"
            min={0} max={20} step={0.5}
            value={churn}
            onChange={setChurn}
            display={`${churn}%`}
          />

          <SliderField
            label="Taxa de crescimento mensal"
            min={0} max={30} step={0.5}
            value={growth}
            onChange={setGrowth}
            display={`${growth}%`}
          />
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#E8F5EE] dark:bg-[#0F4A28]/20 rounded-xl p-4 border border-[#1B6B3A]/20">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                MRR Atual <Tooltip text={TOOLTIPS.mrr} />
              </p>
              <p className="font-playfair font-bold text-xl text-[#0F4A28] dark:text-green-400">{fmt(mrr)}</p>
            </div>
            <div className="bg-[#FDF6E3] dark:bg-yellow-900/20 rounded-xl p-4 border border-[#C9A84C]/30">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                ARR Atual <Tooltip text={TOOLTIPS.arr} />
              </p>
              <p className="font-playfair font-bold text-xl text-[#C9A84C]">{fmt(arr)}</p>
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                MRR em 12 meses <Tooltip text={TOOLTIPS.mrr12} />
              </p>
              <p className="font-playfair font-bold text-xl text-[#1B6B3A]">{fmt(months[11]?.mrr || 0)}</p>
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                Clientes em 12m <Tooltip text={TOOLTIPS.clients12} />
              </p>
              <p className="font-playfair font-bold text-xl text-gray-800 dark:text-white">{fmtN(months[11]?.clients || 0)}</p>
            </div>
          </div>

          {/* Bar chart */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-1">
              <TrendingUp size={13} className="text-[#1B6B3A]" /> Projeção 12 meses (MRR)
            </p>
            <div className="flex items-end gap-1 h-24">
              {months.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className="w-full rounded-t-sm transition-all duration-500"
                    style={{
                      height: `${Math.max(4, (m.mrr / maxMrr) * 80)}px`,
                      background: 'linear-gradient(to top, #1B6B3A, #C9A84C)',
                      opacity: 0.8 + (m.month / 12) * 0.2,
                    }}
                  />
                  <span className="text-[8px] text-gray-400">{m.month}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1">Mês</p>
          </div>
        </div>
      </div>
    </div>
  )
}
