import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'The New SEO - Get Cited by AI Agents | AEO Tool',
  description: 'Google SEO got you on search engines. The New SEO gets you cited by AI agents like ChatGPT, Claude, and Perplexity. Analyze your website for AI visibility.',
  generator: 'v0.app',
  keywords: ['AEO', 'AI SEO', 'Agent Engine Optimization', 'ChatGPT optimization', 'AI visibility', 'AI citations', 'LLM optimization'],
  authors: [{ name: 'The New SEO' }],
  creator: 'The New SEO',
  publisher: 'The New SEO',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thenewseo.app',
    siteName: 'The New SEO',
    title: 'The New SEO - Get Cited by AI Agents',
    description: 'Analyze your website for AI agent visibility. Get optimized pages that AI assistants will cite and recommend.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The New SEO - AI Agent Optimization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The New SEO - Get Cited by AI Agents',
    description: 'Analyze your website for AI agent visibility. Get optimized pages that AI assistants will cite and recommend.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'The New SEO',
  description: 'AI Agent Optimization tool that analyzes websites for AI visibility and generates optimized pages.',
  url: 'https://thenewseo.app',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  creator: {
    '@type': 'Organization',
    name: 'The New SEO',
  },
  featureList: [
    'AI visibility analysis',
    'AEO score calculation',
    'Optimized page generation',
    'Schema.org integration',
    'ChatGPT optimization',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
