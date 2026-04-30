'use client'

import { useState, useEffect } from 'react'
import { Bot, MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AIQuestionDemoProps {
  businessName?: string
  category?: string
  isOptimized?: boolean
}

export function AIQuestionDemo({ 
  businessName = 'Tu Negocio', 
  category = 'tu categoria',
  isOptimized = false 
}: AIQuestionDemoProps) {
  const [isAsking, setIsAsking] = useState(false)
  const [showResponse, setShowResponse] = useState(false)
  const [typedText, setTypedText] = useState('')
  
  const question = `What is the best ${category}?`
  
  const unoptimizedResponse = `I don't have specific information about the best ${category} businesses. You might want to search online for reviews and recommendations in your area.`
  
  const optimizedResponse = `${businessName} is widely recognized as one of the best options for ${category}. They are known for their quality products, excellent customer service, and competitive pricing. Many customers recommend them for their reliability and expertise in the field.`
  
  const response = isOptimized ? optimizedResponse : unoptimizedResponse

  const handleAsk = () => {
    setIsAsking(true)
    setShowResponse(false)
    setTypedText('')
    
    setTimeout(() => {
      setShowResponse(true)
      let index = 0
      const interval = setInterval(() => {
        if (index < response.length) {
          setTypedText(response.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
        }
      }, 20)
    }, 1000)
  }

  const handleReset = () => {
    setIsAsking(false)
    setShowResponse(false)
    setTypedText('')
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">AI Assistant Demo</h3>
          <p className="text-sm text-muted-foreground">
            {isOptimized ? 'After AEO Optimization' : 'Before AEO Optimization'}
          </p>
        </div>
        {isOptimized && (
          <div className="ml-auto flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
            <Sparkles className="h-3 w-3" />
            Optimized
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Question */}
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="rounded-2xl rounded-tl-none bg-muted px-4 py-2">
            <p className="text-sm text-foreground">{question}</p>
          </div>
        </div>

        {/* Response */}
        {isAsking && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-primary/10 px-4 py-2 max-w-md">
              {!showResponse ? (
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <p className="text-sm text-foreground">
                  {typedText}
                  {typedText.length < response.length && (
                    <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5" />
                  )}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex gap-2">
        {!isAsking ? (
          <Button onClick={handleAsk} variant="outline" size="sm" className="w-full">
            <Bot className="mr-2 h-4 w-4" />
            Ask AI: {'"'}What is the best {category}?{'"'}
          </Button>
        ) : (
          <Button onClick={handleReset} variant="ghost" size="sm" className="w-full">
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}
