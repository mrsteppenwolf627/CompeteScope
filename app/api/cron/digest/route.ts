import { createAdminClient } from '@/lib/supabase-server'
import { generateWeeklyDigest } from '@/lib/openai-client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get all projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')

  if (!projects) {
    return NextResponse.json({ error: 'No projects found' }, { status: 404 })
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const results = []

  for (const project of projects) {
    // Get recent snapshots with analysis for this project
    const { data: snapshots } = await supabase
      .from('competitor_snapshots')
      .select('ai_analysis, scraped_at, competitors(name, project_id)')
      .gte('scraped_at', oneWeekAgo)
      .not('ai_analysis', 'is', null)
      .eq('competitors.project_id', project.id)
      .order('scraped_at', { ascending: false })

    if (!snapshots || snapshots.length === 0) continue

    const analyses = snapshots.map((s) => ({
      competitor: (s.competitors as unknown as { name: string } | null)?.name ?? 'Unknown',
      analysis: s.ai_analysis ?? '',
      date: new Date(s.scraped_at).toLocaleDateString(),
    }))

    const summaryHtml = await generateWeeklyDigest(project.name, analyses)

    await supabase
      .from('digests')
      .insert({ project_id: project.id, summary_html: summaryHtml })

    results.push({ project: project.name, snapshots: snapshots.length })
  }

  return NextResponse.json({ digests_generated: results.length, projects: results })
}
