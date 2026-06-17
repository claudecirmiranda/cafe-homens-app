import { NextResponse } from 'next/server'
import webpush from 'web-push'

const PHP_API = process.env.NEXT_PUBLIC_API_URL || 'https://cafecomhomensdedeus.com.br'

webpush.setVapidDetails(
  'mailto:claudecir.miranda@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Hora atual em BRT (UTC-3): determina quais subscribers recebem agora
  const brtHour = (new Date().getUTCHours() + 21) % 24

  // Busca subscriptions do horário atual no backend PHP
  const subsRes = await fetch(`${PHP_API}/api/push/list.php?hour=${brtHour}`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  })
  if (!subsRes.ok) {
    return NextResponse.json({ error: 'Erro ao buscar subscriptions' }, { status: 500 })
  }
  const subscriptions: { endpoint: string; p256dh: string; auth: string }[] = await subsRes.json()

  if (subscriptions.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // Busca devocional do dia
  const today = new Date().toISOString().split('T')[0]
  const devRes = await fetch(`${PHP_API}/api/devotional.php?date=${today}`)
  const devotional = devRes.ok ? await devRes.json() : null

  const payload = JSON.stringify({
    title: 'Café com Homens de Deus ☕',
    body: devotional?.daily_word
      ? `Palavra do dia: ${devotional.daily_word}`
      : 'Seu devocional de hoje está disponível!',
    url: `/devocional/${today}`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
  })

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      )
    )
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.length - sent

  return NextResponse.json({ sent, failed })
}
