import { useState } from 'react'
import { toast } from '../Toast/ToastContainer'
import { addManualListing } from '../../services/listingsRepository'
import './AddListing.css'

function AddListing({ onSuccess }) {
  const [url, setUrl] = useState('')
  const [initialNote, setInitialNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
      toast.error('Revy ilan linkini giriniz')
      return
    }

    setLoading(true)
    try {
      const result = await addManualListing(trimmedUrl, initialNote.trim() || undefined)
      if (result.success) {
        toast.success('İlan sisteme eklendi. Detaylar kısa süre içinde güncellenecektir.')
        setUrl('')
        setInitialNote('')
        if (typeof onSuccess === 'function') onSuccess()
      } else if (result.duplicate) {
        toast.warning(result.error || 'Bu ilan zaten sistemde mevcut')
      } else {
        toast.error(result.error || 'İlan eklenirken hata oluştu')
      }
    } catch (err) {
      toast.error(err.message || 'Beklenmeyen hata')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-listing-page">
      <div className="add-listing-card">
        <h2 className="add-listing-title">Manuel İlan Ekle (Revy Linki ile)</h2>
        <p className="add-listing-desc">
          Revy ilan detay sayfasının linkini yapıştırın. İlan sisteme stub olarak eklenir; başlık ve fotoğraflar arka planda güncellenecektir.
        </p>
        <form className="add-listing-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="revy-url">Revy ilan linki *</label>
            <input
              id="revy-url"
              type="url"
              placeholder="https://www.revy.com.tr/.../detay/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="ilk-not">İlk not (opsiyonel)</label>
            <textarea
              id="ilk-not"
              placeholder="Bu ilanla ilgili kısa not..."
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Ekleniyor...' : 'İlanı Getir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddListing
