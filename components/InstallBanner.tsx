'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Já instalado como PWA — não mostrar
    //if (window.matchMedia('(display-mode: standalone)').matches) return
    // Já dispensou hoje
    //if (sessionStorage.getItem('install-dismissed')) return

    const ua = navigator.userAgent
    const ios = /ipad|iphone|ipod/i.test(ua) && !(window as unknown as { MSStream: unknown }).MSStream
    const standaloneSafari = 'standalone' in navigator && (navigator as { standalone?: boolean }).standalone === false

    if (ios && standaloneSafari) {
      setIsIOS(true)
      setShow(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setPrompt(null)
  }

  const handleDismiss = () => {
    sessionStorage.setItem('install-dismissed', '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 bg-brand-dark text-brand-beige
                    rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-fade-in">
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