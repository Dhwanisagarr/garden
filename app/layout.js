import './globals.css'
import { Analytics } from '@vercel/analytics/next'

export const metadata = {
  metadataBase: new URL('https://mydahlia.vercel.app'),
  title: 'DHWANI — Your Private Botanical Memory Garden',
  description: 'DHWANI — Ordinary days, gently kept. A botanical scrapbook calendar for preserving everyday moments in bloom.',
  keywords: ['memory garden', 'botanical scrapbook', 'calendar memories', 'Dhwani', 'Dahlia', 'memory journal'],
  authors: [{ name: 'Dhwani' }],
  creator: 'Dhwani',
  publisher: 'Dhwani Memory Sanctuary',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'DHWANI — Your Private Botanical Memory Garden',
    description: 'Ordinary days, gently kept. A botanical scrapbook calendar for preserving everyday moments in bloom.',
    url: 'https://mydahlia.vercel.app',
    siteName: 'Dahlia Memory Garden',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DHWANI — Your Private Botanical Memory Garden',
    description: 'Ordinary days, gently kept. A botanical scrapbook calendar for preserving everyday moments in bloom.',
  },
  alternates: {
    canonical: 'https://mydahlia.vercel.app',
  },
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
