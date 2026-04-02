'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Globe, ExternalLink, Activity } from 'lucide-react'
import Link from 'next/link'
import type { Competitor } from '@/lib/types'

interface CompetitorWithProject extends Competitor {
  projects: {
    id: string
    name: string
  }
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<CompetitorWithProject[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('competitors')
        .select('*, projects(id, name)')
        .order('created_at', { ascending: false })
      setCompetitors((data as CompetitorWithProject[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Competitors</h1>
        <p className="text-muted-foreground mt-1">All tracked competitors across your projects</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : competitors.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center">
          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No competitors tracked</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Go to a project and add competitors to start tracking.
          </p>
          <Link href="/dashboard/projects" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            View projects →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {competitors.map((competitor) => (
            <div key={competitor.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-900/40 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="font-semibold text-white">{competitor.name}</h3>
                    <Link
                      href={`/dashboard/projects/${competitor.projects.id}`}
                      className="text-xs bg-blue-900/40 text-blue-300 border border-blue-800/50 px-2 py-0.5 rounded-full hover:bg-blue-900/60 transition-colors"
                    >
                      {competitor.projects.name}
                    </Link>
                    {competitor.category && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        {competitor.category}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <a
                      href={competitor.homepage_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Homepage
                    </a>
                    {competitor.pricing_url && (
                      <a
                        href={competitor.pricing_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Pricing
                      </a>
                    )}
                    {competitor.changelog_url && (
                      <a
                        href={competitor.changelog_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Changelog
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Added {new Date(competitor.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
