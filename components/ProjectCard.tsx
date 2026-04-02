'use client'

import Link from 'next/link'
import { Trash2, Users, ArrowRight, FolderOpen } from 'lucide-react'
import type { Project } from '@/lib/types'

interface ProjectCardProps {
  project: Project
  onDelete: (id: string) => void
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const competitorCount =
    (project.competitors as unknown as Array<{ count: number }>)?.[0]?.count ?? 0

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (confirm(`Delete project "${project.name}"? This will remove all competitors and data.`)) {
      onDelete(project.id)
    }
  }

  return (
    <Link href={`/dashboard/projects/${project.id}`} className="group block">
      <div className="bg-card border border-border hover:border-blue-800/50 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-blue-950/30">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-900/40 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-blue-400" />
          </div>
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-semibold text-white text-lg mb-1 leading-tight">{project.name}</h3>
        {project.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{competitorCount} competitor{competitorCount !== 1 ? 's' : ''}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
    </Link>
  )
}
