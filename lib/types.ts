export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  competitors?: Competitor[]
  _count?: {
    competitors: number
  }
}

export interface Competitor {
  id: string
  project_id: string
  name: string
  homepage_url: string
  pricing_url: string | null
  changelog_url: string | null
  category: string | null
  created_at: string
  updated_at: string
  snapshots?: CompetitorSnapshot[]
}

export interface CompetitorSnapshot {
  id: string
  competitor_id: string
  content_hash: string
  raw_content: string | null
  diff_text: string | null
  ai_analysis: string | null
  scraped_at: string
}

export interface Digest {
  id: string
  project_id: string
  summary_html: string | null
  sent_at: string
}

export interface CreateProjectInput {
  name: string
  description?: string
}

export interface CreateCompetitorInput {
  project_id: string
  name: string
  homepage_url: string
  pricing_url?: string
  changelog_url?: string
  category?: string
}
