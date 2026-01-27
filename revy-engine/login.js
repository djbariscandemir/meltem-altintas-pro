import axios from 'axios'
import { CookieJar } from 'tough-cookie'
import { wrapper } from 'axios-cookiejar-support'
import * as cheerio from 'cheerio'
import { BASE_URL, LOGIN_PATH, REVY_PHONE, REVY_PASSWORD, LOGIN_API_FALLBACKS } from './config.js'

const jar = new CookieJar()
const client = wrapper(
  axios.create({
    jar,
    timeout: 30000,
    maxRedirects: 5,
    validateStatus: () => true,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
    },
  })
)

export { client }

function findForm($) {
  const forms = $('form')
  for (let i = 0; i < forms.length; i++) {
    const form = $(forms[i])
    const hasPass = form.find('input[type="password"], input[name*="password"], input[name*="sifre"]').length
    const hasUser = form.find('input[type="tel"], input[name*="phone"], input[type="email"]').length
    if (hasPass && (hasUser || form.find('input').length >= 2)) return form
  }
  return null
}

export async function login() {
  if (!REVY_PHONE || !REVY_PASSWORD) {
    throw new Error('REVY_PHONE ve REVY_PASSWORD tanımlı olmalı.')
  }

  const loginUrl = BASE_URL + (LOGIN_PATH.startsWith('/') ? LOGIN_PATH : '/' + LOGIN_PATH)
  const res = await client.get(loginUrl)
  if (res.status !== 200) throw new Error(`Login sayfası ${res.status} döndü.`)

  const $ = cheerio.load(res.data)
  const form = findForm($)
  if (!form || !form.length) throw new Error('Revy login formu bulunamadı.')

  let userField = 'phone'
  let passField = 'password'
  const hidden = {}

  const userInput = form.find('input[type="tel"], input[name*="phone"], input[type="email"]').first()
  const passInput = form.find('input[type="password"], input[name*="password"], input[name*="sifre"]').first()
  if (userInput.length) userField = userInput.attr('name') || userField
  if (passInput.length) passField = passInput.attr('name') || passField
  form.find('input[type="hidden"]').each((_, el) => {
    const n = $(el).attr('name')
    const v = $(el).attr('value')
    if (n && v !== undefined) hidden[n] = v
  })

  let action = form.attr('action')
  if (!action || action === '#' || action === '') action = loginUrl
  const actionUrl = action.startsWith('http') ? action : new URL(action, loginUrl).href

  const payload = { [userField]: REVY_PHONE, [passField]: REVY_PASSWORD, ...hidden }
  const postRes = await client.post(actionUrl, new URLSearchParams(payload).toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  if (postRes.status >= 200 && postRes.status < 400) return true

  const fallbacks = LOGIN_API_FALLBACKS || []
  for (const path of fallbacks) {
    const apiUrl = BASE_URL + (path.startsWith('/') ? path : '/' + path)
    const r = await client.post(apiUrl, new URLSearchParams(payload).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    if (r.status >= 200 && r.status < 400) return true
  }

  throw new Error(`Login POST ${postRes.status}. Session alınamadı.`)
}
