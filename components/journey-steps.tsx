'use client'

import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, Copy, Download, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GeneratedPagePreview } from '@/components/generated-page-preview'
import type { AnalysisResult, ActionItem } from '@/lib/types'
import type { JourneyProgress, JourneyStepId } from '@/lib/use-journey-progress'

interface JourneyStepsProps {
  result: AnalysisResult
  progress: JourneyProgress
}

interface StepCardProps {
  stepNumber: JourneyStepId
  icon: string
  title: string
  subtitle: string
  isComplete: boolean
  isOpen: boolean
  onToggle: () => void
  isLast?: boolean
  children: React.ReactNode
}

function StepCard({ stepNumber, icon, title, subtitle, isComplete, isOpen, onToggle, isLast, children }: StepCardProps) {
  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-7 top-20 bottom-0 w-px border-l-2 border-dashed border-primary/20 -mb-4 z-0" />
      )}

      <div className={`relative z-10 bg-card border rounded-2xl overflow-hidden transition-all duration-300 ${
        isComplete ? 'border-success/40' : isOpen ? 'border-primary/40' : 'border-border'
      }`}>
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isComplete ? 'bg-success' : isOpen ? 'bg-primary' : 'bg-border'}`} />

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="w-full text-left p-4 sm:p-6 hover:bg-secondary/20 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-xl font-bold transition-colors ${
              isComplete
                ? 'bg-success/15 text-success'
                : 'bg-primary/15 text-primary'
            }`}>
              {isComplete ? <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" /> : stepNumber}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 sm:gap-3 mb-1">
                <span className="text-xl sm:text-2xl">{icon}</span>
                <h3 className={`text-base sm:text-xl font-bold ${isComplete ? 'text-success' : 'text-foreground'}`}>
                  {title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{subtitle}</p>
            </div>

            <ChevronDown
              className={`flex-shrink-0 w-5 h-5 text-muted-foreground transition-transform duration-300 mt-3 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="px-4 sm:px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
            <div className="pl-0 sm:pl-[72px]">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ActionItemCard({
  action,
  isChecked,
  onToggle
}: {
  action: ActionItem
  isChecked: boolean
  onToggle: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const impactConfig = {
    'High': { color: 'border-l-destructive', badge: 'bg-destructive/15 text-destructive', glow: 'hover:shadow-destructive/10' },
    'Medium': { color: 'border-l-primary', badge: 'bg-primary/15 text-primary', glow: 'hover:shadow-primary/10' },
    'Low': { color: 'border-l-muted-foreground', badge: 'bg-muted/15 text-muted-foreground', glow: 'hover:shadow-muted/10' },
  }

  const config = impactConfig[action.impact as keyof typeof impactConfig] || impactConfig['Medium']

  const timeEstimates = { Easy: '5-15 min', Medium: '30-60 min', Hard: '2-4 hours' }
  const hasDetails = action.action.includes('\n')

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${config.color} border-l-4 ${
      isChecked ? 'bg-success/5 opacity-60' : 'bg-card hover:bg-secondary/30'
    } ${config.glow} hover:shadow-lg`}>
      <div
        className={`p-4 ${hasDetails ? 'cursor-pointer' : ''}`}
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
              isChecked
                ? 'bg-success border-success'
                : 'border-muted-foreground/40 hover:border-primary'
            }`}
            aria-label={isChecked ? 'Mark as not done' : 'Mark as done'}
          >
            {isChecked && <Check className="w-3 h-3 text-white" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${config.badge}`}>
                {action.impact} Impact
              </span>
              <span className="text-xs text-muted-foreground">
                {action.difficulty} · {timeEstimates[action.difficulty]}
              </span>
            </div>
            <p className={`font-medium leading-relaxed ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {action.action.split('\n')[0]}
            </p>
          </div>

          {hasDetails && (
            <button
              type="button"
              className="text-muted-foreground p-1 hover:text-foreground transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {isExpanded && hasDetails && (
        <div className="px-4 pb-4 pt-0 pl-12">
          <pre className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono">
            {action.action.split('\n').slice(1).join('\n')}
          </pre>
        </div>
      )}
    </div>
  )
}

const IMPACT_ORDER: Array<'High' | 'Medium' | 'Low'> = ['High', 'Medium', 'Low']
const IMPACT_CONFIG = {
  High: { label: '🔥 High Impact', description: 'Maximum ROI — do these first', color: 'text-destructive' },
  Medium: { label: '⚡ Medium Impact', description: 'Important improvements', color: 'text-primary' },
  Low: { label: '💡 Low Impact', description: 'Nice to have', color: 'text-muted-foreground' },
} as const

export function JourneySteps({ result, progress }: JourneyStepsProps) {
  const {
    websiteActions,
    checkedActions,
    toggleAction,
    robotsCopied,
    markRobotsCopied,
    markHtmlDownloaded,
    step1Complete,
    step2Complete,
    step3Complete,
    openStep,
    setOpenStep,
  } = progress

  const [showLowImpact, setShowLowImpact] = useState(false)
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [promptCopied, setPromptCopied] = useState(false)

  const previousStep1Complete = useRef(step1Complete)
  const previousStep2Complete = useRef(step2Complete)
  useEffect(() => {
    if (!previousStep1Complete.current && step1Complete && openStep === 1) {
      setOpenStep(2)
    }
    previousStep1Complete.current = step1Complete
  }, [step1Complete, openStep, setOpenStep])
  useEffect(() => {
    if (!previousStep2Complete.current && step2Complete && openStep === 2) {
      setOpenStep(3)
    }
    previousStep2Complete.current = step2Complete
  }, [step2Complete, openStep, setOpenStep])

  const toggleStep = (step: JourneyStepId) => {
    setOpenStep(openStep === step ? null : step)
  }

  const crawlers = [
    { name: 'GPTBot', key: 'gptbot' as const, fullName: 'ChatGPT' },
    { name: 'ClaudeBot', key: 'claudebot' as const, fullName: 'Claude' },
    { name: 'PerplexityBot', key: 'perplexitybot' as const, fullName: 'Perplexity' },
    { name: 'GoogleBot', key: 'googlebot' as const, fullName: 'Google' },
  ]

  const robotsTxt = `# Allow AI Crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

User-agent: *
Allow: /`

  const handleCopyRobots = async () => {
    await navigator.clipboard.writeText(robotsTxt)
    markRobotsCopied()
  }

  const generateAIPrompt = () => {
    const pendingActions = websiteActions.filter((_, i) => !checkedActions.has(i))
    const actionsList = pendingActions.map((a, i) => `${i + 1}. ${a.action.split('\n')[0]}`).join('\n')

    return `I need help implementing the following improvements for my website "${result.businessName}" (${result.mainCategory}${result.location ? ` in ${result.location}` : ''}):

## Current Issues Found
${result.missingElements?.map(e => `- ${e}`).join('\n') || 'No specific issues listed'}

## Actions to Implement
${actionsList}

## Context
- Business Type: ${result.siteType}
- AEO Score: ${result.aeoScore}/100
- Products/Services: ${result.productsOrServices?.slice(0, 5).join(', ') || 'Not specified'}

Please help me implement these changes to improve my website's visibility to AI agents like ChatGPT, Claude, and Perplexity. Focus on creating clear, structured content that AI can easily understand and cite.`
  }

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(generateAIPrompt())
    setPromptCopied(true)
    setTimeout(() => setPromptCopied(false), 2000)
  }

  const handleDownloadRobots = () => {
    const blob = new Blob([robotsTxt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'robots.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    markRobotsCopied()
  }

  const robotsTargetOrigin = result.url ? (() => {
    try { return new URL(result.url).origin } catch { return result.url }
  })() : 'yourdomain.com'

  return (
    <div className="space-y-4">
      <StepCard
        stepNumber={1}
        icon="🔗"
        title="Improve your content"
        subtitle="Tasks to make your site more visible to AI agents"
        isComplete={step1Complete}
        isOpen={openStep === 1}
        onToggle={() => toggleStep(1)}
      >
        <div className="space-y-4">
          {websiteActions.length > 0 && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{checkedActions.size} / {websiteActions.length}</span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-success transition-all duration-500 rounded-full"
                  style={{ width: `${(checkedActions.size / websiteActions.length) * 100}%` }}
                />
              </div>
            </>
          )}

          <div className="border border-primary/20 rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
            <button
              type="button"
              onClick={() => setShowPromptModal(!showPromptModal)}
              className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left min-w-0">
                  <p className="font-medium text-foreground text-sm sm:text-base">Generate prompt for your AI</p>
                  <p className="text-xs text-muted-foreground truncate">v0, Claude, Cursor, Copilot</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${showPromptModal ? 'rotate-180' : ''}`} />
            </button>

            {showPromptModal && (
              <div className="border-t border-primary/20 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                <p className="text-sm text-muted-foreground">
                  Copy this prompt and paste it into your AI assistant:
                </p>
                <div className="bg-background border border-border rounded-xl p-4 max-h-48 overflow-y-auto">
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                    {generateAIPrompt()}
                  </pre>
                </div>
                <Button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="w-full gap-2 bg-primary hover:bg-primary/90"
                >
                  {promptCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {promptCopied ? 'Copied to clipboard!' : 'Copy prompt'}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {IMPACT_ORDER.map((impact) => {
              const actionsForImpact = websiteActions.filter(a => a.impact === impact)
              if (actionsForImpact.length === 0) return null
              if (impact === 'Low' && !showLowImpact) return null

              const config = IMPACT_CONFIG[impact]

              return (
                <div key={impact} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold ${config.color}`}>{config.label}</h4>
                    <span className="text-xs text-muted-foreground">({actionsForImpact.length} {actionsForImpact.length === 1 ? 'task' : 'tasks'})</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                  <div className="space-y-2">
                    {actionsForImpact.map((action) => {
                      const originalIndex = websiteActions.indexOf(action)
                      return (
                        <ActionItemCard
                          key={originalIndex}
                          action={action}
                          isChecked={checkedActions.has(originalIndex)}
                          onToggle={() => toggleAction(originalIndex)}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {!showLowImpact && websiteActions.some(a => a.impact === 'Low') && (
              <button
                type="button"
                onClick={() => setShowLowImpact(true)}
                className="w-full text-sm text-muted-foreground hover:text-foreground py-3 border border-dashed border-border rounded-xl hover:border-primary/40 transition-colors"
              >
                + Show {websiteActions.filter(a => a.impact === 'Low').length} low-impact tasks
              </button>
            )}
          </div>
        </div>
      </StepCard>

      <StepCard
        stepNumber={2}
        icon="🤖"
        title="Allow AI crawlers"
        subtitle={`Upload robots.txt to ${robotsTargetOrigin}/robots.txt`}
        isComplete={step2Complete}
        isOpen={openStep === 2}
        onToggle={() => toggleStep(2)}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {crawlers.map((crawler) => {
              const isAllowed = result.aiCrawlerStatus?.[crawler.key] ?? true
              return (
                <div
                  key={crawler.key}
                  className={`p-3 sm:p-4 rounded-xl border transition-all ${
                    isAllowed
                      ? 'bg-success/10 border-success/30'
                      : 'bg-destructive/10 border-destructive/30'
                  }`}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    {isAllowed ? (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                    )}
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{crawler.name}</p>
                      <p className="text-xs text-muted-foreground">{crawler.fullName}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {result.aiCrawlerStatus && Object.values(result.aiCrawlerStatus).some(v => !v) && (
            <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl">
              <p className="text-warning text-sm">
                <span className="font-semibold">Warning:</span> Some AI crawlers are blocked. Update your robots.txt.
              </p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-foreground mb-3">Recommended robots.txt</p>
            <div className="bg-background border border-border rounded-xl overflow-hidden mb-3">
              <pre className="p-4 text-sm text-muted-foreground overflow-x-auto font-mono leading-relaxed">
                {robotsTxt}
              </pre>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant={robotsCopied ? 'secondary' : 'outline'}
                onClick={handleCopyRobots}
                className="flex-1 gap-2 h-11"
              >
                {robotsCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {robotsCopied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                onClick={handleDownloadRobots}
                className="flex-1 gap-2 h-11 bg-primary hover:bg-primary/90"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </StepCard>

      <StepCard
        stepNumber={3}
        icon="📥"
        title="Get your AEO page"
        subtitle="Download a ready-to-upload HTML page"
        isComplete={step3Complete}
        isOpen={openStep === 3}
        onToggle={() => toggleStep(3)}
        isLast
      >
        <GeneratedPagePreviewWithTracking
          result={result}
          onDownload={markHtmlDownloaded}
        />
      </StepCard>
    </div>
  )
}

function GeneratedPagePreviewWithTracking({
  result,
  onDownload
}: {
  result: AnalysisResult
  onDownload: () => void
}) {
  return (
    <div onClick={(e) => {
      const target = e.target as HTMLElement
      if (target.closest('button')?.textContent?.includes('Download')) {
        setTimeout(onDownload, 100)
      }
    }}>
      <GeneratedPagePreview result={result} />
    </div>
  )
}
