import { createMCPClient } from '@ai-sdk/mcp'

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

interface TavilySearchPayload {
  results?: Array<{
    title?: string
    url?: string
    content?: string
    snippet?: string
  }>
}

function parseTavilyResult(raw: unknown): TavilySearchPayload | null {
  if (!raw || typeof raw !== 'object') return null
  const callResult = raw as { content?: Array<{ type?: string; text?: string }>; structuredContent?: unknown }

  if (callResult.structuredContent && typeof callResult.structuredContent === 'object') {
    return callResult.structuredContent as TavilySearchPayload
  }

  const textPart = callResult.content?.find((c) => c?.type === 'text')?.text
  if (!textPart) return null
  try {
    return JSON.parse(textPart) as TavilySearchPayload
  } catch {
    return null
  }
}

function normalizeHostname(input: string): string {
  try {
    return new URL(input).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return input.replace(/^www\./, '').toLowerCase()
  }
}

export async function runTavilyLiveSearch(
  apiKey: string,
  queries: string[],
  userUrl: string,
  options: { maxResultsPerQuery?: number; timeoutMs?: number } = {},
): Promise<LiveSearchEvidence | null> {
  const { maxResultsPerQuery = 5, timeoutMs = 25_000 } = options
  if (!apiKey || queries.length === 0) return null

  const endpoint = `https://mcp.tavily.com/mcp/?tavilyApiKey=${encodeURIComponent(apiKey)}`
  const targetHost = normalizeHostname(userUrl)

  let client: Awaited<ReturnType<typeof createMCPClient>> | undefined
  const deadline = AbortSignal.timeout(timeoutMs)

  try {
    client = await createMCPClient({
      transport: { type: 'http', url: endpoint },
    })

    const tools = await client.tools()
    const searchTool =
      (tools as Record<string, unknown>)['tavily-search'] ??
      (tools as Record<string, unknown>)['tavily_search']

    if (!searchTool || typeof (searchTool as { execute?: unknown }).execute !== 'function') {
      console.error('[tavily-mcp] tavily-search tool not exposed by server')
      return null
    }

    const execute = (searchTool as { execute: (input: unknown, ctx: unknown) => Promise<unknown> }).execute

    const queryRuns: LiveSearchQuery[] = []
    for (const query of queries) {
      if (deadline.aborted) break
      try {
        const raw = await execute(
          { query, max_results: maxResultsPerQuery, search_depth: 'basic' },
          { messages: [], toolCallId: `live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` },
        )
        const parsed = parseTavilyResult(raw)
        const results: LiveSearchResult[] = (parsed?.results ?? [])
          .slice(0, maxResultsPerQuery)
          .map((r) => ({
            title: r.title ?? '',
            url: r.url ?? '',
            snippet: r.content ?? r.snippet ?? '',
          }))
          .filter((r) => r.url)

        queryRuns.push({ query, results })
      } catch (err) {
        console.error('[tavily-mcp] query failed:', query, err)
        queryRuns.push({ query, results: [] })
      }
    }

    const appearsInResults = queryRuns.some((q) =>
      q.results.some((r) => normalizeHostname(r.url) === targetHost),
    )

    return { appearsInResults, queries: queryRuns }
  } catch (err) {
    console.error('[tavily-mcp] client error:', err)
    return null
  } finally {
    try {
      await client?.close()
    } catch {
      // ignore close errors
    }
  }
}

interface QueryHints {
  category: string | null
  location: string | null
  businessName: string | null
  siteType: 'ecommerce' | 'business' | null
}

function pickFirst(...values: Array<string | null | undefined>): string | null {
  for (const v of values) {
    if (v && v.trim()) return v.trim()
  }
  return null
}

