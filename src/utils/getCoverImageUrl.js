// src/utils/getCoverImageUrl.js
// Listing kartlarında gösterilecek kapak fotoğrafını belirler

/**
 * Listing kartı için kapak fotoğrafı URL'ini döndürür
 * 
 * Öncelik sırası:
 * 1. cover_image_url (varsa ve geçerliyse)
 * 2. image_urls[0] (cover_image_url yoksa ama image_urls varsa)
 * 3. null (hiçbiri yoksa)
 * 
 * @param {Object} listing - Listing objesi
 * @param {string|null} listing.cover_image_url - Kapak fotoğrafı URL'i
 * @param {string[]|null} listing.image_urls - Fotoğraf URL'leri array'i
 * @returns {string|null} - Kapak fotoğrafı URL'i veya null
 */
export function getCoverImageUrl(listing) {
  // 1. cover_image_url varsa ve geçerliyse onu kullan
  if (
    listing.cover_image_url &&
    typeof listing.cover_image_url === 'string' &&
    listing.cover_image_url.startsWith('http')
  ) {
    return listing.cover_image_url;
  }

  // 2. cover_image_url yoksa ama image_urls varsa, ilk fotoğrafı kullan
  if (
    Array.isArray(listing.image_urls) &&
    listing.image_urls.length > 0
  ) {
    const firstImage = listing.image_urls[0];
    if (
      firstImage &&
      typeof firstImage === 'string' &&
      firstImage.startsWith('http')
    ) {
      return firstImage;
    }
  }

  // 3. Hiçbiri yoksa null döndür (placeholder gösterilecek)
  return null;
}
