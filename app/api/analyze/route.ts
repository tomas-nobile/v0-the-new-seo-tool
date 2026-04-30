import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const perplexity = createOpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai',
})

const MODEL_CHAIN = [
  { model: perplexity('sonar-pro'), name: 'Perplexity Sonar Pro' },
  { model: groq('llama-3.3-70b-versatile'), name: 'Llama 3.3 70B' },
  { model: groq('llama-3.1-8b-instant'), name: 'Llama 3.1 8B' },
]

function isRateLimitError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return (
    msg.includes('rate_limit_exceeded') ||
    msg.includes('Rate limit reached') ||
    (error as any)?.statusCode === 429 ||
    (error as any)?.lastError?.statusCode === 429
  )
}

async function generateWithFallback(
  messages: { role: 'system' | 'user'; content: string }[]
): Promise<{ text: string; modelUsed: string }> {
  let lastError: unknown
  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const { model, name } = MODEL_CHAIN[i]
    const isLast = i === MODEL_CHAIN.length - 1
    try {
      const { text } = await generateText({ model, messages })
      return { text, modelUsed: name }
    } catch (error) {
      lastError = error
      // Perplexity: skip on any error (no credits, auth, rate limit, etc.)
      // Groq: skip only on rate limit
      const skip = name.includes('Perplexity') || isRateLimitError(error)
      if (skip && !isLast) continue
      throw error
    }
  }
  throw lastError
}

