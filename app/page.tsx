'use client'

import { useState, useRef } from 'react'
import { HeroSection } from '@/components/hero-section'
import { StatsSection } from '@/components/stats-section'
import { HowItWorksSection } from '@/components/how-it-works-section'
import { ResultsSection } from '@/components/results-section'
import { Footer } from '@/components/footer'
import { SetupErrorBanner } from '@/components/setup-error-banner'
import type { AnalysisResult } from '@/lib/types'

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [setupError, setSetupError] = useState<{ error: string; details: string } | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true)
    setError(null)
    setSetupError(null)
    setResult(null)

    const loadingMessages = [
      'Scanning your website...',
      'Detecting site type...',
      'Analyzing AI visibility...',
      'Generating your page...',
    ]

    let messageIndex = 0
    setLoadingMessage(loadingMessages[0])
    
    const messageInterval = setInterval(() => {
      messageIndex = Math.min(messageIndex + 1, loadingMessages.length - 1)
      setLoadingMessage(loadingMessages[messageIndex])
    }, 3000)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.isSetupError) {
          setSetupError({ error: data.error, details: data.details })
          return
        }
        throw new Error(data.error || 'Failed to analyze website')
      }

      setResult(data)
      
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      clearInterval(messageInterval)
      setIsAnalyzing(false)
      setLoadingMessage('')
    }
  }

  return (
    <main className="min-h-screen">
      {setupError && (
        <SetupErrorBanner 
          error={setupError.error} 
          details={setupError.details}
          onDismiss={() => setSetupError(null)}
        />
      )}
      <HeroSection 
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        loadingMessage={loadingMessage}
        error={error}
      />
      <StatsSection />
      <HowItWorksSection />
      
      {result && (
        <div ref={resultsRef}>
          <ResultsSection result={result} />
        </div>
      )}
      
      <Footer />
    </main>
  )
}
