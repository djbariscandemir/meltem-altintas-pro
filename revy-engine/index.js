import 'dotenv/config'
import { ensureEnv } from './config.js'
import { login } from './login.js'
import { fetchListings } from './fetchListings.js'
import { parseListing } from './parseListing.js'
import { upsertListings } from './saveToSupabase.js'

async function main() {
  const { USE_FIXTURES } = await import('./config.js')
  if (!USE_FIXTURES) {
    try {
      ensureEnv()
    } catch (e) {
      console.error('[REVY-ENGINE]', e.message)
      process.exit(1)
    }
  }

  console.log('[REVY-ENGINE] Başlatılıyor...' + (USE_FIXTURES ? ' (fixture modu)' : ''))

  if (!USE_FIXTURES) {
    try {
      console.log('[REVY-ENGINE] Login...')
      await login()
      console.log('[REVY-ENGINE] Login OK.')
    } catch (e) {
      console.error('[REVY-ENGINE] Login hatası:', e.message)
      process.exit(1)
    }
  } else {
    console.log('[REVY-ENGINE] Fixture modu, login atlanıyor.')
  }

  let items = []
  try {
    console.log('[REVY-ENGINE] İlan listesi çekiliyor...')
    items = await fetchListings({ maxPages: 1, maxPerPage: 20 })
    console.log(`[REVY-ENGINE] ${items.length} detay sayfası alındı.`)
  } catch (e) {
    console.error('[REVY-ENGINE] Fetch hatası:', e.message)
    process.exit(1)
  }

  const listings = []
  for (const { url, html } of items) {
    try {
      const row = parseListing(html, url)
      if (row && row.listing_url) listings.push(row)
    } catch (e) {
      if (process.env.DEBUG) console.warn('[REVY-ENGINE] parse skip:', url, e.message)
    }
  }
  console.log(`[REVY-ENGINE] ${listings.length} ilan parse edildi.`)

  if (listings.length === 0) {
    console.log('[REVY-ENGINE] Yazılacak ilan yok. (Revy SPA ise liste HTML\'de link yok; REVY_ENGINE_USE_FIXTURES=1 ile fixture modu.)')
    return
  }

  try {
    console.log('[REVY-ENGINE] Supabase upsert...')
    const stats = await upsertListings(listings)
    console.log(
      `[REVY-ENGINE] Supabase: ${stats.inserted} eklendi, ${stats.updated} güncellendi, ${stats.failed} hata.`
    )
  } catch (e) {
    console.error('[REVY-ENGINE] Supabase hatası:', e.message)
    process.exit(1)
  }

  console.log('[REVY-ENGINE] Bitti.')
}

main()
