import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { FolderOpen, Users, Activity, TrendingUp, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ count: projectCount }, { count: competitorCount }, { data: recentSnapshots }] =
    await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('competitors').select('*, projects!inner(user_id)', { count: 'exact', head: true }).eq('projects.user_id', user!.id),
      supabase
        .from('competitor_snapshots')
        .select('*, competitors(name, projects(name, user_id))')
        .order('scraped_at', { ascending: false })
        .limit(5),
    ])

  const stats = [
    { label: 'Projects', value: projectCount ?? 0, icon: FolderOpen, color: 'text-blue-400' },
    { label: 'Competitors', value: competitorCount ?? 0, icon: Users, color: 'text-purple-400' },
    { label: 'Changes this week', value: recentSnapshots?.length ?? 0, icon: Activity, color: 'text-green-400' },
    { label: 'Analyses run', value: recentSnapshots?.filter((s) => s.ai_analysis).length ?? 0, icon: TrendingUp, color: 'text-orange-400' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-3xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/projects"
          className="group bg-card border border-border hover:border-blue-800/50 rounded-xl p-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FolderOpen className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-white">Manage Projects</span>
              </div>
              <p className="text-sm text-muted-foreground">Create projects and add competitors to track</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
          </div>
        </Link>

        <Link
          href="/dashboard/competitors"
          className="group bg-card border border-border hover:border-blue-800/50 rounded-xl p-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-white">View Competitors</span>
              </div>
              <p className="text-sm text-muted-foreground">See all tracked competitors and their latest changes</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        {recentSnapshots && recentSnapshots.length > 0 ? (
          <div className="space-y-3">
            {recentSnapshots.map((snapshot) => (
              <div key={snapshot.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-900/50 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm">
                    {(snapshot.competitors as { name: string } | null)?.name ?? 'Unknown competitor'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {snapshot.ai_analysis
                      ? snapshot.ai_analysis.slice(0, 120) + '...'
                      : 'Snapshot captured, analysis pending'}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  {new Date(snapshot.scraped_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No activity yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add competitors to start tracking changes.
            </p>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-2 mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Create your first project <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
