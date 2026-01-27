import { supabase } from '../utils/supabase'

export async function fetchAllUsers() {
  try {
    const { data, error } = await supabase.from('users').select('*').order('full_name')
    if (error) return []
    return data || []
  } catch {
    return []
  }
}
