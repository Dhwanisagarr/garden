import './globals.css'
import { Analytics } from '@vercel/analytics/next'

export const metadata = {
  title: 'DHWANI — your private memory garden',
  description: 'DHWANI — Ordinary days, gently kept. A botanical scrapbook calendar for preserving everyday moments.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
