import type { Devotional, DevotionalListResponse, User, ProgressStats, DevotionalNote, FavoriteItem } from './types'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://cafecomhomensdedeus.com.br'

export async function getDevocional(date?: string): Promise<Devotional | null> {
  const url = date
    ? `${API}/api/devotional.php?date=${date}`
    : `${API}/api/devotional.php`
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function getDevocionalList(page = 1): Promise<DevotionalListResponse | null> {
  try {
    const res = await fetch(`${API}/api/devotional.php?list=1&p=${page}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<User> {
  const res = await fetch(`${API}/api/auth/register.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro ao criar conta')
  return data as User
}

export async function loginUser(email: string, password: string): Promise<User> {
  const res = await fetch(`${API}/api/auth/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro ao fazer login')
  return data as User
}

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export async function getProgressStats(token: string): Promise<ProgressStats> {
  const res = await fetch(`${API}/api/progress/stats.php`, {
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Erro ao buscar progresso')
  return res.json()
}

export async function markDevotionalRead(token: string, devotionalId: number): Promise<void> {
  await fetch(`${API}/api/progress/mark.php`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ devotional_id: devotionalId }),
  })
}

export async function getNote(token: string, devotionalId: number): Promise<DevotionalNote> {
  const res = await fetch(`${API}/api/notes/get.php?devotional_id=${devotionalId}`, {
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Erro ao buscar anotação')
  return res.json()
}

export async function saveNote(token: string, devotionalId: number, content: string): Promise<void> {
  await fetch(`${API}/api/notes/save.php`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ devotional_id: devotionalId, content }),
  })
}

export async function toggleFavorite(token: string, devotionalId: number): Promise<boolean> {
  const res = await fetch(`${API}/api/favorites/toggle.php`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ devotional_id: devotionalId }),
  })
  if (!res.ok) throw new Error('Erro ao atualizar favorito')
  const data = await res.json()
  return data.favorited as boolean
}

export async function getFavorites(token: string): Promise<FavoriteItem[]> {
  const res = await fetch(`${API}/api/favorites/list.php`, {
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Erro ao buscar favoritos')
  return res.json()
}
