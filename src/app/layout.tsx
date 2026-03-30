import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import { Providers } from '@/components/Providers'

export const viewport: Viewport = {
  themeColor: '#9333ea',
}

export const metadata: Metadata = {
  title: 'Postea',
  description: 'App de Geolocalización y Gamificación',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Postea',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 pb-20 max-w-md mx-auto min-h-screen relative shadow-2xl overflow-x-hidden">
        <Providers>
          <main className="min-h-screen">
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  )
}
