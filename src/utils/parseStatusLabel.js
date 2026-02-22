/**
 * parse_status → kullanıcıya gösterilen etiket.
 * pending → İşleniyor, parsed / full / partial → Hazır, failed / abandoned → Hata.
 */
export function getParseStatusLabel(parseStatus) {
  if (!parseStatus || typeof parseStatus !== 'string') return null
  const s = parseStatus.toLowerCase()
  if (s === 'pending' || s === 'manual_pending') return 'İşleniyor'
  if (s === 'parsed' || s === 'full' || s === 'partial') return 'Hazır'
  if (s === 'failed' || s === 'abandoned') return 'Hata'
  return parseStatus
}

/** Badge için CSS sınıfı (pending=warning, parsed/full/partial=success, failed/abandoned=error) */
export function getParseStatusClass(parseStatus) {
  if (!parseStatus || typeof parseStatus !== 'string') return ''
  const s = parseStatus.toLowerCase()
  if (s === 'pending' || s === 'manual_pending') return 'parse-status-pending'
  if (s === 'parsed' || s === 'full' || s === 'partial') return 'parse-status-ok'
  if (s === 'failed' || s === 'abandoned') return 'parse-status-failed'
  return ''
}
