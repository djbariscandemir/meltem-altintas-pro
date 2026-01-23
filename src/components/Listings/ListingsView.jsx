import { useState, useEffect, useMemo } from 'react'
import ModeToggle from './ModeToggle'
import GameMode from './GameMode'
import ListMode from './ListMode'
import DetailModal from './DetailModal'
import FilterPanel from '../Filters/FilterPanel'
import { applyFilters } from '../../utils/filterUtils'
import { insertNote } from '../../services/notesRepository'
import './ListingsView.css'

function EmptyListingsState({ mode, onModeChange }) {
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const handleLogoLoad = () => {
    setLogoLoaded(true)
    setLogoError(false)
  }

  const handleLogoError = () => {
    setLogoError(true)
    setLogoLoaded(false)
  }

  return (
    <div className="listings-view">
      <div className="listings-view-header">
        <ModeToggle mode={mode} onModeChange={onModeChange} />
        <div className="listings-count">0 ilan</div>
      </div>
      <div className="listings-content">
        <div className="empty-state">
          <div className="empty-state-logo-wrapper">
            <img 
              src="/logo.png" 
              alt="Meltem Altıntaş Pro" 
              className={`empty-state-logo ${logoLoaded ? 'logo-loaded' : ''} ${logoError ? 'logo-error' : ''}`}
              onLoad={handleLogoLoad}
              onError={handleLogoError}
              style={{ display: logoError ? 'none' : 'block' }}
            />
            {logoError && (
              <span className="empty-state-logo-fallback">Meltem Altıntaş Pro</span>
            )}
          </div>
          <h3 className="empty-state-title">Henüz ilan bulunamadı</h3>
          <p className="empty-state-text">İlanlar yüklendiğinde burada görünecek</p>
        </div>
      </div>
    </div>
  )
}

const MODES = {
  GAME: 'game',
  LIST: 'list'
}

