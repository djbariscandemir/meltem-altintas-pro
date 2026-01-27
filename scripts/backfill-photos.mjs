/**
 * photos boş olan ilanları Revy detay sayfasından Playwright ile çekip günceller.
 *
 * Gerekli .env: REVY_PHONE, REVY_PASSWORD, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Opsiyonel: BACKFILL_LIMIT=10 (varsayılan 20, max 50), DEBUG=1, DEBUG_BROWSER=1
 *
 * npm run backfill:photos
 */
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import { parseListing } from '../revy-engine/parseListing.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
dotenv.config({ path: path.join(projectRoot, '.env') })

const REVY_PHONE = (process.env.REVY_PHONE || process.env.REYY_PHONE || '').trim()
const REVY_PASSWORD = (process.env.REVY_PASSWORD || process.env.REYY_PASSWORD || '').trim()
const REVY_BASE = 'https://www.revy.com.tr'
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const LIMIT = Math.min(Number(process.env.BACKFILL_LIMIT) || 20, 50)

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
function randomDelay(min = 1, max = 3) {
  return delay(Math.floor((min + Math.random() * (max - min)) * 1000))
}

function getSupabase() {
  if (!url || !key) throw new Error('VITE_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli')
  return createClient(url, key)
}

async function revyLogin(page) {
  await page.goto(REVY_BASE, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await delay(2500)
  const loginBtn = await page.$('a:has-text("Giriş"), button:has-text("Giriş")')
  if (!loginBtn) throw new Error('Giriş butonu bulunamadı')
  await loginBtn.click()
  await delay(1500)
  await page.waitForSelector('input[type="tel"], input[name*="phone"], input[type="password"]', { timeout: 10000 })
  const phone = await page.$('input[type="tel"], input[name*="phone"]')
  const pass = await page.$('input[type="password"]')
  if (!phone || !pass) throw new Error('Telefon/şifre alanı bulunamadı')
  await phone.fill(REVY_PHONE)
  await delay(400)
  await pass.fill(REVY_PASSWORD)
  await delay(400)
  const submit = await page.$('button[type="submit"], button:has-text("Giriş"), button:has-text("Giriş Yap"), button:has-text("Devam Et")')
  if (!submit) throw new Error('Giriş submit butonu bulunamadı')
  await submit.click()
  await delay(3500)
  const ok = await page.evaluate(() => {
    const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"]')
    const visible = Array.from(modals).filter((m) => {
      const s = window.getComputedStyle(m)
      return s.display !== 'none' && s.visibility !== 'hidden'
    })
    const tel = document.querySelectorAll('input[type="tel"]')
    const visibleTel = Array.from(tel).filter((t) => {
      const s = window.getComputedStyle(t)
      return s.display !== 'none' && s.visibility !== 'hidden'
    })
    return visible.length === 0 || visibleTel.length === 0
  })
  if (!ok) throw new Error('Login başarısız (modal hâlâ açık)')
  return true
}

async function main() {
  console.log('[BACKFILL-PHOTOS] Başlatılıyor...')
  const supabase = getSupabase()

  const { data: rows } = await supabase
    .from('listings')
    .select('id, listing_url, photos')
    .not('listing_url', 'is', null)
    .limit(500)

  // Tüm ilanları yeniden parse et (filtreleme mantığı güncellendi)
  const toProcess = (rows || []).slice(0, LIMIT)

  if (toProcess.length === 0) {
    console.log('[BACKFILL-PHOTOS] İşlenecek ilan yok.')
    return
  }
  if (!REVY_PHONE || !REVY_PASSWORD) {
    const envPath = path.join(projectRoot, '.env')
    throw new Error(
      `REVY_PHONE ve REVY_PASSWORD .env içinde dolu olmalı.\n` +
      `  .env konumu: ${envPath}\n` +
      `  Örnek: REVY_PHONE=5XXXXXXXXX  REVY_PASSWORD=şifren`
    )
  }
  console.log(`[BACKFILL-PHOTOS] ${rows?.length || 0} ilan bulundu, ${toProcess.length} işlenecek (limit ${LIMIT}).`)

  const browser = await chromium.launch({
    headless: process.env.DEBUG_BROWSER === '1' ? false : true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  let updated = 0
  let failed = 0

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1366, height: 768 }
    })
    context.setDefaultTimeout(35000)
    const page = await context.newPage()

    console.log('[BACKFILL-PHOTOS] Revy login...')
    await revyLogin(page)
    console.log('[BACKFILL-PHOTOS] Login OK.')

    for (const row of toProcess) {
      const u = row.listing_url
      try {
        await randomDelay(1, 2)
        await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 25000 })
        await delay(1000)
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await delay(800)
        await page.waitForSelector('.price-container', { timeout: 12000 }).catch(() => null)
        await delay(500)
        const html = await page.content()
        const parsed = parseListing(html, u)
        const photos = Array.isArray(parsed.photos) ? parsed.photos : []
        const { error } = await supabase.from('listings').update({ photos }).eq('id', row.id)
        if (error) {
          failed++
          if (process.env.DEBUG) console.warn('[BACKFILL-PHOTOS] update err:', u, error.message)
        } else {
          updated++
          console.log(`[BACKFILL-PHOTOS] ${row.id} → ${photos.length} foto`)
        }
      } catch (e) {
        failed++
        if (process.env.DEBUG) console.warn('[BACKFILL-PHOTOS] skip:', u, e.message)
      }
    }
  } finally {
    await browser.close()
  }

  console.log(`[BACKFILL-PHOTOS] Bitti. ${updated} güncellendi, ${failed} hata.`)
}

main().catch((e) => {
  console.error('[BACKFILL-PHOTOS]', e)
  process.exit(1)
})
