import { createAdminClient } from '@/lib/supabase-server'
import { analyzeCompetitorChange } from '@/lib/openai-client'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

async function scrapeUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CompeteScope/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    })
    const html = await response.text()
    // Strip HTML tags for a basic text extraction
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 10000)
  } catch {
    return ''
  }
}

function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get all competitors
  const { data: competitors, error } = await supabase
    .from('competitors')
    .select('id, name, homepage_url, pricing_url, changelog_url')

  if (error || !competitors) {
    return NextResponse.json({ error: 'Failed to fetch competitors' }, { status: 500 })
  }

  const results = []

  for (const competitor of competitors) {
    const urlsToScrape = [
      competitor.homepage_url,
      competitor.pricing_url,
      competitor.changelog_url,
    ].filter(Boolean) as string[]

    for (const url of urlsToScrape) {
      const content = await scrapeUrl(url)
      if (!content) continue

      const contentHash = hashContent(content)

      // Check if content has changed
      const { data: lastSnapshot } = await supabase
        .from('competitor_snapshots')
        .select('content_hash, raw_content')
        .eq('competitor_id', competitor.id)
        .order('scraped_at', { ascending: false })
        .limit(1)
        .single()

      if (lastSnapshot?.content_hash === contentHash) {
        continue // No change
      }

      // Compute diff (simple: just store new content for now)
      const diffText = lastSnapshot
        ? `Previous content length: ${lastSnapshot.raw_content?.length ?? 0}\nNew content length: ${content.length}\n\nNew content preview:\n${content.slice(0, 2000)}`
        : content.slice(0, 2000)

      // Insert snapshot
      const { data: snapshot } = await supabase
        .from('competitor_snapshots')
        .insert({
          competitor_id: competitor.id,
          content_hash: contentHash,
          raw_content: content,
          diff_text: diffText,
        })
        .select()
        .single()

      if (snapshot) {
        // Run AI analysis
        const analysis = await analyzeCompetitorChange(diffText)
        await supabase
          .from('competitor_snapshots')
          .update({ ai_analysis: analysis })
          .eq('id', snapshot.id)

        results.push({ competitor: competitor.name, url, status: 'changed' })
      }
    }
  }

  return NextResponse.json({ processed: competitors.length, changes: results })
}
