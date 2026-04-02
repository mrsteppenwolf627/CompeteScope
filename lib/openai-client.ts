import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateWeeklyDigest(
  projectName: string,
  analyses: Array<{ competitor: string; analysis: string; date: string }>
): Promise<string> {
  const analysesText = analyses
    .map((a) => `**${a.competitor}** (${a.date}):\n${a.analysis}`)
    .join('\n\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a competitive intelligence analyst writing a weekly digest for a SaaS team.
        Write an executive summary in HTML format with key highlights and strategic recommendations.`,
      },
      {
        role: 'user',
        content: `Project: ${projectName}\n\nThis week's competitor activity:\n\n${analysesText}`,
      },
    ],
    temperature: 0.4,
    max_tokens: 2000,
  })

  return response.choices[0].message.content ?? ''
}

export async function analyzeCompetitorUpdate(diffText: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a product strategy advisor for early-stage SaaS founders.'
        },
        {
          role: 'user',
          content: `Analyze this competitor update and provide:
1. WHAT CHANGED (1-2 sentences, be specific)
2. STRATEGIC IMPLICATION (how this affects the market)
3. ACTION ITEM (1-2 things the founder should do about it)

Competitor Update Diff:
${diffText}

Format your response as JSON:
{
  "what_changed": "...",
  "implication": "...",
  "action": "..."
}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (content) {
      return content;
    }
    return 'Analysis failed';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

// Alias used by scrape cron
export const analyzeCompetitorChange = analyzeCompetitorUpdate
