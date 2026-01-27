import { useState, useMemo } from 'react'
import { PartyPopper, Phone, FileText, Eye, AlertTriangle, CheckCircle2, Clock, MapPin, X } from 'lucide-react'
import NoteSheet from '../Listings/NoteSheet'
import { toast } from '../Toast/ToastContainer'
import './TodayTasks.css'

function TodayTasks({ user, tasks, listings, onUpdateTasks, onUpdateListings }) {
  const [selectedListing, setSelectedListing] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showNoteSheet, setShowNoteSheet] = useState(false)
  const [currentTaskForNote, setCurrentTaskForNote] = useState(null)

  const getTaskTypeLabel = (type) => {
    const labels = {
      day1: '1. Gün Araması',
      day3: '3. Gün Araması',
      dayBeforeEnd: 'Sondan 1 Gün Önce',
      endDay: 'Son Gün Araması',
      lastDay: 'Son Gün Araması',
      beforeLastDay: 'Sondan 1 Gün Önce',
      reminder: 'Özel Görev'
    }
    return labels[type] || type
  }

  // Get today's date (start and end of day)
  const getTodayRange = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)
    return { start: today, end: endOfDay }
  }

  // Filter today's tasks based on role
  const todayTasks = useMemo(() => {
    const { start, end } = getTodayRange()
    const now = new Date()
    
    let filtered = tasks.filter(task => {
      const dueDate = new Date(task.dueDate)
      // Bugünkü görevler VEYA geçmiş tarihli hatırlatıcılar (henüz tamamlanmamış)
      const isToday = dueDate >= start && dueDate <= end
      const isOverdueReminder = task.isCustom && task.type === 'reminder' && dueDate < now && !task.isCalled
      return (isToday || isOverdueReminder) && !task.isCalled
    })

    if (user.role === 'user') {
      filtered = filtered.filter(task => 
        task.calledBy === null || task.calledBy === user.id
      )
    }

    // Get listing info for each task
    return filtered.map(task => {
      const listing = listings.find(l => l.id === task.listingId)
      const dueDate = new Date(task.dueDate)
      const now = new Date()
      
      let status = 'today'
      if (task.isCalled) {
        status = 'completed'
      } else if (dueDate < now) {
        status = 'overdue'
      }

      return {
        ...task,
        listingTitle: listing?.title || 'Bilinmeyen İlan',
        district: listing?.district || listing?.location || 'Bilinmeyen',
        status
      }
    }).sort((a, b) => {
      // Overdue first, then today's
      if (a.status === 'overdue' && b.status !== 'overdue') return -1
      if (a.status !== 'overdue' && b.status === 'overdue') return 1
      return new Date(a.dueDate) - new Date(b.dueDate)
    })
  }, [tasks, listings, user])

  const handleCall = (task) => {
    // Mark task as completed
    const updated = tasks.map(t =>
      t.id === task.id
        ? {
            ...t,
            isCalled: true,
            calledAt: new Date().toISOString(),
            calledBy: user.id
          }
        : t
    )
    onUpdateTasks(updated)

    // Log activity
    const listing = listings.find(l => l.id === task.listingId)
    if (listing) {
      const activity = {
        type: 'call',
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        timestamp: new Date().toISOString()
      }
      
      const updatedListings = listings.map(item => {
        if (item.id === task.listingId) {
          return {
            ...item,
            activities: [...(item.activities || []), activity]
          }
        }
        return item
      })
      onUpdateListings(updatedListings)
    }
    toast.success(`Arama kaydedildi: ${task.listingTitle}`)
  }

  const handleNote = (task) => {
    setCurrentTaskForNote(task)
    const listing = listings.find(l => l.id === task.listingId)
    if (listing) {
      setSelectedListing(listing)
      setShowNoteSheet(true)
    }
  }

  const handleNoteSave = (note, isPrivate) => {
    if (currentTaskForNote && selectedListing) {
      const newNote = {
        id: Date.now().toString(),
        content: note,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        isPrivate: isPrivate || false,
        createdAt: new Date().toISOString()
      }

      const updated = listings.map(item => {
        if (item.id === selectedListing.id) {
          return {
            ...item,
            notes: [...(item.notes || []), newNote],
            activities: [...(item.activities || []), {
              type: 'note',
              userId: user.id,
              userName: `${user.firstName} ${user.lastName}`,
              timestamp: new Date().toISOString()
            }]
          }
        }
        return item
      })
      onUpdateListings(updated)
      
      toast.success('Not kaydedildi')
      setShowNoteSheet(false)
      setCurrentTaskForNote(null)
      setSelectedListing(null)
    }
  }

  const handleViewListing = (task) => {
    const listing = listings.find(l => l.id === task.listingId)
    if (listing) {
      setSelectedListing(listing)
      setShowDetail(true)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (todayTasks.length === 0) {
    return (
      <div className="today-tasks-view">
        <div className="today-tasks-header">
          <h2>Bugün Aranacaklar</h2>
          <div className="tasks-count">
            <span className="count-number">0</span>
            <span className="count-label">görev</span>
          </div>
        </div>
        
        <EmptyState type="todayTasks" />
      </div>
    )
  }

  return (
    <div className="today-tasks-view">
      <div className="today-tasks-header">
        <h2>Bugün Aranacaklar</h2>
        <div className="tasks-count">
          <span className="count-number">{todayTasks.length}</span>
          <span className="count-label">görev</span>
        </div>
      </div>

      <div className="today-tasks-list">
        {todayTasks.map(task => (
          <div 
            key={task.id} 
            className={`today-task-card ${task.status}`}
          >
            <div className="task-status-indicator" />
            
            <div className="task-main-content">
              <div className="task-header-row">
                <h3 className="task-listing-title">{task.listingTitle}</h3>
                {task.isCustom && task.noteText && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', fontStyle: 'italic' }}>
                    Not: {task.noteText.substring(0, 50)}{task.noteText.length > 50 ? '...' : ''}
                  </div>
                )}
                <span className={`status-badge ${task.status}`}>
                  {task.status === 'completed' && (
                    <>
                      <CheckCircle2 size={14} strokeWidth={2} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                      Tamamlandı
                    </>
                  )}
                  {task.status === 'today' && (
                    <>
                      <Clock size={14} strokeWidth={2} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                      Bugün
                    </>
                  )}
                  {task.status === 'overdue' && (
                    <>
                      <AlertTriangle size={14} strokeWidth={2} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                      Gecikti
                    </>
                  )}
                </span>
              </div>

              <div className="task-info-row">
                <span className="task-district">
                  <MapPin size={14} strokeWidth={2} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
                  {task.district}
                </span>
                <span className="task-type">{getTaskTypeLabel(task.type)}</span>
              </div>

              {task.dueDate && (
                <div className="task-time">
                  Son tarih: {formatTime(task.dueDate)}
                </div>
              )}
            </div>

            <div className="task-actions">
              <button
                className="task-action-btn call-btn"
                onClick={() => handleCall(task)}
                title="Ara"
              >
                <Phone size={16} strokeWidth={2} style={{ marginRight: '6px' }} />
                Ara
              </button>
              <button
                className="task-action-btn note-btn"
                onClick={() => handleNote(task)}
                title="Not Al"
              >
                <FileText size={16} strokeWidth={2} style={{ marginRight: '6px' }} />
                Not
              </button>
              <button
                className="task-action-btn view-btn"
                onClick={() => handleViewListing(task)}
                title="İlana Git"
              >
                <Eye size={16} strokeWidth={2} style={{ marginRight: '6px' }} />
                Detay
              </button>
            </div>
          </div>
        ))}
      </div>

      {showDetail && selectedListing && (
        <div className="today-detail-overlay" onClick={() => setShowDetail(false)}>
          <div className="today-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowDetail(false)}>
              <X size={20} strokeWidth={2} />
            </button>
            <h3>{selectedListing.title}</h3>
            <div className="detail-info">
              <p><strong>Fiyat:</strong> {selectedListing.price}</p>
              <p><strong>Alan:</strong> {selectedListing.area}</p>
              <p><strong>Oda:</strong> {selectedListing.rooms}</p>
              <p><strong>Konum:</strong> {selectedListing.location}</p>
            </div>
            <button 
              className="back-to-tasks-btn"
              onClick={() => setShowDetail(false)}
            >
              Görevlere Dön
            </button>
          </div>
        </div>
      )}

      {showNoteSheet && selectedListing && (
        <NoteSheet
          onSave={handleNoteSave}
          onClose={() => {
            setShowNoteSheet(false)
            setSelectedListing(null)
            setCurrentTaskForNote(null)
          }}
        />
      )}
    </div>
  )
}

export default TodayTasks
