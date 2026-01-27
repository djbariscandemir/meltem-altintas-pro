import 'dotenv/config'
import { discoverAndLogin } from './login.js'
import { crawlAll } from './crawl.js'
import { upsertListings } from './supabaseWrite.js'
import { REVY, USE_FIXTURES } from './config.js'

async function main() {
  if (!USE_FIXTURES) {
    try {
      console.log('[CRAWLER] Login deneniyor...')
      await discoverAndLogin()
      console.log('[CRAWLER] Login başarılı.')
    } catch (e) {
      console.error('[CRAWLER] Login hatası:', e.message)
      process.exit(1)
    }
  } else {
    console.log('[CRAWLER] Fixture modu, login atlanıyor.')
  }

  let listings = []
  try {
    console.log('[CRAWLER] Liste ve detay sayfaları taranıyor...')
    listings = await crawlAll({
      listUrls: REVY.listUrls,
      maxLinks: USE_FIXTURES ? 10 : 30,
      maxPages: 1,
    })
    console.log(`[CRAWLER] ${listings.length} ilan parse edildi.`)
  } catch (e) {
    console.error('[CRAWLER] Crawl hatası:', e.message)
    process.exit(1)
  }

  if (listings.length === 0) {
    console.log('[CRAWLER] Yazılacak ilan yok.')
    return
  }

  try {
    const stats = await upsertListings(listings)
    console.log('[CRAWLER] Supabase:', stats.inserted, 'eklendi,', stats.updated, 'güncellendi,', stats.failed, 'hata.')
  } catch (e) {
    console.error('[CRAWLER] Supabase yazım hatası:', e.message)
    process.exit(1)
  }

  console.log('[CRAWLER] Bitti.')
}

main()
