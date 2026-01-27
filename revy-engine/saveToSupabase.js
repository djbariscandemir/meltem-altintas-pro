import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

let client = null
function getClient() {
  if (client) return client
  if (!url || !key) throw new Error('Supabase URL ve key tanımlı olmalı.')
  client = createClient(url, key)
  return client
}

function toRow(row) {
  const photos = Array.isArray(row.photos) ? row.photos : []
  return {
    listing_status: row.listing_type ?? 'satilik',
    property_type: row.property_type ?? 'konut',
    property_subtype: row.property_subtype ?? 'daire',
    title: row.title ?? 'İlan',
    price: row.price ?? null,
    net_area: row.net_area ?? null,
    gross_area: row.gross_area ?? null,
    rooms: row.rooms ?? null,
    building_age: row.building_age ?? null,
    floor: row.floor ?? null,
    heating_type: row.heating_type ?? null,
    owner_type: row.owner_type ?? null,
    owner_name: row.owner_name ?? null,
    city: row.city ?? null,
    district: row.district ?? null,
    neighborhood: row.neighborhood ?? null,
    listing_date: row.listing_date ?? null,
    listing_url: row.listing_url ?? null,
    photos,
  }
}

export async function upsertListings(rows) {
  const supabase = getClient()
  const stats = { inserted: 0, updated: 0, failed: 0 }

  for (const row of rows) {
    try {
      const payload = toRow(row)
      if (!payload.listing_url) {
        stats.failed++
        continue
      }

      const { data: existing } = await supabase
        .from('listings')
        .select('id')
        .eq('listing_url', payload.listing_url)
        .limit(1)
        .maybeSingle()

      if (existing?.id) {
        const { error } = await supabase.from('listings').update(payload).eq('id', existing.id)
        if (error) {
          stats.failed++
          if (process.env.DEBUG) console.warn('[saveToSupabase] update:', payload.listing_url, error.message)
          if (error.message?.includes("'photos'")) {
            console.warn('[saveToSupabase] photos kolonu yok. supabase-add-photos-to-listings.sql çalıştırın.')
          }
        } else stats.updated++
      } else {
        const { error } = await supabase.from('listings').insert(payload)
        if (error) {
          stats.failed++
          if (process.env.DEBUG) console.warn('[saveToSupabase] insert:', payload.listing_url, error.message)
          if (error.message?.includes("'photos'")) {
            console.warn('[saveToSupabase] photos kolonu yok. supabase-add-photos-to-listings.sql çalıştırın.')
          }
        } else stats.inserted++
      }
    } catch (e) {
      stats.failed++
      if (process.env.DEBUG) console.warn('[saveToSupabase]', row.listing_url, e.message)
    }
  }

  return stats
}
