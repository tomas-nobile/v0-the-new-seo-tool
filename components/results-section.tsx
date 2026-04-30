'use client'

import { SiteDetectionBanner } from '@/components/site-detection-banner'
import { AeoScoreCard } from '@/components/aeo-score-card'
import { AIResponse } from '@/components/ai-response'
import { JourneySteps } from '@/components/journey-steps'
import type { AnalysisResult } from '@/lib/types'

interface ResultsSectionProps {
  result: AnalysisResult
}

export function ResultsSection({ result }: ResultsSectionProps) {
  return (
    <section className="py-24 px-4 border-t border-border">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header: Site Detection + Score + AI Response Comparison */}
        <div className="space-y-8">
          {/* Site Detection Banner */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SiteDetectionBanner result={result} />
          </div>

          {/* AEO Score */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <AeoScoreCard result={result} />
          </div>

          {/* What AI Sees Now vs Will See */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <AIResponse result={result} />
          </div>
        </div>

        {/* 3-Step Journey */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <JourneySteps result={result} />
        </div>

      </div>
    </section>
  )
}
