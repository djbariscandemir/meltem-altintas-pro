import * as cheerio from 'cheerio'
import { REVY, propertyTypeFromSubtype, normalizeSubtype } from './config.js'

function text($, el) {
  return $(el).text?.()?.trim() || ''
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
  const s = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
  return s
}

export function parseDetailHtml(html, listingUrl) {
  const $ = cheerio.load(html)
  const sel = REVY.detailSelectors

  let title = null
  if (sel.title) {
    const t = text($, $(sel.title).first())
    if (t && !t.toLowerCase().includes('müşteri seç')) title = t
  }
  if (!title) title = 'İlan'

  let price = null
  if (sel.price) {
    const p = text($, $(sel.price).first())
    price = parsePrice(p)
  }

  let rooms = null
  if (sel.rooms) {
    const parent = $(sel.rooms).first().parent()
    const pt = parent.length ? text($, parent.get(0)) : ''
    const roomMatch = pt.match(/(\d+\+\d+)/)
    if (roomMatch) rooms = roomMatch[1]
  }

  let net_area = null
  if (sel.netArea) {
    const parent = $(sel.netArea).first().parent()
    const pt = parent.length ? text($, parent.get(0)) : ''
    const areaMatch = pt.match(/(\d+)\s*m[²2]?/i)
    if (areaMatch) {
      const n = Number(areaMatch[1])
      if (!Number.isNaN(n) && n > 0) net_area = n
    }
  }

  let gross_area = null
  if (sel.grossArea) {
    const parent = $(sel.grossArea).first().parent()
    const pt = parent.length ? text($, parent.get(0)) : ''
    const areaMatch = pt.match(/(\d+)\s*m[²2]?/i)
    if (areaMatch) {
      const n = Number(areaMatch[1])
      if (!Number.isNaN(n) && n > 0) gross_area = n
    }
  }

  let floor = null
  if (sel.floor) {
    const parent = $(sel.floor).first().parent()
    const pt = parent.length ? text($, parent.get(0)) : ''
    if (pt) floor = pt
  }

  let property_category = null
  if (sel.propertyCategory) {
    const t = text($, $(sel.propertyCategory).first())
    if (t) property_category = t
  }

  let listing_status = 'satilik'
  $('span').each((_, el) => {
    const t = text($, el)
    if (t === 'Satılık') listing_status = 'satilik'
    if (t === 'Kiralık') listing_status = 'kiralik'
  })

  let owner_type = null
  let owner_name = null
  $('div').each((_, el) => {
    const t = text($, el)
    if (t !== 'İlan Sahipliği') return
    const next = $(el).next()
    const nt = next.length ? text($, next.get(0)) : ''
    if (!nt) return
    const lower = nt.toLowerCase()
    if (lower.includes('sahibinden') || lower.includes('mülk sahibi')) owner_type = 'mulk_sahibi'
    else if (lower.includes('emlak') || lower.includes('ofis')) owner_type = 'emlak_ofisi'
  })

  const property_subtype = normalizeSubtype(property_category || title || '')
  const property_type = propertyTypeFromSubtype(property_subtype)

  let listing_date = null
  $('div, span, p').each((_, el) => {
    const t = text($, el)
    if (!t || !t.includes('İlan Tarihi')) return
    const sibs = $(el).nextAll()
    for (let i = 0; i < sibs.length; i++) {
      const st = text($, sibs.get(i))
      const d = parseDate(st)
      if (d) {
        listing_date = d
        return false
      }
    }
  })

  const city = null
  const district = null
  const neighborhood = null

  return {
    title,
    price,
    listing_status,
    listing_date,
    property_type,
    property_subtype,
    rooms,
    net_area,
    gross_area,
    floor,
    building_age: null,
    heating_type: null,
    owner_type,
    owner_name,
    city,
    district,
    neighborhood,
    listing_url: listingUrl || null,
  }
}
