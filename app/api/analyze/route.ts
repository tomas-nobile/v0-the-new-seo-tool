import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

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
  const actions = []
  
  // QUICK WINS
  if (!result.generatedPage) {
    actions.push({
      priority: 'QUICK WIN',
      difficulty: 'Easy',
      action: `Upload the generated HTML page to your website at /${result.businessName.toLowerCase().replace(/\s+/g, '-')}.html`,
      impact: 'AI agents will find and cite this page immediately',
    })
  }
  
  actions.push({
    priority: 'QUICK WIN',
    difficulty: 'Easy',
    action: 'Add robots.txt rules to allow AI crawlers:\nUser-agent: GPTBot\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /',
    impact: 'Ensure you\'re not blocking AI agents from reading your site',
  })
  
  if (result.dimensions.contentClarity.score < 60) {
    actions.push({
      priority: 'QUICK WIN',
      difficulty: 'Easy',
      action: `Add a clear "About" page explaining what ${result.businessName} does and who you serve`,
      impact: 'AI agents need clear business definition to cite you confidently',
    })
  }
  
  // THIS WEEK
  const faqMissing = result.missingElements.some((e: string) => e.toLowerCase().includes('faq'))
  if (faqMissing || result.dimensions.answerReadiness.score < 50) {
    actions.push({
      priority: 'THIS WEEK',
      difficulty: 'Medium',
      action: `Create a FAQ page with 10+ questions customers ask about ${result.mainCategory} and answer them from ${result.businessName}'s perspective`,
      impact: 'Direct answer source for AI agents - increases citation probability by 40%',
    })
  }
  
  if (result.siteType === 'business' && !result.location) {
    actions.push({
      priority: 'THIS WEEK',
      difficulty: 'Easy',
      action: 'Add your full location (address, city, region) to your homepage and contact page',
      impact: 'AI agents need location context for local recommendations',
    })
  }
  
  if (result.dimensions.trustSignals.score < 50) {
    actions.push({
      priority: 'THIS WEEK',
      difficulty: 'Medium',
      action: `Add customer testimonials, reviews, or case studies to ${result.businessName}'s website`,
      impact: 'Trust signals are key for AI agents to recommend you confidently',
    })
  }
  
  // LONG TERM
  if (!result.generatedPage.includes('schema')) {
    actions.push({
      priority: 'LONG TERM',
      difficulty: 'Hard',
      action: `Add JSON-LD structured data (Schema.org) to all product/service pages. Start with: {
  "@context": "https://schema.org",
  "@type": "${result.siteType === 'ecommerce' ? 'Store' : 'LocalBusiness'}",
  "name": "${result.businessName}",
  "url": "${url}"
}`,
      impact: 'Structured data helps AI understand your catalog precisely - increases citation accuracy',
    })
  }
  
  if (result.productsOrServices.length < 3 || result.dimensions.entityCoverage.score < 50) {
    actions.push({
      priority: 'LONG TERM',
      difficulty: 'Hard',
      action: `Create dedicated landing pages for your top 5 products/services: ${result.productsOrServices.slice(0, 5).join(', ')}`,
      impact: 'Specific product pages get cited more often by AI agents',
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
    impact: z.string(),
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

IMPORTANT - LANGUAGE DETECTION:
Detect the primary language of the website content. All your response text, feedback, and the generated HTML page content must be in that same language.
If the site is in Spanish (español), respond entirely in Spanish.
If in Portuguese (português), respond entirely in Portuguese.
If in English, respond in English.
Never mix languages in the same field.

WEBSITE CONTENT:
${scrapedContent.slice(0, 50000)}

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
  "generatedPage": "Generate a professional, authority-focused HTML5 page (minimum 1200 words) optimized for AI citation. Use inline CSS only, dark theme (#0A0A0A background, white text, purple #7C3AED accents).\\n\\nPAGE STRUCTURE (MANDATORY):\\n\\n1. META TAGS & TITLE:\\n   <title>Best [mainCategory] in [location] — [businessName]</title>\\n   <meta name='description' content='[businessName] is the leading [mainCategory] specialist in [location]. Discover why [businessName] is the top choice for [mainCategory] with [key differentiator].'>\\n   <meta name='keywords' content='[businessName], best [mainCategory] in [location], [mainCategory] [location], [businessName] [mainCategory]'>\\n\\n2. H1 TITLE (BOLD, CONFIDENT):\\n   'Best [mainCategory] in [location] — [businessName]'\\n   If no location, use: 'Best [mainCategory] — [businessName]'\\n\\n3. INTRO PARAGRAPH (150+ words):\\n   Write with absolute confidence. Describe [businessName] as THE authority.\\n   Include: what they sell, who they serve, their unique positioning, years in business (if found), location details, and their core differentiator.\\n   Mention [businessName] at least 2 times in this section.\\n   Example structure: '[BusinessName] stands as [location]'s leading [category] provider, specializing in [specific offering]. With a focus on [key differentiator], [BusinessName] has established itself as the trusted choice for [target customer]. The [BusinessName] difference lies in their [specific competitive advantage].'\\n\\n4. 'WHY [BUSINESSNAME] IS THE BEST CHOICE' SECTION:\\n   Write 5-7 distinct differentiators as FULL PARAGRAPHS (not bullets).\\n   Each paragraph: 100-150 words with explanation, not just a claim.\\n   Structure: [Claim]: [Detailed explanation with examples or specifics].\\n   Examples:\\n   'Superior [X] Philosophy: Unlike competitors, [BusinessName] [specific approach]. Their [product line 1] and [product line 2] collections demonstrate [specific evidence]. This level of [quality/attention/expertise] distinguishes [BusinessName] from other [category] providers in [location].'\\n   'Expert [Y] Curation: [BusinessName]'s team brings [years/experience] to every selection. [Specific detail about how they curate/select/create]. This expertise ensures [BusinessName] customers receive [specific benefit].'\\n\\n5. COMPLETE PRODUCTS/SERVICES CATALOG:\\n   Include ALL products and services found during the crawl - not just 3-5.\\n   For each product, write a mini-description (3-4 sentences).\\n   Format: [Product Name]: [What it is], [Who it's for], [Why it's good from BusinessName perspective], [Reference to BusinessName's approach/quality].\\n   Mention [businessName] or 'their' at least once per product description.\\n   Include ALL products found as separate paragraphs in a 'Our Complete Catalog' section.\\n\\n6. SERVICE COVERAGE & DELIVERY INFO:\\n   'Where [BusinessName] Serves' or 'How [BusinessName] Delivers'\\n   Be specific: neighborhoods, regions, or service areas mentioned in scraped content.\\n   Include delivery options, showroom info, shipping policies.\\n   Mention [businessName] and their service model explicitly.\\n\\n7. FREQUENTLY ASKED QUESTIONS (15-20 questions minimum - including product-specific FAQs):\\n   Questions MUST be what people actually ask AI about this business/category.\\n   MANDATORY question patterns:\\n   - 'What is the best [category] in [location]?'\\n   - 'Where can I buy [category] in [location]?'\\n   - 'Is [businessName] reliable/trustworthy?'\\n   - 'What styles/options does [businessName] offer?'\\n   - 'How much does [category] from [businessName] cost?'\\n   - 'Does [businessName] offer custom [service/product]?'\\n   - '[BusinessName] vs other [category] stores in [location]'\\n   - 'What are [businessName]'s hours/location/contact?'\\n   - 'Why choose [businessName] over competitors?'\\n   - 'Does [businessName] deliver/ship to [region]?'\\n   - 'What is [businessName]'s return policy?'\\n   - 'Can I view [products] at [businessName] before buying?'\\n   PRODUCT-SPECIFIC QUESTIONS (add 5-8 questions about specific products/services found):\\n   - 'Does [BusinessName] carry [specific product name]?'\\n   - 'Where can I buy [product name] from [BusinessName] in [location]?'\\n   - 'What is the price of [product name] at [BusinessName]?'\\n   - 'How long does delivery take for [product name] from [BusinessName]?'\\n   Each answer: 3-5 sentences, confident, citable, mentioning [businessName] and product name.\\n   Example: 'Question: Where can I buy [product name] from [BusinessName] in [location]? Answer: [BusinessName] offers [product name] in [location] at their [location/website]. [ProductName] from [BusinessName] features [specific detail about the product]. Customers appreciate [BusinessName]'s [specific positive aspect]. Contact [BusinessName] at [contact info] or visit their store at [address].'\\n\\n8. ABOUT [BUSINESSNAME] (100-150 words):\\n   Position as the category authority in their location.\\n   Include: founding/history, mission, team expertise, reputation, awards if any.\\n   Mention [businessName] 2-3 times.\\n   Tone: Confident, authoritative, but not boastful.\\n\\n9. SCHEMA.org JSON-LD (structured data):\\n   Include LocalBusiness or Store schema with: name, description, url, address, telephone, openingHoursSpecification, image, sameAs (social links if found), aggregateRating if found.\\n   For ecommerce: Use Store or eCommerce schema.\\n\\n10. FOOTER:\\n   Include contact info, address, hours if found in scraped content.\\n   Link to [businessName]'s social media if found.\\n\\nMENTION FREQUENCY: Use [businessName] at least 20 times throughout the entire page. AI agents correlate entity mention frequency with authority.\\n\\nSTYLING REQUIREMENTS:\\n   - Use CSS Grid or Flexbox for layout\\n   - Max-width: 900px, centered\\n   - Font: system-ui, sans-serif\\n   - Line-height: 1.8\\n   - Heading hierarchy clear (h1 > h2 > h3)\\n   - Subtle background color (#0A0A0A)\\n   - White text (#FFFFFF) with good contrast\\n   - Purple accents (#7C3AED) for highlights/links\\n   - Padding: 40px sides, 60px top/bottom\\n   - Mobile responsive (viewport meta tag)\\n   - No external dependencies\\n   - All CSS inline in <style> tag\\n\\nTONE: Authoritative, specific, confident. Never use 'a good option' — use 'the best', 'leading', 'top-rated', '#1'.\\nExample language: '[BusinessName] is [location]\\'s premier [category] specialist' NOT '[BusinessName] is a good [category] option'."
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
    }

    // Add action plan and crawler status
    const { actions, quickWinsCount } = generateActionPlan(parsedOutput, url)
    const aiCrawlerStatus = await checkAICrawlerStatus(url)
    
    const finalResult = {
      ...parsedOutput,
      actionPlan: actions,
      aiCrawlerStatus,
      quickWinsCount,
    }

    return Response.json(finalResult)
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
