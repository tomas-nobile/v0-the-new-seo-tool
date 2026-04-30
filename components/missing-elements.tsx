'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface MissingElementsProps {
  elements?: string[] | null
}

export function MissingElements({ elements }: MissingElementsProps) {
  // Handle undefined or empty arrays
  if (!elements || elements.length === 0) {
    return null
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-300 mb-3">What&apos;s Missing for AI Visibility</h3>
            <ul className="space-y-2">
              {elements.map((element, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-red-200">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>{element}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-300 mb-3">What You'll Gain with Optimization</h3>
            <ul className="space-y-2 text-sm text-green-200">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>AI agents will find and cite your business with confidence</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Recommendations will include specific products/services and differentiators</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Customer questions will be answered directly from your content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Higher visibility in LLM-generated content and recommendations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

