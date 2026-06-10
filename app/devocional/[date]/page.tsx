import { getDevocional } from '@/lib/api'
import { formatDatePt } from '@/lib/utils'
import DevotionalView from '@/components/DevotionalView'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: { date: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await getDevocional(params.date)
  if (!d) return { title: 'Devocional não encontrado' }
  return {
    title: d.weekly_theme,
    description: `${d.bible_reference} · ${d.main_summary || d.weekly_theme}`,
  }
}

export default async function DevocionalPage({ params }: Props) {
  const { date } = params

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound()

  const devotional = await getDevocional(date)
  if (!devotional) notFound()

  return (
    <>
      <Header title={formatDatePt(date)} showBack />
      <main className="pb-24">
        <DevotionalView devotional={devotional} />
      </main>
      <BottomNav active="arquivo" />
    </>
  )
}
