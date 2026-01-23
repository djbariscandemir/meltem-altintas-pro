import { X, Cake, PartyPopper, Phone, AlertTriangle, Bell } from 'lucide-react'
import './NotificationsPanel.css'

function NotificationsPanel({ notifications, onNotificationClick, onClose }) {
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Az önce'
    if (minutes < 60) return `${minutes} dk önce`
    if (hours < 24) return `${hours} saat önce`
    return `${days} gün önce`
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'birthday':
        return <Cake size={20} strokeWidth={2} />
      case 'birthday_info':
        return <PartyPopper size={20} strokeWidth={2} />
      case 'call_task':
        return <Phone size={20} strokeWidth={2} />
      case 'overdue_task':
        return <AlertTriangle size={20} strokeWidth={2} />
      default:
        return <Bell size={20} strokeWidth={2} />
    }
  }

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  return (
    <div className="notifications-panel-overlay" onClick={onClose}>
      <div className="notifications-panel" onClick={(e) => e.stopPropagation()}>
        <div className="notifications-header">
          <h3>Bildirimler</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="notifications-list">
          {sortedNotifications.length === 0 ? (
            <div className="no-notifications">
              <p>Bildirim bulunmuyor</p>
            </div>
          ) : (
            sortedNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => onNotificationClick(notification.id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">
                    {formatTime(notification.createdAt)}
                  </div>
                </div>
                {!notification.isRead && <div className="unread-dot" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationsPanel
