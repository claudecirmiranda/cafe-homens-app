'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window {
    __pwaInstallEvent: BeforeInstallPromptEvent | null
  }
}

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Já instalado como PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const ua = navigator.userAgent

    // Detecção iOS (Safari e Chrome/iOS)
    const ios = /ipad|iphone|ipod/i.test(ua)
    if (ios) {
      // Só mostra se ainda não está instalado (navigator.standalone = false no iOS)
      const alreadyInstalled = 'standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone === true
      if (!alreadyInstalled) {
        setIsIOS(true)
        setShow(true)
      }
      return
    }

    // Android/Desktop: o evento pode ter sido capturado antes do React montar
    const captured = window.__pwaInstallEvent
    if (captured) {
      setPrompt(captured)
      setShow(true)
      return
    }

    // Ou ainda não disparou — aguarda
    const handler = (e: Event) => {
      e.preventDefault()
      const evt = e as BeforeInstallPromptEvent
      window.__pwaInstallEvent = evt
      setPrompt(evt)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
      window.__pwaInstallEvent = null
    }
    setPrompt(null)
  }

  const handleDismiss = () => {
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 bg-brand-dark text-brand-beige
                    rounded-2xl p-4 shadow-2xl flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-serif text-sm font-bold mb-1">Instalar o App</p>
        {isIOS ? (
          <p className="font-sans text-xs leading-snug" style={{ color: '#faf2c5cc' }}>
            No Safari, toque em{' '}
            <span className="font-bold text-brand-beige">Compartilhar</span>{' '}
            <span aria-hidden>⬆️</span> e depois em{' '}
            <span className="font-bold text-brand-beige">Adicionar à Tela de Início</span>
          </p>
        ) : (
          <p className="font-sans text-xs" style={{ color: '#faf2c5cc' }}>
            Acesse o devocional diário mais rápido, offline e sem navegador
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="font-sans text-xs font-bold bg-brand-mustard text-brand-dark
                       px-3 py-1.5 rounded-lg active:opacity-80"
          >
            Instalar
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="font-sans text-xs underline"
          style={{ color: '#faf2c5aa' }}
        >
          Agora não
        </button>
      </div>
    </div>
  )
}