function ListingsView({ user, listings, tasks, onUpdateListings, onUpdateTasks }) {
  const [mode, setMode] = useState(MODES.GAME)
  const [selectedListing, setSelectedListing] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [sortOption, setSortOption] = useState('date_desc') // TEK VE NET SORT STATE
  const [filters, setFilters] = useState({
    ownerType: '', // 'Mülk Sahibi' veya 'Emlak Ofisi'
    propertyGroup: '', // 'Konut' veya 'Ticari' - BASİT
    rooms: [],
    district: '', // İlçe
    area: '', // Semt
    neighborhood: '', // Mahalle
    buildingAge: '', // Bina Yaşı
    isSite: '', // Site İçerisinde
    netArea: { min: '', max: '' }, // Metrekare (Min/Max)
    price: { min: '', max: '' }
  })

  const handleModeChange = (newMode) => {
    setMode(newMode)
  }

  const updateListing = (id, updates) => {
    const updated = listings.map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
    onUpdateListings(updated)
  }

  const handleCall = (listing) => {
    // Log activity
    const activity = {
      type: 'call',
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      timestamp: new Date().toISOString()
    }
    
    const updated = listings.map(item => {
      if (item.id === listing.id) {
        return {
          ...item,
          activities: [...(item.activities || []), activity]
        }
      }
      return item
    })
    onUpdateListings(updated)
    
    console.log('Arama yapıldı:', listing.title)
  }

  const handleOpportunity = (listing) => {
    updateListing(listing.id, { isOpportunity: !listing.isOpportunity })
  }

  const handleSkip = (listing) => {
    console.log('👈 Geçildi:', listing.title)
  }

  const handleNoteSave = async (listingId, note, isPrivate) => {
    if (!note || !note.trim()) {
      console.warn('[ListingsView] handleNoteSave: note boş')
      return
    }

    try {
      console.log('[ListingsView] handleNoteSave başlatılıyor...', {
        listingId,
        noteLength: note.trim().length
      })

      // Supabase notes tablosuna kaydet
      const inserted = await insertNote({
        listing_id: listingId,
        note_text: note.trim(),
        reminder_at: null
      })

      console.log('[ListingsView] ✅ Not kaydedildi:', inserted?.id)

      // Local state'i güncelle (opsiyonel - UI feedback için)
      const activity = {
        type: 'note',
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        timestamp: new Date().toISOString()
      }

      const updated = listings.map(item => {
        if (item.id === listingId) {
          return {
            ...item,
            activities: [...(item.activities || []), activity]
          }
        }
        return item
      })
      onUpdateListings(updated)
    } catch (error) {
      console.error('[ListingsView] ❌ handleNoteSave ERROR:', error)
      console.error('[ListingsView] Error message:', error.message)
      console.error('[ListingsView] Error stack:', error.stack)
      alert('Not kaydedilirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'))
    }
  }

  const openDetail = (listing) => {
    setSelectedListing(listing)
    setShowDetail(true)
  }

  const closeDetail = () => {
    setShowDetail(false)
    // Update selected listing from current listings
    if (selectedListing) {
      const updated = listings.find(l => l.id === selectedListing.id)
      if (updated) {
        setSelectedListing(updated)
      }
    }
    setTimeout(() => setSelectedListing(null), 300) // Delay to allow animation
  }

  // Update selectedListing when listings change
  useEffect(() => {
    if (selectedListing && listings.length > 0) {
      const updated = listings.find(l => l.id === selectedListing.id)
      if (updated) {
        setSelectedListing(updated)
      }
    }
  }, [listings, selectedListing?.id])

  // Apply filters with useMemo for performance
  const sortedListings = useMemo(() => {
    const base = listings || []
    return applyFilters(base, filters, sortOption)
  }, [listings, filters, sortOption])

  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }))
  }

  const handleSortChange = (sortValue) => {
    console.log('SORT SET:', sortValue)
    setSortOption(sortValue)
  }

  // Boş veri kontrolü
  if (!listings || listings.length === 0) {
    const [logoLoaded, setLogoLoaded] = useState(false)
    const [logoError, setLogoError] = useState(false)

    const handleLogoLoad = () => {
      setLogoLoaded(true)
      setLogoError(false)
    }

    const handleLogoError = () => {
      setLogoError(true)
      setLogoLoaded(false)
    }

    return (
      <div className="listings-view">
        <div className="listings-view-header">
          <ModeToggle mode={mode} onModeChange={handleModeChange} />
          <div className="listings-count">0 ilan</div>
        </div>
        <div className="listings-content">
          <div className="empty-state">
            <div className="empty-state-logo-wrapper">
              <img 
                src="/logo.png" 
                alt="Meltem Altıntaş Pro" 
                className={`empty-state-logo ${logoLoaded ? 'logo-loaded' : ''} ${logoError ? 'logo-error' : ''}`}
                onLoad={handleLogoLoad}
                onError={handleLogoError}
                style={{ display: logoError ? 'none' : 'block' }}
              />
              {logoError && (
                <span className="empty-state-logo-fallback">Meltem Altıntaş Pro</span>
              )}
            </div>
            <h3 className="empty-state-title">Henüz ilan bulunamadı</h3>
            <p className="empty-state-text">İlanlar yüklendiğinde burada görünecek</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="listings-view">
      <div className="listings-view-header">
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
        <div className="listings-count">
          {sortedListings.length} / {(listings || []).length} ilan
        </div>
      </div>

      <div className="listings-content">
        <FilterPanel 
          listings={listings || []}
          onFilterChange={handleFilterChange}
          sortOption={sortOption}
          onSortChange={handleSortChange}
        />

        <div className="listings-main">
          {mode === MODES.GAME ? (
            <GameMode
              listings={sortedListings}
              onSkip={handleSkip}
              onOpportunity={handleOpportunity}
              onDetail={openDetail}
              onCall={handleCall}
            />
          ) : (
            <ListMode
              user={user}
              listings={sortedListings}
              onOpportunity={handleOpportunity}
              onDetail={openDetail}
              onCall={handleCall}
              onNoteSave={handleNoteSave}
            />
          )}
        </div>
      </div>

      {showDetail && selectedListing && (
        <DetailModal
          user={user}
          listing={selectedListing}
          onClose={closeDetail}
          onCall={handleCall}
          onNoteSave={handleNoteSave}
        />
      )}
    </div>
  )
}

export default ListingsView
