'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Download, Check, Code, Eye, FileText } from 'lucide-react'
import { UploadInstructions } from '@/components/upload-instructions'
import { getTranslation, type DetectedLanguage } from '@/lib/i18n'
import type { AnalysisResult } from '@/lib/types'

interface GeneratedPagePreviewProps {
  result: AnalysisResult
  robotsTxt?: string
}

export function GeneratedPagePreview({ result, robotsTxt }: GeneratedPagePreviewProps) {
  const [copied, setCopied] = useState(false)
  const [copiedRobots, setCopiedRobots] = useState(false)
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview')
  const lang = (result.detectedLanguage || 'en') as DetectedLanguage
  const filename = `${result.businessName.toLowerCase().replace(/\s+/g, '-')}-aeo-page.html`
  const businessUrl = new URL(window.location.href).origin

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
  }

  const handleCopyRobots = async () => {
    if (robotsTxt) {
      await navigator.clipboard.writeText(robotsTxt)
      setCopiedRobots(true)
      setTimeout(() => setCopiedRobots(false), 2000)
    }
  }

  const handleDownloadRobots = () => {
    if (robotsTxt) {
      const blob = new Blob([robotsTxt], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'robots.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="space-y-8">
      {/* Files to upload */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* HTML File Card */}
        <div className="bg-secondary/30 border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <Code className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">AEO Page</p>
              <p className="text-xs text-muted-foreground">{filename}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button size="sm" onClick={handleDownload} className="flex-1 gap-2 bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Robots.txt File Card */}
        {robotsTxt && (
          <div className="bg-secondary/30 border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center">
                <FileText className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Robots.txt</p>
                <p className="text-xs text-muted-foreground">AI crawler permissions</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyRobots} className="flex-1 gap-2">
                {copiedRobots ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedRobots ? 'Copied' : 'Copy'}
              </Button>
              <Button size="sm" onClick={handleDownloadRobots} className="flex-1 gap-2 bg-success hover:bg-success/90 text-white">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-foreground">{getTranslation(lang, 'preview')}</h4>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {getTranslation(lang, 'preview')}
            </Button>
            <Button
              variant={viewMode === 'code' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('code')}
              className="gap-2"
            >
              <Code className="w-4 h-4" />
              {getTranslation(lang, 'code')}
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {viewMode === 'preview' ? (
            <div className="bg-white">
              <iframe
                srcDoc={result.generatedPage}
                className="w-full h-[500px] border-0"
                title="Generated Page Preview"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            <div className="max-h-[500px] overflow-auto">
              <pre className="p-6 text-sm text-muted-foreground font-mono whitespace-pre-wrap break-all leading-relaxed">
                {result.generatedPage}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Upload Instructions */}
      <div className="border-t border-border pt-8">
        <h3 className="text-xl font-bold mb-6 text-foreground">{getTranslation(lang, 'howToUpload')}</h3>
        <UploadInstructions
          businessName={result.businessName}
          businessUrl={businessUrl}
          filename={filename}
        />
      </div>
    </div>
  )
}