// Function to check AI crawler status from robots.txt
async function checkAICrawlerStatus(url: string) {
  try {
    const parsedUrl = new URL(url)
    const robotsUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}/robots.txt`
    
    const response = await fetch(robotsUrl, { timeout: 5000 })
    if (!response.ok) {
      // If no robots.txt exists, all bots are allowed by default
      return {
        gptbot: true,
        claudebot: true,
        perplexitybot: true,
        googlebot: true,
      }
    }
    
    const robotsContent = await response.text()
    
    // Simple parser: check if each bot is explicitly disallowed
    const isBlocked = (botName: string) => {
      const regex = new RegExp(`User-agent:\\s*${botName}[\\s\\S]*?(?=User-agent:|$)`, 'i')
      const section = robotsContent.match(regex)?.[0] || ''
      return /Disallow:\s*\/\s*$/m.test(section)
    }
    
    return {
      gptbot: !isBlocked('GPTBot'),
      claudebot: !isBlocked('ClaudeBot'),
      perplexitybot: !isBlocked('PerplexityBot'),
      googlebot: !isBlocked('GoogleBot'),
    }
  } catch {
    // If fetch fails, assume all bots are allowed
    return {
      gptbot: true,
      claudebot: true,
      perplexitybot: true,
      googlebot: true,
    }
  }
}

// Function to generate action plan based on analysis
function generateActionPlan(result: any, url: string): { actions: any[], quickWinsCount: number } {
  const score = result.aeoScore
  const actions = []

  // Always include: upload the generated page
  actions.push({
    priority: 'QUICK WIN',
    difficulty: 'Easy',
    action: `Upload the generated HTML page to your website at /${result.businessName.toLowerCase().replace(/\s+/g, '-')}.html`,
    impact: 'High',
  })

  // Always include: FAQ page
  actions.push({
    priority: 'THIS WEEK',
    difficulty: 'Medium',
    action: `Create a FAQ page with 10+ questions customers ask about ${result.mainCategory} and answer them from ${result.businessName}'s perspective`,
    impact: 'High',
  })

  // Always include: About page
  actions.push({
    priority: 'QUICK WIN',
    difficulty: 'Easy',
    action: `Add a clear "About" page explaining what ${result.businessName} does, who you serve, and your main differentiator`,
    impact: 'High',
  })

  // Always include: Schema.org structured data
  actions.push({
    priority: 'LONG TERM',
    difficulty: 'Hard',
    action: `Add JSON-LD structured data (Schema.org) to all product/service pages:\n{\n  "@context": "https://schema.org",\n  "@type": "${result.siteType === 'ecommerce' ? 'Store' : 'LocalBusiness'}",\n  "name": "${result.businessName}",\n  "url": "${url}"\n}`,
    impact: 'Medium',
  })

  // Score < 70: add trust signals
  if (score < 70 && result.dimensions.trustSignals.score < 70) {
    actions.push({
      priority: 'THIS WEEK',
      difficulty: 'Medium',
      action: `Add customer testimonials, reviews, or case studies to ${result.businessName}'s website`,
      impact: 'High',
    })
  }

  // Score < 60: add location if missing
  if (score < 60) {
    if (!result.location) {
      actions.push({
        priority: 'THIS WEEK',
        difficulty: 'Easy',
        action: 'Add your full location (address, city, region) to your homepage and contact page',
        impact: 'Medium',
      })
    }
    // Add product/service pages
    if (result.productsOrServices.length > 0) {
      actions.push({
        priority: 'THIS WEEK',
        difficulty: 'Medium',
        action: `Create dedicated landing pages for your top products/services: ${result.productsOrServices.slice(0, 5).join(', ')}`,
        impact: 'Medium',
      })
    }
  }

  // Score < 50: add contact info and pricing pages
  if (score < 50) {
    actions.push({
      priority: 'THIS WEEK',
      difficulty: 'Easy',
      action: `Add a dedicated Contact page with phone, email, address, and business hours for ${result.businessName}`,
      impact: 'Medium',
    })
    actions.push({
      priority: 'THIS WEEK',
      difficulty: 'Medium',
      action: `Add pricing or pricing ranges for your ${result.mainCategory} products/services so AI agents can answer cost-related questions`,
      impact: 'High',
    })
  }

  // Score < 40: critical content gaps
  if (score < 40) {
    actions.push({
      priority: 'QUICK WIN',
      difficulty: 'Easy',
      action: `Write a 200+ word homepage description that clearly explains what ${result.businessName} sells, who your customers are, and your key differentiator`,
      impact: 'High',
    })
    actions.push({
      priority: 'THIS WEEK',
      difficulty: 'Medium',
      action: `Create a "How it works" or "Our process" page explaining how customers can buy from ${result.businessName} step by step`,
      impact: 'Medium',
    })
    actions.push({
      priority: 'LONG TERM',
      difficulty: 'Hard',
      action: `Start a blog or resources section with articles about ${result.mainCategory} trends, tips, and advice. AI agents cite content-rich sites more often`,
      impact: 'Low',
    })
  }

  // Score < 30: severe coverage gaps
  if (score < 30) {
    actions.push({
      priority: 'QUICK WIN',
      difficulty: 'Easy',
      action: `Add your business to Google Business Profile and link it from your website — AI agents pull data from Google listings`,
      impact: 'High',
    })
    actions.push({
      priority: 'THIS WEEK',
      difficulty: 'Medium',
      action: `Add social proof: number of customers served, years in business, or certifications/awards for ${result.businessName}`,
      impact: 'Medium',
    })
    actions.push({
      priority: 'LONG TERM',
      difficulty: 'Hard',
      action: `Create comparison pages: "${result.businessName} vs competitors" — AI agents use these to answer recommendation queries`,
      impact: 'Medium',
    })
  }

  const quickWinsCount = actions.filter(a => a.priority === 'QUICK WIN').length

  return { actions, quickWinsCount }
}


