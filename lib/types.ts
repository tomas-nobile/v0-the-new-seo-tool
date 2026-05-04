export interface ActionItem {
  priority: 'QUICK WIN' | 'THIS WEEK' | 'LONG TERM'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  action: string
  impact: 'High' | 'Medium' | 'Low'
}

export interface AICrawlerStatus {
  gptbot: boolean
  claudebot: boolean
  perplexitybot: boolean
  googlebot: boolean
}

export interface LiveSearchResult {
  title: string
  url: string
  snippet: string
}

export interface LiveSearchQuery {
  query: string
  results: LiveSearchResult[]
}

export interface LiveSearchEvidence {
  appearsInResults: boolean
  queries: LiveSearchQuery[]
}

export interface AnalysisResult {
  siteType: 'ecommerce' | 'business'
  businessName: string
  mainCategory: string
  location: string | null
  productsOrServices: string[]
  aeoScore: number
  missingElements: string[]
  detectedLanguage: 'en' | 'es' | 'pt'
  dimensions: {
    contentClarity: {
      score: number
      feedback: string
    }
    entityCoverage: {
      score: number
      feedback: string
    }
    trustSignals: {
      score: number
      feedback: string
    }
    answerReadiness: {
      score: number
      feedback: string
    }
  }
  whatAISeeNow: string
  whatAIWillSee: string
  generatedPage: string
  actionPlan: ActionItem[]
  aiCrawlerStatus: AICrawlerStatus
  quickWinsCount: number
  liveSearchEvidence?: LiveSearchEvidence | null
  modelUsed?: string
}
