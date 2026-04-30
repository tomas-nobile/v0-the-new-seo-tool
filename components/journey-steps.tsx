'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Lightbulb, Target, Clock, Copy, Download, Check, ChevronDown, ChevronUp, Bot, Crosshair, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BeforeAfterComparison } from '@/components/before-after-comparison'
import { GeneratedPagePreview } from '@/components/generated-page-preview'
import type { AnalysisResult, ActionItem } from '@/lib/types'

interface JourneyStepsProps {
  result: AnalysisResult
}

// Step card wrapper component
function StepCard({ 
  stepNumber, 
  icon, 
  title, 
  subtitle, 
  isComplete, 
  children 
}: { 
  stepNumber: number
  icon: string
  title: string
  subtitle: string
  isComplete: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      {/* Vertical dotted line connector */}
      {stepNumber < 3 && (
        <div className="absolute left-6 top-16 bottom-0 w-px border-l-2 border-dashed border-primary/30 -mb-16 z-0" />
      )}
      
      <div className={`relative z-10 bg-card border rounded-xl overflow-hidden transition-all duration-300 ${
        isComplete ? 'border-green-500/50' : 'border-border'
      }`}>
        {/* Purple left border */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isComplete ? 'bg-green-500' : 'bg-primary'}`} />
        
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Step number badge */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
              isComplete 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-primary/20 text-primary'
            }`}>
              {isComplete ? <CheckCircle2 className="w-6 h-6" /> : stepNumber}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{icon}</span>
                <h3 className={`text-xl font-bold ${isComplete ? 'text-green-400' : 'text-foreground'}`}>
                  {title}
                </h3>
              </div>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6 pt-2">
          {children}
        </div>
      </div>
    </div>
  )
}

