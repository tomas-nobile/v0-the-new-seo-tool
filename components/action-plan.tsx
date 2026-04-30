'use client'

import { CheckCircle2, Lightbulb, Target, Clock } from 'lucide-react'
import type { ActionItem } from '@/lib/types'

interface ActionPlanProps {
  actions: ActionItem[]
}

const priorityConfig = {
  'QUICK WIN': {
    icon: Lightbulb,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  'THIS WEEK': {
    icon: Target,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  'LONG TERM': {
    icon: Clock,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
}

const difficultyConfig = {
  Easy: 'text-green-400',
  Medium: 'text-yellow-400',
  Hard: 'text-red-400',
}

export function ActionPlan({ actions }: ActionPlanProps) {
  if (!actions || actions.length === 0) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Actionable Steps</h2>
        <p className="text-muted-foreground">
          Specific, prioritized actions to improve your AI visibility
        </p>
      </div>

      <div className="space-y-4">
        {actions.map((action, index) => {
          const config = priorityConfig[action.priority]
          const Icon = config.icon

          return (
            <div
              key={index}
              className={`p-4 border rounded-lg ${config.bgColor} ${config.borderColor} animate-in fade-in slide-in-from-bottom-2`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-1`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`${config.color} font-bold text-sm`}>
                      {action.priority}
                    </span>
                    <span className={`${difficultyConfig[action.difficulty]} font-semibold text-xs`}>
                      {action.difficulty}
                    </span>
                  </div>
                  <p className="text-foreground font-semibold mb-2 whitespace-pre-wrap">
                    {action.action}
                  </p>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground text-sm">
                      {action.impact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
