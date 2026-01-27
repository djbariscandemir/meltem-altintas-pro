import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import './FilterPanel.css'

const SUBTYPES_KONUT = ['daire', 'apartman dairesi', 'villa', 'müstakil ev', 'rezidans']
const SUBTYPES_TICARI = ['dükkan', 'mağaza', 'ofis', 'plaza', 'depo']

function FilterPanel({ listings, onFilterChange, sortOption, onSortChange }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState({ basic: true, location: false, property: false, price: false })
  const [filters, setFilters] = useState({
    listing_status: '',
    property_type: '',
    property_subtype: '',
    owner_type: '',
    rooms: [],
    district: '',
    neighborhood: '',
    netArea: { min: '', max: '' },
    price: { min: '', max: '' }
  })

  const filterOptions = useMemo(() => {
    const districts = [...new Set(listings.map(l => l.district).filter(Boolean))].sort()
    const neighborhoods = [...new Set(listings.map(l => l.neighborhood).filter(Boolean))].sort()
    return { districts, neighborhoods }
  }, [listings])

  const subtypeOptions = filters.property_type === 'konut' ? SUBTYPES_KONUT : filters.property_type === 'ticari' ? SUBTYPES_TICARI : []

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value }
    if (key === 'property_type') next.property_subtype = ''
    setFilters(next)
    onFilterChange(next)
  }

  const toggleArrayFilter = (key, value) => {
    const arr = filters[key] || []
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
    updateFilter(key, next)
  }

  const clearAllFilters = () => {
    const empty = {
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
    setFilters(empty)
    onFilterChange(empty)
  }

  const hasActiveFilters = useMemo(() => {
    const f = filters
    return !!(f.listing_status || f.property_type || f.property_subtype || f.owner_type ||
      (Array.isArray(f.rooms) && f.rooms.length) || f.district || f.neighborhood ||
      (f.netArea && (f.netArea.min || f.netArea.max)) || (f.price && (f.price.min || f.price.max)))
  }, [filters])

  const toggleGroup = (g) => setExpandedGroups(prev => ({ ...prev, [g]: !prev[g] }))

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <div className="filter-header-main">
          <h3>Filtreler</h3>
          {hasActiveFilters && <span className="active-filters-count">aktif</span>}
        </div>
        <div className="filter-header-actions">
          {hasActiveFilters && <button className="clear-filters-btn" onClick={clearAllFilters}>Temizle</button>}
          <button className="filter-toggle-btn" onClick={() => setIsExpanded(!isExpanded)} aria-label={isExpanded ? 'Gizle' : 'Göster'}>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      <div className={`filter-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="filter-group">
          <label className="filter-label">Sırala</label>
          <select value={sortOption || 'photos_first'} onChange={(e) => onSortChange?.(e.target.value)}>
            <option value="photos_first">Önce fotoğraflılar</option>
            <option value="date_desc">İlan Tarihi (Yeniden → Eskiye)</option>
            <option value="date_asc">İlan Tarihi (Eskiden → Yeniye)</option>
            <option value="price_desc">Fiyat (Yüksekten → Düşüğe)</option>
            <option value="price_asc">Fiyat (Düşükten → Yükseğe)</option>
          </select>
        </div>

        <div className="filter-group-section">
          <button className="filter-group-header" onClick={() => toggleGroup('basic')}>
            <span>Temel Filtreler</span>
            {expandedGroups.basic ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedGroups.basic && (
            <div className="filter-group-content">
              <div className="filter-group">
                <label className="filter-label">İlan Tipi</label>
                <select value={filters.listing_status} onChange={(e) => updateFilter('listing_status', e.target.value)}>
                  <option value="">Tümü</option>
                  <option value="satilik">Satılık</option>
                  <option value="kiralik">Kiralık</option>
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">İlan Sahibi Türü</label>
                <select value={filters.owner_type} onChange={(e) => updateFilter('owner_type', e.target.value)}>
                  <option value="">Tümü</option>
                  <option value="mulk_sahibi">Mülk Sahibi</option>
                  <option value="emlak_ofisi">Emlak Ofisi</option>
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Mülk Türü</label>
                <select value={filters.property_type} onChange={(e) => updateFilter('property_type', e.target.value)}>
                  <option value="">Tümü</option>
                  <option value="konut">Konut</option>
                  <option value="ticari">Ticari</option>
                </select>
              </div>
              {subtypeOptions.length > 0 && (
                <div className="filter-group">
                  <label className="filter-label">Alt tür</label>
                  <select value={filters.property_subtype} onChange={(e) => updateFilter('property_subtype', e.target.value)}>
                    <option value="">Tümü</option>
                    {subtypeOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="filter-group-section">
          <button className="filter-group-header" onClick={() => toggleGroup('location')}>
            <span>Konum</span>
            {expandedGroups.location ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedGroups.location && (
            <div className="filter-group-content">
              <div className="filter-group">
                <label className="filter-label">İlçe</label>
                <select value={filters.district} onChange={(e) => updateFilter('district', e.target.value)}>
                  <option value="">Tümü</option>
                  {filterOptions.districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Mahalle</label>
                <select value={filters.neighborhood} onChange={(e) => updateFilter('neighborhood', e.target.value)}>
                  <option value="">Tümü</option>
                  {filterOptions.neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="filter-group-section">
          <button className="filter-group-header" onClick={() => toggleGroup('property')}>
            <span>Mülk Detayları</span>
            {expandedGroups.property ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedGroups.property && (
            <div className="filter-group-content">
              <div className="filter-group">
                <label className="filter-label">Oda Sayısı</label>
                <div className="checkbox-group">
                  {['1+1', '2+1', '3+1', '4+1+'].map(room => (
                    <label key={room} className="checkbox-item">
                      <input type="checkbox" checked={filters.rooms.includes(room)} onChange={() => toggleArrayFilter('rooms', room)} />
                      <span>{room}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <label className="filter-label">Metrekare (m²)</label>
                <div className="range-inputs">
                  <input type="number" placeholder="Min" value={filters.netArea.min} onChange={(e) => updateFilter('netArea', { ...filters.netArea, min: e.target.value })} />
                  <span>-</span>
                  <input type="number" placeholder="Max" value={filters.netArea.max} onChange={(e) => updateFilter('netArea', { ...filters.netArea, max: e.target.value })} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="filter-group-section">
          <button className="filter-group-header" onClick={() => toggleGroup('price')}>
            <span>Fiyat Aralığı</span>
            {expandedGroups.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedGroups.price && (
            <div className="filter-group-content">
              <div className="filter-group">
                <label className="filter-label">Fiyat (TL)</label>
                <div className="range-inputs">
                  <input type="text" placeholder="Min" value={filters.price.min} onChange={(e) => updateFilter('price', { ...filters.price, min: e.target.value })} />
                  <span>-</span>
                  <input type="text" placeholder="Max" value={filters.price.max} onChange={(e) => updateFilter('price', { ...filters.price, max: e.target.value })} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FilterPanel
