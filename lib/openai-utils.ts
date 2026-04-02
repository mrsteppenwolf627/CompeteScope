import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface CompetitorAnalysis {
  what_changed: string
  implication: string
  your_action: string
}

export async function analyzeCompetitorChange(
  competitorName: string,
  url: string,
  diff: string
): Promise<CompetitorAnalysis> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    max_tokens: 400,
    messages: [
      {
        role: 'system',
        content: 'You are a product strategist analyzing competitor updates. Always respond with valid JSON.',
      },
      {
        role: 'user',
        content: `Competitor: ${competitorName}
Website: ${url}

This competitor's website changed. Here's what was added/removed:

${diff}

Analyze this change and provide JSON output:
{
  "what_changed": "1-2 sentence summary of what changed",
  "implication": "How this affects the market",
  "your_action": "1-2 recommended actions for the founder"
}

Be specific and actionable.`,
      },
    ],
  })

  const text = response.choices[0].message.content ?? '{}'
  return JSON.parse(text) as CompetitorAnalysis
}
