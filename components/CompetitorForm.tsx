'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { CreateCompetitorInput } from '@/lib/types'

interface CompetitorFormProps {
  projectId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function CompetitorForm({ projectId, onSuccess, onCancel }: CompetitorFormProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<CreateCompetitorInput, 'project_id'>>({
    name: '',
    homepage_url: '',
    pricing_url: '',
    changelog_url: '',
    category: '',
  })

  const supabase = createClient()

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      project_id: projectId,
      name: form.name,
      homepage_url: form.homepage_url,
      pricing_url: form.pricing_url || null,
      changelog_url: form.changelog_url || null,
      category: form.category || null,
    }

    const { error: err } = await supabase.from('competitors').insert(payload)

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
      <h3 className="font-semibold text-white text-lg">Add competitor</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g. Salesforce"
            required
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Category
          </label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            placeholder="e.g. CRM, Analytics..."
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Homepage URL <span className="text-red-400">*</span>
        </label>
        <input
          type="url"
          value={form.homepage_url}
          onChange={(e) => update('homepage_url', e.target.value)}
          placeholder="https://salesforce.com"
          required
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Pricing URL</label>
          <input
            type="url"
            value={form.pricing_url}
            onChange={(e) => update('pricing_url', e.target.value)}
            placeholder="https://salesforce.com/pricing"
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Changelog URL</label>
          <input
            type="url"
            value={form.changelog_url}
            onChange={(e) => update('changelog_url', e.target.value)}
            placeholder="https://salesforce.com/changelog"
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 text-sm bg-red-900/30 border border-red-700/50 text-red-300">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm"
        >
          {saving ? 'Adding...' : 'Add competitor'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground px-5 py-2 rounded-lg transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
