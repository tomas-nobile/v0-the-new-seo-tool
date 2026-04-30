'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Copy, Download, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GeneratedPagePreview } from '@/components/generated-page-preview'
import type { AnalysisResult, ActionItem } from '@/lib/types'

interface JourneyStepsProps {
  result: AnalysisResult
}

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
      {stepNumber < 3 && (
        <div className="absolute left-7 top-20 bottom-0 w-px border-l-2 border-dashed border-primary/20 -mb-8 z-0" />
      )}
      
      <div className={`relative z-10 bg-card border rounded-2xl overflow-hidden transition-all duration-300 card-hover ${
        isComplete ? 'border-success/40' : 'border-border'
      }`}>
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isComplete ? 'bg-success' : 'bg-primary'}`} />
        
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold transition-colors ${
              isComplete 
                ? 'bg-success/15 text-success' 
                : 'bg-primary/15 text-primary'
            }`}>
              {isComplete ? <CheckCircle2 className="w-7 h-7" /> : stepNumber}
            </div>
            
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{icon}</span>
                <h3 className={`text-xl font-bold ${isComplete ? 'text-success' : 'text-foreground'}`}>
                  {title}
                </h3>
              </div>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  )
}

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
  
  const impactConfig = {
    'High': { color: 'border-l-destructive', badge: 'bg-destructive/15 text-destructive', glow: 'hover:shadow-destructive/10' },
    'Medium': { color: 'border-l-primary', badge: 'bg-primary/15 text-primary', glow: 'hover:shadow-primary/10' },
    'Low': { color: 'border-l-muted-foreground', badge: 'bg-muted/15 text-muted-foreground', glow: 'hover:shadow-muted/10' },
  }
  
  const config = impactConfig[action.impact as keyof typeof impactConfig] || impactConfig['Medium']
  
  const timeEstimates = { Easy: '5-15 min', Medium: '30-60 min', Hard: '2-4 hours' }

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${config.color} border-l-4 ${
      isChecked ? 'bg-success/5 opacity-60' : 'bg-card hover:bg-secondary/30'
    } ${config.glow} hover:shadow-lg`}>
      <div className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
              isChecked 
                ? 'bg-success border-success' 
                : 'border-muted-foreground/40 hover:border-primary'
            }`}
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
          
          {action.action.includes('\n') && (
            <button className="text-muted-foreground p-1 hover:text-foreground transition-colors">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      
      {isExpanded && action.action.includes('\n') && (
        <div className="px-4 pb-4 pt-0 pl-12">
          <pre className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono">
            {action.action.split('\n').slice(1).join('\n')}
          </pre>
          <p className="text-sm text-success mt-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {action.impact}
          </p>
        </div>
      )}
    </div>
  )
}

