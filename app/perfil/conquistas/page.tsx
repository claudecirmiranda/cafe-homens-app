'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { getUser } from '@/lib/auth'
import { getAchievements } from '@/lib/api'
import type { Achievement } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ConquistasPage() {
  const router = useRouter()
  const [items,   setItems]   = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUser()
    if (!user) { router.push('/login'); return }
    getAchievements(user.token)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const unlocked = items.filter((a) => a.unlocked).length

  return (
    <>
      <Header title="Conquistas" showBack />
      <main className="pb-24 px-4 py-6">
        {!loading && (
          <p className="font-sans text-xs text-brand-muted text-center mb-6">
            {unlocked} de {items.length} desbloqueadas
          </p>
        )}

        {loading ? (
          <p className="font-sans text-sm text-brand-muted text-center mt-16">Carregando…</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {items.map((ach) => (
              <div
                key={ach.id}
                className={`flex items-center gap-4 rounded-xl p-4 shadow-sm transition-opacity ${
                  ach.unlocked ? 'bg-white' : 'bg-white opacity-40'
                }`}
              >
                <span className="text-3xl flex-shrink-0 w-10 text-center">
                  {ach.unlocked ? ach.icon : '🔒'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm font-bold text-brand-dark">{ach.title}</p>
                  <p className="font-sans text-xs text-brand-muted mt-0.5">{ach.desc}</p>
                  {ach.unlocked && ach.unlocked_at && (
                    <p className="font-sans text-xs text-brand-mustard mt-1">
                      ✓ {formatDate(ach.unlocked_at)}
                    </p>
                  )}
                </div>
                {ach.unlocked && (
                  <div className="w-2 h-2 rounded-full bg-brand-mustard flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav active="perfil" />
    </>
  )
}
