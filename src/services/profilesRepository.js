import { supabase } from '../utils/supabase'

export async function fetchProfileByUserId(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      if (import.meta.env.DEV) console.error('[profilesRepository] fetchProfileByUserId:', error)
      return null
    }
    return data
  } catch (err) {
    if (import.meta.env.DEV) console.error('[profilesRepository] fetchProfileByUserId:', err)
    return null
  }
}

export async function fetchAllProfiles() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('ad')

    if (error) {
      if (import.meta.env.DEV) console.error('[profilesRepository] fetchAllProfiles:', error)
      return []
    }
    return data || []
  } catch (err) {
    if (import.meta.env.DEV) console.error('[profilesRepository] fetchAllProfiles:', err)
    return []
  }
}

export async function upsertProfile(profile) {
  try {
    const payload = {
      id: profile.id,
      ad: profile.ad ?? null,
      soyad: profile.soyad ?? null,
      email: profile.email ?? '',
      telefon: profile.telefon ?? null,
      dogum_tarihi: profile.dogum_tarihi || null,
      rol: profile.rol || 'user',
      calisma_baslangic_tarihi: profile.calisma_baslangic_tarihi || null,
      sorumlu_bolgeler: profile.sorumlu_bolgeler ?? null
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      if (import.meta.env.DEV) console.error('[profilesRepository] upsertProfile:', error)
      throw error
    }
    return data
  } catch (err) {
    if (import.meta.env.DEV) console.error('[profilesRepository] upsertProfile:', err)
    throw err
  }
}
