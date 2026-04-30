'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2, Sparkles } from 'lucide-react'

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
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.15_0_0)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.15_0_0)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)]" />
      
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Agent Engine Optimization</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 text-balance leading-[1.1]">
          <span className="text-foreground">The</span>{' '}
          <span className="gradient-text">New SEO</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-xl mx-auto text-balance leading-relaxed">
          Google SEO got you on search engines. The New SEO gets you{' '}
          <span className="text-foreground font-medium">cited by AI agents</span>.
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-6">
          <div className="relative flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (validationError) setValidationError(null)
                }}
                placeholder="yourwebsite.com"
                className="w-full h-14 px-5 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                disabled={isAnalyzing}
              />
              <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] glow-primary"
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
          
          {(validationError || error) && (
            <p className="mt-3 text-sm text-destructive text-left">
              {validationError || error}
            </p>
          )}
        </form>

        <p className="text-sm text-muted-foreground">
          Free analysis. No signup required.
        </p>

        {isAnalyzing && loadingMessage && (
          <div className="mt-16 animate-fade-in-up">
            <div className="w-full max-w-sm mx-auto h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                style={{ 
                  width: '70%',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} 
              />
            </div>
            <p className="mt-4 text-muted-foreground">{loadingMessage}</p>
          </div>
        )}
      </div>
    </section>
  )
}
