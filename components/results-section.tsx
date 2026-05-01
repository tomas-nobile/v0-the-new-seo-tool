'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { SiteDetectionBanner } from '@/components/site-detection-banner'
import { AeoScoreCard } from '@/components/aeo-score-card'
import { AIResponse } from '@/components/ai-response'
import { JourneySteps } from '@/components/journey-steps'
import { useJourneyProgress } from '@/lib/use-journey-progress'
import type { AnalysisResult } from '@/lib/types'

interface ResultsSectionProps {
  result: AnalysisResult
}

function getScoreColor(score: number): string {
  if (score <= 40) return 'text-destructive'
  if (score <= 70) return 'text-warning'
  return 'text-success'
}

function StickyOverview({ result, stepsComplete }: { result: AnalysisResult; stepsComplete: number }) {
  const [scrolled, setScrolled] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: '-1px 0px 0px 0px', threshold: [1] }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinelRef} className="h-px" aria-hidden />
      <div
        className={`sticky top-0 z-30 backdrop-blur-md transition-all duration-200 ${
          scrolled
            ? 'bg-background/85 border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3 sm:gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-semibold text-foreground truncate">
              {result.businessName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {result.mainCategory}
              {result.location ? ` · ${result.location}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-xl sm:text-2xl font-bold tabular-nums ${getScoreColor(result.aeoScore)}`}>
              {result.aeoScore}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`w-2 h-2 rounded-full transition-colors ${
                  n <= stepsComplete ? 'bg-success' : 'bg-secondary'
                }`}
                aria-hidden
              />
            ))}
            <span className="text-xs text-muted-foreground tabular-nums ml-1">
              {stepsComplete}/3
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

function CollapsibleAIResponse({ result }: { result: AnalysisResult }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm sm:text-base">
              How AI sees you — before & after
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Compare current AI responses vs after AEO optimization
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-border animate-in slide-in-from-top-2 duration-200">
          <AIResponse result={result} />
        </div>
      )}
    </div>
  )
}

export function ResultsSection({ result }: ResultsSectionProps) {
  const progress = useJourneyProgress(result)

  return (
    <section className="border-t border-border">
      <StickyOverview result={result} stepsComplete={progress.stepsComplete} />

      <div className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SiteDetectionBanner result={result} />
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <AeoScoreCard result={result} />
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <CollapsibleAIResponse result={result} />
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 pt-2">
            <JourneySteps result={result} progress={progress} />
          </div>
        </div>
      </div>
    </section>
  )
}
