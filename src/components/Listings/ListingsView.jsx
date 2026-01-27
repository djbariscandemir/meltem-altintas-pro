import { useState, useEffect, useMemo } from 'react'
import ModeToggle from './ModeToggle'
import GameMode from './GameMode'
import ListMode from './ListMode'
import DetailModal from './DetailModal'
import FilterPanel from '../Filters/FilterPanel'
import { applyFilters } from '../../utils/filterUtils'
import { insertNote } from '../../services/notesRepository'
import { toast } from '../Toast/ToastContainer'
import EmptyState from '../EmptyState/EmptyState'
import './ListingsView.css'

function EmptyListingsState({ mode, onModeChange }) {
  return (
    <div className="listings-view">
      <div className="listings-view-header">
        <ModeToggle mode={mode} onModeChange={onModeChange} />
        <div className="listings-count">0 ilan</div>
      </div>
      <div className="listings-content">
        <EmptyState type="listings" customDescription="İlanlar yüklendiğinde burada görünecek" />
      </div>
    </div>
  )
}

const MODES = { GAME: 'game', LIST: 'list' }

const INITIAL_FILTERS = {
  listing_status: '',
  property_type: '',
  property_subtype: '',
  owner_type: '',
  rooms: [],
  district: '',
  neighborhood: '',
  netArea: { min: '', max: '' },
  price: { min: '', max: '' }
}

function ListingsView({ user, listings, tasks, onUpdateListings, onUpdateTasks }) {
  const [mode, setMode] = useState(MODES.GAME)
  const [selectedListing, setSelectedListing] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [sortOption, setSortOption] = useState('photos_first')
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  const updateListing = (id, updates) => {
    const updated = listings.map(item => (item.id === id ? { ...item, ...updates } : item))
    onUpdateListings(updated)
  }

  const handleCall = (listing) => {
    const activity = { type: 'call', userId: user.id, userName: `${user.firstName} ${user.lastName}`, timestamp: new Date().toISOString() }
    const updated = listings.map(item =>
      item.id === listing.id ? { ...item, activities: [...(item.activities || []), activity] } : item
    )
    onUpdateListings(updated)
    toast.success(`Arama kaydedildi: ${listing.title}`)
  }

  const handleOpportunity = (listing) => {
    updateListing(listing.id, { isOpportunity: !listing.isOpportunity })
  }

  const handleSkip = () => {}

  const handleNoteSave = async (listingId, note) => {
    if (!note?.trim()) return
    try {
      await insertNote({ listing_id: listingId, note_text: note.trim(), reminder_at: null })
      toast.success('Not kaydedildi')
    } catch {
      toast.error('Not kaydedilirken hata oluştu')
    }
  }

  const openDetail = (listing) => {
    setSelectedListing(listing)
    setShowDetail(true)
  }

  const closeDetail = () => {
    setShowDetail(false)
    const next = selectedListing && listings?.length ? listings.find(l => l.id === selectedListing.id) : null
    if (next) setSelectedListing(next)
    setTimeout(() => setSelectedListing(null), 300)
  }

  useEffect(() => {
    if (selectedListing && listings?.length) {
      const u = listings.find(l => l.id === selectedListing.id)
      if (u) setSelectedListing(u)
    }
  }, [listings, selectedListing?.id])

  const sortedListings = useMemo(() => applyFilters(listings || [], filters, sortOption), [listings, filters, sortOption])

  const handleFilterChange = (newFilters) => setFilters(newFilters || INITIAL_FILTERS)
  const handleSortChange = (v) => setSortOption(v || 'photos_first')

  if (!listings || listings.length === 0) {
    return <EmptyListingsState mode={mode} onModeChange={setMode} />
  }

  return (
    <div className="listings-view">
      <div className="listings-view-header">
        <ModeToggle mode={mode} onModeChange={setMode} />
        <div className="listings-count">{sortedListings.length} / {listings.length} ilan</div>
      </div>
      <div className="listings-content">
        <FilterPanel
          listings={listings}
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
