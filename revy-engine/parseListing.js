import * as cheerio from 'cheerio'
import { SELECTORS, SUBTYPE_TO_TYPE } from './config.js'

const KONUT_KEYS = ['daire', 'apartman', 'villa', 'rezidans', 'apartman_dairesi']
const TICARI_KEYS = ['dukkan', 'dükkan', 'ofis', 'depo', 'magaza', 'mağaza']

function trim(s) {
  return (s != null && String(s).trim()) || null
}

function parsePrice(raw) {
  if (!raw || typeof raw !== 'string') return null
  const cleaned = raw.replace(/[^\d]/g, '')
  if (!cleaned) return null
  const n = Number(cleaned)
  return Number.isNaN(n) || n === 0 ? null : n
}

function parseDate(raw) {
  if (!raw || typeof raw !== 'string') return null
  const m = raw.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (!m) return null
  const [, d, mo, y] = m
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function parseArea(raw) {
  if (!raw || typeof raw !== 'string') return null
  const m = raw.match(/(\d+)\s*m[²2]?/i)
  if (!m) return null
  const n = Number(m[1])
  return Number.isNaN(n) || n <= 0 ? null : n
}

function propertyTypeFromSubtype(s) {
  if (!s || typeof s !== 'string') return 'konut'
  const lower = s.toLowerCase()
  for (const k of TICARI_KEYS) {
    if (lower.includes(k)) return 'ticari'
  }
  for (const k of KONUT_KEYS) {
    if (lower.includes(k)) return 'konut'
  }
  return 'konut'
}

function normalizeSubtype(raw) {
  if (!raw || typeof raw !== 'string') return 'daire'
  const lower = raw.toLowerCase().replace(/\s+/g, '_')
  if (lower.includes('villa')) return 'villa'
  if (lower.includes('rezidans')) return 'rezidans'
  if (lower.includes('apartman') && lower.includes('dairesi')) return 'apartman_dairesi'
  if (lower.includes('apartman') || lower.includes('daire')) return 'daire'
  if (lower.includes('dükkan') || lower.includes('dukkan')) return 'dukkan'
  if (lower.includes('ofis')) return 'ofis'
  if (lower.includes('depo')) return 'depo'
  if (lower.includes('mağaza') || lower.includes('magaza')) return 'dukkan'
  return 'daire'
}

/** Fotoğraflar SADECE detay sayfasından. img src/data-src/data-original, swiper-slide img, meta og:image. Relative → absolute, dedupe. */
function extractPhotosFromDetail(html, baseUrl) {
  const $ = cheerio.load(html)
  const base = (baseUrl && String(baseUrl).trim()) || 'https://www.revy.com.tr'
  const seen = new Set()
  const out = []

  function push(raw) {
    let href = (raw && String(raw).trim()) || ''
    if (!href || href.startsWith('data:') || href.startsWith('#')) return
    try {
      const abs = href.startsWith('http') ? href : new URL(href, base).href
      if (!abs.startsWith('http://') && !abs.startsWith('https://')) return
      const norm = abs.split('?')[0].split('#')[0]
      if (!norm || seen.has(norm)) return
      const lower = norm.toLowerCase()
      // Gerçek ilan fotoğrafları: shbdn.com/photos veya sahibinden.com/photos → her zaman geçerli
      const isRealPhoto = lower.includes('shbdn.com/photos') || lower.includes('sahibinden.com/photos')
      if (isRealPhoto) {
        seen.add(norm)
        out.push(norm)
        return
      }
      // Logo/icon filtreleme: revy.com.tr/images/ klasöründeki dosyalar → filtrelensin
      if (lower.includes('revy.com.tr/images/')) return
      // Diğer resimler: .jpg, .jpeg, .webp, .png geçerli (ama logo klasöründe değilse)
      const hasImageExt = /\.(jpg|jpeg|webp|png)(\?|$)/i.test(norm)
      if (hasImageExt) {
        seen.add(norm)
        out.push(norm)
      }
      // SVG'ler genelde logo/icon → filtrelensin (ama shbdn.com/photos içindeyse zaten yukarıda eklendi)
    } catch (_) {}
  }

  $('img').each((_, el) => {
    const n = $(el)
    push(n.attr('src'))
    push(n.attr('data-src'))
    push(n.attr('data-original'))
  })
  $('.swiper-slide img').each((_, el) => {
    const n = $(el)
    push(n.attr('src'))
    push(n.attr('data-src'))
    push(n.attr('data-original'))
  })
  $('meta[property="og:image"]').each((_, el) => {
    push($(el).attr('content'))
  })

  return out
}

export function parseListing(html, listing_url) {
  const $ = cheerio.load(html)
  const s = SELECTORS

  const match = (listing_url || '').match(/\/detay\/([a-f0-9-]+)/i)
  const external_id = match ? match[1] : null

  let title = null
  if (s.title) {
    const t = trim($(s.title).first().text())
    if (t && !t.toLowerCase().includes('müşteri seç')) title = t
  }
  if (!title) title = 'İlan'

  let price = null
  if (s.price) price = parsePrice($(s.price).first().text())

  let rooms = null
  if (s.rooms) {
    const pt = $(s.rooms).first().parent().text()
    const rm = pt.match(/(\d+\+\d+)/)
    if (rm) rooms = rm[1]
  }

  let net_area = null
  if (s.net_m2) {
    const pt = $(s.net_m2).first().parent().text()
    net_area = parseArea(pt)
  }

  let gross_area = null
  if (s.brut_m2) {
    const pt = $(s.brut_m2).first().parent().text()
    gross_area = parseArea(pt)
  }

  let floor = null
  if (s.floor) {
    const pt = trim($(s.floor).first().parent().text())
    if (pt) floor = pt
  }

  let property_subtype_raw = null
  if (s.property_subtype) {
    const t = trim($(s.property_subtype).first().text())
    if (t) property_subtype_raw = t
  }
  const property_type = propertyTypeFromSubtype(property_subtype_raw || title)
  const property_subtype = normalizeSubtype(property_subtype_raw || (property_type === 'ticari' ? 'ofis' : 'daire'))

  let listing_type = 'satilik'
  $('span').each((_, el) => {
    const t = trim($(el).text())
    if (t === s.satiklik) listing_type = 'satilik'
    if (t === s.kiralik) listing_type = 'kiralik'
  })

  let listing_date = null
  $('div, span, p').each((_, el) => {
    const t = trim($(el).text())
    if (!t || !t.includes(s.ilan_tarihi_label)) return
    $(el).nextAll().each((_, nxt) => {
      const st = trim($(nxt).text())
      const d = parseDate(st)
      if (d) {
        listing_date = d
        return false
      }
    })
  })

  let owner_type = null
  let owner_name = null
  $('div').each((_, el) => {
    const t = trim($(el).text())
    if (t !== s.ilan_sahibi_label) return
    const nt = trim($(el).next().text())
    if (!nt) return
    const l = nt.toLowerCase()
    if (l.includes('sahibinden') || l.includes('mülk sahibi')) owner_type = 'mulk_sahibi'
    else if (l.includes('emlak') || l.includes('ofis')) owner_type = 'emlak_ofisi'
    owner_name = nt
  })

  let building_age = null
  let heating_type = null
  $('div, span, p').each((_, el) => {
    const t = trim($(el).text())
    if (t && t.includes('Bina Yaşı') && !building_age) {
      const nt = trim($(el).next().text())
      if (nt) building_age = nt
    }
    if (t && (t.includes('Isıtma') || t.includes('Isitma')) && !heating_type) {
      const nt = trim($(el).next().text())
      if (nt) heating_type = nt
    }
  })

  const city = null
  const district = null
  const neighborhood = null

  const photos = extractPhotosFromDetail(html, listing_url || 'https://www.revy.com.tr')

  return {
    source: 'revy',
    external_id,
    listing_type,
    property_type,
    property_subtype,
    title,
    price,
    net_area,
    gross_area,
    rooms,
    building_age,
    floor,
    heating_type,
    owner_type,
    owner_name,
    city,
    district,
    neighborhood,
    listing_date,
    listing_url: listing_url || null,
    photos: Array.isArray(photos) ? photos : [],
  }
}