// Action item with checkbox
function ActionItemCard({ 
  action, 
  index, 
  isChecked, 
  onToggle 
}: { 
  action: ActionItem
  index: number
  isChecked: boolean
  onToggle: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const priorityConfig = {
    'QUICK WIN': { color: 'border-l-green-500', badge: 'bg-green-500/20 text-green-400' },
    'THIS WEEK': { color: 'border-l-yellow-500', badge: 'bg-yellow-500/20 text-yellow-400' },
    'LONG TERM': { color: 'border-l-blue-500', badge: 'bg-blue-500/20 text-blue-400' },
  }
  
  const config = priorityConfig[action.priority] || priorityConfig['THIS WEEK']
  
  const timeEstimates = {
    Easy: '5-15 min',
    Medium: '30-60 min', 
    Hard: '2-4 hours',
  }

  return (
    <div 
      className={`border rounded-lg overflow-hidden transition-all ${config.color} border-l-4 ${
        isChecked ? 'bg-green-500/5 opacity-60' : 'bg-card'
      }`}
    >
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all mt-0.5 ${
              isChecked 
                ? 'bg-green-500 border-green-500' 
                : 'border-muted-foreground/50 hover:border-primary'
            }`}
          >
            {isChecked && <Check className="w-3 h-3 text-white" />}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${config.badge}`}>
                {action.priority}
              </span>
              <span className="text-xs text-muted-foreground">
                {action.difficulty} · {timeEstimates[action.difficulty]}
              </span>
            </div>
            <p className={`font-medium ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {action.action.split('\n')[0]}
            </p>
          </div>
          
          {action.action.includes('\n') && (
            <button className="text-muted-foreground p-1">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      
      {isExpanded && action.action.includes('\n') && (
        <div className="px-4 pb-4 pt-0 pl-12">
          <pre className="text-sm text-muted-foreground bg-background p-3 rounded overflow-x-auto whitespace-pre-wrap">
            {action.action.split('\n').slice(1).join('\n')}
          </pre>
          <p className="text-sm text-green-400 mt-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {action.impact}
          </p>
        </div>
      )}
    </div>
  )
}

export function JourneySteps({ result }: JourneyStepsProps) {
  // Step completion states
  const [checkedActions, setCheckedActions] = useState<Set<number>>(new Set())
  const [robotsCopied, setRobotsCopied] = useState(false)
  const [htmlDownloaded, setHtmlDownloaded] = useState(false)
  
  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`aeo-actions-${result.businessName}`)
    if (saved) {
      setCheckedActions(new Set(JSON.parse(saved)))
    }
    setRobotsCopied(localStorage.getItem(`aeo-robots-${result.businessName}`) === 'true')
    setHtmlDownloaded(localStorage.getItem(`aeo-html-${result.businessName}`) === 'true')
  }, [result.businessName])
  
  // Filter actions for Step 1 (website improvements only)
  const websiteActions = (result.actionPlan || []).filter(action => {
    const text = action.action.toLowerCase()
    return text.includes('faq') || 
           text.includes('about') || 
           text.includes('review') || 
           text.includes('testimonial') ||
           text.includes('product') ||
           text.includes('pricing') ||
           text.includes('contact') ||
           text.includes('description') ||
           text.includes('content') ||
           action.priority === 'QUICK WIN' ||
           action.priority === 'THIS WEEK'
  })
  
  const toggleAction = (index: number) => {
    const newChecked = new Set(checkedActions)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedActions(newChecked)
    localStorage.setItem(`aeo-actions-${result.businessName}`, JSON.stringify([...newChecked]))
  }
  
  // Calculate completion
  const step1Complete = websiteActions.length > 0 && checkedActions.size === websiteActions.length
  const step2Complete = robotsCopied
  const step3Complete = htmlDownloaded
  const stepsComplete = [step1Complete, step2Complete, step3Complete].filter(Boolean).length
  
  // AI Crawler status
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
    setRobotsCopied(true)
    localStorage.setItem(`aeo-robots-${result.businessName}`, 'true')
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
    setRobotsCopied(true)
    localStorage.setItem(`aeo-robots-${result.businessName}`, 'true')
  }

  // Track HTML download from child component
  useEffect(() => {
    const handleStorage = () => {
      setHtmlDownloaded(localStorage.getItem(`aeo-html-${result.businessName}`) === 'true')
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [result.businessName])

  return (
    <div className="space-y-8">
      {/* Progress header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Your AI Visibility Journey</h2>
          <span className="text-primary font-bold">{stepsComplete} of 3 steps complete</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500 rounded-full"
            style={{ width: `${(stepsComplete / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Improve your website */}
      <StepCard
        stepNumber={1}
        icon="🏗️"
        title="Improve your website"
        subtitle="Fix these issues so AI agents understand your business"
        isComplete={step1Complete}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{checkedActions.size} of {websiteActions.length} improvements done</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-green-500 transition-all duration-300 rounded-full"
              style={{ width: websiteActions.length > 0 ? `${(checkedActions.size / websiteActions.length) * 100}%` : '0%' }}
            />
          </div>
          
          <div className="space-y-3">
            {websiteActions.map((action, index) => (
              <ActionItemCard
                key={index}
                action={action}
                index={index}
                isChecked={checkedActions.has(index)}
                onToggle={() => toggleAction(index)}
              />
            ))}
          </div>
        </div>
      </StepCard>

      {/* Step 2: Let AI agents in */}
      <StepCard
        stepNumber={2}
        icon="🤖"
        title="Let AI agents in"
        subtitle="Make sure AI crawlers can read and index your site"
        isComplete={step2Complete}
      >
        <div className="space-y-6">
          {/* Crawler status grid */}
          <div className="grid grid-cols-2 gap-3">
            {crawlers.map((crawler) => {
              const isAllowed = result.aiCrawlerStatus?.[crawler.key] ?? true
              return (
                <div
                  key={crawler.key}
                  className={`p-3 rounded-lg border ${
                    isAllowed
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isAllowed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${isAllowed ? 'text-green-100' : 'text-red-100'}`}>
                        {crawler.name}
                      </p>
                      <p className={`text-xs ${isAllowed ? 'text-green-200/60' : 'text-red-200/60'}`}>
                        {crawler.fullName}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Warning if blocked */}
          {result.aiCrawlerStatus && Object.values(result.aiCrawlerStatus).some(v => !v) && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-100 text-sm">
                <span className="font-semibold">Warning:</span> Some AI crawlers are blocked. Update your robots.txt using the file below.
              </p>
            </div>
          )}

          {/* robots.txt code block */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Recommended robots.txt</p>
            <div className="bg-[#0d0d0d] border border-border rounded-lg overflow-hidden">
              <pre className="p-4 text-sm text-muted-foreground overflow-x-auto font-mono">
                {robotsTxt}
              </pre>
            </div>
          </div>

          {/* Copy/Download buttons */}
          <div className="flex gap-3">
            <Button
              variant={robotsCopied ? 'secondary' : 'outline'}
              onClick={handleCopyRobots}
              className="flex-1 gap-2"
            >
              {robotsCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {robotsCopied ? 'Copied!' : 'Copy robots.txt'}
            </Button>
            <Button
              onClick={handleDownloadRobots}
              className="flex-1 gap-2 bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4" />
              Download robots.txt
            </Button>
          </div>

          {/* Upload instructions */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-100 text-sm">
              <span className="font-semibold">Upload instructions:</span> Place robots.txt in your website root folder (e.g., yoursite.com/robots.txt)
            </p>
          </div>
        </div>
      </StepCard>

      {/* Step 3: Get cited by AI agents */}
      <StepCard
        stepNumber={3}
        icon="🎯"
        title="Get cited by AI agents"
        subtitle="Upload this page and start appearing in AI recommendations"
        isComplete={step3Complete}
      >
        <div className="space-y-8">
          {/* Before/After comparison - the wow moment */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">How your site looked vs. how it will look</h4>
            <BeforeAfterComparison result={result} />
          </div>

          {/* Generated page preview */}
          <div className="border-t border-border pt-8">
            <GeneratedPagePreviewWithTracking 
              result={result} 
              onDownload={() => {
                setHtmlDownloaded(true)
                localStorage.setItem(`aeo-html-${result.businessName}`, 'true')
              }}
            />
          </div>
        </div>
      </StepCard>
    </div>
  )
}

// Wrapper to track download
function GeneratedPagePreviewWithTracking({ 
  result, 
  onDownload 
}: { 
  result: AnalysisResult
  onDownload: () => void 
}) {
  useEffect(() => {
    const originalDownload = window.HTMLAnchorElement.prototype.click
    // Track downloads via event listener on the component
  }, [])

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
