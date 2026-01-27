import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(url, key)

// Same query as listingsRepository (frontend)
const { data: all, error } = await supabase
  .from('listings')
  .select('id, title, photos, listing_url, listing_date')
  .order('listing_date', { ascending: false, nullsLast: true })
  .limit(100)
if (error) {
  console.error('Supabase error:', error)
  process.exit(1)
}
const list = all || []
const withPhotos = list.filter((r) => Array.isArray(r.photos) && r.photos.length > 0)
const fixture = list.filter((r) =>
  (r.listing_url || '').includes('aaaaaaaa-bbbb') || (r.listing_url || '').includes('bbbbbbbb-cccc')
)
console.log('Total fetched:', list.length)
console.log('With photos:', withPhotos.length, withPhotos.slice(0, 2).map((r) => ({ title: r.title, photosCount: r.photos?.length })))
console.log('Fixture (aaaa/bbbb) in this list:', fixture.length, fixture.map((r) => ({ title: r.title, photosCount: r.photos?.length })))
