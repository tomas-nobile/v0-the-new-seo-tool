'use client'

import { Zap } from 'lucide-react'

interface QuickWinsBannerProps {
  count: number
  businessName: string
}

export function QuickWinsBanner({ count, businessName }: QuickWinsBannerProps) {
  if (count === 0) return null

  return (
    <div className="mb-8 p-4 bg-gradient-to-r from-purple-900/20 to-purple-800/10 border border-purple-500/30 rounded-lg">
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5 text-purple-400" />
        <div>
          <p className="text-purple-100 font-semibold">
            We found {count} quick {count === 1 ? 'win' : 'wins'} for {businessName}
          </p>
          <p className="text-purple-200/70 text-sm">
            These are actions you can take in under an hour to improve AI visibility
          </p>
        </div>
      </div>
    </div>
  )
}
