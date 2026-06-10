'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title?: string
  showBack?: boolean
  showLogo?: boolean
}

export default function Header({ title, showBack, showLogo }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 bg-brand-dark text-brand-beige shadow-md">
      <div className="flex items-center h-14 px-4 gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 rounded-full hover:bg-brand-mid transition-colors"
            aria-label="Voltar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {showLogo && (
          <Link href="/" className="flex items-center">
            <img
              src="/logo_nome.svg"
              alt="Café com Homens de Deus"
              className="h-8 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Link>
        )}

        {title && !showLogo && (
          <span className="text-base font-semibold font-sans truncate">{title}</span>
        )}
      </div>
    </header>
  )
}
