'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import GoogleSignIn from '@/components/GoogleSignIn'
import { loginUser, googleSignIn } from '@/lib/api'
import { saveUser } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await loginUser(email, password)
      saveUser(user)
      router.push('/perfil')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleToken = useCallback(async (idToken: string) => {
    setError('')
    setLoading(true)
    try {
      const user = await googleSignIn(idToken)
      saveUser(user)
      router.push('/perfil')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar com Google')
    } finally {
      setLoading(false)
    }
  }, [router])

  return (
    <>
      <Header title="Entrar" showBack />
      <main className="px-6 py-10">
        <div className="text-center mb-8">
          <span className="text-4xl">☕</span>
          <h1 className="font-serif text-2xl font-bold text-brand-dark mt-3">Bem-vindo de volta</h1>
          <p className="font-sans text-sm text-brand-muted mt-1">Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-sans text-xs font-semibold text-brand-mid uppercase tracking-wider block mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-brand-ocre rounded-xl px-4 py-3
                         font-sans text-sm text-brand-dark placeholder-brand-muted
                         focus:outline-none focus:border-brand-mustard"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="font-sans text-xs font-semibold text-brand-mid uppercase tracking-wider block mb-1.5">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-brand-ocre rounded-xl px-4 py-3
                         font-sans text-sm text-brand-dark
                         focus:outline-none focus:border-brand-mustard"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="font-sans text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-dark text-brand-beige font-sans font-semibold
                       py-3.5 rounded-xl mt-2 active:bg-brand-mid transition-colors
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-sans text-sm text-brand-muted">
            Não tem conta?{' '}
            <Link href="/registro" className="text-brand-mustard font-semibold">
              Criar conta
            </Link>
          </p>
        </div>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-ocre" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-brand-beige px-4 font-sans text-xs text-brand-muted">
              ou continue com
            </span>
          </div>
        </div>

        <div className="mt-6">
          <GoogleSignIn onToken={handleGoogleToken} disabled={loading} />
        </div>
      </main>
    </>
  )
}
