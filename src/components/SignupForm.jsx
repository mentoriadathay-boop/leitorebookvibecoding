import { useState } from 'react'
import { X, Loader2, Sparkles, Mail, Check } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function SignupForm({ onClose }) {
  const [step, setStep] = useState('form') // 'form' | 'sent'
  const [name, setName] = useState('')
  const [profession, setProfession] = useState('')
  const [age, setAge] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !password || !whatsapp.trim() || !profession.trim() || !age) {
      setError('Preencha todos os campos.')
      return
    }
    if (password.length < 6) {
      setError('A senha precisa ter no mínimo 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const { data, error: signErr } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            display_name: name.trim(),
            profession: profession.trim(),
            age: Number(age),
            whatsapp: whatsapp.trim(),
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      })
      if (signErr) throw signErr

      // Salva os dados extras no `profiles` (idempotente — se já existir, atualiza).
      const userId = data?.user?.id
      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          display_name: name.trim(),
          profession: profession.trim(),
          age: Number(age),
          whatsapp: whatsapp.trim(),
          plan_type: 'free',
          status: 'active',
        })
      }

      setStep('sent')
    } catch (err) {
      const msg = err.message || 'Não foi possível criar sua conta agora.'
      setError(
        msg.includes('already registered') || msg.includes('User already')
          ? 'Este e-mail já tem uma conta. Faça login em vez de criar uma nova.'
          : msg
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-md my-8" onClick={e => e.stopPropagation()}>
        <div className="bg-[#F7F6F3] rounded-2xl overflow-hidden shadow-2xl">
          {/* Header do modal */}
          <div className="px-5 py-4 flex items-center justify-between text-white" style={{ background: 'linear-gradient(135deg, #5B2A6E 0%, #C2298A 60%, #F5B942 100%)' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#FFD966]" />
              <span className="text-sm font-semibold">Criar conta grátis</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
              <X size={16} />
            </button>
          </div>

          {step === 'sent' ? (
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#F2E4FA] flex items-center justify-center mx-auto mb-4">
                <Mail size={22} className="text-[#5B2A6E]" />
              </div>
              <h3 className="font-playfair font-bold text-lg text-[#2E1338] mb-2">Confirme seu e-mail</h3>
              <p className="text-sm text-[#7A6584] leading-relaxed mb-5">
                Enviamos um link de confirmação para <strong className="text-[#2E1338]">{email}</strong>.
                Clique nele pra ativar sua conta e liberar o acesso ao Hub.
              </p>
              <button onClick={onClose}
                className="text-sm font-semibold px-6 py-2.5 bg-[#5B2A6E] hover:bg-[#3E1B4D] text-white rounded-xl transition-colors">
                Entendi
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="p-5 space-y-3">
              <p className="text-xs text-[#7A6584] leading-relaxed mb-2">
                Acesso liberado durante o período de lançamento. Preencha pra criar sua conta:
              </p>

              <Field label="Nome completo" value={name} onChange={setName} placeholder="Como você quer ser chamado(a)" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Profissão" value={profession} onChange={setProfession} placeholder="Ex: Designer" />
                <Field label="Idade" value={age} onChange={setAge} placeholder="Ex: 32" type="number" />
              </div>
              <Field label="WhatsApp" value={whatsapp} onChange={setWhatsapp} placeholder="(11) 99999-9999" />
              <Field label="E-mail" value={email} onChange={setEmail} placeholder="voce@email.com" type="email" />
              <Field label="Senha" value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" type="password" />

              {error && (
                <p className="text-xs text-[#E8845F] bg-[#FDF2EE] border border-[#F5B99E] rounded-lg px-3 py-2">{error}</p>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #5B2A6E 0%, #C2298A 60%, #F5B942 100%)' }}>
                {loading ? <><Loader2 size={15} className="animate-spin" /> Criando conta…</> : <><Check size={15} /> Criar minha conta grátis</>}
              </button>

              <p className="text-[10px] text-center text-[#7A6584] mt-1">
                Ao criar sua conta você aceita nossos termos. Sem cobrança agora — no fim do período gratuito você decide se continua.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#2E1338] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm border border-[#EDE7F6] rounded-lg px-3 py-2.5 bg-white text-[#2E1338] placeholder-[#7A6584]/60 focus:outline-none focus:border-[#5B2A6E]"
      />
    </div>
  )
}
