const MONTHS = [
  'janeiro','fevereiro','março','abril','maio','junho',
  'julho','agosto','setembro','outubro','novembro','dezembro',
]

export function formatDatePt(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${day} de ${MONTHS[month - 1]} de ${year}`
}

export function formatMonthPt(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  return `${MONTHS[month - 1].charAt(0).toUpperCase() + MONTHS[month - 1].slice(1)} ${year}`
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function buildWhatsAppText(theme: string, verse: string, ref: string, url: string): string {
  return encodeURIComponent(`☕ *Café com Homens de Deus*\n\n*${theme}*\n\n"${verse}"\n— ${ref}\n\n${url}`)
}
