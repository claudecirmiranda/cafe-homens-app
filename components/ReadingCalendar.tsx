'use client'

import { useEffect, useState } from 'react'
import { getCalendar } from '@/lib/api'

interface Props {
  token: string
}

const DAYS_PT   = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

interface Cell {
  day: number | null
  date: string | null
  read: boolean
  isToday: boolean
  isFuture: boolean
}

function buildMonth(year: number, month: number, readSet: Set<string>, today: string): Cell[] {
  const firstDow  = new Date(year, month, 1).getDay()      // 0=Dom
  const daysTotal = new Date(year, month + 1, 0).getDate()
  const cells: Cell[] = []

  for (let i = 0; i < firstDow; i++) {
    cells.push({ day: null, date: null, read: false, isToday: false, isFuture: false })
  }
  for (let d = 1; d <= daysTotal; d++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      day: d,
      date,
      read: readSet.has(date),
      isToday: date === today,
      isFuture: date > today,
    })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, date: null, read: false, isToday: false, isFuture: false })
  }
  return cells
}

export default function ReadingCalendar({ token }: Props) {
  const [dates,   setDates]   = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCalendar(token)
      .then(setDates)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const today   = new Date().toISOString().slice(0, 10)
  const readSet = new Set(dates)
  const now     = new Date()

  // Últimos 3 meses incluindo o atual
  const months = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
      <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-brand-mid mb-4">
        Calendário de leitura
      </h2>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-brand-ocre/30 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {months.map(({ year, month }) => {
            const cells     = buildMonth(year, month, readSet, today)
            const readCount = cells.filter((c) => c.read).length

            return (
              <div key={`${year}-${month}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-sans text-xs font-semibold text-brand-dark">
                    {MONTHS_PT[month]}{year !== now.getFullYear() ? ` ${year}` : ''}
                  </p>
                  {readCount > 0 && (
                    <p className="font-sans text-xs text-brand-mustard font-semibold">
                      {readCount} {readCount === 1 ? 'dia' : 'dias'}
                    </p>
                  )}
                </div>

                {/* Cabeçalho dos dias da semana */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAYS_PT.map((d, i) => (
                    <div key={i} className="text-center font-sans text-xs text-brand-muted">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Grade de células */}
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((cell, i) => {
                    if (!cell.day) {
                      return <div key={i} />
                    }
                    return (
                      <div
                        key={i}
                        className={[
                          'aspect-square rounded-sm',
                          cell.read
                            ? 'bg-brand-mustard'
                            : cell.isFuture
                              ? 'bg-transparent'
                              : 'bg-brand-ocre/40',
                          cell.isToday
                            ? 'ring-2 ring-brand-dark ring-offset-1'
                            : '',
                        ].join(' ')}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Legenda */}
      {!loading && (
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-brand-ocre">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-brand-mustard" />
            <span className="font-sans text-xs text-brand-muted">Lido</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-brand-ocre/40" />
            <span className="font-sans text-xs text-brand-muted">Não lido</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <p className="font-sans text-xs text-brand-muted">
              Total: <span className="font-semibold text-brand-dark">{dates.length}</span> dias
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
