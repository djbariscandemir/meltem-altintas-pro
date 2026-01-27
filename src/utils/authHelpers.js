/**
 * Supabase Auth user → uygulama user formatına çevirir.
 * Dashboard/Header vb. { id, email, firstName, lastName, role } bekler.
 */
export function buildUserFromAuth(authUser) {
  if (!authUser?.id) return null
  const fullName = (authUser.user_metadata?.full_name || authUser.email || '').trim()
  const parts = fullName.split(/\s+/).filter(Boolean)
  const firstName = parts[0] || 'Kullanıcı'
  const lastName = parts.slice(1).join(' ') || ''
  return {
    id: authUser.id,
    email: authUser.email || '',
    firstName,
    lastName,
    // Rol bilgisi sadece profiles tablosundan okunur.
    // Auth metadata'daki role alanı dikkate alınmaz.
    role: 'user'
  }
}
