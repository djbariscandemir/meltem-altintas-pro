import * as cheerio from 'cheerio'
import { client } from './login.js'
import { LIST_URL, BASE_URL, SELECTORS, USE_FIXTURES, loadFixture } from './config.js'

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function randomDelay(min = 1, max = 3) {
  return delay(Math.floor((min + Math.random() * (max - min)) * 1000))
}

function extractDetailUrls(html, baseUrl, max = 50) {
  const $ = cheerio.load(html)
  const links = []

  $(SELECTORS.detail_links).each((_, el) => {
    const href = $(el).attr('href')
    if (!href || links.length >= max) return
    try {
      const url = href.startsWith('http') ? href : new URL(href, baseUrl).href
      const norm = url.split('?')[0].split('#')[0]
      if (norm && !links.includes(norm)) links.push(norm)
    } catch (_) {}
  })

  const re = /(?:https?:\/\/[^"'\s]*)?\/app\/portfoy\/detay\/[a-f0-9-]+/gi
  let m
  $('script').each((_, el) => {
    const raw = $(el).html()
    if (!raw || raw.length < 50) return
    while ((m = re.exec(raw)) !== null && links.length < max) {
      let path = m[0]
      if (!path.startsWith('http')) path = new URL(path, baseUrl).href
      const norm = path.split('?')[0].split('#')[0]
      if (norm && !links.includes(norm)) links.push(norm)
    }
  })

  return [...new Set(links)].slice(0, max)
}

export async function fetchListings(opts = {}) {
  const maxPerPage = opts.maxPerPage ?? 20

  if (USE_FIXTURES) {
    const listHtml = loadFixture('list.html')
    const detailHtml = loadFixture('detail.html')
    if (!listHtml || !detailHtml) return []
    const urls = extractDetailUrls(listHtml, BASE_URL, maxPerPage)
    return urls.map((url) => ({ url, html: detailHtml }))
  }

  const res = await client.get(LIST_URL)
  if (res.status !== 200) return []

  const urls = extractDetailUrls(res.data, BASE_URL, maxPerPage)
  await randomDelay(2, 4)

  const out = []
  for (const url of urls) {
    try {
      await randomDelay(1, 2)
      const r = await client.get(url)
      if (r.status !== 200) continue
      out.push({ url, html: r.data })
    } catch (e) {
      if (process.env.DEBUG) console.warn('[fetchListings] skip:', url, e.message)
    }
  }

  return out
}
