import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Joshua',
  description: 'Created with Joshua',
  generator: 'Joshua.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
