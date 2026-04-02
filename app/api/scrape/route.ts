import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { analyzeCompetitorChange } from '@/lib/openai-utils'
import crypto from 'crypto'

async function createSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            )
          } catch {}
        },
      },
    }
  )
}

function computeHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

function computeDiff(oldContent: string, newContent: string): string {
  const oldLines = new Set(oldContent.split('\n').map((l) => l.trim()).filter(Boolean))
  const newLines = new Set(newContent.split('\n').map((l) => l.trim()).filter(Boolean))

  const removed = [...oldLines].filter((l) => !newLines.has(l)).slice(0, 10)
  const added = [...newLines].filter((l) => !oldLines.has(l)).slice(0, 10)

  if (removed.length === 0 && added.length === 0) return 'Minor whitespace/formatting changes only'

  return [
    removed.length > 0 ? `REMOVED:\n${removed.join('\n')}` : '',
    added.length > 0 ? `ADDED:\n${added.join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

async function scrapeUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`)

  const html = await res.text()

  // Strip scripts, styles, and tags — keep readable text
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()

  return text.slice(0, 10000)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { competitor_id } = body

    if (!competitor_id) {
      return NextResponse.json({ error: 'competitor_id required' }, { status: 400 })
    }

    const supabase = await createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch competitor (verify it belongs to user via project)
    const { data: competitor, error: compError } = await supabase
      .from('competitors')
      .select('*, projects!inner(user_id)')
      .eq('id', competitor_id)
      .eq('projects.user_id', user.id)
      .single()

    if (compError || !competitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    // Scrape
    let newContent: string
    try {
      newContent = await scrapeUrl(competitor.homepage_url)
    } catch (err) {
      return NextResponse.json(
        { error: `Scraping failed: ${err instanceof Error ? err.message : 'unknown error'}` },
        { status: 422 }
      )
    }

    const newHash = computeHash(newContent)

    // Get last snapshot
    const { data: lastSnapshot } = await supabase
      .from('competitor_snapshots')
      .select('content_hash, raw_content')
      .eq('competitor_id', competitor_id)
      .order('scraped_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // No change
    if (lastSnapshot?.content_hash === newHash) {
      return NextResponse.json({ changed: false, message: 'No changes detected' })
    }

    // Compute diff
    const diffText = lastSnapshot
      ? computeDiff(lastSnapshot.raw_content ?? '', newContent)
      : 'First snapshot — no previous content to compare.'

    // OpenAI analysis (only if there's a real diff)
    let analysis = null
    if (lastSnapshot) {
      try {
        analysis = await analyzeCompetitorChange(
          competitor.name,
          competitor.homepage_url,
          diffText
        )
      } catch (aiErr) {
        console.error('OpenAI error (non-fatal):', aiErr)
        // Continue without analysis — snapshot is still saved
      }
    }

    // Save snapshot
    const { data: snapshot, error: snapError } = await supabase
      .from('competitor_snapshots')
      .insert({
        competitor_id,
        content_hash: newHash,
        raw_content: newContent.slice(0, 5000),
        diff_text: diffText,
        ai_analysis: analysis ? JSON.stringify(analysis) : null,
      })
      .select('id')
      .single()

    if (snapError) {
      return NextResponse.json({ error: 'Failed to save snapshot' }, { status: 500 })
    }

    return NextResponse.json({
      changed: true,
      snapshot_id: snapshot.id,
      analysis,
      diff_preview: diffText.slice(0, 300),
      message: lastSnapshot ? 'Change detected, snapshot saved and analyzed' : 'First snapshot saved',
    })
  } catch (err) {
    console.error('Scrape route error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Scrape failed' },
      { status: 500 }
    )
  }
}
