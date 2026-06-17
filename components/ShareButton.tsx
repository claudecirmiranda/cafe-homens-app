'use client'

import { buildWhatsAppText } from '@/lib/utils'
import type { Devotional } from '@/lib/types'

export default function ShareButton({ devotional }: { devotional: Devotional }) {
  const handleShare = async () => {
    const url  = `${window.location.origin}/devocional/${devotional.date}`
    const text = `☕ Café com Homens de Deus\n\n${devotional.weekly_theme}\n\n"${devotional.bible_text}"\n— ${devotional.bible_reference}\n\n`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        // Tenta incluir a logo; se a plataforma não suportar o arquivo, compartilha só o texto
        let files: File[] | undefined
        try {
          const res  = await fetch('/logo_nome.svg')
          const blob = await res.blob()
          const file = new File([blob], 'cafe-homens-deus.svg', { type: 'image/svg+xml' })
          if (navigator.canShare?.({ files: [file] })) files = [file]
        } catch { /* logo indisponível — ignora */ }

        await navigator.share({ title: 'Café com Homens de Deus', text, url, ...(files ? { files } : {}) })
        return
      } catch {
        // usuário cancelou — fallback abaixo
      }
    }

    // Fallback: WhatsApp
    const wa = `https://wa.me/?text=${buildWhatsAppText(devotional.weekly_theme, devotional.bible_text, devotional.bible_reference, url)}`
    window.open(wa, '_blank', 'noopener')
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 bg-brand-mustard text-brand-dark font-semibold font-sans
                 px-5 py-2.5 rounded-full text-sm shadow hover:bg-brand-light transition-colors"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
      </svg>
      Compartilhar
    </button>
  )
}
