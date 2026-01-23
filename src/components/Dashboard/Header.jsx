import { useState } from 'react'
import { Bell } from 'lucide-react'
import NotificationsPanel from './NotificationsPanel'
import './Header.css'

function Header({ user, notifications, onUpdateNotifications, onLogout }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleNotificationClick = (notificationId) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    )
    onUpdateNotifications(updated)
  }

  const handleLogoLoad = () => {
    setLogoLoaded(true)
    setLogoError(false)
  }

  const handleLogoError = () => {
    setLogoError(true)
    setLogoLoaded(false)
  }

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-logo-section">
          <div className="header-logo-wrapper">
            <img 
              src="/logo.png" 
              alt="Meltem Altıntaş Pro" 
              className={`logo-img ${logoLoaded ? 'logo-loaded' : ''} ${logoError ? 'logo-error' : ''}`}
              onLoad={handleLogoLoad}
              onError={handleLogoError}
              style={{ display: logoError ? 'none' : 'block' }}
            />
            {logoError && (
              <span className="logo-fallback">Meltem Altıntaş Pro</span>
            )}
          </div>
          <h1 className="header-title">
            <span className="brand-name">Meltem Altıntaş</span>
            <span className="brand-pro">Pro</span>
          </h1>
        </div>
        
        <div className="header-actions">
          <button 
            className="header-btn notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          <div className="user-menu">
            <button 
              className="header-btn user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </button>
            
            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-info">
                  <div className="user-name">{user.firstName} {user.lastName}</div>
                  <div className="user-role">
                    {user.role === 'broker' ? 'Broker' : 'Danışman'}
                  </div>
                </div>
                <button className="user-menu-item" onClick={onLogout}>
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </header>
  )
}

export default Header
