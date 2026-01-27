import * as cheerio from 'cheerio'
import { client } from './httpClient.js'
import { REVY, USE_FIXTURES, loadFixture, BASE_URL } from './config.js'
import { parseDetailHtml } from './parseDetail.js'

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function randomDelay(min = 1, max = 3) {
  return delay(Math.floor(Math.random() * (max - min + 1) * 1000) + min * 1000)
}

export async function fetchListPageUrls(listUrl, maxLinks = 50) {
  let html = ''
  if (USE_FIXTURES) {
    html = loadFixture('list.html')
    if (!html) return []
  } else {
    const res = await client.get(listUrl)
    if (res.status !== 200) return []
    html = res.data
  }

  const $ = cheerio.load(html)
  const base = (typeof listUrl === 'string' && listUrl) ? listUrl : BASE_URL
  const selector = REVY.listLinkSelector || 'a[href*="/detay/"]'
  const links = []

  $(selector).each((_, el) => {
    const href = $(el).attr('href')
    if (!href) return
    try {
      const url = href.startsWith('http') ? href : new URL(href, base).href
      const norm = url.split('?')[0].split('#')[0]
      if (norm && !links.includes(norm) && links.length < maxLinks) links.push(norm)
    } catch (_) {}
  })

  let jsonLinks = []
  const extractFromText = (str) => {
    const re = /(?:https?:)?\/\/[^"'\s]*\/app\/portfoy\/detay\/[a-f0-9-]+|\/app\/portfoy\/detay\/[a-f0-9-]+/gi
    let m
    const out = []
    while ((m = re.exec(str)) !== null && out.length < maxLinks) {
      let path = m[0]
      if (!path.startsWith('http')) path = new URL(path, base).href
      const norm = path.split('?')[0].split('#')[0]
      if (norm && !jsonLinks.includes(norm) && !out.includes(norm)) out.push(norm)
    }
    return out
  }
  $('script[type="application/json"]').each((_, el) => {
    const raw = $(el).html()
    if (!raw) return
    try {
      const str = typeof JSON.parse(raw) === 'object' ? JSON.stringify(JSON.parse(raw)) : raw
      jsonLinks.push(...extractFromText(str))
    } catch (_) {}
  })
  $('script').each((_, el) => {
    const raw = $(el).html()
    if (!raw || raw.length < 100) return
    jsonLinks.push(...extractFromText(raw))
  })

  const combined = [...new Set([...links, ...jsonLinks])].slice(0, maxLinks)
  return combined
}

export async function fetchDetailAndParse(detailUrl) {
  await randomDelay(0.2, 0.5)
  let html = ''
  if (USE_FIXTURES) {
    html = loadFixture('detail.html')
    if (!html) return null
  } else {
    const res = await client.get(detailUrl)
    if (res.status !== 200) return null
    html = res.data
  }
  try {
    return parseDetailHtml(html, detailUrl)
  } catch (e) {
    if (process.env.DEBUG) console.warn('[crawl] parse error:', detailUrl, e.message)
    return null
  }
}

export async function crawlAll(config = {}) {
  const listUrls = config.listUrls || REVY.listUrls
  const maxLinks = config.maxLinks ?? 50
  const maxPages = config.maxPages ?? 3

  const allUrls = new Set()
  for (let p = 0; p < Math.min(maxPages, listUrls.length); p++) {
    const urls = await fetchListPageUrls(listUrls[p], maxLinks)
    urls.forEach((u) => allUrls.add(u))
    await randomDelay(2, 4)
  }

  const detailUrls = Array.from(allUrls)
  const results = []

  for (const url of detailUrls) {
    const listing = await fetchDetailAndParse(url)
    if (listing) results.push(listing)
    await randomDelay(1, 3)
  }

  return results
}
