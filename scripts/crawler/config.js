import 'dotenv/config'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const USE_FIXTURES = process.env.CRAWLER_USE_FIXTURES === 'true' || process.env.CRAWLER_USE_FIXTURES === '1'
export const FIXTURES_DIR = join(__dirname, 'fixtures')

export const BASE_URL = process.env.CRAWLER_BASE_URL || 'https://www.revy.com.tr'
export const LOGIN_USER = process.env.REVY_PHONE || process.env.CRAWLER_LOGIN_USER || ''
export const LOGIN_PASS = process.env.REVY_PASSWORD || process.env.CRAWLER_LOGIN_PASS || ''

export const REVY = {
  loginPath: '/app/portfoy/ilanlar',
  loginForm: { user: 'phone', password: 'password' },
  loginApiFallbacks: [
    '/api/auth/login',
    '/api/login',
    '/v1/auth/login',
  ],
  listUrls: [
    `${BASE_URL}/app/portfoy/ilanlar?export=0&fsbo=true&tab=all&area=my&advertisement_status=active`,
  ],
  listLinkSelector: 'a[href*="/app/portfoy/detay/"]',
  detailSelectors: {
    title: 'p.description',
    price: '.price-container',
    rooms: 'i.icon-room-2',
    netArea: 'i.icon-square',
    grossArea: null,
    floor: 'i.icon-floor',
    listingDate: null,
    propertyCategory: 'span.type',
    ownerLabel: null,
    ownerName: null,
    city: null,
    district: null,
    neighborhood: null,
  },
}

const KONUT = ['daire', 'apartman dairesi', 'villa', 'müstakil ev', 'rezidans']
const TICARI = ['dükkan', 'mağaza', 'ofis', 'plaza', 'depo']

export function propertyTypeFromSubtype(subtype) {
  if (!subtype || typeof subtype !== 'string') return 'konut'
  const s = subtype.toLowerCase().trim()
  if (TICARI.some((t) => s.includes(t))) return 'ticari'
  if (KONUT.some((k) => s.includes(k))) return 'konut'
  return 'konut'
}

export function loadFixture(name) {
  try {
    return readFileSync(join(FIXTURES_DIR, name), 'utf8')
  } catch {
    return ''
  }
}

export function normalizeSubtype(raw) {
  if (!raw || typeof raw !== 'string') return 'daire'
  const s = raw.toLowerCase().trim()
  for (const k of [...KONUT, ...TICARI]) {
    if (s.includes(k)) return k
  }
  return s || 'daire'
}
