import { useState, useMemo } from 'react'
import { AlertTriangle, Clock, CheckCircle2, Check } from 'lucide-react'
import { updateNote } from '../../services/notesRepository'
import { toast } from '../Toast/ToastContainer'
import './Tasks.css'

function Tasks({ user, tasks, listings, onUpdateTasks }) {
  const [filter, setFilter] = useState('all') // all, pending, overdue, completed

  const getTaskTypeLabel = (type) => {
    const labels = {
      day1: '1. Gün Arama',
      day3: '3. Gün Arama',
      dayBeforeEnd: 'Sondan 1 Gün Önce',
      endDay: 'Son Gün Arama',
      reminder: 'Özel Görev'
    }
    return labels[type] || type
  }

  const getTaskStatus = (task) => {
    if (task.isCalled) return 'completed'
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    if (dueDate < today) return 'overdue'
    return 'pending'
  }

  const baseTasks = useMemo(() => {
    if (user.role === 'user') {
      return tasks.filter(t => t.calledBy === null || t.calledBy === user.id)
    }
    return tasks
  }, [tasks, user.role, user.id])

  const filteredTasks = useMemo(() => {
    let filtered = baseTasks
    if (filter === 'pending') {
      filtered = baseTasks.filter(t => !t.isCalled && new Date(t.dueDate) >= new Date())
    } else if (filter === 'overdue') {
      filtered = baseTasks.filter(t => !t.isCalled && new Date(t.dueDate) < new Date())
    } else if (filter === 'completed') {
      filtered = baseTasks.filter(t => t.isCalled)
    }

    return filtered.sort((a, b) => {
      if (filter === 'overdue') {
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      return new Date(b.dueDate) - new Date(a.dueDate)
    })
  }, [baseTasks, filter])

  const handleTaskComplete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      // Eğer bu bir note reminder göreviyse, notes tablosunda is_completed'ı güncelle
      if (task.isCustom && task.noteId) {
        console.log('[Tasks] Note reminder görevi tamamlanıyor, notes tablosu güncelleniyor...', task.noteId)
        try {
          await updateNote(task.noteId, { is_completed: true })
          console.log('[Tasks] ✅ Note is_completed güncellendi')
        } catch (error) {
          console.error('[Tasks] ❌ Note güncelleme hatası:', error)
        }
      }

      const updated = tasks.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              isCalled: true, 
              calledAt: new Date().toISOString(),
              calledBy: user.id
            }
          : t
      )
      onUpdateTasks(updated)

      const listing = listings.find(l => l.id === task.listingId)
      toast.success(`Görev tamamlandı: ${listing?.title || 'İlan'}`)
    } catch (error) {
      console.error('[Tasks] ❌ handleTaskComplete ERROR:', error)
      toast.error('Görev tamamlanırken bir hata oluştu')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getListingTitle = (listingId) => {
    const listing = listings.find(l => l.id === listingId)
    return listing?.title || 'Bilinmeyen İlan'
  }

  return (
    <div className="tasks-view">
      <div className="tasks-header">
        <h2>Arama Görevleri</h2>
        <div className="tasks-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tümü ({baseTasks.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Bekleyen ({baseTasks.filter(t => !t.isCalled && new Date(t.dueDate) >= new Date()).length})
          </button>
          <button 
            className={`filter-btn ${filter === 'overdue' ? 'active' : ''}`}
            onClick={() => setFilter('overdue')}
          >
            <AlertTriangle size={16} strokeWidth={2} style={{ marginRight: '6px' }} />
            Geciken ({baseTasks.filter(t => !t.isCalled && new Date(t.dueDate) < new Date()).length})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            <CheckCircle2 size={16} strokeWidth={2} style={{ marginRight: '6px' }} />
            Tamamlanan ({baseTasks.filter(t => t.isCalled).length})
          </button>
        </div>
      </div>

      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <EmptyState type="tasks" />
        ) : (
          filteredTasks.map(task => {
            const status = getTaskStatus(task)
            const listing = listings.find(l => l.id === task.listingId)

            return (
              <div 
                key={task.id} 
                className={`task-card ${status}`}
              >
                <div className="task-header">
                  <div className="task-type">
                    {getTaskTypeLabel(task.type)}
                    {task.isCustom && <span className="custom-task-badge">Özel</span>}
                  </div>
                  <div className={`task-status-badge ${status}`}>
                    {status === 'completed' && (
                      <>
                        <CheckCircle2 size={14} strokeWidth={2} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                        Tamamlandı
                      </>
                    )}
                    {status === 'overdue' && (
                      <>
                        <AlertTriangle size={14} strokeWidth={2} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                        Gecikti
                      </>
                    )}
                    {status === 'pending' && (
                      <>
                        <Clock size={14} strokeWidth={2} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                        Bekliyor
                      </>
                    )}
                  </div>
                </div>

                <div className="task-listing">
                  {listing?.title || 'Bilinmeyen İlan'}
                  {task.isCustom && task.noteText && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', fontStyle: 'italic' }}>
                      Not: {task.noteText.substring(0, 50)}{task.noteText.length > 50 ? '...' : ''}
                    </div>
                  )}
                </div>

                <div className="task-info">
                  <div className="task-due-date">
                    <span className="label">Son Tarih:</span>
                    <span className={`value ${status === 'overdue' ? 'overdue' : ''}`}>
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                  
                  {task.isCalled && task.calledAt && (
                    <div className="task-completed-info">
                      <span className="label">Tamamlandı:</span>
                      <span className="value">
                        {formatDate(task.calledAt)}
                      </span>
                    </div>
                  )}
                </div>

                {!task.isCalled && (
                  <button 
                    className="task-complete-btn"
                    onClick={() => handleTaskComplete(task.id)}
                  >
                    <Check size={16} strokeWidth={2.5} style={{ marginRight: '6px' }} />
                    Görevi Tamamla
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Tasks
