import { supabase } from '../utils/supabase'

export async function fetchAllListings() {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('listing_date', { ascending: false, nullsLast: true })
      .limit(100)

    if (error) {
      if (import.meta.env.DEV) console.warn('[listingsRepository]', error.message)
      return []
    }
    return data || []
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[listingsRepository]', err)
    return []
  }
}
