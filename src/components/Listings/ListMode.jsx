import { useState } from 'react'
import { Phone, Star, Eye, FileText, MapPin, Tag } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'
import PhotoCarousel from '../PhotoCarousel'
import EmptyState from '../EmptyState/EmptyState'
import './ListMode.css'

function ListMode({ user, listings, onOpportunity, onDetail, onCall, onNoteSave }) {
  if (listings.length === 0) {
    return <EmptyState type="listings" />
  }

  // Filter notes based on user role
  const getVisibleNotes = (listing) => {
    if (user.role === 'broker' || user.role === 'admin') {
      return listing.notes || []
    }
    return (listing.notes || []).filter(note => 
      !note.isPrivate || note.userId === user.id
    )
  }

  return (
    <div className="list-mode">
      {listings.map(listing => {
        const visibleNotes = getVisibleNotes(listing)
        const photos = Array.isArray(listing.image_urls) && listing.image_urls.length > 0
          ? listing.image_urls
          : Array.isArray(listing.photos) ? listing.photos : []

        return (
          <ListingCard
            key={listing.id}
            listing={listing}
            photos={photos}
            visibleNotes={visibleNotes}
            onOpportunity={onOpportunity}
            onDetail={onDetail}
            onCall={onCall}
            onNoteSave={onNoteSave}
          />
        )
      })}
    </div>
  )
}

function ListingCard({ listing, photos, visibleNotes, onOpportunity, onDetail, onCall, onNoteSave }) {
  return (
    <div 
      className={`list-card ${listing.isOpportunity ? 'opportunity' : ''} ${listing.isCustomStock ? 'custom-stock' : ''}`}
    >
      <div className="list-card-image">
        <PhotoCarousel
          photos={photos}
          variant="card"
          title={listing.title || 'İlan fotoğrafı'}
        />
        {listing.isOpportunity && (
          <div className="opportunity-badge-small">
            <Star size={14} strokeWidth={2.5} fill="currentColor" />
          </div>
        )}
        {listing.isCustomStock && (
          <div className="custom-stock-badge-small">
            <Star size={12} strokeWidth={2.5} fill="currentColor" style={{ marginRight: '4px' }} />
            Özel
          </div>
        )}
      </div>

      <div className="list-card-content">
        <div className="list-card-badges">
          {listing.listing_status && (
            <span className="type-badge">
              {listing.listing_status === 'satilik' ? 'Satılık' : listing.listing_status === 'kiralik' ? 'Kiralık' : listing.listing_status}
            </span>
          )}
          {listing.property_type && (
            <span className="type-badge">{listing.property_type === 'konut' ? 'Konut' : 'Ticari'}</span>
          )}
        </div>
        
        <h3 className="list-card-title">{listing.title}</h3>
        
        <div className="list-card-info">
          <div className="list-card-info-row">
            <span className="list-card-price">{formatPrice(listing.price)}</span>
            {listing.rooms && (
              <span className="list-card-rooms">{listing.rooms}</span>
            )}
            {(listing.net_area || listing.netArea) && (
              <span className="list-card-area">{(listing.net_area || listing.netArea)} m²</span>
            )}
          </div>
          <div className="list-card-info-row">
            {listing.district && listing.neighborhood && (
              <span className="list-card-location">{listing.district} / {listing.neighborhood}</span>
            )}
            {listing.district && !listing.neighborhood && (
              <span className="list-card-location">{listing.district}</span>
            )}
            {!listing.district && listing.neighborhood && (
              <span className="list-card-location">{listing.neighborhood}</span>
            )}
          </div>
          <div className="list-card-meta">
            {listing.property_subtype && (
              <span className="list-card-category">
                <Tag size={14} strokeWidth={2} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
                {listing.property_subtype}
              </span>
            )}
            {listing.owner_type && (
              <span className="list-card-source">
                <MapPin size={14} strokeWidth={2} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
                {listing.owner_type === 'mulk_sahibi' ? 'Mülk Sahibi' : 'Emlak Ofisi'}
              </span>
            )}
          </div>
        </div>
        
        {visibleNotes.length > 0 && (
          <div className="list-card-notes-preview">
            {visibleNotes.length} not
          </div>
        )}
      </div>

      <div className="list-card-actions">
        <button 
          className="action-icon-btn"
          onClick={() => onCall(listing)}
          title="Ara"
        >
          <Phone size={18} strokeWidth={2} />
        </button>
        <button 
          className={`action-icon-btn ${listing.isOpportunity ? 'active' : ''}`}
          onClick={() => onOpportunity(listing)}
          title="Fırsat"
        >
          <Star size={18} strokeWidth={2} />
        </button>
        <button 
          className="action-icon-btn"
          onClick={() => onDetail(listing)}
          title="Detay"
        >
          <Eye size={18} strokeWidth={2} />
        </button>
        <button 
          className="action-icon-btn"
          onClick={() => {
            const note = prompt('Not:', '')
            if (note != null && note.trim()) onNoteSave(listing.id, note.trim())
          }}
          title="Not"
        >
          <FileText size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

export default ListMode
