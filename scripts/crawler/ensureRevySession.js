/**
 * Ortak Revy oturum yönetimi.
 * Oturum yoksa veya süresi dolmuşsa otomatik login yapar, storage state günceller.
 * parseManualListings ve fetchRevyWithLogin bu modülü kullanır.
 */

import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import dotenv from 'dotenv'

dotenv.config()

const REVY_BASE_URL = 'https://www.revy.com.tr'
const DEFAULT_STORAGE_PATH = './.auth/revy-storage-state.json'

// REVY_PHONE veya REVY_EMAIL (öncelik: phone), REVY_PASSWORD
const REVY_USER = process.env.REVY_PHONE || process.env.REVY_EMAIL || ''
const REVY_PASSWORD = process.env.REVY_PASSWORD || ''

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function randomDelay(min, max) {
  const ms = Math.floor(Math.random() * (max - min + 1) * 1000) + min * 1000
  return delay(ms)
}

/**
 * Sayfada login gerektiğini tespit eder.
 * - URL ana sayfa ise (revy.com.tr/ veya /app/portfoy/detay/ yok)
 * - VEYA login formu selector'ları var (input[type="tel"], input[name="email"], input[name="password"])
 */
export function needsLogin(page) {
  return page.evaluate(() => {
    const url = window.location.href
    const isHomepage = url === 'https://www.revy.com.tr/' || url === 'https://www.revy.com.tr' || !url.includes('/app/portfoy/detay/')
    const hasLoginForm = !!(
      (document.querySelector('input[type="tel"], input[name*="phone"], input[name="email"]') && document.querySelector('input[type="password"], input[name="password"]'))
    )
    return isHomepage || hasLoginForm
  }).catch(() => true)
}

/**
 * Detay sayfasında mıyız kontrolü.
 */
export function isOnDetailPage(page) {
  return page.evaluate(() => window.location.href.includes('/app/portfoy/detay/')).catch(() => false)
}

/**
 * Revy oturumunu sağlar. Oturum yoksa login yapar, storage state günceller.
 * @param {import('playwright').Page} page - Playwright page
 * @param {Object} options
 * @param {string} [options.storageStatePath] - Storage state kayıt yolu
 * @returns {Promise<void>}
 */
export async function ensureRevySession(page, options = {}) {
  const storagePath = options.storageStatePath || DEFAULT_STORAGE_PATH
  const hasStorageState = existsSync(storagePath)

  if (!REVY_USER || !REVY_PASSWORD) {
    throw new Error(
      'REVY_LOGIN_REQUIRED: .env dosyasında REVY_PHONE (veya REVY_EMAIL) ve REVY_PASSWORD tanımlı olmalı.'
    )
  }

  await page.goto(REVY_BASE_URL, { waitUntil: 'networkidle', timeout: 60000 })
  await delay(2000)

  const currentUrl = page.url()
  if (!currentUrl.startsWith(REVY_BASE_URL)) {
    throw new Error(`REVY_LOGIN_FAILED: Beklenmeyen domain: ${currentUrl}`)
  }

  // Giriş butonu var mı?
  const loginButtonSelectors = [
    'a:has-text("Giriş")',
    'button:has-text("Giriş")',
    '[aria-label*="Giriş"]'
  ]

  let loginButton = null
  for (const sel of loginButtonSelectors) {
    try {
      const el = await page.$(sel)
      if (el && (await el.isVisible())) {
        loginButton = el
        break
      }
    } catch {
      continue
    }
  }

  // Login butonu yok + storageState varsa → zaten login olabilir
  if (!loginButton) {
    if (hasStorageState) {
      const alreadyLoggedIn = await page.evaluate(() => {
        const portfolioLinks = document.querySelectorAll('a[href*="/portfoy"], a[href*="/portfolio"]')
        const phoneInputs = document.querySelectorAll('input[type="tel"]')
        const visible = Array.from(phoneInputs).filter(
          i => getComputedStyle(i).display !== 'none' && getComputedStyle(i).visibility !== 'hidden'
        )
        return (portfolioLinks.length > 0 || document.querySelector('[class*="user"], [class*="profile"]')) && visible.length === 0
      }).catch(() => false)
      if (alreadyLoggedIn) {
        await saveStorageState(page, storagePath)
        return
      }
    }
    throw new Error('REVY_LOGIN_FAILED: Giriş butonu bulunamadı ve oturum geçersiz.')
  }

  // Login akışı
  await loginButton.click()
  await delay(1500)

  await page.waitForSelector('input[type="tel"], input[name*="phone"], input[name="email"], input[type="password"]', { timeout: 8000 })

  // Kullanıcı alanı: telefon veya email
  const userInput = await page.$('input[type="tel"], input[name*="phone"], input[name="email"]')
  if (!userInput) {
    throw new Error('REVY_LOGIN_FAILED: Telefon/email input bulunamadı.')
  }
  await userInput.fill('')
  await userInput.type(REVY_USER, { delay: 80 })
  await delay(500)

  const passInput = await page.$('input[type="password"], input[name="password"]')
  if (!passInput) {
    throw new Error('REVY_LOGIN_FAILED: Şifre input bulunamadı.')
  }
  await passInput.fill(REVY_PASSWORD)
  await randomDelay(0.3, 0.6)

  const submitSelectors = ['button[type="submit"]', 'button:has-text("Giriş")', 'button:has-text("Devam Et")', 'button:has-text("Giriş Yap")']
  let submitBtn = null
  for (const sel of submitSelectors) {
    try {
      const el = await page.$(sel)
      if (el && (await el.isVisible())) {
        submitBtn = el
        break
      }
    } catch {
      continue
    }
  }
  if (!submitBtn) {
    throw new Error('REVY_LOGIN_FAILED: Giriş butonu bulunamadı.')
  }
  await submitBtn.click()
  await delay(2500)

  // Başarı kontrolü
  const success = await page.evaluate(() => {
    const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"]')
    const visibleModals = Array.from(modals).filter(
      m => getComputedStyle(m).display !== 'none' && getComputedStyle(m).visibility !== 'hidden'
    )
    const phoneInputs = document.querySelectorAll('input[type="tel"]')
    const visible = Array.from(phoneInputs).filter(
      i => getComputedStyle(i).display !== 'none' && getComputedStyle(i).visibility !== 'hidden'
    )
    const portfolio = document.querySelectorAll('a[href*="/portfoy"], a[href*="/portfolio"]')
    return (visibleModals.length === 0 && visible.length === 0) || portfolio.length > 0
  }).catch(() => false)

  if (!success) {
    await delay(5000)
    const retry = await page.evaluate(() => {
      const phoneInputs = document.querySelectorAll('input[type="tel"]')
      const visible = Array.from(phoneInputs).filter(
        i => getComputedStyle(i).display !== 'none' && getComputedStyle(i).visibility !== 'hidden'
      )
      return visible.length === 0
    }).catch(() => false)
    if (!retry) {
      throw new Error('REVY_LOGIN_FAILED: Giriş başarısız - Modal veya form hala görünür.')
    }
  }

  await saveStorageState(page, storagePath)
}

async function saveStorageState(page, storagePath) {
  const dir = dirname(storagePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  const context = page.context()
  await context.storageState({ path: storagePath })
  console.log('[ensureRevySession] Storage state kaydedildi:', storagePath)
}