export function extractQueryHintsFromMarkdown(markdown: string): QueryHints {
  const head = markdown.slice(0, 4000)

  const titleMatch = head.match(/^#\s+(.+)$/m) || head.match(/<title>([^<]+)<\/title>/i)
  const h1Match = head.match(/^#\s+(.+)$/m)

  const cityMatch = head.match(
    /\b(?:in|en|located in|ubicad[oa] en|based in)\s+([A-Z][\p{L}\s.'-]{2,40})/u,
  )

  return {
    category: null,
    location: pickFirst(cityMatch?.[1] ?? null),
    businessName: pickFirst(h1Match?.[1] ?? null, titleMatch?.[1] ?? null),
    siteType: null,
  }
}

function clean(v: string | null | undefined): string {
  if (!v) return ''
  const s = v.trim()
  if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'none') return ''
  // collapse a comma-joined list to its first item — small detection models
  // sometimes pack several services into a single field
  return s.split(',')[0].trim()
}

export type SupportedLanguage = 'en' | 'es' | 'pt'

interface QueryTemplates {
  defaultCategory: string
  best: (c: string, l: string) => string
  recommendations: (c: string, l: string) => string
  whereToBuy: (p: string, l: string) => string
  onlineStore: (c: string, l: string) => string
  topRated: (c: string, l: string) => string
}

const TEMPLATES: Record<SupportedLanguage, QueryTemplates> = {
  en: {
    defaultCategory: 'business',
    best: (c, l) => `best ${c}${l ? ` in ${l}` : ''}`,
    recommendations: (c, l) => `${c} recommendations${l ? ` in ${l}` : ''}`,
    whereToBuy: (p, l) => `where to buy ${p}${l ? ` in ${l}` : ''}`,
    onlineStore: (c, l) => `${c} online store${l ? ` in ${l}` : ''}`,
    topRated: (c, l) => (l ? `top ${c} in ${l}` : `top rated ${c}`),
  },
  es: {
    defaultCategory: 'negocio',
    best: (c, l) => `mejor ${c}${l ? ` en ${l}` : ''}`,
    recommendations: (c, l) => `recomendaciones de ${c}${l ? ` en ${l}` : ''}`,
    whereToBuy: (p, l) => `dónde comprar ${p}${l ? ` en ${l}` : ''}`,
    onlineStore: (c, l) => `tienda online de ${c}${l ? ` en ${l}` : ''}`,
    topRated: (c, l) => (l ? `los mejores ${c} en ${l}` : `los mejores ${c}`),
  },
  pt: {
    defaultCategory: 'negócio',
    best: (c, l) => `melhor ${c}${l ? ` em ${l}` : ''}`,
    recommendations: (c, l) => `recomendações de ${c}${l ? ` em ${l}` : ''}`,
    whereToBuy: (p, l) => `onde comprar ${p}${l ? ` em ${l}` : ''}`,
    onlineStore: (c, l) => `loja online de ${c}${l ? ` em ${l}` : ''}`,
    topRated: (c, l) => (l ? `melhores ${c} em ${l}` : `melhores ${c}`),
  },
}

export function buildLiveSearchQueries(input: {
  category: string | null
  location: string | null
  businessName: string | null
  siteType: 'ecommerce' | 'business' | null
  topProducts?: string[]
  language?: SupportedLanguage | null
}): string[] {
  const lang: SupportedLanguage = input.language ?? 'en'
  const t = TEMPLATES[lang] ?? TEMPLATES.en
  const category = clean(input.category) || t.defaultCategory
  const location = clean(input.location)
  const topProduct = clean(input.topProducts?.[0])

  if (input.siteType === 'ecommerce') {
    const queries = [
      t.best(category, location),
      topProduct ? t.whereToBuy(topProduct, location) : t.recommendations(category, location),
      t.onlineStore(category, location),
    ]
    return Array.from(new Set(queries.filter(Boolean))).slice(0, 3)
  }

  const queries = [
    t.best(category, location),
    t.recommendations(category, location),
    t.topRated(category, location),
  ]
  return Array.from(new Set(queries.filter(Boolean))).slice(0, 3)
}
