import { getDevocionalList } from '@/lib/api'
import { formatDatePt, formatMonthPt } from '@/lib/utils'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Arquivo' }

interface Props {
  searchParams: { p?: string }
}

export default async function ArquivoPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.p || '1'))
  const data = await getDevocionalList(page)

  // Agrupa por mês YYYY-MM
  const grouped: Record<string, typeof data.items> = {}
  if (data?.items) {
    for (const item of data.items) {
      const month = item.date.substring(0, 7)
      if (!grouped[month]) grouped[month] = []
      grouped[month].push(item)
    }
  }

  const totalPages = data?.total ? Math.ceil(data.total / 20) : 1

  return (
    <>
      <Header title="Arquivo" />
      <main className="pb-24 px-4 py-5">

        {!data?.items?.length && (
          <p className="text-center text-brand-muted font-sans text-sm py-12">
            Nenhum devocional encontrado.
          </p>
        )}

        {Object.entries(grouped).map(([month, items]) => (
          <section key={month} className="mb-6">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-brand-mid mb-3">
              {formatMonthPt(month)}
            </h2>
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/devocional/${item.date}`}
                    className="flex flex-col bg-white rounded-xl p-4 shadow-sm border border-brand-ocre
                               active:bg-brand-ocre transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-sans text-xs text-brand-muted">
                        {formatDatePt(item.date)}
                      </span>
                      {item.daily_word && (
                        <span className="font-sans text-xs bg-brand-mustard text-brand-dark
                                         px-2 py-0.5 rounded-full font-semibold">
                          {item.daily_word}
                        </span>
                      )}
                    </div>
                    <p className="font-serif text-sm text-brand-dark leading-snug line-clamp-2">
                      {item.weekly_theme}
                    </p>
                    <span className="font-sans text-xs text-brand-mid mt-1">
                      {item.bible_reference}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Paginação */}
        {totalPages > 1 && (
          <nav className="flex justify-center gap-4 pt-4 font-sans text-sm">
            {page > 1 && (
              <Link href={`/arquivo?p=${page - 1}`} className="text-brand-mid underline">
                ← Anterior
              </Link>
            )}
            <span className="text-brand-muted">{page} / {totalPages}</span>
            {page < totalPages && (
              <Link href={`/arquivo?p=${page + 1}`} className="text-brand-mid underline">
                Próxima →
              </Link>
            )}
          </nav>
        )}

      </main>
      <BottomNav active="arquivo" />
    </>
  )
}
