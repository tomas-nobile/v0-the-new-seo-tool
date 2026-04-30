'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, AlertCircle, CheckCircle2, Sparkles, FileCode, Bot } from 'lucide-react'

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

  const aiInstructions = [
    {
      title: 'ChatGPT / Claude',
      prompt: `I have an HTML file called "${filename}" that I need to upload to my website's root folder. My website is hosted on [YOUR HOSTING PROVIDER]. Can you give me step-by-step instructions to upload this file so it's accessible at ${suggestedEndpoint}.html?`,
    },
    {
      title: 'Ask your hosting support',
      prompt: `Hi, I need to upload an HTML file to my website root. The file is called "${filename}" and I want it accessible at ${suggestedEndpoint}.html. Can you help me upload it or tell me how?`,
    },
  ]

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
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Copy one of these prompts and paste it into ChatGPT, Claude, or your hosting support chat:
            </p>

            {aiInstructions.map((ai, idx) => (
              <div key={idx} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-medium">{ai.title}</span>
                </div>
                <div className="relative">
                  <p className="text-sm text-muted-foreground bg-background border border-border rounded p-3 pr-12">
                    {ai.prompt}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={async () => {
                      await navigator.clipboard.writeText(ai.prompt)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
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
