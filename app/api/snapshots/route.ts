import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const competitorId = searchParams.get('competitor_id')
  const competitorIdsParam = searchParams.get('competitor_ids')
  const projectId = searchParams.get('project_id')

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Handle bulk fetch: ?competitor_ids=uuid1,uuid2,...
  // Returns the latest snapshot per competitor (client deduplicates by taking first seen)
  if (competitorIdsParam) {
    const ids = competitorIdsParam.split(',').map((id) => id.trim()).filter(Boolean)
    if (ids.length === 0) return NextResponse.json([])

    const { data, error } = await supabase
      .from('competitor_snapshots')
      .select('*, competitors!inner(name, project_id, projects!inner(user_id))')
      .in('competitor_id', ids)
      .eq('competitors.projects.user_id', user.id)
      .order('scraped_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  }

  let query = supabase
    .from('competitor_snapshots')
    .select('*, competitors(name, project_id, projects(name, user_id))')
    .order('scraped_at', { ascending: false })
    .limit(50)

  if (competitorId) {
    query = query.eq('competitor_id', competitorId)
  }

  if (projectId) {
    query = query.eq('competitors.project_id', projectId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Filter to user's data
  const filtered = data?.filter(
    (s) => (s.competitors as { projects: { user_id: string } } | null)?.projects?.user_id === user.id
  )

  return NextResponse.json(filtered)
}
