import { useState, useEffect } from 'react'
import { supabaseApi } from '../../utils/supabase'
import './ImportsManagement.css'

function ImportsManagement({ onRefreshListings }) {
  const [imports, setImports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadImports()
  }, [])

  const loadImports = async () => {
    try {
      setLoading(true)
      const data = await supabaseApi.imports.getAll()
      setImports(data)
    } catch (err) {
      console.error('[ImportsManagement] Veri yükleme hatası:', err)
      setError('İçe aktarımlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (importId, fileName) => {
    if (!confirm(`${fileName} içe aktarım kaydını silmek istediğinizden emin misiniz? Bu işlem sadece import kaydını siler, ilanları etkilemez.`)) {
      return
    }

    try {
      await supabaseApi.imports.delete(importId)
      await loadImports()
      // Listings'i yeniden yükle
      if (onRefreshListings) {
        await onRefreshListings()
      }
      alert('İçe aktarım başarıyla silindi')
    } catch (err) {
      console.error('[ImportsManagement] Silme hatası:', err)
      alert('İçe aktarım silinirken hata oluştu: ' + err.message)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="imports-management">
        <div className="loading-state">
          <div>📊</div>
          <div>İçe aktarımlar yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="imports-management">
        <div className="error-state">
          <div>⚠️</div>
          <div>{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="imports-management">
      <div className="imports-header">
        <h2>Yüklenen Excel'ler</h2>
        <p className="imports-subtitle">
          Sistemde kayıtlı Excel içe aktarımları
        </p>
      </div>

      {imports.length === 0 ? (
        <div className="no-imports">
          <div className="no-imports-icon">📄</div>
          <p>Henüz Excel içe aktarımı yapılmadı</p>
          <p className="no-imports-hint">
            Revy Excel Yükle sayfasından ilk Excel dosyanızı yükleyebilirsiniz
          </p>
        </div>
      ) : (
        <div className="imports-list">
          {imports.map(importRecord => (
            <div key={importRecord.id} className="import-card">
              <div className="import-card-header">
                <div className="import-card-icon">📊</div>
                <div className="import-card-info">
                  <h3 className="import-card-title">{importRecord.file_name}</h3>
                  <div className="import-card-meta">
                    <span>📅 {formatDate(importRecord.imported_at)}</span>
                  </div>
                </div>
                <button
                  className="delete-import-btn"
                  onClick={() => handleDelete(importRecord.id, importRecord.file_name)}
                  title="İçe aktarımı sil"
                >
                  🗑️
                </button>
              </div>

              <div className="import-card-stats">
                <div className="stat-item">
                  <span className="stat-value">{importRecord.total_listings || 0}</span>
                  <span className="stat-label">Toplam İlan</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImportsManagement
