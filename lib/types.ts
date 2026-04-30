export interface AnalysisResult {
  siteType: 'ecommerce' | 'business'
  businessName: string
  mainCategory: string
  location: string | null
  productsOrServices: string[]
  aeoScore: number
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
}
