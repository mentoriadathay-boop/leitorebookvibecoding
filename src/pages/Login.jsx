import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Eye, EyeOff, BookOpen } from 'lucide-react'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password })
        if (e) throw e
      } else if (mode === 'signup') {
        const { error: e } = await supabase.auth.signUp({ email, password })
        if (e) throw e
        setSuccess('Conta criada! Verifique seu email para confirmar o cadastro.')
        setMode('login')
      } else {
        const { error: e } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })
        if (e) throw e
        setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.')
        setMode('login')
      }
    } catch (e) {
      const msg = e?.message || 'Ocorreu um erro. Tente novamente.'
      if (msg.includes('Invalid login')) setError('Email ou senha incorretos.')
      else if (msg.includes('already registered')) setError('Este email já está cadastrado. Faça login.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#E8F5EE] dark:bg-[#0a1a0f] px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo + Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="font-playfair text-2xl font-bold text-[#0F4A28] dark:text-green-300">
            Vibe Coding
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            TFA Soluções com IA — Thayane Fidelis
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic font-playfair">
            "Vibe Coding e IA com visão humanizada"
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="font-playfair font-semibold text-xl text-gray-900 dark:text-white mb-1">
            {mode === 'login' ? 'Entrar na plataforma' : mode === 'signup' ? 'Criar sua conta' : 'Recuperar senha'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            {mode === 'login'
              ? 'Use o email e senha do seu cadastro.'
              : mode === 'signup'
              ? 'Crie sua conta para acessar o ebook interativo.'
              : 'Informe seu email para receber o link de recuperação.'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-[#FEF2F2] dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-xs text-[#B91C1C] dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-[#E8F5EE] dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-xs text-[#0F4A28] dark:text-green-400">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1B6B3A] hover:bg-[#0F4A28] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Aguarde...'
                : mode === 'login'
                ? 'Entrar'
                : mode === 'signup'
                ? 'Criar conta'
                : 'Enviar link de recuperação'}
            </button>
          </form>

          <div className="mt-4 space-y-2 text-center">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
                  className="block w-full text-xs text-[#1B6B3A] hover:text-[#0F4A28] transition-colors"
                >
                  Não tem conta? Criar agora
                </button>
                <button
                  onClick={() => { setMode('forgot'); setError(''); setSuccess('') }}
                  className="block w-full text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Esqueci minha senha
                </button>
              </>
            )}
            {mode !== 'login' && (
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                className="block w-full text-xs text-[#1B6B3A] hover:text-[#0F4A28] transition-colors"
              >
                ← Voltar ao login
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-6">
          Acesso exclusivo para compradores do ebook.{' '}
          <a href="https://thayanefidelis.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#1B6B3A]">
            Saiba mais
          </a>
        </p>
      </div>
    </div>
  )
}
