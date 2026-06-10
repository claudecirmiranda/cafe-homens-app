'use client'

import Link from 'next/link'

type Tab = 'home' | 'arquivo' | 'perfil'

const tabs = [
  {
    id: 'home' as Tab,
    href: '/',
    label: 'Hoje',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-brand-mustard' : 'text-brand-muted'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2}
          d={active
            ? 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
            : 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
          }
        />
      </svg>
    ),
  },
  {
    id: 'arquivo' as Tab,
    href: '/arquivo',
    label: 'Arquivo',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-brand-mustard' : 'text-brand-muted'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2}
          d={active
            ? 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
            : 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
          }
        />
      </svg>
    ),
  },
  {
    id: 'perfil' as Tab,
    href: '/perfil',
    label: 'Perfil',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-brand-mustard' : 'text-brand-muted'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
]

export default function BottomNav({ active }: { active: Tab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-brand-ocre safe-bottom">
      <div className="flex">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors
              ${active === tab.id ? 'text-brand-mustard' : 'text-brand-muted'}`}
          >
            {tab.icon(active === tab.id)}
            <span className="text-xs font-sans">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
