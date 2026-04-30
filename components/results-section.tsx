'use client'

import { SiteDetectionBanner } from '@/components/site-detection-banner'
import { AeoScoreCard } from '@/components/aeo-score-card'
import { BeforeAfterComparison } from '@/components/before-after-comparison'
import { GeneratedPagePreview } from '@/components/generated-page-preview'
import { MissingElements } from '@/components/missing-elements'
import { QuickWinsBanner } from '@/components/quick-wins-banner'
import { ActionPlan } from '@/components/action-plan'
import { AICrawlerStatus } from '@/components/ai-crawler-status'
import type { AnalysisResult } from '@/lib/types'

interface ResultsSectionProps {
  result: AnalysisResult
}

export function ResultsSection({ result }: ResultsSectionProps) {
  return (
    <section className="py-24 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Quick Wins Banner */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <QuickWinsBanner 
            count={result.quickWinsCount || 0} 
            businessName={result.businessName}
          />
        </div>

        {/* Section 1: Site Detection Banner */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-75">
          <SiteDetectionBanner result={result} />
        </div>

        {/* Section 2: Missing Elements */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <MissingElements elements={result.missingElements} />
        </div>

        {/* Section 3: AEO Score */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-225">
          <AeoScoreCard result={result} />
        </div>

        {/* Section 4: Action Plan */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <ActionPlan actions={result.actionPlan || []} />
        </div>

        {/* Section 5: AI Crawler Status */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-375">
          {result.aiCrawlerStatus && <AICrawlerStatus status={result.aiCrawlerStatus} />}
        </div>

        {/* Section 6: Before/After AI Response */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-450">
          <BeforeAfterComparison result={result} />
        </div>

        {/* Section 7: Generated Page Preview */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-525">
          <GeneratedPagePreview result={result} />
        </div>
      </div>
    </section>
  )
}
