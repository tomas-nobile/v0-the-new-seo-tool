'use client'

import { AlertTriangle } from 'lucide-react'

interface MissingElementsProps {
  elements?: string[] | null
}

export function MissingElements({ elements }: MissingElementsProps) {
  const safeElements = Array.isArray(elements) ? elements : []
  
  if (safeElements.length === 0) {
    return null
  }

  return (
    <div className="bg-destructive/10 border border-destructive/25 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Missing for AI visibility</h3>
          <p className="text-sm text-muted-foreground">Add these to improve your score</p>
        </div>
      </div>
      
      <ul className="grid sm:grid-cols-2 gap-3">
        {safeElements.map((element, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm bg-destructive/5 rounded-lg px-4 py-3">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
            <span className="text-foreground">{element}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
