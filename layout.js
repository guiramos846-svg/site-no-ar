import './globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Frango Dourado — O melhor frango assado da cidade',
  description: 'Peça agora seu frango assado no Frango Dourado. Entrega rápida, sabor incomparável.',
  icons: { icon: '/favicon.ico' },
}

export const viewport = {
  themeColor: '#F5B90A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-neutral-50 text-neutral-900">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
