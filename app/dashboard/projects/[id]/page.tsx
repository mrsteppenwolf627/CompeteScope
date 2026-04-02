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

interface AnalysisData {
  what_changed: string
  implication: string
  your_action: string
}

interface CompetitorSnapshot {
  id: string
  competitor_id: string
  content_hash: string
  raw_content: string | null
  diff_text: string | null
  ai_analysis: AnalysisData | null
  scraped_at: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [competitorSnapshots, setCompetitorSnapshots] = useState<Map<string, CompetitorSnapshot>>(new Map())
  const [scrapingCompetitorId, setScrapingCompetitorId] = useState<string | null>(null)
  const [analysisOpen, setAnalysisOpen] = useState<string | null>(null)

  // Add competitor form
  const [compName, setCompName] = useState('')
  const [compHomepageUrl, setCompHomepageUrl] = useState('')
  const [compPricingUrl, setCompPricingUrl] = useState('')
  const [compChangelogUrl, setCompChangelogUrl] = useState('')
  const [compCategory, setCompCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [scrapeMessage, setScrapeMessage] = useState<{ id: string; text: string; type: 'success' | 'error' } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [projectId])

  async function fetchAll() {
    setFetching(true)
    try {
      const [projRes, compRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/competitors?project_id=${projectId}`),
      ])

      if (!projRes.ok) throw new Error('Project not found')
      if (!compRes.ok) throw new Error('Failed to fetch competitors')

      const [projData, compData]: [Project, Competitor[]] = await Promise.all([
        projRes.json(),
        compRes.json(),
      ])

      setProject(projData)
      setCompetitors(compData)

      // Fetch latest snapshot for each competitor in parallel
      if (compData.length > 0) {
        await fetchSnapshots(compData.map((c) => c.id))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading project')
    } finally {
      setFetching(false)
    }
  }

  async function fetchSnapshots(competitorIds: string[]) {
    const snapshotRes = await fetch(
      `/api/snapshots?competitor_ids=${competitorIds.join(',')}`
    )
    if (!snapshotRes.ok) return

    const snapshots: CompetitorSnapshot[] = await snapshotRes.json()

    // Build map: competitor_id → latest snapshot
    const map = new Map<string, CompetitorSnapshot>()
    for (const snap of snapshots) {
      const parsed = parseSnapshot(snap)
      if (!map.has(snap.competitor_id)) {
        map.set(snap.competitor_id, parsed)
      }
    }
    setCompetitorSnapshots(map)
  }

  function parseSnapshot(snap: CompetitorSnapshot): CompetitorSnapshot {
    if (snap.ai_analysis && typeof snap.ai_analysis === 'string') {
      try {
        return { ...snap, ai_analysis: JSON.parse(snap.ai_analysis as unknown as string) }
      } catch {
        return { ...snap, ai_analysis: null }
      }
    }
    return snap
  }

  async function handleScrape(competitorId: string) {
    setScrapingCompetitorId(competitorId)
    setScrapeMessage(null)

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitor_id: competitorId }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Scrape failed')

      if (!data.changed) {
        setScrapeMessage({ id: competitorId, text: 'No changes detected', type: 'success' })
      } else {
        // Update snapshot map with fresh data
        if (data.snapshot_id) {
          const snapRes = await fetch(`/api/snapshots?competitor_id=${competitorId}`)
          if (snapRes.ok) {
            const snaps: CompetitorSnapshot[] = await snapRes.json()
            if (snaps.length > 0) {
              setCompetitorSnapshots((prev) => {
                const next = new Map(prev)
                next.set(competitorId, parseSnapshot(snaps[0]))
                return next
              })
            }
          }
        }

        setScrapeMessage({
          id: competitorId,
          text: data.analysis ? '✅ Change detected & analyzed!' : '✅ Snapshot saved (first run)',
          type: 'success',
        })
      }
    } catch (err) {
      setScrapeMessage({
        id: competitorId,
        text: err instanceof Error ? err.message : 'Scrape failed',
        type: 'error',
      })
    } finally {
      setScrapingCompetitorId(null)
      setTimeout(() => setScrapeMessage(null), 4000)
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
      setCompetitorSnapshots((prev) => {
        const next = new Map(prev)
        next.delete(compId)
        return next
      })
    } catch {
      setError('Failed to delete competitor')
    }
  }

  function handleCopyAnalysis(analysis: AnalysisData) {
    const text = `What Changed:\n${analysis.what_changed}\n\nMarket Implication:\n${analysis.implication}\n\nYour Action:\n${analysis.your_action}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── LOADING ──
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

  // ── ANALYSIS MODAL ──
  const openAnalysisSnapshot = analysisOpen ? competitorSnapshots.get(analysisOpen) : null
  const openAnalysisCompetitor = analysisOpen ? competitors.find((c) => c.id === analysisOpen) : null

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

      {/* Global messages */}
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
            {competitors.map((comp) => {
              const snapshot = competitorSnapshots.get(comp.id) ?? null
              const isScrapingThis = scrapingCompetitorId === comp.id
              const msg = scrapeMessage?.id === comp.id ? scrapeMessage : null

              return (
                <div
                  key={comp.id}
                  className="bg-slate-800 rounded-lg p-5 border border-slate-700 hover:border-blue-500/40 transition-colors group"
                >
                  {/* Header row */}
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{comp.name}</h3>
                      {comp.category && (
                        <span className="text-xs bg-slate-700 text-gray-400 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                          {comp.category}
                        </span>
                      )}
                      {snapshot && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last scraped: {new Date(snapshot.scraped_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleScrape(comp.id)}
                      disabled={scrapingCompetitorId !== null}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 ml-2"
                    >
                      {isScrapingThis ? '⏳ Scraping...' : '🔄 Scrape'}
                    </button>
                  </div>

                  {/* Scrape result message */}
                  {msg && (
                    <div className={`mt-2 p-2 rounded text-xs ${msg.type === 'success' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                      {msg.text}
                    </div>
                  )}

                  {/* URLs */}
                  <div className="mt-3 space-y-1">
                    <a
                      href={comp.homepage_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      🌐 Homepage
                    </a>
                    {comp.pricing_url && (
                      <a
                        href={comp.pricing_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        💰 Pricing
                      </a>
                    )}
                    {comp.changelog_url && (
                      <a
                        href={comp.changelog_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        📋 Changelog
                      </a>
                    )}
                  </div>

                  {/* Analysis preview */}
                  {snapshot?.ai_analysis && (
                    <div className="mt-4 p-3 bg-blue-900/20 rounded border border-blue-800/40">
                      <p className="text-xs text-blue-300 font-semibold mb-1">Latest Analysis</p>
                      <p className="text-xs text-gray-300 line-clamp-2">
                        {snapshot.ai_analysis.what_changed}
                      </p>
                      <button
                        onClick={() => setAnalysisOpen(comp.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 mt-1.5 transition-colors"
                      >
                        View full analysis →
                      </button>
                    </div>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteCompetitor(comp.id, comp.name)}
                    className="mt-4 text-xs text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Analysis Modal */}
      {analysisOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setAnalysisOpen(null)}
        >
          <div
            className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">Analysis</h2>
                {openAnalysisCompetitor && (
                  <p className="text-sm text-gray-400 mt-0.5">{openAnalysisCompetitor.name}</p>
                )}
              </div>
              <button
                onClick={() => setAnalysisOpen(null)}
                className="text-gray-400 hover:text-white text-xl leading-none transition-colors"
              >
                ✕
              </button>
            </div>

            {openAnalysisSnapshot?.ai_analysis ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    What Changed
                  </h3>
                  <p className="text-white text-sm leading-relaxed">
                    {openAnalysisSnapshot.ai_analysis.what_changed}
                  </p>
                </div>

                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Market Implication
                  </h3>
                  <p className="text-white text-sm leading-relaxed">
                    {openAnalysisSnapshot.ai_analysis.implication}
                  </p>
                </div>

                <div className="p-4 bg-blue-900/30 border border-blue-800/40 rounded-lg">
                  <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">
                    Your Action
                  </h3>
                  <p className="text-white text-sm leading-relaxed">
                    {openAnalysisSnapshot.ai_analysis.your_action}
                  </p>
                </div>

                {openAnalysisSnapshot.scraped_at && (
                  <p className="text-xs text-gray-500">
                    Scraped on {new Date(openAnalysisSnapshot.scraped_at).toLocaleString()}
                  </p>
                )}

                <button
                  onClick={() => handleCopyAnalysis(openAnalysisSnapshot.ai_analysis!)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {copied ? '✅ Copied!' : '📋 Copy Analysis'}
                </button>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No analysis yet. Run a scrape to generate one.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
