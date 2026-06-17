'use client'

import { useEffect, useState } from 'react'
import { getUser } from '@/lib/auth'

const PHP_API = process.env.NEXT_PUBLIC_API_URL || 'https://cafecomhomensdedeus.com.br'
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const LS_HOUR_KEY = 'push_preferred_hour'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 6..22

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from(rawData.split('').map((c) => c.charCodeAt(0)))
}

export default function PushNotificationButton() {
  const [supported,  setSupported]  = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [hour,       setHour]       = useState(6)
  const [savedHour,  setSavedHour]  = useState<number | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    setSupported(true)

    const stored = localStorage.getItem(LS_HOUR_KEY)
    if (stored) setSavedHour(parseInt(stored, 10))

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
      setError('Configuração ausente. Tente novamente mais tarde.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const reg = await navigator.serviceWorker.ready

      if (subscribed) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await sub.unsubscribe()
          await fetch(`${PHP_API}/api/push/subscribe.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
            body: JSON.stringify({ endpoint: sub.endpoint, action: 'unsubscribe' }),
          })
          localStorage.removeItem(LS_HOUR_KEY)
          setSavedHour(null)
        }
        setSubscribed(false)
      } else {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setError('Permissão negada. Verifique as configurações do navegador.')
          return
        }
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
        })
        const json = sub.toJSON()
        await fetch(`${PHP_API}/api/push/subscribe.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({
            endpoint:       json.endpoint,
            p256dh:         json.keys?.p256dh,
            auth:           json.keys?.auth,
            action:         'subscribe',
            preferred_hour: hour,
          }),
        })
        localStorage.setItem(LS_HOUR_KEY, String(hour))
        setSavedHour(hour)
        setSubscribed(true)
      }
    } catch (err: unknown) {
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

  if (subscribed) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={toggle}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium
                     bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50 transition-colors"
        >
          <span>🔔</span>
          {loading ? 'Aguarde...' : `Ativas · ${savedHour ?? 6}:00`}
        </button>
        {error && <p className="text-xs text-red-500 max-w-[200px] text-right">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <select
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          className="rounded-lg border border-amber-300 bg-white px-2 py-1.5 text-sm
                     text-brand-dark focus:outline-none focus:border-amber-500"
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>{h}:00</option>
          ))}
        </select>
        <button
          onClick={toggle}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium
                     bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
        >
          <span>🔕</span>
          {loading ? 'Aguarde...' : 'Ativar'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 max-w-[200px] text-right">{error}</p>}
    </div>
  )
}
