'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'

interface HeroSectionProps {
  onAnalyze: (url: string) => void
  isAnalyzing: boolean
  loadingMessage: string
  error: string | null
}

export function HeroSection({ onAnalyze, isAnalyzing, loadingMessage, error }: HeroSectionProps) {
  const [url, setUrl] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateUrl = (value: string): boolean => {
    if (!value.trim()) {
      setValidationError('Please enter a URL')
      return false
    }
    
    try {
      let urlToCheck = value.trim()
      if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
        urlToCheck = 'https://' + urlToCheck
      }
      new URL(urlToCheck)
      setValidationError(null)
      return true
    } catch {
      setValidationError('Please enter a valid URL')
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateUrl(url)) {
      let urlToAnalyze = url.trim()
      if (!urlToAnalyze.startsWith('http://') && !urlToAnalyze.startsWith('https://')) {
        urlToAnalyze = 'https://' + urlToAnalyze
      }
      onAnalyze(urlToAnalyze)
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance">
          The New SEO
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto text-balance">
          Google SEO got you on search engines.{' '}
          <span className="text-foreground">The New SEO gets you cited by AI agents.</span>
        </p>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (validationError) setValidationError(null)
                }}
                placeholder="Enter your website URL"
                className="w-full h-14 px-5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                disabled={isAnalyzing}
              />
              {(validationError || error) && (
                <p className="absolute -bottom-6 left-0 text-sm text-destructive">
                  {validationError || error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  Analyze
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </form>

        {isAnalyzing && loadingMessage && (
          <div className="mt-12">
            <div className="w-full max-w-md mx-auto h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
            <p className="mt-4 text-muted-foreground animate-pulse">{loadingMessage}</p>
          </div>
        )}
      </div>
    </section>
  )
}
