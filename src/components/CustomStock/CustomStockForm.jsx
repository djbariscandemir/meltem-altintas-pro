import { useState } from 'react'
import './CustomStockForm.css'

function CustomStockForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    rooms: '',
    area: '',
    price: '',
    description: '',
    contractor: '',
    commissionRate: '',
    images: ['']
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      title: formData.title,
      location: formData.location,
      rooms: formData.rooms,
      area: formData.area,
      price: formData.price,
      description: formData.description,
      contractor: formData.contractor || null,
      commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : null,
      images: formData.images.filter(img => img.trim()),
      phone: ''
    })
    
    // Reset form
    setFormData({
      title: '',
      location: '',
      rooms: '',
      area: '',
      price: '',
      description: '',
      contractor: '',
      commissionRate: '',
      images: ['']
    })
  }

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] })
  }

  const updateImage = (index, value) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData({ ...formData, images: newImages })
  }

  return (
    <form className="custom-stock-form" onSubmit={handleSubmit}>
      <h3>Yeni Özel Stok İlanı</h3>
      
      <div className="form-group">
        <label>İlan Adı *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="Örn: Fenerbahçe'de Lüks Villa"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Lokasyon *</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
            placeholder="Örn: Fenerbahçe, Kadıköy"
          />
        </div>
        <div className="form-group">
          <label>Fiyat *</label>
          <input
            type="text"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            placeholder="2.500.000 TL"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Oda *</label>
          <input
            type="text"
            value={formData.rooms}
            onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
            required
            placeholder="3+1"
          />
        </div>
        <div className="form-group">
          <label>Alan *</label>
          <input
            type="text"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            required
            placeholder="120 m²"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Müteahhit</label>
          <input
            type="text"
            value={formData.contractor}
            onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
            placeholder="ABC İnşaat"
          />
        </div>
        <div className="form-group">
          <label>Komisyon Oranı (%)</label>
          <input
            type="number"
            step="0.1"
            value={formData.commissionRate}
            onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
            placeholder="2.5"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Açıklama</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="İlan açıklaması..."
          rows="4"
        />
      </div>

      <div className="form-group">
        <label>Fotoğraflar (URL)</label>
        {formData.images.map((img, index) => (
          <input
            key={index}
            type="url"
            value={img}
            onChange={(e) => updateImage(index, e.target.value)}
            placeholder={`Fotoğraf ${index + 1} URL`}
            className="image-input"
          />
        ))}
        <button 
          type="button" 
          className="add-image-btn"
          onClick={addImageField}
        >
          + Fotoğraf Ekle
        </button>
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

export default CustomStockForm
