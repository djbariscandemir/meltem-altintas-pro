// Supabase client
// Supabase artık KALICI veri kaynağı - localStorage yerine kullanılıyor
// KANONİK ŞEMA: Sadece belirlenmiş alanlar kabul edilir

import { createClient } from '@supabase/supabase-js'

// Kanonik şema alanları (sadece bunlar kabul edilir)
const CANONICAL_FIELDS = [
  'listing_id',
  'title',
  'listing_date',
  'source',
  'owner_type',
  'property_category',
  'property_type',
  'price',
  'net_area',
  'gross_area',
  'rooms',
  'city',
  'district',
  'neighborhood',
  'floor',
  'building_age',
  'heating_type',
  'listing_url',
  'cover_image_url', // Kapak fotoğrafı URL'i
  'image_urls', // Çoklu fotoğraf URL'leri (TEXT[])
  'listing_status', // İlan durumu (active/passive)
  'is_active', // Aktif/Pasif durumu (boolean)
  'listing_type', // Satılık/Kiralık (text)
  'phone_numbers', // Telefon numaraları (TEXT[])
  'notes', // Notlar (text)
  'reminder_at' // Hatırlatıcı tarihi (timestamptz)
]

// Supabase'e gönderilecek listing objesini filtrele (sadece kanonik alanlar)
function filterCanonicalFields(listing) {
  const filtered = {}
  for (const field of CANONICAL_FIELDS) {
    const value = listing[field]
    
    // null veya undefined değerleri gönderme
    if (value === null || value === undefined) continue
    
    // Array alanları (image_urls, phone_numbers) için özel kontrol
    if (field === 'image_urls' || field === 'phone_numbers') {
      if (Array.isArray(value) && value.length > 0) {
        filtered[field] = value
      }
      continue
    }
    
    // Boş string ("") ASLA gönderme
    if (typeof value === 'string' && value.trim() === '') continue

    filtered[field] = value
  }
  return filtered
}

// Supabase URL ve Anon Key'i environment variables'dan al
// .env dosyasında tanımlı olmalı
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('[Supabase] Bağlantı bilgileri kontrol ediliyor...')
console.log('[Supabase] URL:', supabaseUrl ? '✅ Tanımlı' : '❌ Tanımlı değil')
console.log('[Supabase] Anon Key:', supabaseAnonKey ? '✅ Tanımlı' : '❌ Tanımlı değil')

if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.DEV) {
    console.error('[Supabase] VITE_SUPABASE_URL veya VITE_SUPABASE_ANON_KEY tanımlı değil!')
    console.error('[Supabase] Lütfen .env dosyasını kontrol edin.')
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://akidlfqugftljfuhnjxn.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFraWRsZnF1Z2Z0bGpmdWhuanhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjcwMDMsImV4cCI6MjA4NDI0NDAwM30.VpxOa_tAXu1uyVUV6b3F-PQnLpaGC9alsXMr2F0V05k'
)

console.log('[Supabase] Client oluşturuldu:', supabase ? '✅' : '❌')

// Supabase API fonksiyonları
export const supabaseApi = {
  /**
   * Listings API
   */
  listings: {
    // Tüm listings'leri getir (created_at desc, limit 50)
    getAll: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) {
        if (import.meta.env.DEV) {
          console.error('[Supabase] Listings getirme hatası:', error)
        }
        return []
      }

      // DEBUG: Supabase'ten gelen ham veriyi logla
      if (process.env.NODE_ENV === 'development') {
        console.log('SUPABASE LISTINGS:', data)
      }
      
      return data || []
    },

    // TÜM listings kayıtlarını sil (MVP davranışı: her import öncesi temizle)
    clearAll: async () => {
      const { error } = await supabase
        .from('listings')
        .delete()
        .not('id', 'is', null)

      if (error) {
        if (import.meta.env.DEV) {
          console.error('[Supabase] Listings clearAll hatası:', error)
        }
        // Production'da sessizce devam et
      }
    },

    // Yeni listing ekle (sadece kanonik alanlar, id ASLA gönderilmez)
    insert: async (listing) => {
      const filtered = filterCanonicalFields(listing)
      // Güvenlik: payload içindeki olası id alanını da KESİN olarak kaldır
      const { id: _ignoredId, ...safePayload } = filtered
      const { data, error } = await supabase
        .from('listings')
        .insert(safePayload)
        .select()
        .single()
      
      if (error) {
        console.error('[Supabase] Listing ekleme hatası:', error)
        throw error
      }
      
      return data
    },

    // Birden fazla listing ekle (sadece kanonik alanlar, id ASLA gönderilmez)
    insertMany: async (listings) => {
      const filtered = listings.map(listing => {
        const f = filterCanonicalFields(listing)
        const { id: _ignoredId, ...rest } = f
        return rest
      })
      const { data, error } = await supabase
        .from('listings')
        .insert(filtered)
        .select()
      
      if (error) {
        if (import.meta.env.DEV) {
          console.error('[Supabase] Listings ekleme hatası:', error)
        }
        throw error
      }
      
      return data || []
    },

    // Listing güncelle (MVP'de DEVRE DIŞI - sadece uyarı logla)
    update: async (id, updates) => {
      console.warn('[Supabase] listings.update MVP için devre dışı. id:', id, 'updates:', updates)
      // İleride gerçek update mantığı eklenecek. Şimdilik hiçbir şey yapma.
      return null
    },

    // Listing sil
    delete: async (id) => {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('[Supabase] Listing silme hatası:', error)
        throw error
      }
    }
  },

  /**
   * Imports API
   */
  imports: {
    // Tüm imports'ları getir
    getAll: async () => {
      const { data, error } = await supabase
        .from('imports')
        .select('*')
        .order('imported_at', { ascending: false })
      
      if (error) {
        if (import.meta.env.DEV) {
          console.error('[Supabase] Imports getirme hatası:', error)
        }
        return []
      }
      
      return data || []
    },

    // Yeni import ekle
    insert: async (importData) => {
      const { data, error } = await supabase
        .from('imports')
        .insert(importData)
        .select()
        .single()
      
      if (error) {
        console.error('[Supabase] Import ekleme hatası:', error)
        throw error
      }
      
      return data
    },

    // Import sil (imports sadece log tablosu - listings ile bağlantı yok)
    delete: async (id) => {
      const { error } = await supabase
        .from('imports')
        .delete()
        .eq('id', id)
      
      if (error) {
        if (import.meta.env.DEV) {
          console.error('[Supabase] Import silme hatası:', error)
        }
        throw error
      }
    },

    // Import güncelle
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('imports')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('[Supabase] Import güncelleme hatası:', error)
        throw error
      }
      
      return data
    }
  }
}
