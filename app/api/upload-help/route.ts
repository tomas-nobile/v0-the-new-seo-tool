import { createGroq } from '@ai-sdk/groq'
import { streamText } from 'ai'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const { hosting, techStack, filename, suggestedEndpoint, businessName } = await req.json()

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: `You are a friendly web hosting expert. Your job is to give clear, step-by-step instructions to help a non-technical business owner upload an HTML file to their website. 
Be concise, use numbered steps, and avoid technical jargon. 
If the hosting is unknown, give general instructions and mention common options.
Respond in the same language the user's inputs are written in.`,
    prompt: `I need to upload an HTML file to my website.

File name: ${filename}
I want it accessible at: ${suggestedEndpoint}.html
My hosting provider: ${hosting || 'I don\'t know'}
My website is built with: ${techStack || 'I\'m not sure'}
My business: ${businessName}

Give me specific, step-by-step instructions to upload this file. If my hosting or tech stack is unknown, give me the most common method and ask me to clarify. Keep it short and practical.`,
  })

  return result.toTextStreamResponse()
}
