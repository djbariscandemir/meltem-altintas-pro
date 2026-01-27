import { useState, useEffect } from 'react'
import { fetchProfileByUserId, upsertProfile } from '../../services/profilesRepository'
import { toast } from '../Toast/ToastContainer'
import './Profile.css'

function toDateInputValue(d) {
  if (!d) return ''
  const x = new Date(d)
  if (isNaN(x.getTime())) return ''
  return x.toISOString().slice(0, 10)
}

function Profile({ user, onProfileUpdate }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    dogum_tarihi: '',
    calisma_baslangic_tarihi: '',
    sorumlu_bolgeler: ''
  })

  useEffect(() => {
    let mounted = true
    async function load() {
      const profile = await fetchProfileByUserId(user.id)
      if (!mounted) return
      if (profile) {
        setForm({
          ad: profile.ad ?? '',
          soyad: profile.soyad ?? '',
          email: profile.email ?? user.email ?? '',
          telefon: profile.telefon ?? '',
          dogum_tarihi: toDateInputValue(profile.dogum_tarihi),
          calisma_baslangic_tarihi: toDateInputValue(profile.calisma_baslangic_tarihi),
          sorumlu_bolgeler: profile.sorumlu_bolgeler ?? ''
        })
      } else {
        setForm({
          ad: user.firstName ?? '',
          soyad: user.lastName ?? '',
          email: user.email ?? '',
          telefon: '',
          dogum_tarihi: '',
          calisma_baslangic_tarihi: '',
          sorumlu_bolgeler: ''
        })
      }
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [user.id])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        id: user.id,
        ad: form.ad?.trim() || null,
        soyad: form.soyad?.trim() || null,
        email: user.email ?? '',
        telefon: form.telefon?.trim() || null,
        dogum_tarihi: form.dogum_tarihi || null,
        rol: user.role || 'user',
        calisma_baslangic_tarihi: form.calisma_baslangic_tarihi || null,
        sorumlu_bolgeler: form.sorumlu_bolgeler?.trim() || null
      }
      await upsertProfile(payload)
      toast.success('Profil kaydedildi')
      const merged = {
        ...user,
        firstName: payload.ad || user.firstName,
        lastName: payload.soyad || user.lastName,
        email: payload.email,
        role: payload.rol
      }
      onProfileUpdate?.(merged)
    } catch (err) {
      toast.error('Profil kaydedilemedi')
      if (import.meta.env.DEV) console.error('[Profile] save:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="profile-view">
        <div className="profile-loading">Yükleniyor...</div>
      </div>
    )
  }

  const roleLabel = user.role === 'admin' ? 'Admin' : user.role === 'broker' ? 'Broker' : 'Kullanıcı'

  return (
    <div className="profile-view">
      <div className="profile-header">
        <div className="profile-avatar">
          {(form.ad || user.firstName || 'K').charAt(0)}{(form.soyad || user.lastName || '').charAt(0) || '?'}
        </div>
        <h2>{form.ad || user.firstName} {form.soyad || user.lastName}</h2>
        <div className="profile-role">{roleLabel}</div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-section">
          <h3>Kişisel Bilgiler</h3>
          <div className="profile-fields">
            <div className="form-row">
              <label>Ad</label>
              <input
                type="text"
                value={form.ad}
                onChange={(e) => handleChange('ad', e.target.value)}
                placeholder="Ad"
              />
            </div>
            <div className="form-row">
              <label>Soyad</label>
              <input
                type="text"
                value={form.soyad}
                onChange={(e) => handleChange('soyad', e.target.value)}
                placeholder="Soyad"
              />
            </div>
            <div className="form-row">
              <label>E-posta</label>
              <input
                type="email"
                value={form.email}
                readOnly
                disabled
                className="readonly"
                title="Auth kaynaklı, değiştirilemez"
              />
            </div>
            <div className="form-row">
              <label>Telefon</label>
              <input
                type="tel"
                value={form.telefon}
                onChange={(e) => handleChange('telefon', e.target.value)}
                placeholder="Telefon"
              />
            </div>
            <div className="form-row">
              <label>Doğum tarihi</label>
              <input
                type="date"
                value={form.dogum_tarihi}
                onChange={(e) => handleChange('dogum_tarihi', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Hesap</h3>
          <div className="profile-fields">
            <div className="form-row">
              <label>Çalışma başlangıç tarihi</label>
              <input
                type="date"
                value={form.calisma_baslangic_tarihi}
                onChange={(e) => handleChange('calisma_baslangic_tarihi', e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>Sorumlu olduğu bölgeler (opsiyonel)</label>
              <input
                type="text"
                value={form.sorumlu_bolgeler}
                onChange={(e) => handleChange('sorumlu_bolgeler', e.target.value)}
                placeholder="Örn: Kadıköy, Üsküdar"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="profile-save-btn" disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  )
}

export default Profile