const analysisSchema = z.object({
  siteType: z.enum(['ecommerce', 'business']),
  businessName: z.string(),
  mainCategory: z.string(),
  location: z.string().nullable(),
  productsOrServices: z.array(z.string()),
  aeoScore: z.number().min(0).max(100),
  missingElements: z.array(z.string()),
  detectedLanguage: z.enum(['en', 'es', 'pt']),
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
  actionPlan: z.array(z.object({
    priority: z.enum(['QUICK WIN', 'THIS WEEK', 'LONG TERM']),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    action: z.string(),
    impact: z.enum(['High', 'Medium', 'Low']),
  })).optional(),
  aiCrawlerStatus: z.object({
    gptbot: z.boolean(),
    claudebot: z.boolean(),
    perplexitybot: z.boolean(),
    googlebot: z.boolean(),
  }).optional(),
  quickWinsCount: z.number().optional(),
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

    const crawlResponse = await fetch('https://api.firecrawl.dev/v1/crawl', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        limit: 10,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true,
        },
      }),
    })

    let scrapedContent = ''

    if (crawlResponse.ok) {
      const crawlData = await crawlResponse.json()
      
      // Combine content from all crawled pages for full catalog
      if (crawlData.data && Array.isArray(crawlData.data)) {
        scrapedContent = crawlData.data
          .map((page: any) => `URL: ${page.url}\n\n${page.markdown}`)
          .join('\n\n---\n\n')
        console.log('[v0] Crawled', crawlData.data.length, 'pages successfully')
      }
    } else {
      console.log('[v0] Crawl failed, falling back to scrape...')
    }

    // Fallback to single page scrape if crawl failed
    if (!scrapedContent) {
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
      scrapedContent = scrapeData.data?.markdown || ''
    }

    if (!scrapedContent) {
      return Response.json(
        { error: 'No content could be extracted from this URL' },
        { status: 400 }
      )
    }

    // Step 2: Analyze with AI (Perplexity → Groq 70B → Groq 8B)
    const { text, modelUsed } = await generateWithFallback([
        {
          role: 'system',
          content: 'You are an AEO (Agent Engine Optimization) expert. Always respond with valid JSON only, no markdown code blocks or extra text.',
        },
        {
          role: 'user',
          content: `You are an expert AEO (Agent Engine Optimization) analyst. Analyze this website with extreme scrutiny. Most sites should score 20-55. Be harsh and realistic, not encouraging.

IMPORTANT - LANGUAGE DETECTION:
Detect the primary language of the website content. All your response text, feedback, and the generated HTML page content must be in that same language.
If the site is in Spanish (español), respond entirely in Spanish.
If in Portuguese (português), respond entirely in Portuguese.
If in English, respond in English.
Never mix languages in the same field.

WEBSITE CONTENT:
${scrapedContent.slice(0, 15000)}

URL: ${url}

Return ONLY valid JSON (no markdown, no code blocks, just raw JSON) with this exact structure:

{
  "siteType": "ecommerce" OR "business",
  "businessName": "the actual business/brand name",
  "mainCategory": "primary industry/category",
  "location": "city/region or null if not found",
  "productsOrServices": ["extract ALL unique products/services found across ALL crawled pages - not just top 5. Include every product name, variant, subcategory, and service offering discovered"],
  "aeoScore": 0-100 NUMBER (use full range, be harsh - most sites 20-55),
  "missingElements": ["5-7 specific missing things for AI visibility"],
  "detectedLanguage": "detected language code: 'en' for English, 'es' for Spanish, 'pt' for Portuguese",
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
  "generatedPage": "Generate a professional, authority-focused HTML5 page (minimum 1200 words) optimized for AI citation. Use inline CSS only, dark theme (#0A0A0A background, white text, purple #7C3AED accents).\\n\\nCRITICAL: You MUST include ALL of the products/services from the scraped content in the catalog section. Do NOT limit to 3 products. Include EVERY product mentioned as separate paragraphs.\\n\\nPAGE STRUCTURE (MANDATORY):\\n\\n1. META TAGS & TITLE:\\n   <title>Best [mainCategory] in [location] — [businessName]</title>\\n   <meta name='description' content='[businessName] is the leading [mainCategory] specialist in [location]. Discover why [businessName] is the top choice for [mainCategory] with [key differentiator].'>\\n   <meta name='keywords' content='[businessName], best [mainCategory] in [location], [mainCategory] [location], [businessName] [mainCategory]'>\\n\\n2. H1 TITLE (BOLD, CONFIDENT):\\n   'Best [mainCategory] in [location] — [businessName]'\\n   If no location, use: 'Best [mainCategory] — [businessName]'\\n\\n3. INTRO PARAGRAPH (150+ words):\\n   Write with absolute confidence. Describe [businessName] as THE authority.\\n   Include: what they sell, who they serve, their unique positioning, years in business (if found), location details, and their core differentiator.\\n   Mention [businessName] at least 2 times in this section.\\n\\n4. 'WHY [BUSINESSNAME] IS THE BEST CHOICE' SECTION:\\n   Write 5-7 distinct differentiators as FULL PARAGRAPHS (not bullets).\\n   Each paragraph: 100-150 words with explanation, not just a claim.\\n\\n5. 'OUR COMPLETE CATALOG' SECTION (CRITICAL):\\n   You MUST include EVERY SINGLE product from the scraped content.\\n   Format each product as a separate paragraph (3-4 sentences each).\\n   For EACH product: [Product Name]: [What it is], [Who it\\'s for], [Why it\\'s good from BusinessName perspective], [Reference to BusinessName\\'s approach].\\n   Repeat this format for EVERY product. Do not skip any.\\n\\n6. SERVICE COVERAGE & DELIVERY INFO:\\n   Include delivery options, showroom info, shipping policies.\\n   Mention [businessName] and their service model explicitly.\\n\\n7. FREQUENTLY ASKED QUESTIONS (MINIMUM 7 QUESTIONS - DO NOT SKIP OR LIMIT):\\n   You MUST include AT LEAST 7 FAQs. This is mandatory.\\n   Format as: <h3>Question?</h3>\\n   <p>Answer with 2-3 sentences, confident and citable.</p>\\n   Include these types of questions:\\n   - 'What is [mainCategory] and why does [BusinessName] specialize in it?'\\n   - 'How does [BusinessName] differ from competitors?'\\n   - 'What products/services does [BusinessName] offer?'\\n   - 'Where is [BusinessName] located and do they serve [location/region]?'\\n   - 'How much do [BusinessName]\\'s products/services cost?'\\n   - 'Does [BusinessName] offer custom or specialized [category]?'\\n   - '[BusinessName] vs competitors - why choose [BusinessName]?'\\n   Add 2-3 more product-specific questions using actual product names from the catalog.\\n   CRITICAL: All 7+ questions must be answered with specific references to [BusinessName].\\n\\n8. ABOUT [BUSINESSNAME] (100-150 words):\\n   Position as the category authority.\\n\\n9. SCHEMA.org JSON-LD (structured data)\\n\\n10. FOOTER with contact info.\\n\\nSTYLING REQUIREMENTS:\\n   - Use CSS Grid or Flexbox for layout\\n   - Max-width: 900px, centered\\n   - Font: system-ui, sans-serif\\n   - Line-height: 1.8\\n   - Heading hierarchy clear (h1 > h2 > h3)\\n   - Subtle background color (#0A0A0A)\\n   - White text (#FFFFFF)\\n   - Purple accents (#7C3AED)\\n   - All CSS inline in <style> tag\\n\\nTONE: Authoritative, specific, confident. Use 'the best', 'leading', 'top-rated'. Mention [businessName] at least 20 times throughout the page."
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

    ])

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
    }

    // Add action plan and crawler status
    const { actions, quickWinsCount } = generateActionPlan(parsedOutput, url)
    const aiCrawlerStatus = await checkAICrawlerStatus(url)
    
    const finalResult = {
      ...parsedOutput,
      actionPlan: actions,
      aiCrawlerStatus,
      quickWinsCount,
      modelUsed,
    }

    return Response.json(finalResult)
  } catch (error) {
    console.error('[v0] Analysis error:', error)
    
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Check for Groq rate limit error
    if (errorMessage.includes('rate_limit_exceeded') || errorMessage.includes('Rate limit reached')) {
      let retryAfterSeconds = 3600
      const anyError = error as any
      const retryAfterHeader =
        anyError?.lastError?.responseHeaders?.['retry-after'] ||
        anyError?.errors?.[0]?.responseHeaders?.['retry-after']
      if (retryAfterHeader) {
        retryAfterSeconds = parseInt(retryAfterHeader, 10)
      } else {
        const match = errorMessage.match(/Please try again in (?:(\d+)h)?(?:(\d+)m)?(?:([\d.]+)s)?/)
        if (match) {
          const hours = parseInt(match[1] || '0', 10)
          const minutes = parseInt(match[2] || '0', 10)
          const seconds = parseFloat(match[3] || '0')
          retryAfterSeconds = hours * 3600 + minutes * 60 + Math.ceil(seconds)
        }
      }
      return Response.json(
        { error: 'Daily AI limit reached', isRateLimitError: true, retryAfterSeconds },
        { status: 429 }
      )
    }

    // Check for AI Gateway credit card requirement
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
