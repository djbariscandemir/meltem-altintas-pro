import { useState } from 'react'
import * as XLSX from 'xlsx'
import { supabaseApi } from '../../utils/supabase'
import { replaceAllListings, fetchAllListings } from '../../services/listingsRepository'
import './RevyExcelImport.css'

// KANONİK ŞEMA: Sadece bu alanlar kabul edilir
const CANONICAL_FIELDS = [
  'listing_id',
  'listing_date',
  'source',
  'owner_type',
  'property_category',
  'property_type',
  'price',
  'net_area',
  'gross_area',
  'rooms',
  'city',
  'district',
  'neighborhood',
  'floor',
  'building_age',
  'heating_type',
  'listing_url',
  'title' // Excel'deki "İlan Başlığı" kolonundan gelir
]

// Excel kolon alias'ları (kanonik isme map eder)
const COLUMN_ALIASES = {
  listing_id: ['ilan id', 'ilan_id', 'ilan no', 'id'],
  listing_date: ['ilan tarihi', 'tarih', 'listing date'],
  source: ['ilan kaynağı', 'kaynak', 'source'],
  owner_type: ['ilan sahibi türü', 'sahibi', 'owner type'],
  property_type: ['mülk türü', 'gayrimenkul türü'],
  price: ['fiyat', 'bedel', 'price'],
  net_area: ['net m2', 'net m²', 'net alan'],
  gross_area: ['brüt m2', 'brüt m²', 'brüt alan'],
  rooms: ['oda sayısı', 'oda', 'rooms'],
  city: ['il', 'şehir'],
  district: ['ilçe', 'semt'],
  neighborhood: ['mahalle'],
  floor: ['kat', 'bulunduğu kat'],
  building_age: ['bina yaşı', 'yaş'],
  heating_type: ['ısınma tipi', 'ısınma'],
  listing_url: ['ilan url', 'url', 'link']
}

// Türkçe karakterleri normalize et
function normalizeColumnName(columnName) {
  if (!columnName) return ''
  return String(columnName)
    .toLowerCase()
    .trim()
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c')
}

// Excel kolon adını kanonik isme map et
function mapColumnToCanonical(excelColumnName) {
  const normalized = normalizeColumnName(excelColumnName)
  
  for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      if (normalizeColumnName(alias) === normalized) {
        return canonical
      }
    }
  }
  
  return null // Eşleşme yoksa null döner
}

// Excel satırını kanonik şemaya map et
function mapRowToCanonical(row) {
  const canonical = {}
  const unmappedColumns = []
  
  // Excel satırındaki tüm kolonları işle
  for (const [excelColumn, value] of Object.entries(row)) {
    const canonicalField = mapColumnToCanonical(excelColumn)
    
    if (canonicalField) {
      // Kanonik alana map et
      canonical[canonicalField] = value
    } else {
      // Eşleşmeyen kolonları logla (hard fail YOK)
      unmappedColumns.push(excelColumn)
    }
  }
  
  // Eşleşmeyen kolonlar varsa uyarı ver (ama devam et)
  if (unmappedColumns.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('[Excel] Eşleşmeyen kolonlar:', unmappedColumns)
  }
  
  return canonical
}

// property_category otomatik türetme (property_type'a göre)
function derivePropertyCategory(propertyType) {
  if (!propertyType) return ''
  
  const normalized = String(propertyType).toLowerCase()
  
  if (
    normalized.includes('daire') ||
    normalized.includes('apartman') ||
    normalized.includes('konut') ||
    normalized.includes('rezidans')
  ) {
    return 'konut'
  }
  
  if (
    normalized.includes('dükkan') ||
    normalized.includes('mağaza') ||
    normalized.includes('ofis') ||
    normalized.includes('plaza') ||
    normalized.includes('ticari')
  ) {
    return 'ticari'
  }
  
  return ''
}

// Fiyat parse (string'den number'a)
function parsePrice(priceValue) {
  if (!priceValue) return null
  
  if (typeof priceValue === 'number') {
    return priceValue
  }
  
  if (typeof priceValue === 'string') {
    // Sayısal değerleri çıkar (nokta ve virgül hariç)
    const cleaned = priceValue.toString().replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? null : parsed
  }
  
  return null
}

