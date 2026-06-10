'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { getUser } from '@/lib/auth'
import { getFavorites } from '@/lib/api'
import { formatDatePt } from '@/lib/utils'
import type { FavoriteItem } from '@/lib/types'

export default function FavoritosPage() {
  const router = useRouter()
  const [items,   setItems]   = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUser()
    if (!user) { router.push('/login'); return }
    getFavorites(user.token)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  return (
    <>
      <Header title="Favoritos" showBack />
      <main className="pb-24 px-4 py-6">
        {loading ? (
          <p className="font-sans text-sm text-brand-muted text-center mt-12">Carregando…</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 mt-16 text-center">
            <span className="text-4xl">🔖</span>
            <p className="font-serif text-brand-mid text-base">Nenhum favorito ainda</p>
            <p className="font-sans text-sm text-brand-muted">
              Toque em &ldquo;Favoritar&rdquo; em qualquer devocional para salvá-lo aqui.
            </p>
            <Link href="/" className="mt-2 font-sans text-sm text-brand-mustard font-semibold">
              Ver devocional de hoje
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/devocional/${item.date}`}
                  className="block bg-white rounded-xl p-4 shadow-sm active:bg-brand-ocre transition-colors"
                >
                  <p className="font-sans text-xs text-brand-muted uppercase tracking-wider mb-1">
                    {formatDatePt(item.date)}
                  </p>
                  <p className="font-serif text-sm font-bold text-brand-dark leading-snug mb-1">
                    {item.weekly_theme}
                  </p>
                  <p className="font-sans text-xs text-brand-mid">{item.bible_reference}</p>
                  {item.daily_word && (
                    <span className="inline-block mt-2 bg-brand-mustard text-brand-dark
                                     font-sans text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {item.daily_word}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <BottomNav active="perfil" />
    </>
  )
}
