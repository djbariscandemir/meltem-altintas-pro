// Tüm filtreleme ve sıralama mantığı burada toplanır.
// Girdi: Supabase'ten gelen listings dizisi (HAM veri).
// filters: { owner_type/ownerType, property_category/propertyCategory, rooms[], city, district, neighborhood, price:{min,max}, netArea/net_area:{min,max}, title, source }
// sortOption: 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc'

export function applyFilters(listings, filters = {}, sortOption = 'date_desc') {
  if (!Array.isArray(listings) || listings.length === 0) return []
  const f = filters || {}

  let result = [...listings]

  // --- FİLTRELER (AND) ---

  result = result.filter((item) => {
    // owner_type (Mülk Sahibi / Emlak Ofisi)
    if (f.owner_type && item.owner_type !== f.owner_type) {
      return false
    }
    if (f.ownerType && item.owner_type !== f.ownerType) {
      return false
    }

    // property_category (Konut / Ticari)
    if (f.property_category && item.property_category !== f.property_category) return false
    if (f.propertyCategory && item.property_category !== f.propertyCategory) return false

    // rooms (birebir eşleşme)
    if (Array.isArray(f.rooms) && f.rooms.length > 0) {
      if (!f.rooms.includes(item.rooms)) {
        return false
      }
    }

    // city / district / neighborhood
    if (f.city && item.city !== f.city) return false
    if (f.district && item.district !== f.district) return false
    if (f.neighborhood && item.neighborhood !== f.neighborhood) return false

    // net_area (min / max) – hem net_area hem netArea destekle
    const netAreaFilter = f.net_area || f.netArea
    if (netAreaFilter) {
      const rawNet = item.net_area != null ? item.net_area : item.netArea
      const val = Number(rawNet || 0)
      if (netAreaFilter.min !== undefined && netAreaFilter.min !== '' && val < Number(netAreaFilter.min)) {
        return false
      }
      if (netAreaFilter.max !== undefined && netAreaFilter.max !== '' && val > Number(netAreaFilter.max)) {
        return false
      }
    }

    // price (min / max)
    if (f.price) {
      const p = Number(item.price || 0)
      if (f.price.min !== undefined && f.price.min !== '' && p < Number(f.price.min)) {
        return false
      }
      if (f.price.max !== undefined && f.price.max !== '' && p > Number(f.price.max)) {
        return false
      }
    }

    // source
    if (f.source && item.source !== f.source) return false

    // is_active (İlan Durumu)
    if (f.isActive !== undefined && f.isActive !== '') {
      const isActiveValue = f.isActive === 'true' || f.isActive === true
      const itemIsActive = item.is_active === true || item.is_active === 'true'
      if (itemIsActive !== isActiveValue) return false
    }

    // listing_type (İlan Tipi)
    if (f.listingType && f.listingType !== '') {
      if (item.listing_type !== f.listingType) return false
    }

    // title içerik araması (opsiyonel)
    if (f.title) {
      const t = (item.title || '').toLowerCase()
      const needle = String(f.title).toLowerCase()
      if (!t.includes(needle)) return false
    }

    return true
  })

  // --- SIRALAMA ---

  const opt = sortOption || 'date_desc'
  if (process.env.NODE_ENV === 'development') {
    console.log('[Filters] sort option:', opt)
  }

  switch (opt) {
    case 'date_asc':
      result.sort((a, b) => {
        const da = a.listing_date ? new Date(a.listing_date).getTime() : 0
        const db = b.listing_date ? new Date(b.listing_date).getTime() : 0
        if (!a.listing_date && !b.listing_date) return 0
        if (!a.listing_date) return 1
        if (!b.listing_date) return -1
        return da - db
      })
      break
    case 'price_desc':
      result.sort((a, b) => {
        const pa = Number(a.price || 0)
        const pb = Number(b.price || 0)
        return pb - pa
      })
      break
    case 'price_asc':
      result.sort((a, b) => {
        const pa = Number(a.price || 0)
        const pb = Number(b.price || 0)
        return pa - pb
      })
      break
    case 'date_desc':
    default:
      // İlan Tarihi (Yeniden → Eskiye), null'lar en sonda
      result.sort((a, b) => {
        const da = a.listing_date ? new Date(a.listing_date).getTime() : 0
        const db = b.listing_date ? new Date(b.listing_date).getTime() : 0
        if (!a.listing_date && !b.listing_date) return 0
        if (!a.listing_date) return 1
        if (!b.listing_date) return -1
        return db - da
      })
      break
  }

  return result
}

