import { useState, useEffect, useMemo } from 'react'
import './FilterPanel.css'

function FilterPanel({ listings, onFilterChange, sortOption, onSortChange }) {
  const [filters, setFilters] = useState({
    ownerType: '', // 'Mülk Sahibi' veya 'Emlak Ofisi'
    propertyCategory: '', // 'Konut' veya 'Ticari'
    rooms: [], // ['1+1', '2+1', '3+1', '4+1+']
    district: '', // İlçe
    neighborhood: '', // Mahalle
    netArea: { min: '', max: '' }, // Metrekare (Min/Max)
    price: { min: '', max: '' },
    isActive: '', // '' (Tümü), 'true' (Aktif), 'false' (Pasif)
    listingType: '' // '' (Tümü), 'satilik', 'kiralik'
  })

  // Dinamik filtre seçenekleri - listings'ten unique değerler
  const filterOptions = useMemo(() => {
    const uniqueDistricts = [...new Set(listings.map(l => l.district).filter(Boolean))].sort()
    const uniqueNeighborhoods = [...new Set(listings.map(l => l.neighborhood).filter(Boolean))].sort()
    
    return {
      districts: uniqueDistricts,
      neighborhoods: uniqueNeighborhoods
    }
  }, [listings])

  // Update filters and notify parent
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const toggleArrayFilter = (key, value) => {
    const current = filters[key] || []
    const newValue = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    updateFilter(key, newValue)
  }

  const handleSortChange = (value) => {
    console.log('SORT SET:', value)
    if (onSortChange) {
      onSortChange(value)
    }
  }

  const clearAllFilters = () => {
    const emptyFilters = {
      ownerType: '',
      propertyCategory: '',
      rooms: [],
      district: '',
      neighborhood: '',
      netArea: { min: '', max: '' },
      price: { min: '', max: '' },
      isActive: '',
      listingType: ''
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const hasActiveFilters = useMemo(() => {
    return (
      filters.ownerType ||
      filters.propertyCategory ||
      filters.rooms.length > 0 ||
      filters.district ||
      filters.neighborhood ||
      filters.netArea.min || filters.netArea.max ||
      filters.price.min || filters.price.max ||
      filters.isActive ||
      filters.listingType
    )
  }, [filters])

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filtreler</h3>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearAllFilters}>
            Temizle
          </button>
        )}
      </div>

      <div className="filter-content">
        {/* Sıralama */}
        <div className="filter-group">
          <label className="filter-label">Sırala</label>
          <select
            value={sortOption || 'date_desc'}
            onChange={(e) => {
              const value = e.target.value
              console.log('SORT SET:', value)
              handleSortChange(value)
            }}
          >
            <option value="date_desc">İlan Tarihi (Yeniden → Eskiye)</option>
            <option value="date_asc">İlan Tarihi (Eskiden → Yeniye)</option>
            <option value="price_desc">Fiyat (Yüksekten → Düşüğe)</option>
            <option value="price_asc">Fiyat (Düşükten → Yükseğe)</option>
          </select>
        </div>

        {/* İlan Sahibi Türü - BASİT DROPDOWN */}
        <div className="filter-group">
          <label className="filter-label">İlan Sahibi Türü</label>
          <select
            value={filters.ownerType}
            onChange={(e) => updateFilter('ownerType', e.target.value)}
          >
            <option value="">Tümü</option>
            <option value="Mülk Sahibi">Mülk Sahibi</option>
            <option value="Emlak Ofisi">Emlak Ofisi</option>
          </select>
        </div>

        {/* İlan Durumu */}
        <div className="filter-group">
          <label className="filter-label">İlan Durumu</label>
          <select
            value={filters.isActive}
            onChange={(e) => updateFilter('isActive', e.target.value)}
          >
            <option value="">Tümü</option>
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>
        </div>

        {/* İlan Tipi */}
        <div className="filter-group">
          <label className="filter-label">İlan Tipi</label>
          <select
            value={filters.listingType}
            onChange={(e) => updateFilter('listingType', e.target.value)}
          >
            <option value="">Tümü</option>
            <option value="satilik">Satılık</option>
            <option value="kiralik">Kiralık</option>
          </select>
        </div>

        {/* Mülk Türü (Konut/Ticari) */}
        <div className="filter-group">
          <label className="filter-label">Mülk Türü</label>
          <select
            value={filters.propertyCategory}
            onChange={(e) => updateFilter('propertyCategory', e.target.value)}
          >
            <option value="">Tümü</option>
            <option value="Konut">Konut</option>
            <option value="Ticari">Ticari</option>
          </select>
        </div>

        {/* Oda Sayısı */}
        <div className="filter-group">
          <label className="filter-label">Oda Sayısı</label>
          <div className="checkbox-group">
            {['1+1', '2+1', '3+1', '4+1+'].map(room => (
              <label key={room} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.rooms.includes(room)}
                  onChange={() => toggleArrayFilter('rooms', room)}
                />
                <span>{room}</span>
              </label>
            ))}
          </div>
        </div>

        {/* İlçe */}
        <div className="filter-group">
          <label className="filter-label">İlçe</label>
          <select
            value={filters.district}
            onChange={(e) => updateFilter('district', e.target.value)}
          >
            <option value="">Tümü</option>
            {filterOptions.districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {/* Mahalle */}
        <div className="filter-group">
          <label className="filter-label">Mahalle</label>
          <select
            value={filters.neighborhood}
            onChange={(e) => updateFilter('neighborhood', e.target.value)}
          >
            <option value="">Tümü</option>
            {filterOptions.neighborhoods.map(neighborhood => (
              <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
            ))}
          </select>
        </div>

        {/* Metrekare */}
        <div className="filter-group">
          <label className="filter-label">Metrekare (m²)</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="Min"
              value={filters.netArea.min}
              onChange={(e) => updateFilter('netArea', { ...filters.netArea, min: e.target.value })}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.netArea.max}
              onChange={(e) => updateFilter('netArea', { ...filters.netArea, max: e.target.value })}
            />
          </div>
        </div>

        {/* Fiyat */}
        <div className="filter-group">
          <label className="filter-label">Fiyat (TL)</label>
          <div className="range-inputs">
            <input
              type="text"
              placeholder="Min"
              value={filters.price.min}
              onChange={(e) => updateFilter('price', { ...filters.price, min: e.target.value })}
            />
            <span>-</span>
            <input
              type="text"
              placeholder="Max"
              value={filters.price.max}
              onChange={(e) => updateFilter('price', { ...filters.price, max: e.target.value })}
            />
          </div>
        </div>

      </div>

      {hasActiveFilters && (
        <div className="filter-active-count">
          {Object.values(filters).reduce((count, filter) => {
            if (Array.isArray(filter)) {
              return count + filter.length
            } else if (typeof filter === 'object' && filter !== null) {
              return count + (filter.min ? 1 : 0) + (filter.max ? 1 : 0)
            } else if (filter) {
              return count + 1
            }
            return count
          }, 0)} aktif filtre
        </div>
      )}
    </div>
  )
}

export default FilterPanel
