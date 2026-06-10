'use client'

import { useEffect, useRef } from 'react'

interface CredentialResponse {
  credential: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string
            callback: (r: CredentialResponse) => void
            ux_mode?: string
            use_fedcm_for_prompt?: boolean
          }): void
          renderButton(el: HTMLElement, config: object): void
        }
      }
    }
  }
}

interface Props {
  onToken: (idToken: string) => Promise<void> | void
  disabled?: boolean
}

export default function GoogleSignIn({ onToken, disabled }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId) return

    const render = () => {
      if (!window.google || !containerRef.current) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (r) => onToken(r.credential),
        ux_mode: 'popup',
        use_fedcm_for_prompt: false,
      })
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        width: containerRef.current.offsetWidth || 320,
        locale: 'pt-BR',
        text: 'signin_with',
        shape: 'rectangular',
      })
    }

    if (window.google) {
      render()
      return
    }

    // Carrega o script GSI caso ainda não esteja presente
    if (!document.querySelector('script[data-gsi]')) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.dataset.gsi = '1'
      script.onload = render
      document.head.appendChild(script)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  if (!clientId) return null

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center"
      style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
    />
  )
}
