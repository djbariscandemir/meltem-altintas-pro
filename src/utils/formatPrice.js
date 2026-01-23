// Fiyat formatla: 3.500.000 TL formatında göster
export function formatPrice(price) {
  if (!price && price !== 0) {
    return 'Fiyat belirtilmemiş'
  }
  
  // Number ise direkt formatla
  if (typeof price === 'number') {
    return `${price.toLocaleString('tr-TR')} TL`
  }
  
  // String ise parse et ve formatla
  if (typeof price === 'string') {
    // Sayısal değerleri çıkar
    const cleaned = price.replace(/[^\d]/g, '')
    if (!cleaned) {
      return 'Fiyat belirtilmemiş'
    }
    const num = parseInt(cleaned, 10)
    if (isNaN(num)) {
      return 'Fiyat belirtilmemiş'
    }
    return `${num.toLocaleString('tr-TR')} TL`
  }
  
  return 'Fiyat belirtilmemiş'
}
