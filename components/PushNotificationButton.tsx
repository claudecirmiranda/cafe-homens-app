'use client'

import { useEffect, useState } from 'react'
import { getUser } from '@/lib/auth'

const PHP_API = process.env.NEXT_PUBLIC_API_URL || 'https://cafecomhomensdedeus.com.br'
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from(rawData.split('').map((c) => c.charCodeAt(0)))
}

export default function PushNotificationButton() {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    setSupported(true)

    navigator.serviceWorker.ready.then(async (reg) => {
      const existing = await reg.pushManager.getSubscription()
      setSubscribed(!!existing)
    })
  }, [])

  async function toggle() {
    const user = getUser()
    if (!user) {
      setError('Faça login para ativar as notificações.')
      return
    }

    if (!VAPID_PUBLIC_KEY) {
      setError('Configuração de notificação ausente. Tente novamente mais tarde.')
      console.error('[Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY não definido')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const reg = await navigator.serviceWorker.ready
      console.log('[Push] Service worker pronto:', reg)

      if (subscribed) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await sub.unsubscribe()
          const res = await fetch(`${PHP_API}/api/push/subscribe.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
            body: JSON.stringify({ endpoint: sub.endpoint, action: 'unsubscribe' }),
          })
          console.log('[Push] Unsubscribe PHP response:', res.status)
        }
        setSubscribed(false)
      } else {
        console.log('[Push] Solicitando permissão de notificação...')
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setError('Permissão negada. Verifique as configurações do navegador.')
          return
        }
        console.log('[Push] Solicitando permissão de push...')
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
        })
        console.log('[Push] Subscription criada:', sub.endpoint)
        const json = sub.toJSON()
        const res = await fetch(`${PHP_API}/api/push/subscribe.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({
            endpoint: json.endpoint,
            p256dh: json.keys?.p256dh,
            auth: json.keys?.auth,
            action: 'subscribe',
          }),
        })
        console.log('[Push] Subscribe PHP response:', res.status, await res.json())
        setSubscribed(true)
      }
    } catch (err: unknown) {
      console.error('[Push] Erro:', err)
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Permissão negada. Verifique as configurações do navegador.')
      } else if (err instanceof Error && err.name === 'AbortError') {
        setError('Notificações não são suportadas neste modo de navegação.')
      } else {
        setError('Não foi possível ativar as notificações.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!supported) return null

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={toggle}
        disabled={loading}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors
          ${subscribed
            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            : 'bg-amber-600 text-white hover:bg-amber-700'
          } disabled:opacity-50`}
      >
        <span>{subscribed ? '🔔' : '🔕'}</span>
        {loading ? 'Aguarde...' : subscribed ? 'Notificações ativas' : 'Ativar notificações'}
      </button>
      {error && <p className="text-xs text-red-500 max-w-[200px] text-right">{error}</p>}
    </div>
  )
}
