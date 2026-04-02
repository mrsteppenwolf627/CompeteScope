import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CompeteScope — AI Competitive Intelligence',
  description:
    'Monitor competitors, track changes, and get weekly AI-powered digests. Built for early-stage SaaS founders.',
  keywords: ['competitive intelligence', 'competitor monitoring', 'SaaS analytics', 'AI analysis'],
  openGraph: {
    title: 'CompeteScope — AI Competitive Intelligence',
    description: 'Monitor competitors and get weekly AI-powered insights.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-[#0f172a] text-white`}>
        {children}
      </body>
    </html>
  )
}
