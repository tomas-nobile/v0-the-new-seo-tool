'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { AnalysisResult, ActionItem } from './types'

export type JourneyStepId = 1 | 2 | 3
export type OpenStep = JourneyStepId | null

export interface JourneyProgress {
  websiteActions: ActionItem[]
  checkedActions: Set<number>
  toggleAction: (index: number) => void
  robotsCopied: boolean
  markRobotsCopied: () => void
  htmlDownloaded: boolean
  markHtmlDownloaded: () => void
  step1Complete: boolean
  step2Complete: boolean
  step3Complete: boolean
  stepsComplete: number
  openStep: OpenStep
  setOpenStep: (step: OpenStep) => void
}

export function useJourneyProgress(result: AnalysisResult): JourneyProgress {
  const [checkedActions, setCheckedActions] = useState<Set<number>>(new Set())
  const [robotsCopied, setRobotsCopied] = useState(false)
  const [htmlDownloaded, setHtmlDownloaded] = useState(false)
  const [openStep, setOpenStep] = useState<OpenStep>(1)

  useEffect(() => {
    const saved = localStorage.getItem(`aeo-actions-${result.businessName}`)
    if (saved) {
      try {
        setCheckedActions(new Set(JSON.parse(saved)))
      } catch {
        setCheckedActions(new Set())
      }
    } else {
      setCheckedActions(new Set())
    }
    setRobotsCopied(localStorage.getItem(`aeo-robots-${result.businessName}`) === 'true')
    setHtmlDownloaded(localStorage.getItem(`aeo-html-${result.businessName}`) === 'true')
    setOpenStep(1)
  }, [result.businessName])

  const websiteActions = useMemo(() => {
    return (result.actionPlan || []).filter(action => {
      const text = action.action.toLowerCase()
      return !text.includes('robots.txt') && (
        text.includes('faq') || text.includes('about') || text.includes('review') ||
        text.includes('testimonial') || text.includes('product') || text.includes('pricing') ||
        text.includes('contact') || text.includes('description') || text.includes('content') ||
        action.priority === 'QUICK WIN' || action.priority === 'THIS WEEK'
      )
    })
  }, [result.actionPlan])

  const toggleAction = useCallback((index: number) => {
    setCheckedActions(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      localStorage.setItem(`aeo-actions-${result.businessName}`, JSON.stringify([...next]))
      return next
    })
  }, [result.businessName])

  const markRobotsCopied = useCallback(() => {
    setRobotsCopied(true)
    localStorage.setItem(`aeo-robots-${result.businessName}`, 'true')
  }, [result.businessName])

  const markHtmlDownloaded = useCallback(() => {
    setHtmlDownloaded(true)
    localStorage.setItem(`aeo-html-${result.businessName}`, 'true')
  }, [result.businessName])

  const step1Complete = websiteActions.length > 0 && checkedActions.size === websiteActions.length
  const step2Complete = robotsCopied
  const step3Complete = htmlDownloaded
  const stepsComplete = [step1Complete, step2Complete, step3Complete].filter(Boolean).length

  return {
    websiteActions,
    checkedActions,
    toggleAction,
    robotsCopied,
    markRobotsCopied,
    htmlDownloaded,
    markHtmlDownloaded,
    step1Complete,
    step2Complete,
    step3Complete,
    stepsComplete,
    openStep,
    setOpenStep,
  }
}
