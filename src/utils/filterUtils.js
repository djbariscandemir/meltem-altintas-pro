export function applyFilters(listings, filters = {}, sortOption = 'date_desc') {
  if (!Array.isArray(listings) || listings.length === 0) return []
  const f = filters || {}
  let result = [...listings]

  result = result.filter((item) => {
    if (f.listing_status && item.listing_status !== f.listing_status) return false
    if (f.property_type && item.property_type !== f.property_type) return false
    if (f.property_subtype && item.property_subtype !== f.property_subtype) return false
    if (f.owner_type && item.owner_type !== f.owner_type) return false
    if (Array.isArray(f.rooms) && f.rooms.length > 0 && !f.rooms.includes(item.rooms)) return false
    if (f.district && item.district !== f.district) return false
    if (f.neighborhood && item.neighborhood !== f.neighborhood) return false
    const net = f.netArea || f.net_area
    if (net && (net.min !== undefined && net.min !== '' || net.max !== undefined && net.max !== '')) {
      const val = Number(item.net_area ?? 0)
      if (net.min !== undefined && net.min !== '' && val < Number(net.min)) return false
      if (net.max !== undefined && net.max !== '' && val > Number(net.max)) return false
    }
    if (f.price && (f.price.min !== undefined && f.price.min !== '' || f.price.max !== undefined && f.price.max !== '')) {
      const p = Number(item.price ?? 0)
      if (f.price.min !== undefined && f.price.min !== '' && p < Number(f.price.min)) return false
      if (f.price.max !== undefined && f.price.max !== '' && p > Number(f.price.max)) return false
    }
    return true
  })

  const opt = sortOption || 'date_desc'
  switch (opt) {
    case 'photos_first':
      result.sort((a, b) => {
        const aHas = Array.isArray(a.photos) && a.photos.length > 0 ? 1 : 0
        const bHas = Array.isArray(b.photos) && b.photos.length > 0 ? 1 : 0
        if (bHas !== aHas) return bHas - aHas
        return (new Date(b.listing_date || 0)).getTime() - (new Date(a.listing_date || 0)).getTime()
      })
      break
    case 'date_asc':
      result.sort((a, b) => (new Date(a.listing_date || 0)).getTime() - (new Date(b.listing_date || 0)).getTime())
      break
    case 'price_desc':
      result.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0))
      break
    case 'price_asc':
      result.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0))
      break
    case 'date_desc':
    default:
      result.sort((a, b) => (new Date(b.listing_date || 0)).getTime() - (new Date(a.listing_date || 0)).getTime())
      break
  }
  return result
}
