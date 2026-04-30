'use client'

import { SiteDetectionBanner } from '@/components/site-detection-banner'
import { AeoScoreCard } from '@/components/aeo-score-card'
import { BeforeAfterComparison } from '@/components/before-after-comparison'
import { GeneratedPagePreview } from '@/components/generated-page-preview'
import { AIQuestionDemo } from '@/components/ai-question-demo'
import type { AnalysisResult } from '@/lib/types'

interface ResultsSectionProps {
  result: AnalysisResult
}

export function ResultsSection({ result }: ResultsSectionProps) {
  return (
    <section className="py-24 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section 1: Site Detection Banner */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <SiteDetectionBanner result={result} />
        </div>

        {/* Section 2: AEO Score */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <AeoScoreCard result={result} />
        </div>

        {/* Section 3: Interactive AI Question Demo */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              What is the best {result.mainCategory}?
            </h2>
            <p className="text-muted-foreground">
              See how AI agents respond before and after optimization
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <AIQuestionDemo 
              businessName={result.businessName}
              category={result.mainCategory}
              isOptimized={false}
            />
            <AIQuestionDemo 
              businessName={result.businessName}
              category={result.mainCategory}
              isOptimized={true}
            />
          </div>
        </div>

        {/* Section 4: Before/After AI Response */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-450">
          <BeforeAfterComparison result={result} />
        </div>

        {/* Section 5: Generated Page Preview */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
          <GeneratedPagePreview result={result} />
        </div>
      </div>
    </section>
  )
}
