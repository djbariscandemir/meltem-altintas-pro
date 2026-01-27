import { supabase } from '../utils/supabase'

export async function fetchActivitiesForBrokerPanel({ since } = {}) {
  try {
    let q = supabase.from('activities').select('*').order('created_at', { ascending: false })
    if (since) q = q.gte('created_at', since)
    const { data, error } = await q
    if (error) return []
    return data || []
  } catch {
    return []
  }
}
