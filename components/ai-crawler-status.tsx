'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import type { AICrawlerStatus } from '@/lib/types'

interface AICrawlerStatusProps {
  status: AICrawlerStatus
}

export function AICrawlerStatus({ status }: AICrawlerStatusProps) {
  const crawlers = [
    { name: 'GPTBot (ChatGPT)', key: 'gptbot' as const },
    { name: 'ClaudeBot (Claude)', key: 'claudebot' as const },
    { name: 'PerplexityBot', key: 'perplexitybot' as const },
    { name: 'GoogleBot', key: 'googlebot' as const },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">AI Crawler Access</h2>
        <p className="text-muted-foreground">
          Whether AI agents can currently access your website
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {crawlers.map((crawler) => {
          const isAllowed = status[crawler.key]

          return (
            <div
              key={crawler.key}
              className={`p-4 border rounded-lg ${
                isAllowed
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {isAllowed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${isAllowed ? 'text-green-100' : 'text-red-100'}`}>
                    {crawler.name}
                  </p>
                  <p className={`text-sm ${isAllowed ? 'text-green-200/70' : 'text-red-200/70'}`}>
                    {isAllowed ? 'Allowed' : 'Blocked'}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-blue-100 text-sm">
          <span className="font-semibold">Tip:</span> If any crawler is blocked, update your robots.txt to allow them. Most blocks are accidental.
        </p>
      </div>
    </div>
  )
}