// Alan parse (string'den number'a - m² sembolü vs.)
function parseArea(areaValue) {
  if (!areaValue) return null
  
  if (typeof areaValue === 'number') {
    return areaValue
  }
  
  if (typeof areaValue === 'string') {
    // Sayısal değerleri çıkar
    const cleaned = areaValue.toString().replace(/[^\d.,]/g, '').replace(',', '.')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? null : parsed
  }
  
  return null
}

// Tarih parse
function parseDate(dateValue) {
  if (!dateValue) return null
  
  // Excel date number (days since 1900-01-01)
  if (typeof dateValue === 'number') {
    const excelEpoch = new Date(1899, 11, 30)
    const date = new Date(excelEpoch.getTime() + dateValue * 86400000)
    return date
  }
  
  // Date object
  if (dateValue instanceof Date) {
    return dateValue
  }
  
  // String date
  if (typeof dateValue === 'string') {
    const date = new Date(dateValue)
    if (!isNaN(date.getTime())) {
      return date
    }
    
    // Turkish date format (DD.MM.YYYY)
    const parts = dateValue.split(/[.\/\-]/)
    if (parts.length === 3) {
      const day = parseInt(parts[0])
      const month = parseInt(parts[1]) - 1
      const year = parseInt(parts[2])
      return new Date(year, month, day)
    }
  }
  
  return null
}

// Listing ID parse (URL'den veya direkt ID'den)
function parseListingId(row) {
  // Önce listing_url veya listing_id kolonlarını kontrol et
  const listingUrl = row.listing_url || row['İlan Url'] || row['İlan URL'] || row['İlan url']
  const listingId = row.listing_id || row['İlan ID'] || row['İlan Id'] || row['İlan id']
  
  if (listingUrl && typeof listingUrl === 'string' && listingUrl.includes('/')) {
    // URL'den ID çıkar
    return listingUrl.split('/').filter(Boolean).pop()
  }
  
  if (listingId) {
    return String(listingId).trim()
  }
  
  return null
}

