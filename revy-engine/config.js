import 'dotenv/config'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PHONE = process.env.REVY_PHONE || process.env.REYY_PHONE || ''
const PASS = process.env.REVY_PASSWORD || process.env.REYY_PASSWORD || ''

export const REVY_PHONE = PHONE
export const REVY_PASSWORD = PASS
export const USE_FIXTURES = process.env.REVY_ENGINE_USE_FIXTURES === '1' || process.env.REVY_ENGINE_USE_FIXTURES === 'true'
export const FIXTURES_DIR = join(__dirname, 'fixtures')

export function loadFixture(name) {
  try {
    return readFileSync(join(FIXTURES_DIR, name), 'utf8')
  } catch {
    return ''
  }
}

export const BASE_URL = 'https://www.revy.com.tr'
export const LOGIN_PATH = '/app/portfoy/ilanlar'
export const LIST_URL = `${BASE_URL}/app/portfoy/ilanlar?export=0&fsbo=true&tab=all&area=my&advertisement_status=active`
export const LOGIN_API_FALLBACKS = ['/api/auth/login', '/api/login', '/v1/auth/login']

export const SELECTORS = {
  title: 'p.description',
  price: '.price-container',
  rooms: 'i.icon.icon-room-2',
  net_m2: 'i.icon.icon-square',
  brut_m2: null,
  floor: 'i.icon.icon-floor',
  property_subtype: 'span.type',
  detail_links: 'a[href*="/app/portfoy/detay/"]',
  price_container: '.price-container',
  ilan_tarihi_label: 'İlan Tarihi',
  ilan_sahibi_label: 'İlan Sahipliği',
  satilik: 'Satılık',
  kiralik: 'Kiralık',
}

export const SUBTYPE_TO_TYPE = {
  daire: 'konut',
  apartman_dairesi: 'konut',
  apartman: 'konut',
  villa: 'konut',
  rezidans: 'konut',
  dukkan: 'ticari',
  dükkan: 'ticari',
  ofis: 'ticari',
  depo: 'ticari',
  magaza: 'ticari',
  mağaza: 'ticari',
}

export function ensureEnv() {
  if (!REVY_PHONE || !REVY_PASSWORD) {
    throw new Error('REVY_PHONE ve REVY_PASSWORD (veya REYY_*) tanımlı olmalı. Engine çalışmıyor.')
  }
}
