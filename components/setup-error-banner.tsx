'use client'

import { AlertTriangle, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SetupErrorBannerProps {
  error: string
  details: string
  onDismiss: () => void
}

export function SetupErrorBanner({ error, details, onDismiss }: SetupErrorBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-amber-500">{error}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{details}</p>
            <a 
              href="https://vercel.com/dashboard/~/ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
            >
              Open Vercel AI Settings
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
