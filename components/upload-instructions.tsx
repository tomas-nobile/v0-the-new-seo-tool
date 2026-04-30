'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, CheckCircle2, Sparkles, FileCode, Bot, Send, Loader2, FolderOpen, Globe } from 'lucide-react'

interface UploadInstructionsProps {
  businessName: string
  businessUrl: string
  filename: string
  onTestClick?: () => void
}

export function UploadInstructions({
  businessName,
  businessUrl,
  filename,
  onTestClick,
}: UploadInstructionsProps) {
  const [method, setMethod] = useState<'manual' | 'ai'>('manual')
  const [manualMethod, setManualMethod] = useState<'cpanel' | 'ftp' | 'wordpress'>('cpanel')
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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

  const copyEndpoint = async () => {
    await navigator.clipboard.writeText(suggestedEndpoint + '.html')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTest = () => {
    window.open(`${businessUrl}${suggestedEndpoint}.html`, '_blank')
    onTestClick?.()
  }

  const manualInstructions = {
    cpanel: {
      title: 'cPanel / Plesk',
      icon: FolderOpen,
      steps: [
        'Log in to your hosting control panel',
        'Open "File Manager"',
        'Navigate to public_html/ (or www/)',
        `Upload ${filename}`,
        `Rename to: best-${businessName.toLowerCase().replace(/\s+/g, '-')}.html`,
      ],
    },
    ftp: {
      title: 'FTP Client',
      icon: Globe,
      steps: [
        'Open FileZilla, WinSCP, or Cyberduck',
        'Connect with your FTP credentials',
        'Navigate to the root folder',
        `Upload ${filename}`,
        `Rename to: best-${businessName.toLowerCase().replace(/\s+/g, '-')}.html`,
      ],
    },
    wordpress: {
      title: 'WordPress',
      icon: FileCode,
      steps: [
        'Install "File Manager" plugin',
        'Go to WP File Manager',
        'Navigate to root (public_html/)',
        `Upload ${filename}`,
        `Rename to: best-${businessName.toLowerCase().replace(/\s+/g, '-')}.html`,
      ],
    },
  }

  const currentManual = manualInstructions[manualMethod]
  const CurrentIcon = currentManual.icon

  return (
    <div className="space-y-6">
      {/* Method Toggle */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant={method === 'manual' ? 'secondary' : 'outline'}
          onClick={() => setMethod('manual')}
          className="gap-2 h-12"
        >
          <FileCode className="w-4 h-4" />
          Upload manually
        </Button>
        <Button
          variant={method === 'ai' ? 'secondary' : 'outline'}
          onClick={() => setMethod('ai')}
          className="gap-2 h-12"
        >
          <Bot className="w-4 h-4" />
          Get AI help
        </Button>
      </div>

      {method === 'manual' ? (
        <>
          {/* Manual Method Tabs */}
          <div className="flex gap-2">
            {(['cpanel', 'ftp', 'wordpress'] as const).map((m) => (
              <Button
                key={m}
                variant={manualMethod === m ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManualMethod(m)}
                className="text-sm"
              >
                {m === 'cpanel' && 'cPanel'}
                {m === 'ftp' && 'FTP'}
                {m === 'wordpress' && 'WordPress'}
              </Button>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <CurrentIcon className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold text-lg text-foreground">{currentManual.title}</h4>
            </div>
            
            <ol className="space-y-3">
              {currentManual.steps.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold">
                    {idx + 1}
                  </span>
                  <span className="text-foreground leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Tell us about your setup</span>
          </div>

          <div className="space-y-4">
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
                How is your page built?{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={techStack}
                onChange={e => setTechStack(e.target.value)}
                placeholder="WordPress, Wix, custom HTML..."
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition"
              />
            </div>
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
      )}

      {/* Test Button */}
      <Button
        onClick={handleTest}
        variant="outline"
        className="w-full gap-2 h-12"
      >
        <ExternalLink className="w-4 h-4" />
        Test if your page is live
      </Button>
    </div>
  )
}
