'use client'

import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import type { AnalysisResult } from '@/lib/types'

interface BeforeAfterComparisonProps {
  result: AnalysisResult
}

export function BeforeAfterComparison({ result }: BeforeAfterComparisonProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">What AI agents see</h3>
      <p className="text-muted-foreground mb-8">
        Compare how AI agents respond to questions about your business now vs. after optimization
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Before Card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-destructive/5 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <span className="font-medium text-destructive">What AI sees now</span>
          </div>
          <div className="p-6">
            {/* Simulated ChatGPT-style response */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">ChatGPT</div>
                <p className="text-foreground/80 leading-relaxed">{result.whatAISeeNow}</p>
              </div>
            </div>
          </div>
        </div>

        {/* After Card */}
        <div className="bg-card border border-primary/30 rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <div className="relative px-6 py-4 border-b border-primary/30 bg-primary/10 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span className="font-medium text-primary">What AI will see after</span>
          </div>
          <div className="relative p-6">
            {/* Simulated ChatGPT-style response */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-primary/70 mb-2">ChatGPT</div>
                <p className="text-foreground leading-relaxed">{result.whatAIWillSee}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
