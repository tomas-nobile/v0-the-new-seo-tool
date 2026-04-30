'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, CheckCircle2, Sparkles, Bot, Send, Loader2 } from 'lucide-react'

interface UploadInstructionsProps {
  businessName: string
  businessUrl: string
  filename: string
}

export function UploadInstructions({
  businessName,
  businessUrl,
  filename,
}: UploadInstructionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hosting, setHosting] = useState('')
  const [techStack, setTechStack] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const responseRef = useRef<HTMLDivElement>(null)

  const suggestedEndpoint = `/best-${businessName.toLowerCase().replace(/\s+/g, '-')}`

  const handleAskAI = async () => {
    if (!hosting.trim()) return
    setIsLoading(true)
    setAiResponse('')

    try {
      const res = await fetch('/api/upload-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hosting, techStack, filename, suggestedEndpoint, businessName }),
      })

      if (!res.body) return

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setAiResponse(prev => prev + decoder.decode(value, { stream: true }))
        responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    } catch {
      setAiResponse('Sorry, something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Get personalized upload instructions</h3>
            <p className="text-sm text-muted-foreground">Tell us about your setup and get AI-generated step-by-step guide</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Hosting provider <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={hosting}
              onChange={e => setHosting(e.target.value)}
              placeholder="Hostinger, GoDaddy, SiteGround..."
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              How is your page built? <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={techStack}
              onChange={e => setTechStack(e.target.value)}
              placeholder="WordPress, Wix, custom HTML..."
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition"
            />
          </div>

          <Button
            onClick={handleAskAI}
            disabled={!hosting.trim() || isLoading}
            className="w-full gap-2 h-12 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Getting instructions...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Get my instructions
              </>
            )}
          </Button>

          {(aiResponse || isLoading) && (
            <div className="bg-background border border-primary/25 rounded-xl p-5" ref={responseRef}>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Your upload instructions</span>
              </div>
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {aiResponse}
                {isLoading && (
                  <span className="inline-block w-2 h-5 bg-primary/50 ml-1 animate-pulse rounded-sm" />
                )}
              </div>
              {aiResponse && !isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 gap-2 text-muted-foreground"
                  onClick={async () => {
                    await navigator.clipboard.writeText(aiResponse)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
