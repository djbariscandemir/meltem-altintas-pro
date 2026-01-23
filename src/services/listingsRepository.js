// Tek sorumluluk: Supabase 'listings' tablosu ile konuşmak.
// UI ve diğer katmanlar doğrudan Supabase client kullanmaz.

import { supabase } from '../utils/supabase'

// Tüm ilanları getir ve HAM Supabase formatında döndür
// Varsayılan: created_at desc, limit 50
export async function fetchAllListings() {
  console.log('[listingsRepository] fetchAllListings başlatılıyor...')
  console.log('[listingsRepository] Supabase client:', supabase ? '✅ Mevcut' : '❌ Yok')
  
  try {
    console.log('[listingsRepository] Supabase sorgusu gönderiliyor: listings.select(*).order(created_at).limit(50)')
    
    const { data, error, count } = await supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .order('listing_date', { ascending: false, nullsLast: true })
      .limit(50)

    console.log('[listingsRepository] Sorgu tamamlandı')
    console.log('[listingsRepository] Response - data:', data ? `${data.length} kayıt` : 'null')
    console.log('[listingsRepository] Response - error:', error ? '❌ Var' : '✅ Yok')
    console.log('[listingsRepository] Response - count:', count !== null ? count : 'null')

    if (error) {
      // "Failed to fetch" hatası için özel handling (network error)
      if (error.message === 'Failed to fetch' || error.message?.includes('fetch')) {
        if (import.meta.env.DEV) {
          console.warn('[listingsRepository] Network error: Supabase bağlantısı kurulamadı')
        }
        return []
      }
      
      // Diğer hatalar için sadece DEV modunda log
      if (import.meta.env.DEV) {
        console.error('[listingsRepository] fetchAllListings error:', error)
        console.error('[listingsRepository] Error code:', error.code)
        console.error('[listingsRepository] Error message:', error.message)
      }
      // Production'da sessizce boş array döndür
      return []
    }

    const listings = data || []
    console.log(`[listingsRepository] ✅ ${listings.length} adet ilan getirildi`)
    console.log(`[listingsRepository] 📊 Toplam kayıt sayısı (Supabase): ${count || 0}`)
    
    // Her ilan için cover_image_url, id, title logla
    if (listings.length > 0) {
      console.log('[listingsRepository] İlk ilan örneği:', {
        id: listings[0].id,
        listing_id: listings[0].listing_id,
        title: listings[0].title,
        price: listings[0].price,
        listing_date: listings[0].listing_date,
        owner_type: listings[0].owner_type,
        listing_url: listings[0].listing_url ? '✅ Var' : '❌ Yok'
      })
      
      // Her ilan için cover_image_url kontrolü
      listings.forEach((listing, index) => {
        console.log(`[listingsRepository] İlan ${index + 1}:`, {
          id: listing.id,
          title: listing.title || '❌ NULL',
          cover_image_url: listing.cover_image_url || '❌ NULL'
        })
      })
    } else {
      console.warn('[listingsRepository] ⚠️ Supabase\'te henüz ilan bulunmuyor!')
      console.warn('[listingsRepository] Tabloda toplam kayıt sayısı:', count || 0)
    }

    // KABUL KRİTERİ: Console'a data.length yazdır
    console.log(`[listingsRepository] 📋 Frontend'e gönderilen ilan sayısı: ${listings.length}`)

    return listings
  } catch (err) {
    // "Failed to fetch" hatası için özel handling (network error)
    if (err.message === 'Failed to fetch' || err.message?.includes('fetch')) {
      if (import.meta.env.DEV) {
        console.warn('[listingsRepository] Network error: Supabase bağlantısı kurulamadı')
      }
      return []
    }
    
    // Diğer hatalar için sadece DEV modunda log
    if (import.meta.env.DEV) {
      console.warn('[listingsRepository] fetchAllListings exception:', err)
    }
    // Production'da sessizce boş array döndür
    return []
  }
}

// TÜM ilanları sil (MVP tam import için)
export async function clearAllListings() {
  const { error } = await supabase
    .from('listings')
    .delete()
    .not('id', 'is', null)

  if (error) {
    console.error('[listingsRepository] clearAllListings error:', error)
    throw error
  }
}

// Tüm ilanları verilen yeni liste ile değiştir (MVP davranışı)
// newListings: Supabase kolon isimleriyle uyumlu ham objeler (listing_id, title, listing_date, ...)
export async function replaceAllListings(newListings) {
  // 1) Eski kayıtları temizle
  await clearAllListings()

  if (!newListings || newListings.length === 0) {
    if (import.meta.env.DEV) {
      console.log('[listingsRepository] replaceAllListings: boş liste, sadece temizlendi.')
    }
    return []
  }

  // 2) Yeni kayıtları ekle (id alanını KESİNLİKLE gönderme)
  const safePayload = newListings.map(({ id, ...rest }) => rest)

  const { data, error } = await supabase
    .from('listings')
    .insert(safePayload)
    .select('*')

  if (error) {
    if (import.meta.env.DEV) {
      console.error('[listingsRepository] replaceAllListings insert error:', error)
    }
    throw error
  }

  if (import.meta.env.DEV) {
    console.log('[listingsRepository] replaced listings count:', (data || []).length)
  }

  return data || []
}

