'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // O Supabase Auth já guarda o cookie automaticamente aqui
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
    } else {
      // O refresh é importante para o Next.js ler o novo cookie
      router.push('/admin/imoveis')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Acesso Restrito</h1>
          <p className="text-sm text-zinc-500">Painel Imobiliário</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1">E-mail</label>
            <input 
              type="email" 
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900/10 transition"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1">Senha</label>
            <input 
              type="password" 
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900/10 transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-bold text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-xl bg-zinc-900 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Entrar no Painel'}
          </button>
        </form>
      </div>
    </div>
  )
}