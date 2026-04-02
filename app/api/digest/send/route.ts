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
          } catch {}
        },
      },
    }
  )
}

// POST /api/digest/send — send digest for the authenticated user immediately
export async function POST(request: NextRequest) {
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
      message: sent ? 'Digest sent successfully' : 'No changes in the last 7 days — digest not sent',
    })
  } catch (err) {
    console.error('Digest POST error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Digest failed' },
      { status: 500 }
    )
  }
}

// GET /api/digest/send?cron_secret=xxx — bulk send for all users (cron job)
// GET /api/digest/send?cron_secret=xxx&user_id=yyy — send for one user (testing)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cronSecret = searchParams.get('cron_secret')
  const targetUserId = searchParams.get('user_id')

  const validSecret =
    process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET

  if (!validSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use service-role key so we can query all users regardless of session
  const { createClient } = await import('@supabase/supabase-js')
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Resolve target users
    let targetUsers: { id: string; email: string }[] = []

    if (targetUserId) {
      const { data, error } = await admin.auth.admin.getUserById(targetUserId)
      if (error || !data.user) throw new Error('User not found')
      targetUsers = [{ id: data.user.id, email: data.user.email! }]
    } else {
      // Fetch all distinct user_ids that have at least one project
      const { data: rows, error } = await admin
        .from('projects')
        .select('user_id')
      if (error) throw new Error('Failed to fetch project owners')

      const uniqueIds = [...new Set((rows ?? []).map((r: { user_id: string }) => r.user_id))]

      // Batch-fetch user emails via Auth Admin API
      const users = await Promise.all(
        uniqueIds.map(async (uid) => {
          const { data } = await admin.auth.admin.getUserById(uid)
          if (!data.user?.email) return null
          return { id: uid, email: data.user.email }
        })
      )
      targetUsers = users.filter(Boolean) as { id: string; email: string }[]
    }

    let emailsSent = 0

    for (const user of targetUsers) {
      try {
        const sent = await sendDigestForUser(admin, user.id, user.email)
        if (sent) emailsSent++
      } catch (err) {
        // Log but continue — one user failure shouldn't abort the batch
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

async function sendDigestForUser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  email: string
): Promise<boolean> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch all snapshots with AI analysis from the last 7 days for this user's competitors
  const { data: snapshots, error } = await supabase
    .from('competitor_snapshots')
    .select(
      `
      id,
      competitor_id,
      scraped_at,
      ai_analysis,
      competitors!inner (
        id,
        name,
        homepage_url,
        projects!inner (
          id,
          name,
          user_id
        )
      )
    `
    )
    .gte('scraped_at', sevenDaysAgo)
    .not('ai_analysis', 'is', null)
    .eq('competitors.projects.user_id', userId)
    .order('scraped_at', { ascending: false })

  if (error) throw new Error(`Snapshot fetch failed: ${error.message}`)
  if (!snapshots || snapshots.length === 0) return false

  const emailHtml = generateDigestEmail(email, snapshots)

  const { error: sendError } = await resend.emails.send({
    from: 'CompeteScope <hello@competescope.com>',
    to: email,
    subject: '📊 Your weekly competitive intelligence digest',
    html: emailHtml,
  })

  if (sendError) throw new Error(`Resend error: ${sendError.message}`)

  return true
}
