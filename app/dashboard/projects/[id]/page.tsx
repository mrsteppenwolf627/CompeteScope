'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description: string | null
}

interface Competitor {
  id: string
  name: string
  homepage_url: string
  pricing_url: string | null
  changelog_url: string | null
  category: string | null
}

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [compName, setCompName] = useState('')
  const [compHomepageUrl, setCompHomepageUrl] = useState('')
  const [compPricingUrl, setCompPricingUrl] = useState('')
  const [compChangelogUrl, setCompChangelogUrl] = useState('')
  const [compCategory, setCompCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchProjectAndCompetitors()
  }, [projectId])

  async function fetchProjectAndCompetitors() {
    setFetching(true)
    try {
      const [projRes, compRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/competitors?project_id=${projectId}`),
      ])

      if (!projRes.ok) throw new Error('Project not found')
      if (!compRes.ok) throw new Error('Failed to fetch competitors')

      const [projData, compData] = await Promise.all([
        projRes.json(),
        compRes.json(),
      ])

      setProject(projData)
      setCompetitors(compData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading project')
    } finally {
      setFetching(false)
    }
  }

  async function handleAddCompetitor(e: React.FormEvent) {
    e.preventDefault()

    if (!compName.trim() || !compHomepageUrl.trim()) {
      setError('Name and homepage URL are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          name: compName.trim(),
          homepage_url: compHomepageUrl.trim(),
          pricing_url: compPricingUrl.trim() || null,
          changelog_url: compChangelogUrl.trim() || null,
          category: compCategory.trim() || null,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to add competitor')
      }

      const newComp = await res.json()
      setCompetitors((prev) => [newComp, ...prev])
      setCompName('')
      setCompHomepageUrl('')
      setCompPricingUrl('')
      setCompChangelogUrl('')
      setCompCategory('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteCompetitor(compId: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return

    try {
      const res = await fetch(`/api/competitors/${compId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setCompetitors((prev) => prev.filter((c) => c.id !== compId))
    } catch {
      setError('Failed to delete competitor')
    }
  }

  if (fetching) {
    return (
      <div className="space-y-6 max-w-4xl animate-pulse">
        <div className="h-8 bg-slate-700 rounded w-1/3" />
        <div className="h-4 bg-slate-700 rounded w-1/2" />
        <div className="bg-slate-800 rounded-lg h-48 border border-slate-700" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Project not found.</p>
        <Link href="/dashboard/projects" className="text-blue-400 hover:underline text-sm mt-2 inline-block">
          ← Back to projects
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <Link href="/dashboard/projects" className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-3 inline-block">
          ← Projects
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">{project.name}</h1>
        <p className="text-gray-400">{project.description || 'No description'}</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-900/50 text-red-200 rounded text-sm border border-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-900/50 text-green-200 rounded text-sm border border-green-700">
          ✅ Competitor added!
        </div>
      )}

      {/* Add competitor form */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Add competitor</h2>

        <form onSubmit={handleAddCompetitor} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Name *</label>
              <input
                type="text"
                placeholder="e.g. Salesforce"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Homepage URL *</label>
              <input
                type="url"
                placeholder="https://salesforce.com"
                value={compHomepageUrl}
                onChange={(e) => setCompHomepageUrl(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Pricing URL</label>
              <input
                type="url"
                placeholder="https://salesforce.com/pricing"
                value={compPricingUrl}
                onChange={(e) => setCompPricingUrl(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Changelog URL</label>
              <input
                type="url"
                placeholder="https://salesforce.com/changelog"
                value={compChangelogUrl}
                onChange={(e) => setCompChangelogUrl(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. CRM, Analytics..."
                value={compCategory}
                onChange={(e) => setCompCategory(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : '+ Add competitor'}
          </button>
        </form>
      </div>

      {/* Competitors list */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Competitors
          <span className="ml-2 text-sm font-normal text-gray-500">({competitors.length})</span>
        </h2>

        {competitors.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
            <p className="text-gray-400 mb-2">No competitors yet</p>
            <p className="text-sm text-gray-500">Add your first competitor above to start tracking</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitors.map((comp) => (
              <div
                key={comp.id}
                className="bg-slate-800 rounded-lg p-5 border border-slate-700 hover:border-blue-500/50 transition-colors group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{comp.name}</h3>
                    {comp.category && (
                      <span className="text-xs bg-slate-700 text-gray-400 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {comp.category}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteCompetitor(comp.id, comp.name)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all text-lg leading-none px-1"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1.5">
                  <a
                    href={comp.homepage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    🌐 Homepage
                  </a>
                  {comp.pricing_url && (
                    <a
                      href={comp.pricing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      💰 Pricing
                    </a>
                  )}
                  {comp.changelog_url && (
                    <a
                      href={comp.changelog_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      📋 Changelog
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
