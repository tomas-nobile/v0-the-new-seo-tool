'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, AlertCircle, CheckCircle2, Sparkles, FileCode, Bot, Send, Loader2 } from 'lucide-react'

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
  const [copiedEndpoint, setCopiedEndpoint] = useState(false)
  const [hosting, setHosting] = useState('')
  const [techStack, setTechStack] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const responseRef = useRef<HTMLDivElement>(null)

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
    } catch (e) {
      setAiResponse('Sorry, something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedEndpoint = `/best-${businessName.toLowerCase().replace(/\s+/g, '-')}`

  const copyEndpoint = async () => {
    await navigator.clipboard.writeText(suggestedEndpoint)
    setCopiedEndpoint(true)
    setTimeout(() => setCopiedEndpoint(false), 2000)
  }

  const handleTest = () => {
    window.open(`${businessUrl}${suggestedEndpoint}.html`, '_blank')
    onTestClick?.()
  }

  const manualInstructions = {
    cpanel: {
      title: 'cPanel / Plesk',
      steps: [
        'Log in to your hosting control panel (cPanel or Plesk)',
        'Look for "File Manager" in the main menu',
        'Navigate to the public_html/ folder (or www/ or htdocs/)',
        `Click "Upload" and select the downloaded ${filename} file`,
        `Rename the file to: best-${businessName.toLowerCase().replace(/\s+/g, '-')}.html`,
        'Done! Your AEO page is now live',
      ],
    },
    ftp: {
      title: 'FTP Client',
      steps: [
        'Open your FTP client (FileZilla, WinSCP, Transmit, Cyberduck)',
        'Connect using your FTP credentials from your hosting provider',
        'Navigate to the root folder (public_html/ or www/)',
        `Upload the ${filename} file`,
        `Rename it to: best-${businessName.toLowerCase().replace(/\s+/g, '-')}.html`,
        'Done! Your AEO page is now live',
      ],
    },
    wordpress: {
      title: 'WordPress',
      steps: [
        'Go to WordPress Admin → Plugins → Add New',
        'Search and install "File Manager" plugin (by mndpsingh287)',
        'Activate the plugin and go to WP File Manager',
        'Navigate to the root folder (usually public_html/)',
        `Upload the ${filename} file and rename it to: best-${businessName.toLowerCase().replace(/\s+/g, '-')}.html`,
        'Done! Your AEO page is now live',
      ],
    },
  }

  const currentManual = manualInstructions[manualMethod]

  return (
    <div className="space-y-6">
      {/* Suggested Endpoint */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileCode className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Suggested endpoint</span>
        </div>
        <div className="flex gap-2">
          <code className="flex-1 bg-card border border-border rounded px-3 py-2 text-sm font-mono text-primary">
            {suggestedEndpoint}.html
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={copyEndpoint}
            className="gap-2"
          >
            {copiedEndpoint ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          This URL is optimized for AI agents searching for "{businessName}"
        </p>
      </div>

      {/* Method Toggle: Manual vs AI */}
      <div className="flex gap-2">
        <Button
          variant={method === 'manual' ? 'secondary' : 'outline'}
          onClick={() => setMethod('manual')}
          className="gap-2 flex-1"
        >
          <FileCode className="w-4 h-4" />
          Upload manually
        </Button>
        <Button
          variant={method === 'ai' ? 'secondary' : 'outline'}
          onClick={() => setMethod('ai')}
          className="gap-2 flex-1"
        >
          <Bot className="w-4 h-4" />
          Get help from AI
        </Button>
      </div>

      {method === 'manual' ? (
        <>
          {/* Manual Method Tabs */}
          <div className="flex gap-2 flex-wrap">
            {(['cpanel', 'ftp', 'wordpress'] as const).map((m) => (
              <Button
                key={m}
                variant={manualMethod === m ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManualMethod(m)}
              >
                {m === 'cpanel' && 'cPanel / Plesk'}
                {m === 'ftp' && 'FTP Client'}
                {m === 'wordpress' && 'WordPress'}
              </Button>
            ))}
          </div>

          {/* Current Manual Instructions */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h4 className="font-semibold text-lg">{currentManual.title}</h4>
            
            <ol className="space-y-3">
              {currentManual.steps.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
                    {idx + 1}
                  </span>
                  <span className="text-foreground leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      ) : (
        <>
          {/* AI Help Section */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Tell us about your setup</span>
            </div>

            {/* Input 1: Hosting */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Your hosting provider <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={hosting}
                onChange={e => setHosting(e.target.value)}
                placeholder="e.g. Hostinger, GoDaddy, SiteGround, WooCommerce, Shopify..."
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
              />
            </div>

            {/* Input 2: Tech Stack (optional) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                How is your page built?{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={techStack}
                onChange={e => setTechStack(e.target.value)}
                placeholder="e.g. WordPress, Wix, custom HTML, Webflow, I don't know..."
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
              />
            </div>

            <Button
              onClick={handleAskAI}
              disabled={!hosting.trim() || isLoading}
              className="w-full gap-2 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Getting instructions...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Get my upload instructions
                </>
              )}
            </Button>

            {/* Streaming AI Response */}
            {(aiResponse || isLoading) && (
              <div className="bg-background border border-primary/30 rounded-lg p-5 space-y-2" ref={responseRef}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Upload instructions for you</span>
                </div>
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {aiResponse}
                  {isLoading && (
                    <span className="inline-block w-2 h-4 bg-primary/60 ml-0.5 animate-pulse rounded-sm" />
                  )}
                </div>
                {aiResponse && !isLoading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 gap-2 text-muted-foreground"
                    onClick={async () => {
                      await navigator.clipboard.writeText(aiResponse)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy instructions'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Info Box */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-200">
          <strong>Need more help?</strong>
          <p className="mt-1">
            Forward the downloaded file to your web developer or hosting provider. Ask them to upload it
            to the root of your website at <code className="text-yellow-300">{suggestedEndpoint}.html</code>
          </p>
        </div>
      </div>

      {/* Test Button */}
      <Button
        onClick={handleTest}
        variant="secondary"
        className="w-full gap-2"
      >
        <ExternalLink className="w-4 h-4" />
        Test if your page is live
      </Button>
    </div>
  )
}
