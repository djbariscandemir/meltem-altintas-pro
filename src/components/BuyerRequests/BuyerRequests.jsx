import { useState } from 'react'
import BuyerRequestForm from './BuyerRequestForm'
import { CheckCircle2, X } from 'lucide-react'
import './BuyerRequests.css'

function BuyerRequests({ user, buyerRequests, listings, onUpdateBuyerRequests }) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all') // all, active, inactive

  const filteredRequests = buyerRequests.filter(req => {
    if (filter === 'active') return req.isActive
    if (filter === 'inactive') return !req.isActive
    return true
  })

  const handleAddRequest = (requestData) => {
    const newRequest = {
      id: Date.now().toString(),
      ...requestData,
      createdBy: user.id,
      createdByName: `${user.firstName} ${user.lastName}`,
      createdAt: new Date().toISOString()
    }
    onUpdateBuyerRequests([...buyerRequests, newRequest])
    setShowForm(false)
  }

  const handleToggleActive = (requestId) => {
    const updated = buyerRequests.map(req =>
      req.id === requestId ? { ...req, isActive: !req.isActive } : req
    )
    onUpdateBuyerRequests(updated)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="buyer-requests-view">
      <div className="buyer-requests-header">
        <h2>Alıcı Talepleri</h2>
        <button 
          className="add-request-btn"
          onClick={() => setShowForm(!showForm)}
        >
          + Yeni Talep
        </button>
      </div>

      {showForm && (
        <BuyerRequestForm
          onSubmit={handleAddRequest}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="requests-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tümü
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Aktif
        </button>
        <button 
          className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
          onClick={() => setFilter('inactive')}
        >
          Pasif
        </button>
      </div>

      <div className="requests-list">
        {filteredRequests.length === 0 ? (
          <div className="no-requests">
            <p>Talep bulunmuyor</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div 
              key={request.id} 
              className={`request-card ${request.isActive ? 'active' : 'inactive'}`}
            >
              <div className="request-header">
                <h3 className="request-title">{request.title}</h3>
                <button
                  className={`status-toggle ${request.isActive ? 'active' : ''}`}
                  onClick={() => handleToggleActive(request.id)}
                >
                  {request.isActive ? (
                    <>
                      <CheckCircle2 size={14} strokeWidth={2} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                      Aktif
                    </>
                  ) : (
                    <>
                      <X size={14} strokeWidth={2} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                      Pasif
                    </>
                  )}
                </button>
              </div>

              <div className="request-info">
                <div className="info-item">
                  <span className="label">Lokasyon:</span>
                  <span className="value">{request.location}</span>
                </div>
                <div className="info-item">
                  <span className="label">Fiyat:</span>
                  <span className="value">
                    {request.priceRange.min} - {request.priceRange.max} TL
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Oda:</span>
                  <span className="value">{request.rooms}</span>
                </div>
                <div className="info-item">
                  <span className="label">Alan:</span>
                  <span className="value">{request.area}</span>
                </div>
              </div>

              {request.notes && (
                <div className="request-notes">
                  <span className="label">Notlar:</span>
                  <p>{request.notes}</p>
                </div>
              )}

              <div className="request-footer">
                <div className="request-meta">
                  <span>{request.createdByName}</span>
                  <span>•</span>
                  <span>{formatDate(request.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default BuyerRequests
