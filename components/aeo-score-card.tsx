'use client'

import { useEffect, useState } from 'react'
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

const dimensions = [
  { key: 'contentClarity', label: 'Content Clarity', description: 'Can AI agents understand what you do?' },
  { key: 'entityCoverage', label: 'Entity Coverage', description: 'Are your products/services well defined?' },
  { key: 'trustSignals', label: 'Trust Signals', description: 'Reviews, about page, contact info' },
  { key: 'answerReadiness', label: 'Answer Readiness', description: 'Do you answer questions people ask AI?' },
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
    // Animate main score
    const scoreInterval = setInterval(() => {
      setAnimatedScore((prev) => {
        if (prev >= result.aeoScore) {
          clearInterval(scoreInterval)
          return result.aeoScore
        }
        return prev + 1
      })
    }, 20)

    // Animate dimension scores
    const dimensionIntervals = dimensions.map((dim) => {
      return setInterval(() => {
        setAnimatedDimensions((prev) => {
          const targetScore = result.dimensions[dim.key].score
          if (prev[dim.key] >= targetScore) {
            return prev
          }
          return { ...prev, [dim.key]: prev[dim.key] + 1 }
        })
      }, 25)
    })

    return () => {
      clearInterval(scoreInterval)
      dimensionIntervals.forEach(clearInterval)
    }
  }, [result])

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  return (
    <div className="bg-card border border-border rounded-xl p-8">
      <h3 className="text-xl font-semibold mb-8">AI Visibility Score</h3>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Circular Score */}
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-secondary"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`${getScoreStrokeColor(result.aeoScore)} transition-all duration-1000`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-bold ${getScoreColor(result.aeoScore)}`}>
                {animatedScore}
              </span>
              <span className="text-muted-foreground text-sm">out of 100</span>
            </div>
          </div>
        </div>

        {/* Dimension Bars */}
        <div className="flex-1 space-y-6">
          {dimensions.map((dim) => {
            const score = result.dimensions[dim.key].score
            const feedback = result.dimensions[dim.key].feedback
            const animatedValue = animatedDimensions[dim.key]

            return (
              <div key={dim.key}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium">{dim.label}</span>
                    <span className="text-muted-foreground text-sm ml-2">— {dim.description}</span>
                  </div>
                  <span className={`font-semibold ${getScoreColor(score)}`}>{animatedValue}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${getBarColor(score)}`}
                    style={{ width: `${animatedValue}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">{feedback}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
