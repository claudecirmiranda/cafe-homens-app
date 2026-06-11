'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { getUser, clearUser } from '@/lib/auth'
import { getProgressStats, getStreak, checkAchievements } from '@/lib/api'
import type { User, ProgressStats, Streak } from '@/lib/types'
import ReadingCalendar from '@/components/ReadingCalendar'
import PushNotificationButton from '@/components/PushNotificationButton'

export default function PerfilPage() {
  const router = useRouter()
  const [user,   setUser]   = useState<User | null>(null)
  const [stats,  setStats]  = useState<ProgressStats | null>(null)
  const [streak, setStreak] = useState<Streak | null>(null)

  const fetchData = (token: string) => {
    getProgressStats(token).then(setStats).catch(() => {})
    getStreak(token).then(setStreak).catch(() => {})
    checkAchievements(token).catch(() => {})   // garante conquistas atualizadas
  }

  useEffect(() => {
    const u = getUser()
    setUser(u)
    if (u) fetchData(u.token)

    // Recarrega dados ao voltar para a aba/página (resolve cache do router)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        const fresh = getUser()
        if (fresh) fetchData(fresh.token)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = () => {
    clearUser()
    router.push('/')
  }

  if (!user) return (
    <>
      <Header title="Perfil" />
      <main className="pb-24 px-4 py-8">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-20 h-20 rounded-full bg-brand-ocre border-2 border-brand-mustard
                          flex items-center justify-center text-4xl">
            👤
          </div>
          <p className="font-serif text-brand-dark text-lg">Minha conta</p>
          <p className="font-sans text-brand-muted text-sm text-center">
            Faça login para salvar favoritos, notas e acompanhar seu progresso de leitura.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/login"
            className="flex items-center justify-center bg-brand-dark text-brand-beige
                       font-sans font-semibold py-3.5 rounded-xl">
            Entrar na minha conta
          </Link>
          <Link href="/registro"
            className="flex items-center justify-center bg-white border border-brand-mustard
                       text-brand-dark font-sans font-semibold py-3.5 rounded-xl">
            Criar conta gratuita
          </Link>
        </div>
      </main>
      <BottomNav active="perfil" />
    </>
  )

  return (
    <>
      <Header title="Perfil" />
      <main className="pb-24 px-4 py-8">

        {/* Avatar + nome */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-20 h-20 rounded-full bg-brand-ocre border-2 border-brand-mustard
                          flex items-center justify-center text-4xl">
            👤
          </div>
          <p className="font-serif text-brand-dark text-lg font-bold">{user.name}</p>
          <p className="font-sans text-brand-muted text-sm">{user.email}</p>
        </div>

        {/* Streak */}
        {streak !== null && (
          <div className="bg-brand-dark rounded-xl p-5 shadow-sm mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🔥</span>
              <div>
                <p className="font-serif text-3xl font-bold text-brand-beige leading-none">
                  {streak.current}
                </p>
                <p className="font-sans text-xs text-brand-ocre mt-0.5">
                  {streak.current === 1 ? 'dia seguido' : 'dias seguidos'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-sans text-xs text-brand-ocre">Recorde</p>
              <p className="font-serif text-xl font-bold text-brand-mustard">{streak.longest}</p>
              <p className="font-sans text-xs text-brand-ocre mt-2">Total lidos</p>
              <p className="font-serif text-xl font-bold text-brand-beige">{streak.total}</p>
            </div>
          </div>
        )}

        {/* Calendário de leitura */}
        <ReadingCalendar token={user.token} />

        {/* Progresso */}
        {stats && (
          <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-brand-mid mb-4">
              Progresso de leitura
            </h2>
            <div className="flex justify-around mb-4">
              <div className="text-center">
                <p className="font-serif text-3xl font-bold text-brand-dark">{stats.read}</p>
                <p className="font-sans text-xs text-brand-muted mt-1">Lidos</p>
              </div>
              <div className="text-center">
                <p className="font-serif text-3xl font-bold text-brand-dark">{stats.total}</p>
                <p className="font-sans text-xs text-brand-muted mt-1">Total</p>
              </div>
              <div className="text-center">
                <p className="font-serif text-3xl font-bold text-brand-mustard">{stats.percentage}%</p>
                <p className="font-sans text-xs text-brand-muted mt-1">Concluído</p>
              </div>
            </div>
            <div className="w-full bg-brand-ocre rounded-full h-2">
              <div
                className="bg-brand-mustard h-2 rounded-full transition-all"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Funcionalidades */}
        <ul className="flex flex-col gap-3 mb-6">
          <li>
            <Link href="/perfil/conquistas"
              className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🏅</span>
                <div>
                  <p className="font-sans text-sm font-semibold text-brand-dark">Conquistas</p>
                  <p className="font-sans text-xs text-brand-muted">Seus marcos desbloqueados</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </li>

          <li>
            <Link href="/perfil/favoritos"
              className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🔖</span>
                <div>
                  <p className="font-sans text-sm font-semibold text-brand-dark">Favoritos</p>
                  <p className="font-sans text-xs text-brand-muted">Seus devocionais salvos</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </li>

          <li className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🔔</span>
                <div>
                  <p className="font-sans text-sm font-semibold text-brand-dark">Notificações</p>
                  <p className="font-sans text-xs text-brand-muted">Devocional às 09:00</p>
                </div>
              </div>
              <PushNotificationButton />
            </div>
          </li>
        </ul>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center border border-brand-ocre
                     text-brand-mid font-sans font-semibold py-3.5 rounded-xl
                     active:bg-brand-ocre transition-colors"
        >
          Sair da conta
        </button>
      </main>
      <BottomNav active="perfil" />
    </>
  )
}
