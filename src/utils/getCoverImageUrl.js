// src/utils/getCoverImageUrl.js
// Listing kartlarında gösterilecek kapak fotoğrafını belirler

/**
 * Listing kartı için kapak fotoğrafı URL'ini döndürür
 *
 * Öncelik: cover_image_url → image_urls[0] → photos[0] → null
 */
export function getCoverImageUrl(listing) {
  if (
    listing.cover_image_url &&
    typeof listing.cover_image_url === 'string' &&
    listing.cover_image_url.startsWith('http')
  ) {
    return listing.cover_image_url
  }
  const urls = Array.isArray(listing.image_urls) ? listing.image_urls : []
  if (urls.length > 0) {
    const first = urls[0]
    if (first && typeof first === 'string' && first.startsWith('http')) return first
  }
  const photos = Array.isArray(listing.photos) ? listing.photos : []
  if (photos.length > 0) {
    const first = photos[0]
    if (first && typeof first === 'string' && first.startsWith('http')) return first
  }
  return null
}
