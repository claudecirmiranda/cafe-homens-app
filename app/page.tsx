import { getDevocional } from '@/lib/api'
import { formatDatePt, todayISO } from '@/lib/utils'
import DevotionalView from '@/components/DevotionalView'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'

export const revalidate = 3600

export default async function HomePage() {
  const devotional = await getDevocional()

  return (
    <>
      <Header showLogo />
      <main className="pb-24">
        {devotional ? (
          <DevotionalView devotional={devotional} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
            <img src="/logo.svg" alt="Café com Homens de Deus" className="w-40 h-auto" />
            <p className="font-serif text-brand-mid text-lg">
              O devocional de hoje ainda está sendo preparado.
            </p>
            <p className="font-sans text-brand-muted text-sm">
              {formatDatePt(todayISO())}
            </p>
            <Link
              href="/arquivo"
              className="font-sans text-sm text-brand-mustard underline underline-offset-2"
            >
              Ver devocionais anteriores
            </Link>
          </div>
        )}
      </main>
      <BottomNav active="home" />
    </>
  )
}
