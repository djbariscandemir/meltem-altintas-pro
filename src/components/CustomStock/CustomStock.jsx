import { useState } from 'react'
import CustomStockForm from './CustomStockForm'
import { Star, Trash2 } from 'lucide-react'
import { getCoverImageUrl } from '../../utils/getCoverImageUrl'
import LogoPlaceholder from '../LogoPlaceholder'
import './CustomStock.css'

// Image component with logo fallback
function ImageWithLogoFallback({ src, alt }) {
  const [imageError, setImageError] = useState(false)
  
  if (imageError) {
    return <LogoPlaceholder showText={false} />
  }
  
  return (
    <img 
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setImageError(true)}
    />
  )
}

function CustomStock({ user, listings, onUpdateListings }) {
  const [showForm, setShowForm] = useState(false)

  const customStockListings = listings.filter(l => l.isCustomStock)

  const handleAddStock = (stockData) => {
    const newListing = {
      id: Date.now().toString(),
      ...stockData,
      isCustomStock: true,
      isOpportunity: false,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      expirationDate: null,
      notes: [],
      activities: []
    }
    onUpdateListings([...listings, newListing])
    setShowForm(false)
  }

  const handleDelete = (listingId) => {
    if (window.confirm('Bu özel stok ilanını silmek istediğinize emin misiniz?')) {
      const updated = listings.filter(l => l.id !== listingId)
      onUpdateListings(updated)
    }
  }

  return (
    <div className="custom-stock-view">
      <div className="custom-stock-header">
        <h2>Özel Stok İlanları</h2>
        <button 
          className="add-stock-btn"
          onClick={() => setShowForm(!showForm)}
        >
          + Yeni Özel Stok
        </button>
      </div>

      {showForm && (
        <CustomStockForm
          onSubmit={handleAddStock}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="custom-stock-list">
        {customStockListings.length === 0 ? (
          <div className="no-stock">
            <p>Henüz özel stok ilanı bulunmuyor</p>
          </div>
        ) : (
          customStockListings.map(listing => {
            // Development'ta debug logging
            if (import.meta.env.DEV) {
              console.debug('[CustomStock] Listing render:', {
                id: listing.id,
                cover_image_url: listing.cover_image_url,
                image_urls_length: Array.isArray(listing.image_urls) ? listing.image_urls.length : null
              });
            }

            // Kapak fotoğrafı URL'ini belirle
            const coverImageUrl = getCoverImageUrl(listing)

            return (
              <div key={listing.id} className="stock-card">
                <div className="stock-image">
                  {coverImageUrl ? (
                    <ImageWithLogoFallback 
                      src={coverImageUrl}
                      alt={listing.title || "İlan fotoğrafı"}
                    />
                  ) : (
                    <LogoPlaceholder showText={false} />
                  )}
                  <div className="custom-badge">⭐ Özel Stok</div>
                </div>

              <div className="stock-content">
                <h3 className="stock-title">{listing.title}</h3>
                
                <div className="stock-info">
                  <div className="info-item">
                    <span className="label">Fiyat:</span>
                    <span className="value">{listing.price}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Alan:</span>
                    <span className="value">{listing.area}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Oda:</span>
                    <span className="value">{listing.rooms}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Lokasyon:</span>
                    <span className="value">{listing.location}</span>
                  </div>
                  {listing.contractor && (
                    <div className="info-item">
                      <span className="label">Müteahhit:</span>
                      <span className="value">{listing.contractor}</span>
                    </div>
                  )}
                  {listing.commissionRate && (
                    <div className="info-item">
                      <span className="label">Komisyon:</span>
                      <span className="value">%{listing.commissionRate}</span>
                    </div>
                  )}
                </div>

                {listing.description && (
                  <div className="stock-description">
                    <p>{listing.description}</p>
                  </div>
                )}

                <div className="stock-actions">
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(listing.id)}
                  >
                    <Trash2 size={16} strokeWidth={2} style={{ marginRight: '6px' }} />
                    Sil
                  </button>
                </div>
              </div>
            </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default CustomStock
