'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, MessageCircle, CheckCircle2 } from 'lucide-react'
import { SiteDetectionBanner } from '@/components/site-detection-banner'
import { AeoScoreCard } from '@/components/aeo-score-card'
import { AIResponse } from '@/components/ai-response'
import { JourneySteps } from '@/components/journey-steps'
import { useJourneyProgress, type JourneyProgress, type JourneyStepId } from '@/lib/use-journey-progress'
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
        className={`sticky top-0 z-30 backdrop-blur-md transition-all duration-200 lg:hidden ${
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
            <p className="font-semibold text-foreground text-sm">
              AI: before & after
            </p>
            <p className="text-xs text-muted-foreground truncate">
              See how AI agents will describe you
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

function BottomStepBar({
  result,
  progress,
  resultsRef,
}: {
  result: AnalysisResult
  progress: JourneyProgress
  resultsRef: React.RefObject<HTMLDivElement | null>
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = resultsRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '0px 0px -20% 0px', threshold: 0 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [resultsRef])

  const completion = [progress.step1Complete, progress.step2Complete, progress.step3Complete] as const

  const goToStep = (step: JourneyStepId) => {
    progress.setOpenStep(step)
    requestAnimationFrame(() => {
      const target = document.querySelector(`[data-step="${step}"]`)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/90 backdrop-blur-md border-t border-border animate-in slide-in-from-bottom-4 duration-300"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch gap-2 p-3 max-w-md mx-auto">
        {[1, 2, 3].map((n) => {
          const stepId = n as JourneyStepId
          const isComplete = completion[n - 1]
          const isOpen = progress.openStep === stepId
          const labels = ['Content', 'Crawlers', 'Page'] as const

          return (
            <button
              key={n}
              type="button"
              onClick={() => goToStep(stepId)}
              aria-current={isOpen ? 'step' : undefined}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border transition-all ${
                isOpen
                  ? 'border-primary bg-primary/10 text-primary'
                  : isComplete
                    ? 'border-success/30 bg-success/5 text-success'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold w-4 h-4 rounded-full border border-current flex items-center justify-center">
                    {n}
                  </span>
                )}
                <span className="text-xs font-semibold">{labels[n - 1]}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ResultsSection({ result }: ResultsSectionProps) {
  const progress = useJourneyProgress(result)
  const resultsRef = useRef<HTMLDivElement>(null)

  return (
    <section ref={resultsRef} className="border-t border-border">
      <StickyOverview result={result} stepsComplete={progress.stepsComplete} />

      <div className="py-12 md:py-20 px-4 pb-24 lg:pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <aside className="lg:col-span-4 lg:sticky lg:top-6 lg:self-start space-y-4 md:space-y-6">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <SiteDetectionBanner result={result} />
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <AeoScoreCard result={result} />
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <CollapsibleAIResponse result={result} />
              </div>
            </aside>

            <div className="mt-6 lg:mt-0 lg:col-span-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <JourneySteps result={result} progress={progress} />
            </div>
          </div>
        </div>
      </div>

      <BottomStepBar result={result} progress={progress} resultsRef={resultsRef} />
    </section>
  )
}
