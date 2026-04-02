'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description: string | null
  created_at: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    setFetching(true)
    try {
      const res = await fetch('/api/projects')
      if (!res.ok) throw new Error('Failed to fetch projects')
      const data = await res.json()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching projects')
    } finally {
      setFetching(false)
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()

    if (!projectName.trim()) {
      setError('Project name is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName.trim(),
          description: projectDescription.trim() || null,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to create project')
      }

      const newProject = await res.json()

      setProjects((prev) => [newProject, ...prev])
      setProjectName('')
      setProjectDescription('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This will remove all associated competitors.`)) return

    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id))
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Projects</h1>
        <p className="text-gray-400">Organize your competitive tracking by product or market</p>
      </div>

      {/* Create form */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">New project</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded text-sm border border-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-900/50 text-green-200 rounded text-sm border border-green-700">
            ✅ Project created successfully!
          </div>
        )}

        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Project name *</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={loading}
              placeholder="e.g. CRM Market 2024"
              className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Description (optional)</label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              disabled={loading}
              placeholder="Tracking top CRM competitors..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none disabled:opacity-50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : '+ Create project'}
          </button>
        </form>
      </div>

      {/* Projects list */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Your projects
          {!fetching && (
            <span className="ml-2 text-sm font-normal text-gray-500">({projects.length})</span>
          )}
        </h2>

        {fetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-slate-800 rounded-lg p-6 border border-slate-700 animate-pulse">
                <div className="h-5 bg-slate-700 rounded w-1/2 mb-3" />
                <div className="h-4 bg-slate-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
            <p className="text-gray-400 mb-2">No projects yet</p>
            <p className="text-sm text-gray-500">Create your first project above to start tracking competitors</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500/50 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="text-lg font-semibold text-white hover:text-blue-400 transition-colors"
                  >
                    {project.name}
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id, project.name)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all text-xs px-2 py-1 rounded hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {project.description || 'No description'}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