function RevyExcelImport({ user, listings, tasks, onUpdateListings, onUpdateTasks }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // CRASH FIX: listings kontrolü
  if (!listings) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>Henüz Revy Excel verisi yok</p>
      </div>
    )
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile)
        setError('')
        setResult(null)
      } else {
        setError('Lütfen .xlsx formatında bir Excel dosyası seçin!')
        setFile(null)
      }
    }
  }

  const parseExcelData = (data) => {
    const rows = []
    
    data.forEach((row, index) => {
      try {
        // Boş satır kontrolü
        const hasData = Object.values(row).some(val => val !== null && val !== undefined && val !== '')
        if (!hasData) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Satır ${index + 1} boş, atlanıyor`)
          }
          return
        }

        // === KANONİK KURAL: Excel kolonları tek gerçek kaynak ===
        // Zorunlu alanlar: İlan Başlığı ve İlan URL
        const rawTitle = row['İlan Başlığı']
        const rawUrl = row['İlan URL']

        if (!rawTitle || !String(rawTitle).trim()) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Satır ${index + 1}: İlan Başlığı boş, atlanıyor`)
          }
          return
        }

        if (!rawUrl || !String(rawUrl).trim()) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Satır ${index + 1}: İlan URL boş, atlanıyor`)
          }
          return
        }

        // İlan Tarihi (string olarak kaydedilir)
        const listing_date = row['İlan Tarihi'] != null
          ? String(row['İlan Tarihi']).trim()
          : null

        // İlan Sahibi Türü
        const owner_type = row['İlan Sahibi Türü'] != null
          ? String(row['İlan Sahibi Türü']).trim()
          : null

        // İlan Sahibi Adı (owner_name)
        let owner_name = null
        if (owner_type === 'Emlak Ofisi') {
          owner_name = row['Ofis'] != null ? String(row['Ofis']).trim() : null
        } else {
          owner_name = row['İlan Sahibi'] != null ? String(row['İlan Sahibi']).trim() : null
        }

        // Fiyat (Number)
        const price = row['Fiyat'] != null ? Number(row['Fiyat']) : null

        // Net / Brüt m² (Number) – hiçbir regex/normalize yok
        const net_area = row['Net m²'] != null ? Number(row['Net m²']) : null
        const gross_area = row['Brüt m²'] != null ? Number(row['Brüt m²']) : null

        // Oda Sayısı
        const rooms = row['Oda Sayısı'] != null
          ? String(row['Oda Sayısı']).trim()
          : null

        // Mülk Türü ve property_category
        const rawPropertyType = row['Mülk Türü'] != null
          ? String(row['Mülk Türü']).trim()
          : ''
        const property_type = rawPropertyType || null
        const property_category = property_type
          ? derivePropertyCategory(property_type) || 'Ticari'
          : null

        const parsed = {
          listing_date,
          owner_type,
          owner_name,
          title: String(rawTitle).trim(),
          listing_url: String(rawUrl).trim(),
          price,
          rooms,
          net_area,
          gross_area,
          property_type,
          property_category
        }

        rows.push(parsed)

      } catch (err) {
        console.error(`Satır ${index + 1} parse edilemedi:`, err)
        // Hata olsa bile devam et (hard fail YOK)
      }
    })

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Excel] Toplam ${rows.length} ilan parse edildi`)
    }
    
    return rows
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Lütfen bir dosya seçin!')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          
          // İlk sheet'i al
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          
          // Sheet'i JSON'a çevir
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          
          if (jsonData.length === 0) {
            setError('Excel dosyası boş veya geçersiz format!')
            setLoading(false)
            return
          }

          // Debug: Kolon isimlerini göster
          if (jsonData.length > 0 && process.env.NODE_ENV === 'development') {
            console.log('[Excel] Kolon isimleri:', Object.keys(jsonData[0]))
            console.log('[Excel] İlk satır örneği:', jsonData[0])
          }

          // Veriyi parse et (kanonik şemaya map et)
          const parsedListings = parseExcelData(jsonData)
          
          if (parsedListings.length === 0) {
            const columnNames = jsonData.length > 0 ? Object.keys(jsonData[0]).join(', ') : 'Yok'
            setError(`Excel dosyasından ilan bilgisi çıkarılamadı! Bulunan kolonlar: ${columnNames}. Lütfen 'İlan ID' veya 'İlan URL' kolonunun olduğundan emin olun.`)
            setLoading(false)
            return
          }

          // Supabase'e yaz: Önce import kaydı oluştur (sadece file_name ve total_listings)
          const importData = {
            file_name: file.name,
            total_listings: parsedListings.length
          }
          
          const importRecord = await supabaseApi.imports.insert(importData)
          console.log('[Supabase] Import kaydı oluşturuldu:', importRecord.id)

          // === MVP DAVRANIŞI: Yeni Excel import'unda TÜM listings'i temizle, sonra yeniden yaz ===
          // 1) Supabase'te tüm kayıtları sil ve 2) yeni Excel verisini ekle (repository üzerinden)
          const canonicalForInsert = parsedListings.map(canonicalListing => {
            const supabaseListing = {}
            for (const field of CANONICAL_FIELDS) {
              if (canonicalListing[field] !== null && canonicalListing[field] !== undefined) {
                supabaseListing[field] = canonicalListing[field]
              }
            }
            // listing_date'i DATE string'e çevir (Date ise)
            if (supabaseListing.listing_date instanceof Date) {
              supabaseListing.listing_date = supabaseListing.listing_date.toISOString().split('T')[0]
            }
            return supabaseListing
          })

          const normalizedAfterImport = await replaceAllListings(canonicalForInsert)

          // Listings'i yeniden yükle (Supabase'ten normalize edilmiş veri)
          const allListings = await fetchAllListings()

          await onUpdateListings(allListings)

          setResult({
            added: addedCount,
            updated: 0,
            total: parsedListings.length
          })

          // Dosya input'unu temizle
          setFile(null)
          document.getElementById('excel-file-input').value = ''

        } catch (err) {
          console.error('[Excel] Parse hatası:', err)
          setError('Excel dosyası işlenirken hata oluştu: ' + err.message)
        } finally {
          setLoading(false)
        }
      }

      reader.onerror = () => {
        setError('Dosya okunurken hata oluştu!')
        setLoading(false)
      }

      reader.readAsArrayBuffer(file)

    } catch (err) {
      console.error('[Upload] Hata:', err)
      setError('Dosya yüklenirken hata oluştu: ' + err.message)
      setLoading(false)
    }
  }

  // Supabase'den mevcut ilan sayısını al (sadece UI gösterimi için)
  const existingListingsCount = listings && listings.length ? listings.length : 0
  const hasExistingData = existingListingsCount > 0

  // Veri yoksa bilgi mesajı göster
  if (!listings || listings.length === 0) {
    return (
      <div className="revy-excel-import">
        <div className="import-header">
          <h2>Revy Excel Yükle</h2>
          <p className="import-subtitle">
            Revy'den aldığınız .xlsx Excel dosyasını yükleyerek ilanları sisteme aktarın
          </p>
          <div className="no-data-info">
            ℹ️ Henüz Excel verisi yüklenmedi. İlk Excel dosyasını yükleyerek sistemi başlatın.
          </div>
        </div>

        <div className="import-card">
          <div className="file-upload-section">
            <label htmlFor="excel-file-input" className="file-input-label">
              <div className="file-input-icon">📄</div>
              <div className="file-input-text">
              <span className="file-input-title">Excel Dosyası Seç</span>
              <span className="file-input-subtitle">
                {file ? file.name : '.xlsx formatında dosya seçin'}
              </span>
            </div>
          </label>
          <input
            id="excel-file-input"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            className="file-input"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <div className="success-content">
              <h3>Yükleme Başarılı!</h3>
              <div className="result-stats">
                <div className="stat-item">
                  <span className="stat-number">{result.added}</span>
                  <span className="stat-label">Yeni İlan</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{result.updated}</span>
                  <span className="stat-label">Güncellenen</span>
                </div>
                <div className="stat-item total">
                  <span className="stat-number">{result.total}</span>
                  <span className="stat-label">Toplam</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="expected-format">
          <h4>Beklenen Excel Formatı:</h4>
          <ul>
            <li>İlan ID veya İlan URL</li>
            <li>İlan Tarihi</li>
            <li>İl / İlçe / Mahalle</li>
            <li>Fiyat</li>
            <li>Oda Sayısı</li>
            <li>Net m² / Brüt m²</li>
            <li>Kat / Bina Yaşı</li>
            <li>Isınma Tipi</li>
          </ul>
          <p className="format-note">
            Not: Kolon adları farklı yazımlarda olabilir. Sistem otomatik olarak normalize eder.
          </p>
        </div>

        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading 
            ? 'Yükleniyor...' 
            : '📤 Excel Yükle'
          }
        </button>
      </div>
    </div>
    )
  }

  // Normal durum - veri varsa normal sayfayı göster
  return (
    <div className="revy-excel-import">
      <div className="import-header">
        <h2>Revy Excel Yükle</h2>
        <p className="import-subtitle">
          Revy'den aldığınız .xlsx Excel dosyasını yükleyerek ilanları sisteme aktarın
        </p>
        {hasExistingData && (
          <div className="existing-listings-info">
            📊 Sistemde <strong>{existingListingsCount}</strong> adet ilan yüklü
          </div>
        )}
      </div>

      <div className="import-card">
        <div className="file-upload-section">
          <label htmlFor="excel-file-input" className="file-input-label">
            <div className="file-input-icon">📄</div>
            <div className="file-input-text">
              <span className="file-input-title">Excel Dosyası Seç</span>
              <span className="file-input-subtitle">
                {file ? file.name : '.xlsx formatında dosya seçin'}
              </span>
            </div>
          </label>
          <input
            id="excel-file-input"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            className="file-input"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <div className="success-content">
              <h3>Yükleme Başarılı!</h3>
              <div className="result-stats">
                <div className="stat-item">
                  <span className="stat-number">{result.added}</span>
                  <span className="stat-label">Yeni İlan</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{result.updated}</span>
                  <span className="stat-label">Güncellenen</span>
                </div>
                <div className="stat-item total">
                  <span className="stat-number">{result.total}</span>
                  <span className="stat-label">Toplam</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="expected-format">
          <h4>Beklenen Excel Formatı:</h4>
          <ul>
            <li>İlan ID veya İlan URL</li>
            <li>İlan Tarihi</li>
            <li>İl / İlçe / Mahalle</li>
            <li>Fiyat</li>
            <li>Oda Sayısı</li>
            <li>Net m² / Brüt m²</li>
            <li>Kat / Bina Yaşı</li>
            <li>Isınma Tipi</li>
          </ul>
          <p className="format-note">
            Not: Kolon adları farklı yazımlarda olabilir. Sistem otomatik olarak normalize eder.
          </p>
        </div>

        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading 
            ? 'Yükleniyor...' 
            : hasExistingData 
              ? '📤 Veriyi Güncelle' 
              : '📤 Excel Yükle'
          }
        </button>
      </div>
    </div>
  )
}

export default RevyExcelImport
