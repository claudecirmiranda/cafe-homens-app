import type { Metadata, Viewport } from 'next'
import './globals.css'
import InstallBanner from '@/components/InstallBanner'

export const metadata: Metadata = {
  title: { default: 'Café com Homens de Deus', template: '%s · Café com Homens de Deus' },
  description: 'Devocional diário para homens que buscam a Deus',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Café Homens',
    startupImage: '/icons/icon-512.png',
  },
  formatDetection: { telephone: false },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#5A2F1A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Café Homens" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="max-w-lg mx-auto min-h-screen">
        {children}
        <InstallBanner />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__pwaInstallEvent = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__pwaInstallEvent = e;
              });
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { 
                    scope: '/', 
                    updateViaCache: 'none' 
                  })                  
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}