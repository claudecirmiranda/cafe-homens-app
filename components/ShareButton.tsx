'use client'

import { buildWhatsAppText } from '@/lib/utils'
import type { Devotional } from '@/lib/types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.cafecomhomensdedeus.com.br'

/**
 * Baixa a imagem de compartilhamento do devocional (gerada no servidor)
 * e a transforma em File, para anexar via Web Share API.
 * Requer que a pasta /share/ permita CORS para o subdomínio do app.
 */
async function devotionalImageToFile(shareImageUrl: string): Promise<File | null> {
  try {
    const res = await fetch(shareImageUrl)
    if (!res.ok) return null
    const blob = await res.blob()
    return new File([blob], 'devocional.png', { type: blob.type || 'image/png' })
  } catch {
    return null
  }
}

export default function ShareButton({ devotional }: { devotional: Devotional }) {
  const handleShare = async () => {
    const url = `${APP_URL}/devocional/${devotional.date}`

    // Texto enxuto: a imagem já mostra data e referência.
    const text =
      `☕ Café com Homens de Deus\n\n` +
      `${devotional.weekly_theme}\n\n` +
      `_"${devotional.bible_text}"_\n` +
      `— ${devotional.bible_reference}\n\n` +
      `${url}`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        // Anexa a IMAGEM DO DEVOCIONAL (gerada no servidor), se possível.
        let files: File[] | undefined
        if (devotional.share_image_url) {
          const png = await devotionalImageToFile(devotional.share_image_url)
          if (png && navigator.canShare?.({ files: [png] })) {
            files = [png]
          }
        }

        await navigator.share({
          title: 'Café com Homens de Deus',
          text,
          url,
          ...(files ? { files } : {}),
        })
        return
      } catch {
        // usuário cancelou ou falhou — cai no fallback abaixo
      }
    }

    // Fallback: WhatsApp (texto + link; imagem aparece via preview og:image)
    const wa = `https://wa.me/?text=${buildWhatsAppText(
      devotional.weekly_theme,
      devotional.bible_text,
      devotional.bible_reference,
      url,
    )}`
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