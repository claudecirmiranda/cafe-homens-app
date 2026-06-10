'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Achievement, Devotional } from '@/lib/types'
import { formatDatePt } from '@/lib/utils'
import ShareButton from './ShareButton'
import AchievementToast from './AchievementToast'
import { getUser } from '@/lib/auth'
import {
  getNote, saveNote,
  toggleFavorite,
  getFavorites,
  markDevotionalRead,
  checkAchievements,
} from '@/lib/api'

interface SectionProps {
  title: string
  children: React.ReactNode
  accent?: boolean
}

function Section({ title, children, accent }: SectionProps) {
  return (
    <section className={`rounded-xl p-5 ${accent ? 'bg-brand-ocre' : 'bg-white'} shadow-sm`}>
      <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-brand-mid mb-3">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function DevotionalView({ devotional: d }: { devotional: Devotional }) {
  const [token,        setToken]        = useState<string | null>(null)
  const [favorited,    setFavorited]    = useState(false)
  const [favLoading,   setFavLoading]   = useState(false)
  const [note,         setNote]         = useState('')
  const [noteSaved,    setNoteSaved]    = useState(false)
  const [newAchs,      setNewAchs]      = useState<Achievement[]>([])
  const saveTimer                       = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const user = getUser()
    if (!user) return
    setToken(user.token)
    markDevotionalRead(user.token, d.id)
      .then(() => checkAchievements(user.token))
      .then((achs) => { if (achs.length) setNewAchs(achs) })
      .catch(() => {})
    getNote(user.token, d.id).then((n) => setNote(n.content)).catch(() => {})
    getFavorites(user.token)
      .then((list) => setFavorited(list.some((f) => f.id === d.id)))
      .catch(() => {})
  }, [d.id])

  const clearAchs = useCallback(() => setNewAchs([]), [])

  const handleFavorite = async () => {
    if (!token || favLoading) return
    setFavLoading(true)
    try {
      const next = await toggleFavorite(token, d.id)
      setFavorited(next)
    } finally {
      setFavLoading(false)
    }
  }

  const handleNoteChange = (value: string) => {
    setNote(value)
    setNoteSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      if (!token) return
      await saveNote(token, d.id, value).catch(() => {})
      setNoteSaved(true)
    }, 1200)
  }

  return (
    <>
    <AchievementToast achievements={newAchs} onDone={clearAchs} />
    <article className="flex flex-col gap-4 px-4 py-5">

      {/* Cabeçalho */}
      <header className="text-center pt-2 pb-3 border-b border-brand-ocre">
        <p className="font-sans text-xs text-brand-muted uppercase tracking-wider mb-2">
          {formatDatePt(d.date)}
          {d.day_of_year && ` · Dia ${d.day_of_year}`}
        </p>
        {d.daily_word && (
          <span className="inline-block bg-brand-mustard text-brand-dark font-sans text-xs font-bold
                           px-3 py-1 rounded-full mb-3">
            💡 {d.daily_word}
          </span>
        )}
        <h1 className="font-serif text-xl font-bold text-brand-dark leading-snug">
          {d.weekly_theme}
        </h1>
      </header>

      {/* Versículo */}
      <blockquote className="bg-brand-ocre rounded-xl p-5 border-l-4 border-brand-mustard">
        <p className="font-serif text-base italic text-brand-dark leading-relaxed mb-2">
          &ldquo;{d.bible_text}&rdquo;
        </p>
        <cite className="font-sans text-sm text-brand-mid not-italic font-semibold">
          — {d.bible_reference}
        </cite>
      </blockquote>

      {/* Análise e Reflexão */}
      {d.reflection && (
        <Section title="Análise e Reflexão">
          {d.reflection.split('\n\n').map((p, i) => (
            <p key={i} className="font-serif text-sm text-brand-dark leading-relaxed mb-3 last:mb-0">
              {p}
            </p>
          ))}
        </Section>
      )}

      {/* Conexão Prática */}
      {d.practical_connection && (
        <Section title="Conexão Prática para os Homens de Deus">
          {d.practical_connection.split('\n\n').map((p, i) => (
            <p key={i} className="font-serif text-sm text-brand-dark leading-relaxed mb-3 last:mb-0">
              {p}
            </p>
          ))}
        </Section>
      )}

      {/* Pergunta */}
      {d.practical_question && (
        <div className="bg-brand-dark rounded-xl p-4">
          <p className="font-serif text-sm italic text-brand-beige leading-relaxed">
            🎯 {d.practical_question}
          </p>
        </div>
      )}

      {/* Aplicações */}
      {d.applications?.length > 0 && (
        <Section title="Aplicação">
          <ul className="flex flex-col gap-3">
            {d.applications.map((app, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-mustard text-brand-dark
                                 font-sans font-bold text-xs flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="font-serif text-sm text-brand-dark leading-relaxed">{app}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Mensagem Final */}
      {d.final_message && (
        <Section title="Mensagem Final" accent>
          {d.final_message.split('\n\n').map((p, i) => (
            <p key={i} className="font-serif text-sm text-brand-dark leading-relaxed mb-3 last:mb-0">
              {p}
            </p>
          ))}
        </Section>
      )}

      {/* Resumo */}
      {(d.main_summary || d.daily_encouragement || d.daily_prayer) && (
        <Section title="Resumo do Dia">
          {d.main_summary && (
            <p className="font-serif text-sm text-brand-dark leading-relaxed mb-4">{d.main_summary}</p>
          )}
          {d.daily_encouragement && (
            <p className="font-sans text-sm font-semibold text-brand-mid mb-4">
              🚀 {d.daily_encouragement}
            </p>
          )}
          {d.daily_prayer && (
            <div className="border-t border-brand-ocre pt-4">
              <p className="font-sans text-xs font-bold uppercase tracking-wider text-brand-mid mb-2">
                🙏 Oração
              </p>
              <p className="font-serif text-sm italic text-brand-dark leading-relaxed">{d.daily_prayer}</p>
            </div>
          )}
        </Section>
      )}

      {/* Hashtags */}
      {d.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {d.hashtags.map((tag) => (
            <span key={tag} className="font-sans text-xs text-brand-mid bg-brand-ocre
                                       px-2.5 py-1 rounded-full border border-brand-mustard">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Anotações */}
      {token ? (
        <Section title="Minha Anotação">
          <textarea
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            rows={4}
            placeholder="Escreva sua reflexão pessoal sobre este devocional…"
            className="w-full font-sans text-sm text-brand-dark bg-brand-beige border border-brand-ocre
                       rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-brand-mustard
                       placeholder-brand-muted"
          />
          {noteSaved && (
            <p className="font-sans text-xs text-brand-mid mt-1.5">✓ Anotação salva</p>
          )}
        </Section>
      ) : (
        <div className="bg-brand-ocre rounded-xl p-4 text-center">
          <p className="font-sans text-sm text-brand-mid">
            <a href="/login" className="text-brand-mustard font-semibold">Entre na sua conta</a>
            {' '}para salvar anotações e favoritos.
          </p>
        </div>
      )}

      {/* Ações — Favorito e Compartilhar */}
      <div className="flex items-center justify-between pt-2 pb-4">
        {token ? (
          <button
            onClick={handleFavorite}
            disabled={favLoading}
            className="flex items-center gap-2 font-sans text-sm font-semibold
                       active:opacity-60 transition-opacity disabled:opacity-40"
            style={{ color: favorited ? '#D3A24D' : undefined }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"
              fill={favorited ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className={favorited ? 'text-brand-mustard' : 'text-brand-mid'}>
              {favorited ? 'Favoritado' : 'Favoritar'}
            </span>
          </button>
        ) : (
          <span />
        )}
        <ShareButton devotional={d} />
      </div>

    </article>
    </>
  )
}
