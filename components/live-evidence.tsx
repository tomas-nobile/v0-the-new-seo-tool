import { Search, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import type { LiveSearchEvidence } from '@/lib/types'

interface LiveEvidenceProps {
  evidence: LiveSearchEvidence | null | undefined
  userUrl?: string
}

function normalizeHostname(input: string): string {
  try {
    return new URL(input).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return input.replace(/^www\./, '').toLowerCase()
  }
}

function faviconUrl(rawUrl: string): string | null {
  try {
    const host = new URL(rawUrl).hostname
    return `https://www.google.com/s2/favicons?domain=${host}&sz=32`
  } catch {
    return null
  }
}

export function LiveEvidence({ evidence, userUrl }: LiveEvidenceProps) {
  if (!evidence || evidence.queries.length === 0) return null

  const targetHost = userUrl ? normalizeHostname(userUrl) : null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Search className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Real-time search via Tavily MCP</h3>
        {evidence.appearsInResults ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success border border-success/30 px-2.5 py-0.5 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            You appear here
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 text-destructive border border-destructive/30 px-2.5 py-0.5 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            Not in results
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        These are live web results returned right now for queries a user might ask AI agents about
        your category. If your site isn&apos;t here, AI agents likely won&apos;t cite you.
      </p>

      <div className="space-y-4">
        {evidence.queries.map((q, qi) => (
          <div key={qi} className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-secondary/30">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Query</p>
              <p className="text-sm font-semibold text-foreground">&ldquo;{q.query}&rdquo;</p>
            </div>

            {q.results.length === 0 ? (
              <p className="px-4 py-4 text-sm text-muted-foreground italic">No results returned.</p>
            ) : (
              <ul className="divide-y divide-border">
                {q.results.map((r, ri) => {
                  const isUser = targetHost && normalizeHostname(r.url) === targetHost
                  const fav = faviconUrl(r.url)
                  return (
                    <li
                      key={ri}
                      className={`px-4 py-3 ${isUser ? 'bg-success/5' : 'hover:bg-secondary/20'}`}
                    >
                      <div className="flex items-start gap-3">
                        {fav ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={fav}
                            alt=""
                            width={16}
                            height={16}
                            className="mt-1 w-4 h-4 rounded-sm shrink-0"
                          />
                        ) : (
                          <div className="mt-1 w-4 h-4 rounded-sm bg-muted shrink-0" aria-hidden />
                        )}
                        <div className="min-w-0 flex-1">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary hover:underline break-words"
                          >
                            {r.title || r.url}
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" />
                          </a>
                          {isUser && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-success/15 text-success border border-success/30 px-2 py-0.5 text-[10px] font-semibold uppercase">
                              <CheckCircle2 className="w-3 h-3" />
                              You
                            </span>
                          )}
                          <p className="mt-0.5 text-xs text-muted-foreground truncate">{r.url}</p>
                          {r.snippet && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {r.snippet}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