export function JourneySteps({ result }: JourneyStepsProps) {
  const [checkedActions, setCheckedActions] = useState<Set<number>>(new Set())
  const [robotsCopied, setRobotsCopied] = useState(false)
  const [htmlDownloaded, setHtmlDownloaded] = useState(false)
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [promptCopied, setPromptCopied] = useState(false)
  
  useEffect(() => {
    const saved = localStorage.getItem(`aeo-actions-${result.businessName}`)
    if (saved) setCheckedActions(new Set(JSON.parse(saved)))
    setRobotsCopied(localStorage.getItem(`aeo-robots-${result.businessName}`) === 'true')
    setHtmlDownloaded(localStorage.getItem(`aeo-html-${result.businessName}`) === 'true')
  }, [result.businessName])
  
  const websiteActions = (result.actionPlan || []).filter(action => {
    const text = action.action.toLowerCase()
    return !text.includes('robots.txt') && (
      text.includes('faq') || text.includes('about') || text.includes('review') || 
      text.includes('testimonial') || text.includes('product') || text.includes('pricing') ||
      text.includes('contact') || text.includes('description') || text.includes('content') ||
      action.priority === 'QUICK WIN' || action.priority === 'THIS WEEK'
    )
  })
  
  const toggleAction = (index: number) => {
    const newChecked = new Set(checkedActions)
    if (newChecked.has(index)) newChecked.delete(index)
    else newChecked.add(index)
    setCheckedActions(newChecked)
    localStorage.setItem(`aeo-actions-${result.businessName}`, JSON.stringify([...newChecked]))
  }
  
  const step1Complete = websiteActions.length > 0 && checkedActions.size === websiteActions.length
  const step2Complete = robotsCopied
  const step3Complete = htmlDownloaded
  const stepsComplete = [step1Complete, step2Complete, step3Complete].filter(Boolean).length
  
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
    setRobotsCopied(true)
    localStorage.setItem(`aeo-robots-${result.businessName}`, 'true')
  }

  useEffect(() => {
    const handleStorage = () => {
      setHtmlDownloaded(localStorage.getItem(`aeo-html-${result.businessName}`) === 'true')
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [result.businessName])

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Your AI Visibility Journey</h2>
            <p className="text-sm text-muted-foreground mt-1">Complete these steps to get cited by AI agents</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-primary">{stepsComplete}</span>
            <span className="text-muted-foreground"> / 3</span>
          </div>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-primary to-success transition-all duration-700 ease-out rounded-full"
            style={{ width: `${(stepsComplete / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1 */}
      <StepCard
        stepNumber={1}
        icon="🔗"
        title="Paste your URL"
        subtitle="We scan your entire website to understand your business, products, and services"
        isComplete={step1Complete}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{checkedActions.size} / {websiteActions.length}</span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-success transition-all duration-500 rounded-full"
              style={{ width: websiteActions.length > 0 ? `${(checkedActions.size / websiteActions.length) * 100}%` : '0%' }}
            />
          </div>
          
          {/* AI Prompt Generator - Inline expandable */}
          <div className="border border-primary/20 rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
            <button
              onClick={() => setShowPromptModal(!showPromptModal)}
              className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Generate prompt for your AI</p>
                  <p className="text-xs text-muted-foreground">v0, Claude, Cursor, GitHub Copilot</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${showPromptModal ? 'rotate-180' : ''}`} />
            </button>
            
            {showPromptModal && (
              <div className="border-t border-primary/20 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                <p className="text-sm text-muted-foreground">
                  Copy this prompt and paste it into your AI assistant to get help implementing these improvements:
                </p>
                <div className="bg-background border border-border rounded-xl p-4 max-h-48 overflow-y-auto">
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                    {generateAIPrompt()}
                  </pre>
                </div>
                <Button
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
            {/* Group actions by impact */}
            {['High', 'Medium', 'Low'].map((impact) => {
              const actionsForImpact = websiteActions.filter(a => a.impact === impact)
              if (actionsForImpact.length === 0) return null
              
              const impactConfig = {
                'High': { color: 'text-destructive', bgColor: 'bg-destructive/10', borderColor: 'border-destructive/30', label: '🔥 High Impact', description: 'Maximum ROI - do these first' },
                'Medium': { color: 'text-primary', bgColor: 'bg-primary/10', borderColor: 'border-primary/30', label: '⚡ Medium Impact', description: 'Important improvements' },
                'Low': { color: 'text-muted-foreground', bgColor: 'bg-secondary/10', borderColor: 'border-secondary/30', label: '💡 Low Impact', description: 'Nice to have enhancements' },
              }
              
              const config = impactConfig[impact as keyof typeof impactConfig]
              
              return (
                <div key={impact} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold ${config.color}`}>{config.label}</h4>
                    <span className="text-xs text-muted-foreground">({actionsForImpact.length} {actionsForImpact.length === 1 ? 'task' : 'tasks'})</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                  <div className="space-y-2">
                    {actionsForImpact.map((action, idx) => {
                      const originalIndex = websiteActions.indexOf(action)
                      return (
                        <ActionItemCard
                          key={`${impact}-${idx}`}
                          action={action}
                          index={originalIndex}
                          isChecked={checkedActions.has(originalIndex)}
                          onToggle={() => toggleAction(originalIndex)}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </StepCard>

      {/* Step 2 */}
      <StepCard
        stepNumber={2}
        icon="🤖"
        title="AI Analysis"
        subtitle="Claude detects gaps in your AI visibility and identifies optimization opportunities"
        isComplete={step2Complete}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {crawlers.map((crawler) => {
              const isAllowed = result.aiCrawlerStatus?.[crawler.key] ?? true
              return (
                <div
                  key={crawler.key}
                  className={`p-4 rounded-xl border transition-all ${
                    isAllowed
                      ? 'bg-success/10 border-success/30'
                      : 'bg-destructive/10 border-destructive/30'
                  }`}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    {isAllowed ? (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    ) : (
                      <XCircle className="w-6 h-6 text-destructive" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{crawler.name}</p>
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
            <div className="bg-background border border-border rounded-xl overflow-hidden">
              <pre className="p-4 text-sm text-muted-foreground overflow-x-auto font-mono leading-relaxed">
                {robotsTxt}
              </pre>
            </div>
          </div>
        </div>
      </StepCard>

      {/* Step 3 */}
      <StepCard
        stepNumber={3}
        icon="📥"
        title="Get your page"
        subtitle="Download a ready-to-upload HTML page that gets you cited by AI agents"
        isComplete={step3Complete}
      >
        <GeneratedPagePreviewWithTracking 
          result={result}
          onDownload={() => {
            setHtmlDownloaded(true)
            localStorage.setItem(`aeo-html-${result.businessName}`, 'true')
          }}
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
