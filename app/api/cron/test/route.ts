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

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  if (!userId) {
    return NextResponse.json({ error: 'user_id obrigatório' }, { status: 422 })
  }

  const subsRes = await fetch(`${PHP_API}/api/push/list.php?user_id=${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  })
  if (!subsRes.ok) {
    return NextResponse.json({ error: 'Erro ao buscar subscriptions' }, { status: 500 })
  }

  const subscriptions: { endpoint: string; p256dh: string; auth: string }[] = await subsRes.json()
  if (subscriptions.length === 0) {
    return NextResponse.json({ error: 'Nenhuma subscription encontrada para este usuário' }, { status: 404 })
  }

  const payload = JSON.stringify({
    title: 'Café com Homens de Deus ☕ [TESTE]',
    body: 'Notificação de teste funcionando!',
    url: '/',
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
  const failed = results.filter((r) => r.status === 'rejected').map((r) =>
    r.status === 'rejected' ? r.reason?.message : ''
  )

  return NextResponse.json({ sent, failed, total: subscriptions.length })
}
