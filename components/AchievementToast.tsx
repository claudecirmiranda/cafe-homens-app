'use client'

import { useEffect, useState } from 'react'
import type { Achievement } from '@/lib/types'

interface Props {
  achievements: Achievement[]
  onDone: () => void
}

export default function AchievementToast({ achievements, onDone }: Props) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (achievements.length === 0) return
    setIndex(0)
    setVisible(true)
  }, [achievements])

  useEffect(() => {
    if (achievements.length === 0) return
    const timer = setTimeout(() => {
      if (index < achievements.length - 1) {
        setVisible(false)
        setTimeout(() => { setIndex((i) => i + 1); setVisible(true) }, 300)
      } else {
        setVisible(false)
        setTimeout(onDone, 300)
      }
    }, 3500)
    return () => clearTimeout(timer)
  }, [index, achievements, onDone])

  if (achievements.length === 0) return null

  const ach = achievements[index]

  return (
    <div
      className="fixed top-16 left-3 right-3 z-50 transition-all duration-300"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-12px)' }}
    >
      <div className="bg-brand-dark text-brand-beige rounded-2xl px-5 py-4 shadow-2xl
                      flex items-center gap-4">
        <span className="text-4xl flex-shrink-0">{ach.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-brand-mustard mb-0.5">
            Conquista desbloqueada!
          </p>
          <p className="font-serif text-base font-bold leading-snug">{ach.title}</p>
          <p className="font-sans text-xs mt-0.5" style={{ color: '#faf2c5bb' }}>{ach.desc}</p>
        </div>
      </div>
    </div>
  )
}
