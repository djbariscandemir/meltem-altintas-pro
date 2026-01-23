import { useState } from 'react'
import './BuyerRequestForm.css'

function BuyerRequestForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    priceMin: '',
    priceMax: '',
    rooms: '',
    area: '',
    notes: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      title: formData.title,
      location: formData.location,
      priceRange: {
        min: formData.priceMin,
        max: formData.priceMax
      },
      rooms: formData.rooms,
      area: formData.area,
      notes: formData.notes,
      isActive: true
    })
    
    // Reset form
    setFormData({
      title: '',
      location: '',
      priceMin: '',
      priceMax: '',
      rooms: '',
      area: '',
      notes: ''
    })
  }

  return (
    <form className="buyer-request-form" onSubmit={handleSubmit}>
      <h3>Yeni Alıcı Talebi</h3>
      
      <div className="form-group">
        <label>Talep Başlığı</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="Örn: Moda'da 3+1 Arıyorum"
        />
      </div>

      <div className="form-group">
        <label>Lokasyon</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
          placeholder="Örn: Moda, Kadıköy"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Min Fiyat (TL)</label>
          <input
            type="text"
            value={formData.priceMin}
            onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
            placeholder="2.000.000"
          />
        </div>
        <div className="form-group">
          <label>Max Fiyat (TL)</label>
          <input
            type="text"
            value={formData.priceMax}
            onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
            placeholder="3.000.000"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Oda</label>
          <input
            type="text"
            value={formData.rooms}
            onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
            placeholder="3+1"
          />
        </div>
        <div className="form-group">
          <label>Alan</label>
          <input
            type="text"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            placeholder="100-150 m²"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Notlar</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Ek bilgiler..."
          rows="3"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onCancel}>
          İptal
        </button>
        <button type="submit" className="submit-btn">
          Kaydet
        </button>
      </div>
    </form>
  )
}

export default BuyerRequestForm
