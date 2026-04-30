import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const analysisSchema = z.object({
  siteType: z.enum(['ecommerce', 'business']),
  businessName: z.string(),
  mainCategory: z.string(),
  location: z.string().nullable(),
  productsOrServices: z.array(z.string()),
  aeoScore: z.number().min(0).max(100),
  dimensions: z.object({
    contentClarity: z.object({
      score: z.number().min(0).max(100),
      feedback: z.string(),
    }),
    entityCoverage: z.object({
      score: z.number().min(0).max(100),
      feedback: z.string(),
    }),
    trustSignals: z.object({
      score: z.number().min(0).max(100),
      feedback: z.string(),
    }),
    answerReadiness: z.object({
      score: z.number().min(0).max(100),
      feedback: z.string(),
    }),
  }),
  whatAISeeNow: z.string(),
  whatAIWillSee: z.string(),
  generatedPage: z.string(),
})

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 })
    }

    // Step 1: Scrape with Firecrawl
    const firecrawlKey = process.env.FIRECRAWL_API_KEY
    if (!firecrawlKey) {
      return Response.json(
        { error: 'Firecrawl API key not configured' },
        { status: 500 }
      )
    }

    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    })

    if (!scrapeResponse.ok) {
      const errorData = await scrapeResponse.json().catch(() => ({}))
      console.error('[v0] Firecrawl error:', errorData)
      return Response.json(
        { error: 'We couldn\'t scan your site. Make sure it\'s publicly accessible.' },
        { status: 400 }
      )
    }

    const scrapeData = await scrapeResponse.json()
    const scrapedContent = scrapeData.data?.markdown || ''

    if (!scrapedContent) {
      return Response.json(
        { error: 'No content could be extracted from this URL' },
        { status: 400 }
      )
    }

    // Step 2: Analyze with Groq (fast inference)
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      messages: [
        {
          role: 'system',
          content: 'You are an AEO (Agent Engine Optimization) expert. Always respond with valid JSON only, no markdown code blocks or extra text.',
        },
        {
          role: 'user',
          content: `Analyze this website and return a JSON object with exactly this structure:
{
  "siteType": "ecommerce" or "business",
  "businessName": "string",
  "mainCategory": "string", 
  "location": "string or null",
  "productsOrServices": ["array of top 5 products/services"],
  "aeoScore": number 0-100,
  "dimensions": {
    "contentClarity": { "score": 0-100, "feedback": "one line" },
    "entityCoverage": { "score": 0-100, "feedback": "one line" },
    "trustSignals": { "score": 0-100, "feedback": "one line" },
    "answerReadiness": { "score": 0-100, "feedback": "one line" }
  },
  "whatAISeeNow": "2-3 sentence vague ChatGPT response about this business",
  "whatAIWillSee": "2-3 sentence confident ChatGPT response after optimization",
  "generatedPage": "complete HTML page string"
}

SCRAPED WEBSITE CONTENT:
${scrapedContent.slice(0, 50000)}

URL: ${url}

Analyze this website and return:

1. siteType: detect if ecommerce (has products/prices/cart) or business (services/info site)

2. Basic info: businessName, mainCategory, location (or null if not found), productsOrServices (top 5)

3. aeoScore (0-100): how visible is this site to AI agents?
   Consider: structured content, clear value proposition, FAQ-style content, entity definitions, trust signals

4. dimensions: score each 0-100 with specific one-line feedback:
   - contentClarity: Can AI agents understand what you do?
   - entityCoverage: Are your products/services well defined?
   - trustSignals: Reviews, about page, contact info presence
   - answerReadiness: Do you answer questions people ask AI?

5. whatAISeeNow: write a realistic ChatGPT-style response (2-3 sentences) when someone asks about this business/product category. Make it vague or incomplete reflecting current state.
   Example: "I don't have specific information about..."

6. whatAIWillSee: write the ideal ChatGPT-style response (2-3 sentences) after AEO optimization — specific, confident, citing the business by name.
   Example: "[BusinessName] is one of the best options for X in Y, known for Z..."

7. generatedPage: generate a complete, beautiful HTML page optimized for AI agents to find and cite this business.

   For ecommerce: title "Best [mainCategory] in [location]"
   For business: title "Best [mainCategory] in [location]"
   If no location found, omit the location part.
   
   The page must include:
   - Clear H1 with the business name and category
   - What they sell/offer (structured, scannable)
   - Why choose them (3-5 differentiators)
   - Pricing info if available
   - Location and contact if available
   - FAQ section with 5 questions people ask AI about this category — answered from this business perspective
   - Schema.org JSON-LD structured data (Organization or LocalBusiness)
   
   Style requirements:
   - Clean, minimal, professional design
   - Inline CSS only (no external dependencies)
   - Dark background (#0A0A0A) with white text
   - Purple accent color (#7C3AED) for highlights
   - Good typography with Inter or system fonts
   - This page should look good if a human visits it too
   - Make it mobile responsive with simple CSS
   - Include meta tags for SEO`,
        },
      ],
    })

    if (!text) {
      return Response.json(
        { error: 'Failed to analyze website' },
        { status: 500 }
      )
    }

    // Parse the JSON response
    let parsedOutput
    try {
      // Remove markdown code blocks if present
      let cleanedText = text.trim()
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7)
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3)
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3)
      }
      cleanedText = cleanedText.trim()
      
      parsedOutput = JSON.parse(cleanedText)
    } catch {
      console.error('[v0] Failed to parse JSON:', text.slice(0, 500))
      return Response.json(
        { error: 'Failed to parse analysis results' },
        { status: 500 }
      )
    }

    // Validate with schema
    const validated = analysisSchema.safeParse(parsedOutput)
    if (!validated.success) {
      console.error('[v0] Schema validation failed:', validated.error)
      // Return the parsed output anyway, frontend can handle missing fields
      return Response.json(parsedOutput)
    }

    return Response.json(validated.data)
  } catch (error) {
    console.error('[v0] Analysis error:', error)
    
    // Check for AI Gateway credit card requirement
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('credit card') || errorMessage.includes('customer_verification_required')) {
      return Response.json(
        { 
          error: 'AI Gateway Setup Required',
          details: 'To use this tool, you need to add a credit card to your Vercel account to unlock free AI Gateway credits. Visit your Vercel dashboard → AI → Add Credit Card.',
          isSetupError: true
        },
        { status: 403 }
      )
    }
    
    return Response.json(
      { error: 'An unexpected error occurred while analyzing the website. Please try again.' },
      { status: 500 }
    )
  }
}
