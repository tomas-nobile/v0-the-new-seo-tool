import { ArrowDown, MessageCircle } from 'lucide-react'
import type { AnalysisResult } from '@/lib/types'
import { LiveEvidence } from '@/components/live-evidence'

interface AIResponseProps {
  result: AnalysisResult
  userUrl?: string
}

export function AIResponse({ result, userUrl }: AIResponseProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">What AI Agents Say About Your Business</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        This is how AI assistants like ChatGPT, Claude, and Perplexity currently respond to questions about your business — and how they will respond after AEO optimization.
      </p>

      {result.liveSearchEvidence && (
        <div className="mt-2 pb-2 border-b border-border">
          <LiveEvidence evidence={result.liveSearchEvidence} userUrl={userUrl} />
        </div>
      )}

      <div className="flex flex-col gap-3 mt-6">
        <div className="border border-border rounded-xl p-5 bg-card hover:bg-secondary/30 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
              NOW
            </div>
            <h4 className="font-semibold text-foreground">How AI sees you today</h4>
          </div>
          <div className="bg-background border border-border rounded-lg p-4 text-sm text-muted-foreground italic space-y-2">
            <p>{result.whatAISeeNow}</p>
          </div>
        </div>

        <div className="flex justify-center" aria-hidden>
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <ArrowDown className="w-4 h-4 text-primary" />
          </div>
        </div>

        <div className="border border-primary/30 rounded-xl p-5 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg hover:shadow-primary/10 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-white">
              ✓
            </div>
            <h4 className="font-semibold text-foreground">How AI will see you after AEO</h4>
          </div>
          <div className="bg-background border border-primary/20 rounded-lg p-4 text-sm text-foreground space-y-2">
            <p>{result.whatAIWillSee}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
