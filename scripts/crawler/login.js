import * as cheerio from 'cheerio'
import { client } from './httpClient.js'
import { BASE_URL, LOGIN_USER, LOGIN_PASS, REVY } from './config.js'

const base = () => BASE_URL.replace(/\/$/, '')

function getLoginPageUrl() {
  const path = REVY.loginPath || '/'
  return base() + (path.startsWith('/') ? path : '/' + path)
}

function findForm($) {
  const candidates = $('form')
  for (let i = 0; i < candidates.length; i++) {
    const form = $(candidates[i])
    const hasPass = form.find('input[type="password"], input[name*="password"], input[name*="sifre"]').length
    const hasUser = form.find('input[type="tel"], input[name*="phone"], input[name*="telefon"], input[type="email"]').length
    if (hasPass && (hasUser || form.find('input').length >= 2)) return form
  }
  return null
}

async function tryFormPost(loginUrl, payload, userField, passField) {
  const form = { [userField]: LOGIN_USER, [passField]: LOGIN_PASS, ...payload }
  const res = await client.post(loginUrl, new URLSearchParams(form).toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return res
}

async function tryApiPost(apiPath, userField, passField) {
  const url = base() + (apiPath.startsWith('/') ? apiPath : '/' + apiPath)
  const form = { [userField]: LOGIN_USER, [passField]: LOGIN_PASS }
  const res = await client.post(url, new URLSearchParams(form).toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return res
}

export async function discoverAndLogin() {
  if (!LOGIN_USER || !LOGIN_PASS) {
    throw new Error('LOGIN_FAILED: REVY_PHONE / REVY_PASSWORD veya CRAWLER_LOGIN_USER / CRAWLER_LOGIN_PASS tanımlı olmalı')
  }

  const loginUrl = getLoginPageUrl()
  const res = await client.get(loginUrl)
  if (res.status !== 200) throw new Error(`LOGIN_FAILED: Login sayfası ${res.status} döndü`)

  const $ = cheerio.load(res.data)
  const form = findForm($)
  const userKey = REVY.loginForm?.user || 'phone'
  const passKey = REVY.loginForm?.password || 'password'

  let userField = userKey
  let passField = passKey
  const hidden = {}

  if (form && form.length) {
    const userInput = form.find('input[type="tel"], input[name*="phone"], input[name*="telefon"], input[type="email"]').first()
    const passInput = form.find('input[type="password"], input[name*="password"], input[name*="sifre"]').first()
    if (userInput.length) userField = userInput.attr('name') || userKey
    if (passInput.length) passField = passInput.attr('name') || passKey
    form.find('input[type="hidden"]').each((_, el) => {
      const n = $(el).attr('name')
      const v = $(el).attr('value')
      if (n && v !== undefined) hidden[n] = v
    })
  }

  let action = form?.attr('action')
  if (!action || action === '#' || action === '') action = loginUrl
  const actionUrl = action.startsWith('http') ? action : new URL(action, loginUrl).href

  const postRes = await tryFormPost(actionUrl, hidden, userField, passField)
  if (postRes.status >= 200 && postRes.status < 400) return true

  const fallbacks = REVY.loginApiFallbacks || []
  for (const path of fallbacks) {
    const apiRes = await tryApiPost(path, userField, passField)
    if (apiRes.status >= 200 && apiRes.status < 400) return true
  }

  throw new Error(`LOGIN_FAILED: Form POST ${postRes.status}, API fallback başarısız`)
}
