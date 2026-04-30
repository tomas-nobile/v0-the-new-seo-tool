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
  missingElements: z.array(z.string()),
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
          content: `You are an expert AEO (Agent Engine Optimization) analyst. Analyze this website with extreme scrutiny. Most sites should score 20-55. Be harsh and realistic, not encouraging.

WEBSITE CONTENT:
${scrapedContent.slice(0, 50000)}

URL: ${url}

Return ONLY valid JSON (no markdown, no code blocks, just raw JSON) with this exact structure:

{
  "siteType": "ecommerce" OR "business",
  "businessName": "the actual business/brand name",
  "mainCategory": "primary industry/category",
  "location": "city/region or null if not found",
  "productsOrServices": ["top 5 specific product or service names from the site"],
  "aeoScore": 0-100 NUMBER (use full range, be harsh - most sites 20-55),
  "missingElements": ["5-7 specific missing things for AI visibility"],
  "dimensions": {
    "contentClarity": {
      "score": 0-100,
      "feedback": "mention the business name and be VERY specific to what's missing"
    },
    "entityCoverage": {
      "score": 0-100,
      "feedback": "mention business name and specific products/services not clearly defined"
    },
    "trustSignals": {
      "score": 0-100,
      "feedback": "mention business name and what trust elements are missing (reviews, about, certifications)"
    },
    "answerReadiness": {
      "score": 0-100,
      "feedback": "mention business name and specific questions customers ask that aren't answered"
    }
  },
  "whatAISeeNow": "Write as ChatGPT would TODAY. Be vague/unhelpful reflecting current state. Example: 'I don\\'t have current information about [business]. For [category], I\\'d recommend checking [competitor] or [general alternative].' Make it feel like the business is invisible.",
  "whatAIWillSee": "Write as ChatGPT would AFTER optimization. Include: business name, specific products/services found, actual differentiators, location details. Example: '[BusinessName] in [City] specializes in [specific products], including the [actual product names]. They [specific differentiator], with [specific detail found].' Use real details from the scraped content.",
  "generatedPage": "Complete valid HTML5 page optimized for AI agents. Requirements:\\n- H1: \\"Best [mainCategory] in [location]\\" (or just \\"Best [mainCategory]\\" if no location)\\n- Section: What [BusinessName] offers (list actual products/services)\\n- Section: Why choose [BusinessName] (3-5 specific differentiators from the site)\\n- Section: FAQ with 8-10 questions people ask AI about this business category, answered from this business perspective. Examples: \\"What is the best [mainCategory] in [location]?\\", \\"Does [BusinessName] offer [service]?\\", \\"What are [BusinessName]\\'s prices?\\", \\"Where is [BusinessName] located?\\", \\"Does [BusinessName] deliver/ship?\\", \\"What makes [BusinessName] different?\\", etc.\\n- JSON-LD schema (LocalBusiness for local, Store for ecommerce, Organization fallback)\\n- Pricing if found\\n- Location/contact if available\\n- Professional styling: dark background (#0A0A0A), white text, purple accents (#7C3AED), clean typography, mobile responsive, inline CSS only\\n- 800-1200 words\\n- Meta tags for SEO (title, description, keywords)\\n- Escape all quotes and newlines properly for JSON"
}

CRITICAL INSTRUCTIONS FOR SCORING:
1. Be extremely harsh. A site with no FAQ, no structured data, no AI-optimized content should NEVER exceed 45 points.
2. Each dimension score must reflect specific gaps in the actual business.
3. Scores should reflect: How easily can ChatGPT find, understand, and confidently recommend this business?
4. If no location found, penalize answerReadiness heavily (AI needs location context).
5. If no structured differentiators exist, penalize entityCoverage heavily.
6. If no trust signals (reviews, about, team, certifications), score trustSignals low.

CRITICAL FOR whatAISeeNow:
- Write as if the business doesn't exist in AI training data
- Be brutally honest about what ChatGPT would say today without optimization
- This should make the user feel the urgency of the problem

CRITICAL FOR whatAIWillSee:
- Include specific product names from the scraped content
- Include actual location details
- Include real differentiators mentioned on the site
- Make it specific, confident, and cite-able

CRITICAL FOR missingElements:
- List 5-7 specific gaps with business name when relevant
- Examples: "No FAQ addressing common questions about [business]", "No pricing information visible", "No structured data markup", "No clear delivery/shipping policy", "No customer testimonials or reviews", "No comparison with competitors", "No team/expertise credentials"`,
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
