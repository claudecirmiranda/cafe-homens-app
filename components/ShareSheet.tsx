'use client'

import { useState, useEffect } from 'react'
import type { Devotional } from '@/lib/types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.cafecomhomensdedeus.com.br'

/** Baixa a imagem do devocional (gerada no servidor) como File para anexar. */
async function imageToFile(url: string): Promise<File | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    return new File([blob], 'devocional.png', { type: blob.type || 'image/png' })
  } catch {
    return null
  }
}

export default function ShareSheet({ devotional }: { devotional: Devotional }) {
  const [open, setOpen] = useState(false)
  const [sharingImg, setSharingImg] = useState(false)

  const url = `${APP_URL}/devocional/${devotional.date}`

  const text =
    `☕ Café com Homens de Deus\n\n` +
    `${devotional.weekly_theme}\n\n` +
    `_"${devotional.bible_text}"_\n` +
    `— ${devotional.bible_reference}\n\n` +
    `${url}`

  // Trava o scroll do fundo quando o sheet está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  // ── Ações: TEXTO ──
  const shareTextNative = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Café com Homens de Deus', text }); return } catch {}
    }
    // fallback: copia
    try { await navigator.clipboard.writeText(text) } catch {}
  }

  const shareTextWhatsApp = () => {
    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(wa, '_blank', 'noopener')
  }

  // ── Ações: IMAGEM ──
  const shareImageNative = async () => {
    if (!devotional.share_image_url) return
    setSharingImg(true)
    try {
      const file = await imageToFile(devotional.share_image_url)
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Café com Homens de Deus' })
      } else {
        // fallback: abre a imagem em nova aba para salvar/compartilhar manualmente
        window.open(devotional.share_image_url, '_blank', 'noopener')
      }
    } catch {
      // usuário cancelou — silencioso
    } finally {
      setSharingImg(false)
    }
  }

  return (
    <>
      {/* Botão que abre o sheet */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-brand-mustard text-brand-dark font-semibold font-sans
                   px-5 py-2.5 rounded-full text-sm shadow hover:bg-brand-light transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
        </svg>
        Compartilhar
      </button>

      {/* Bottom sheet */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-brand-cream rounded-t-3xl p-5 pb-8
                       max-h-[90vh] overflow-y-auto animate-[slideUp_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Alça do sheet */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-brand-dark/20" />

            <h2 className="text-center font-serif text-lg text-brand-dark font-bold mb-5">
              Compartilhar devocional
            </h2>

            {/* ── PREVIEW IMAGEM ── */}
            {devotional.share_image_url && (
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider text-brand-dark/60 mb-2 font-sans">
                  Imagem
                </p>
                <div className="rounded-xl overflow-hidden border border-brand-dark/10 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={devotional.share_image_url}
                    alt="Imagem do devocional"
                    className="w-full block"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={shareImageNative}
                    disabled={sharingImg}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-mustard
                               text-brand-dark font-semibold font-sans py-2.5 rounded-full text-sm
                               disabled:opacity-60 hover:bg-brand-light transition-colors"
                  >
                    {sharingImg ? 'Abrindo…' : 'Compartilhar'}
                  </button>
                  <button
                    onClick={shareImageNative}
                    disabled={sharingImg}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]
                               text-white font-semibold font-sans py-2.5 rounded-full text-sm
                               disabled:opacity-60 hover:brightness-95 transition"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.01c-.24.68-1.42 1.31-1.95 1.36-.5.05-.96.24-3.23-.67-2.71-1.07-4.45-3.82-4.59-4-.13-.18-1.1-1.46-1.1-2.79 0-1.33.7-1.98.95-2.25.24-.27.53-.34.71-.34.18 0 .35 0 .51.01.16.01.39-.06.6.46.24.58.81 2 .88 2.15.07.14.12.31.02.49-.09.18-.14.29-.27.45-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.27.14.43.12.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.6-.14.24.09 1.55.73 1.82.86.27.14.45.2.51.31.07.11.07.63-.17 1.31z"/>
                    </svg>
                    WhatsApp
                  </button>
                </div>
                <p className="text-[11px] text-brand-dark/50 mt-2 font-sans text-center">
                  No WhatsApp, escolha a conversa e envie a imagem.
                </p>
              </div>
            )}

            {/* ── PREVIEW TEXTO ── */}
            <div>
              <p className="text-xs uppercase tracking-wider text-brand-dark/60 mb-2 font-sans">
                Texto
              </p>
              <div className="rounded-xl border border-brand-dark/10 bg-white/60 p-3 mb-3">
                <p className="font-serif text-sm text-brand-dark whitespace-pre-line leading-relaxed">
                  {text}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={shareTextNative}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-mustard
                             text-brand-dark font-semibold font-sans py-2.5 rounded-full text-sm
                             hover:bg-brand-light transition-colors"
                >
                  Compartilhar
                </button>
                <button
                  onClick={shareTextWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]
                             text-white font-semibold font-sans py-2.5 rounded-full text-sm
                             hover:brightness-95 transition"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.01c-.24.68-1.42 1.31-1.95 1.36-.5.05-.96.24-3.23-.67-2.71-1.07-4.45-3.82-4.59-4-.13-.18-1.1-1.46-1.1-2.79 0-1.33.7-1.98.95-2.25.24-.27.53-.34.71-.34.18 0 .35 0 .51.01.16.01.39-.06.6.46.24.58.81 2 .88 2.15.07.14.12.31.02.49-.09.18-.14.29-.27.45-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.27.14.43.12.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.6-.14.24.09 1.55.73 1.82.86.27.14.45.2.51.31.07.11.07.63-.17 1.31z"/>
                  </svg>
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Fechar */}
            <button
              onClick={() => setOpen(false)}
              className="w-full mt-5 text-brand-dark/60 font-sans text-sm py-2"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
