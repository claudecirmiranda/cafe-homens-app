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
    if (!user) return

    setLoading(true)
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
        }
        setSubscribed(false)
      } else {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
        })
        const json = sub.toJSON()
        await fetch(`${PHP_API}/api/push/subscribe.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({
            endpoint: json.endpoint,
            p256dh: json.keys?.p256dh,
            auth: json.keys?.auth,
            action: 'subscribe',
          }),
        })
        setSubscribed(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!supported) return null

  return (
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
  )
}
