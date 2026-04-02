import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { generateDigestEmail } from '@/lib/email-template'

const resend = new Resend(process.env.RESEND_API_KEY)

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
          } catch { }
        },
      },
    }
  )
}

// POST /api/digest/send — send digest for the currently authenticated user
export async function POST(_request: NextRequest) {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sent = await sendDigestForUser(supabase, user.id, user.email!)
    return NextResponse.json({
      success: true,
      emailsSent: sent ? 1 : 0,
      message: sent
        ? 'Digest sent successfully'
        : 'No changes in the last 7 days — digest not sent',
    })
  } catch (err) {
    console.error('Digest POST error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Digest failed' },
      { status: 500 }
    )
  }
}

// GET /api/digest/send?cron_secret=xxx            — bulk send (all users)
// GET /api/digest/send?cron_secret=xxx&user_id=y — single user (for testing)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cronSecret = searchParams.get('cron_secret')
  const targetUserId = searchParams.get('user_id')

  if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 500 }
    )
  }

  const { createClient } = await import('@supabase/supabase-js')
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    let targetUsers: { id: string; email: string }[] = []

    if (targetUserId) {
      // Single user — look up via admin API
      const { data, error } = await admin.auth.admin.getUserById(targetUserId)
      if (error || !data.user?.email) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      targetUsers = [{ id: data.user.id, email: data.user.email }]
    } else {
      // All users — list via admin API, then filter to those with projects
      const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
      if (error) throw new Error(`Failed to list users: ${error.message}`)

      const allUsers = (data.users ?? []).filter((u) => u.email)

      // Fetch all user_ids that have at least one project in a single query
      const { data: projectRows, error: projError } = await admin
        .from('projects')
        .select('user_id')
      if (projError) throw new Error(`Failed to fetch projects: ${projError.message}`)

      const usersWithProjects = new Set(
        (projectRows ?? []).map((r: { user_id: string }) => r.user_id)
      )

      targetUsers = allUsers
        .filter((u) => usersWithProjects.has(u.id))
        .map((u) => ({ id: u.id, email: u.email! }))
    }

    let emailsSent = 0

    for (const user of targetUsers) {
      try {
        const sent = await sendDigestForUser(admin, user.id, user.email)
        if (sent) emailsSent++
      } catch (err) {
        console.error(`Digest failed for ${user.email}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      usersProcessed: targetUsers.length,
      message: `Digest sent to ${emailsSent} of ${targetUsers.length} users`,
    })
  } catch (err) {
    console.error('Digest GET error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Digest failed' },
      { status: 500 }
    )
  }
}

// ─── Core digest logic ────────────────────────────────────────────────────────

interface ProjectRow { id: string; name: string }
interface CompetitorRow { id: string; name: string; homepage_url: string; project_id: string }
interface SnapshotRow {
  id: string
  competitor_id: string
  scraped_at: string
  ai_analysis: string | null
}

async function sendDigestForUser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  email: string
): Promise<boolean> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Step 1 — projects owned by this user
  const { data: projects, error: projError } = await supabase
    .from('projects')
    .select('id, name')
    .eq('user_id', userId)

  if (projError) throw new Error(`Projects fetch failed: ${projError.message}`)
  if (!projects || projects.length === 0) return false

  const projectIds = (projects as ProjectRow[]).map((p) => p.id)
  const projectById = Object.fromEntries((projects as ProjectRow[]).map((p) => [p.id, p]))

  // Step 2 — competitors belonging to those projects
  const { data: competitors, error: compError } = await supabase
    .from('competitors')
    .select('id, name, homepage_url, project_id')
    .in('project_id', projectIds)

  if (compError) throw new Error(`Competitors fetch failed: ${compError.message}`)
  if (!competitors || competitors.length === 0) return false

  const competitorIds = (competitors as CompetitorRow[]).map((c) => c.id)
  const competitorById = Object.fromEntries(
    (competitors as CompetitorRow[]).map((c) => [c.id, c])
  )

  // Step 3 — snapshots with AI analysis in the last 7 days
  const { data: snapshots, error: snapError } = await supabase
    .from('competitor_snapshots')
    .select('id, competitor_id, scraped_at, ai_analysis')
    .in('competitor_id', competitorIds)
    .gte('scraped_at', sevenDaysAgo)
    .not('ai_analysis', 'is', null)
    .order('scraped_at', { ascending: false })

  if (snapError) throw new Error(`Snapshots fetch failed: ${snapError.message}`)
  if (!snapshots || snapshots.length === 0) return false

  // Step 4 — enrich snapshots with nested competitor + project shape the template expects
  const enriched = (snapshots as SnapshotRow[])
    .map((snap) => {
      const competitor = competitorById[snap.competitor_id]
      if (!competitor) return null
      const project = projectById[competitor.project_id]
      if (!project) return null
      return {
        ...snap,
        competitors: {
          id: competitor.id,
          name: competitor.name,
          homepage_url: competitor.homepage_url,
          projects: { id: project.id, name: project.name },
        },
      }
    })
    .filter(Boolean)

  if (enriched.length === 0) return false

  // Step 5 — generate and send
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emailHtml = generateDigestEmail(email, enriched as any)

  const { error: sendError } = await resend.emails.send({
    from: 'CompeteScope <aitor@aitoralmu.xyz>',
    to: email,
    subject: '📊 Your weekly competitive intelligence digest',
    html: emailHtml,
  })

  if (sendError) throw new Error(`Resend error: ${sendError.message}`)

  return true
}