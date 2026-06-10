'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { registerUser } from '@/lib/api'
import { saveUser } from '@/lib/auth'

export default function RegistroPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await registerUser(form.name, form.email, form.password)
      saveUser(user)
      router.push('/perfil')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header title="Criar conta" showBack />
      <main className="px-6 py-10">
        <div className="text-center mb-8">
          <span className="text-4xl">☕</span>
          <h1 className="font-serif text-2xl font-bold text-brand-dark mt-3">Crie sua conta</h1>
          <p className="font-sans text-sm text-brand-muted mt-1">
            Salve favoritos e acompanhe seu progresso
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { key: 'name',     label: 'Nome',   type: 'text',     placeholder: 'Seu nome' },
            { key: 'email',    label: 'E-mail', type: 'email',    placeholder: 'seu@email.com' },
            { key: 'password', label: 'Senha',  type: 'password', placeholder: 'Mín. 8 caracteres, 1 maiúscula e 1 número' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="font-sans text-xs font-semibold text-brand-mid uppercase tracking-wider block mb-1.5">
                {label}
              </label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={set(key)}
                className="w-full bg-white border border-brand-ocre rounded-xl px-4 py-3
                           font-sans text-sm text-brand-dark placeholder-brand-muted
                           focus:outline-none focus:border-brand-mustard"
                placeholder={placeholder}
                required
              />
            </div>
          ))}

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
            {loading ? 'Criando conta…' : 'Criar conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-sans text-sm text-brand-muted">
            Já tem conta?{' '}
            <Link href="/login" className="text-brand-mustard font-semibold">
              Entrar
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}
