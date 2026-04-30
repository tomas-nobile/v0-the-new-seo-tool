'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Download, Check, Code, Eye } from 'lucide-react'
import { UploadInstructions } from '@/components/upload-instructions'
import { getTranslation, type DetectedLanguage } from '@/lib/i18n'
import type { AnalysisResult } from '@/lib/types'

interface GeneratedPagePreviewProps {
  result: AnalysisResult
}

export function GeneratedPagePreview({ result }: GeneratedPagePreviewProps) {
  const [copied, setCopied] = useState(false)
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

  return (
    <div className="space-y-8">
      {/* Download Card */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">{getTranslation(lang, 'readyToUpload')}</p>
              <p className="text-sm text-muted-foreground">{filename}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCopy} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? getTranslation(lang, 'copied') : getTranslation(lang, 'copyHTML')}
            </Button>
            <Button onClick={handleDownload} className="gap-2 bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4" />
              {getTranslation(lang, 'downloadHTML')}
            </Button>
          </div>
        </div>
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
