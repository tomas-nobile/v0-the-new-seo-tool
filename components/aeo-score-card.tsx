'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { AnalysisResult } from '@/lib/types'

interface AeoScoreCardProps {
  result: AnalysisResult
}

function getScoreColor(score: number): string {
  if (score <= 40) return 'text-destructive'
  if (score <= 70) return 'text-warning'
  return 'text-success'
}

function getScoreStrokeColor(score: number): string {
  if (score <= 40) return 'stroke-destructive'
  if (score <= 70) return 'stroke-warning'
  return 'stroke-success'
}

function getBarColor(score: number): string {
  if (score <= 40) return 'bg-destructive'
  if (score <= 70) return 'bg-warning'
  return 'bg-success'
}

function getScoreLabel(score: number): { label: string; icon: typeof TrendingUp } {
  if (score <= 30) return { label: 'Critical', icon: TrendingDown }
  if (score <= 50) return { label: 'Needs Work', icon: TrendingDown }
  if (score <= 70) return { label: 'Getting There', icon: Minus }
  if (score <= 85) return { label: 'Good', icon: TrendingUp }
  return { label: 'Excellent', icon: TrendingUp }
}

const dimensions = [
  { key: 'contentClarity', label: 'Content Clarity', icon: '📝' },
  { key: 'entityCoverage', label: 'Entity Coverage', icon: '🏷️' },
  { key: 'trustSignals', label: 'Trust Signals', icon: '✅' },
  { key: 'answerReadiness', label: 'Answer Readiness', icon: '💬' },
] as const

export function AeoScoreCard({ result }: AeoScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [animatedDimensions, setAnimatedDimensions] = useState<Record<string, number>>({
    contentClarity: 0,
    entityCoverage: 0,
    trustSignals: 0,
    answerReadiness: 0,
  })

  useEffect(() => {
    const scoreInterval = setInterval(() => {
      setAnimatedScore((prev) => {
        if (prev >= result.aeoScore) {
          clearInterval(scoreInterval)
          return result.aeoScore
        }
        return prev + 1
      })
    }, 15)

    const dimensionIntervals = dimensions.map((dim) => {
      return setInterval(() => {
        setAnimatedDimensions((prev) => {
          const targetScore = result.dimensions[dim.key].score
          if (prev[dim.key] >= targetScore) {
            return prev
          }
          return { ...prev, [dim.key]: prev[dim.key] + 1 }
        })
      }, 20)
    })

    return () => {
      clearInterval(scoreInterval)
      dimensionIntervals.forEach(clearInterval)
    }
  }, [result])

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference
  const scoreInfo = getScoreLabel(result.aeoScore)
  const ScoreIcon = scoreInfo.icon

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <h3 className="text-lg font-semibold text-foreground">AI Visibility Score</h3>
        <p className="text-sm text-muted-foreground">How well AI agents understand your business</p>
      </div>

      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Circular Score */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative w-44 h-44">
              {/* Background glow */}
              <div className={`absolute inset-4 rounded-full blur-xl opacity-30 ${
                result.aeoScore <= 40 ? 'bg-destructive' : 
                result.aeoScore <= 70 ? 'bg-warning' : 'bg-success'
              }`} />
              
              <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
                {/* Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-secondary"
                />
                {/* Progress */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={`${getScoreStrokeColor(result.aeoScore)} transition-all duration-700 ease-out`}
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className={`text-5xl font-bold tabular-nums ${getScoreColor(result.aeoScore)}`}>
                  {animatedScore}
                </span>
                <span className="text-muted-foreground text-sm mt-1">/ 100</span>
              </div>
            </div>

            {/* Score label */}
            <div className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-full ${
              result.aeoScore <= 40 ? 'bg-destructive/10 text-destructive' :
              result.aeoScore <= 70 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
            }`}>
              <ScoreIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">{scoreInfo.label}</span>
            </div>
          </div>

          {/* Dimension Bars */}
          <div className="flex-1 space-y-5">
            {dimensions.map((dim, idx) => {
              const score = result.dimensions[dim.key].score
              const feedback = result.dimensions[dim.key].feedback
              const animatedValue = animatedDimensions[dim.key]

              return (
                <div 
                  key={dim.key}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{dim.icon}</span>
                      <span className="font-medium text-foreground">{dim.label}</span>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${getScoreColor(score)}`}>
                      {animatedValue}%
                    </span>
                  </div>
                  
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(score)}`}
                      style={{ width: `${animatedValue}%` }}
                    />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{feedback}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
