# v0-the-new-seo-tool

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_xhMZX7xN7umLhoDS8NgE7I8WN6r5)

## Setup

This project needs the following environment variables in `.env.local` (and on Vercel for production):

| Variable | Required | Purpose |
|---|---|---|
| `FIRECRAWL_API_KEY` | yes | Scrapes the analyzed site |
| `PERPLEXITY_API_KEY` | optional | First model in the analysis fallback chain |
| `GROQ_API_KEY` | optional | Second/third models in the fallback chain (Llama 3.3 70B → 3.1 8B) |
| `TAVILY_API_KEY` | optional | Powers the **live search evidence** step via the Tavily remote MCP server. When set, the API runs 2–3 real-world category queries (e.g. `best <category> in <city>`) before the LLM call and grounds the `whatAISeeNow` field in those results. Without it, the analyzer silently falls back to the inferred behavior. |

Get a Tavily key at <https://tavily.com>. The remote MCP endpoint used is `https://mcp.tavily.com/mcp/?tavilyApiKey=<KEY>` (HTTP transport via `@ai-sdk/mcp`).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/tomas-nobile/v0-the-new-seo-tool" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
