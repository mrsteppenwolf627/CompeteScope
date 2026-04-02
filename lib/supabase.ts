import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Call inside Client Components — each call returns a configured instance
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Module-level singleton for non-auth server utility calls
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export async function saveAnalysis(snapshotId: string, analysis: string) {
  const { data, error } = await supabase
    .from('competitor_snapshots')
    .update({ ai_analysis: analysis })
    .eq('id', snapshotId)

  if (error) throw error
  return data
}
