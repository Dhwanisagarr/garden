import './globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'DAISY — your private memory garden',
  description: 'A botanical scrapbook calendar for preserving everyday moments.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Toaster position="bottom-center" toastOptions={{ style: { fontFamily: 'Fraunces, serif' } }} />
      </body>
    </html>
  )
}
