'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Download, Check, Code, Eye } from 'lucide-react'
import { UploadInstructions } from '@/components/upload-instructions'
import type { AnalysisResult } from '@/lib/types'

interface GeneratedPagePreviewProps {
  result: AnalysisResult
}

export function GeneratedPagePreview({ result }: GeneratedPagePreviewProps) {
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview')
  const [hasDownloaded, setHasDownloaded] = useState(false)

  const filename = `${result.businessName.toLowerCase().replace(/\s+/g, '-')}-aeo-page.html`
  const businessUrl = new URL(window.location.href).origin // Fallback, ideally from result

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.generatedPage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([result.generatedPage], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setHasDownloaded(true)
  }

  return (
    <div className="space-y-8">
      {/* Header & Download Buttons */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Your ready-to-upload page</h3>
            <p className="text-muted-foreground">
              Upload this page to your website root. AI agents will find it and start citing your business.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy HTML
                </>
              )}
            </Button>
            <Button
              onClick={handleDownload}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4" />
              Download HTML
            </Button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('preview')}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button
            variant={viewMode === 'code' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('code')}
            className="gap-2"
          >
            <Code className="w-4 h-4" />
            Code
          </Button>
        </div>

        {/* Preview/Code Area */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {viewMode === 'preview' ? (
            <div className="bg-white">
              <iframe
                srcDoc={result.generatedPage}
                className="w-full h-[600px] border-0"
                title="Generated Page Preview"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            <div className="max-h-[600px] overflow-auto">
              <pre className="p-6 text-sm text-muted-foreground font-mono whitespace-pre-wrap break-all">
                {result.generatedPage}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Upload Instructions */}
      {hasDownloaded && (
        <div className="border-t border-border pt-8">
          <h3 className="text-xl font-semibold mb-6">How to upload your page</h3>
          <UploadInstructions
            businessName={result.businessName}
            businessUrl={businessUrl}
            filename={filename}
          />
        </div>
      )}
    </div>
  )
}
