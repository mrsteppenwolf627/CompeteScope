'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import ProjectCard from '@/components/ProjectCard'
import { Plus, FolderOpen } from 'lucide-react'
import type { Project } from '@/lib/types'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  async function loadProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*, competitors(count)')
      .order('created_at', { ascending: false })
    setProjects((data as Project[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadProjects()
  }, [])

  async function createProject(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('projects')
      .insert({ name, description, user_id: user!.id })

    if (!error) {
      setName('')
      setDescription('')
      setShowForm(false)
      await loadProjects()
    }
    setSaving(false)
  }

  async function deleteProject(id: string) {
    await supabase.from('projects').delete().eq('id', id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-muted-foreground mt-1">Organize your competitive tracking by product or market</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New project
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={createProject} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-white text-lg">New project</h3>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Project name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CRM Market 2024"
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tracking top CRM competitors..."
              rows={3}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm"
            >
              {saving ? 'Creating...' : 'Create project'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-white px-5 py-2 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Projects grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/2 mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-6" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-muted-foreground text-sm">Create a project to start tracking competitors.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={deleteProject} />
          ))}
        </div>
      )}
    </div>
  )
}
