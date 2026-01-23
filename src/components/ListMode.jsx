import './ListMode.css'

function ListMode({ listings, onOpportunity, onDetail, onCall, onNoteSave }) {
  if (listings.length === 0) {
    return (
      <div className="list-mode-empty">
        <p>Henüz ilan bulunmuyor.</p>
      </div>
    )
  }

  return (
    <div className="list-mode">
      {listings.map(listing => (
        <div 
          key={listing.id} 
          className={`list-card ${listing.isOpportunity ? 'opportunity' : ''}`}
        >
          <div className="list-card-image">
            <img 
              src={
                listing.cover_image_url &&
                listing.cover_image_url.startsWith("http")
                  ? listing.cover_image_url
                  : "/images/no-image.png"
              }
              onError={(e) => {
                e.currentTarget.src = '/images/no-image.png'
              }} 
              alt={listing.title || "İlan fotoğrafı"}
              loading="lazy"
            />
            {listing.isOpportunity && (
              <div className="opportunity-badge-small">⭐</div>
            )}
          </div>

          <div className="list-card-content">
            <h3 className="list-card-title">{listing.title}</h3>
            <div className="list-card-info">
              <span className="list-card-price">{listing.price}</span>
              <span className="list-card-area">{listing.area}</span>
              <span className="list-card-location">{listing.location}</span>
            </div>
          </div>

          <div className="list-card-actions">
            <button 
              className="action-icon-btn"
              onClick={() => onCall(listing)}
              title="Ara"
            >
              📞
            </button>
            <button 
              className={`action-icon-btn ${listing.isOpportunity ? 'active' : ''}`}
              onClick={() => onOpportunity(listing)}
              title="Fırsat"
            >
              ⭐
            </button>
            <button 
              className="action-icon-btn"
              onClick={() => onDetail(listing)}
              title="Detay"
            >
              👁
            </button>
            <button 
              className="action-icon-btn"
              onClick={() => {
                const note = prompt('Not:', listing.note || '')
                if (note !== null) {
                  onNoteSave(listing.id, note)
                }
              }}
              title="Not"
            >
              📝
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ListMode
