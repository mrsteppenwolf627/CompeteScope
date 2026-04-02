'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase'
import CompetitorForm from '@/components/CompetitorForm'
import { ArrowLeft, Globe, ExternalLink, Trash2, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import type { Project, Competitor } from '@/lib/types'

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const supabase = createClient()

  async function loadData() {
    const [{ data: proj }, { data: comps }] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('competitors').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    ])
    setProject(proj as Project)
    setCompetitors((comps as Competitor[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [id])

  async function deleteCompetitor(competitorId: string) {
    await supabase.from('competitors').delete().eq('id', competitorId)
    setCompetitors((prev) => prev.filter((c) => c.id !== competitorId))
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Project not found.</p>
        <Link href="/dashboard/projects" className="text-blue-400 hover:underline text-sm mt-2 inline-block">
          Back to projects
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add competitor
          </button>
        </div>
      </div>

      {showForm && (
        <CompetitorForm
          projectId={id}
          onSuccess={async () => {
            setShowForm(false)
            await loadData()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Competitors
          <span className="ml-2 text-sm font-normal text-muted-foreground">({competitors.length})</span>
        </h2>

        {competitors.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No competitors added yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              Add your first competitor
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {competitors.map((competitor) => (
              <div
                key={competitor.id}
                className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-900/40 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{competitor.name}</h3>
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
                <button
                  onClick={() => deleteCompetitor(competitor.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-900/20"
                  title="Remove competitor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
