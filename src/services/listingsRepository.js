import { supabase } from '../utils/supabase'

const REVY_DETAIL_URL_REGEX = /^https?:\/\/(www\.)?revy\.com\.tr\/.*\/detay\/([a-f0-9-]+)/i

/**
 * Revy detay URL'sinden ilan ID'sini çıkarır.
 * @param {string} url - Revy ilan detay URL'si
 * @returns {{ valid: boolean, revyId?: string, error?: string }}
 */
export function parseRevyDetailUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL giriniz' }
  }
  const trimmed = url.trim()
  const match = trimmed.match(REVY_DETAIL_URL_REGEX)
  if (!match) {
    return { valid: false, error: 'Geçerli bir Revy ilan detay linki giriniz (revy.com.tr/.../detay/...)' }
  }
  return { valid: true, revyId: match[2] }
}

/**
 * Manuel ilan ekle (Revy linki ile). Stub kayıt: source=manual, parse_status=pending.
 * Şema ile uyumlu sadece gerekli kolonlar gönderilir.
 * @param {string} revyDetailUrl - Revy ilan detay URL'si
 * @param {string} [initialNote] - Opsiyonel ilk not
 * @returns {{ success: boolean, duplicate?: boolean, listingId?: string, error?: string }}
 */
export async function addManualListing(revyDetailUrl, initialNote) {
  const parsed = parseRevyDetailUrl(revyDetailUrl)
  if (!parsed.valid) {
    return { success: false, error: parsed.error }
  }

  const { revyId } = parsed
  const listingUrl = revyDetailUrl.trim()

  // external_id zorunlu (Revy ID)
  if (!revyId) {
    return { success: false, error: 'Revy ilan ID\'si alınamadı' }
  }

  try {
    // Duplicate: aynı external_id ile revy veya manual kayıt varsa tekrar ekleme
    const { data: existingRevy } = await supabase
      .from('listings')
      .select('id')
      .eq('source', 'revy')
      .eq('external_id', revyId)
      .maybeSingle()
    const { data: existingManual } = await supabase
      .from('listings')
      .select('id')
      .eq('source', 'manual')
      .eq('external_id', revyId)
      .maybeSingle()

    if (existingRevy || existingManual) {
      return { success: false, duplicate: true, error: 'Bu ilan zaten sistemde mevcut' }
    }

    // Insert: DB şemasına uyumlu kolonlar (parse_status, source, external_id)
    const stub = {
      listing_url: listingUrl,
      source: 'manual',
      external_id: revyId,
      parse_status: 'pending',
      title: 'İlan (yükleniyor)'
    }

    const { data: inserted, error: insertError } = await supabase
      .from('listings')
      .insert(stub)
      .select('id')
      .single()

    if (insertError) {
      if (import.meta.env.DEV) console.warn('[listingsRepository] addManualListing insert:', insertError)
      // PGRST204 vb. kullanıcıya Toast ile gösterilsin
      return { success: false, error: insertError.message || 'İlan eklenirken hata oluştu' }
    }

    const listingId = inserted?.id
    if (import.meta.env.DEV && listingId) console.log('[listingsRepository] addManualListing inserted id:', listingId)

    if (initialNote && initialNote.trim()) {
      const { error: noteError } = await supabase.from('notes').insert({
        listing_id: listingId,
        note_text: initialNote.trim(),
        is_completed: false
      })
      if (noteError && import.meta.env.DEV) {
        console.warn('[listingsRepository] addManualListing note:', noteError)
      }
    }

    return { success: true, listingId }
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[listingsRepository] addManualListing', err)
    return { success: false, error: err.message || 'Beklenmeyen hata' }
  }
}

export async function fetchAllListings() {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('listing_date', { ascending: false, nullsLast: true })
      .limit(100)

    if (error) {
      if (import.meta.env.DEV) console.warn('[listingsRepository]', error.message)
      return []
    }
    return data || []
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[listingsRepository]', err)
    return []
  }
}
