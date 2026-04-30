'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react'

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
  const [method, setMethod] = useState<'cpanel' | 'ftp' | 'wordpress'>('cpanel')
  const [copied, setCopied] = useState(false)
  const [hasDownloaded, setHasDownloaded] = useState(false)

  const livePageUrl = `${businessUrl}${filename.startsWith('/') ? '' : '/'}${filename}`

  const copyUrl = async () => {
    await navigator.clipboard.writeText(livePageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTest = () => {
    window.open(livePageUrl, '_blank')
    onTestClick?.()
  }

  const instructions = {
    cpanel: {
      title: 'cPanel / Plesk (Most Common)',
      steps: [
        'Log in to your hosting control panel (cPanel or Plesk)',
        'Look for "File Manager" in the main menu',
        'Navigate to the public_html/ folder (or www/ or htdocs/ depending on your host)',
        `Click "Upload" and select the downloaded ${filename} file`,
        'Your page is now live!',
      ],
    },
    ftp: {
      title: 'FTP (FileZilla, WinSCP, Transmit)',
      steps: [
        'Open your FTP client and connect to your server',
        'Use your FTP credentials from your hosting provider',
        'Navigate to the root folder (usually public_html/ or www/)',
        `Drag and drop the ${filename} file to that folder`,
        'Your page is now live!',
      ],
    },
    wordpress: {
      title: 'WordPress (WP File Manager)',
      steps: [
        'Go to your WordPress Admin dashboard',
        'Navigate to Plugins → Add New',
        'Search for "File Manager" plugin',
        'Install and activate the File Manager plugin',
        `Go to the plugin and navigate to public_html/ folder, then upload ${filename}`,
        'Your page is now live!',
      ],
    },
  }

  const current = instructions[method]

  return (
    <div className="space-y-6">
      {/* Method Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['cpanel', 'ftp', 'wordpress'] as const).map((m) => (
          <Button
            key={m}
            variant={method === m ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setMethod(m)}
          >
            {m === 'cpanel' && 'cPanel'}
            {m === 'ftp' && 'FTP'}
            {m === 'wordpress' && 'WordPress'}
          </Button>
        ))}
      </div>

      {/* Current Method Instructions */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h4 className="font-semibold text-lg">{current.title}</h4>
        
        <ol className="space-y-3">
          {current.steps.map((step, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
                {idx + 1}
              </span>
              <span className="text-foreground leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* URL Display & Copy */}
      <div className="bg-background border border-border rounded-lg p-4">
        <label className="text-sm font-medium text-muted-foreground block mb-2">
          Your page will be live at:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={livePageUrl}
            readOnly
            className="flex-1 bg-card border border-border rounded px-3 py-2 text-sm font-mono text-foreground"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={copyUrl}
            className="gap-2"
          >
            {copied ? (
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
      </div>

      {/* Info Box */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-900">
          <strong>Not sure how to upload?</strong>
          <p className="mt-1">
            Forward the downloaded file to your web developer or hosting provider and ask them to upload it
            to the root of your website. It takes less than 2 minutes.
          </p>
        </div>
      </div>

      {/* Test Button */}
      {hasDownloaded && (
        <Button
          onClick={handleTest}
          variant="secondary"
          className="w-full gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Test if your page is live
        </Button>
      )}
    </div>
  )
}
