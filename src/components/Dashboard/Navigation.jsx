import { Home, Clock, Phone, FileText, Users, Star, User } from 'lucide-react'
import './Navigation.css'

function Navigation({ currentView, onViewChange, unreadNotifications, todayTasksCount = 0 }) {
  const menuItems = [
    { id: 'listings', icon: Home, label: 'İlanlar' },
    { id: 'today-tasks', icon: Clock, label: 'Bugün', badge: todayTasksCount },
    { id: 'tasks', icon: Phone, label: 'Görevler' },
    { id: 'notes', icon: FileText, label: 'Notlar' },
    { id: 'buyer-requests', icon: Users, label: 'Alıcılar' },
    { id: 'custom-stock', icon: Star, label: 'Özel Stok' },
    { id: 'profile', icon: User, label: 'Profil' }
  ]

  return (
    <nav className="dashboard-navigation">
      {menuItems.map(item => {
        const IconComponent = item.icon
        return (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <IconComponent size={18} strokeWidth={2} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="nav-badge">{item.badge}</span>
            )}
            {item.id === 'tasks' && unreadNotifications > 0 && (
              <span className="nav-badge">{unreadNotifications}</span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

export default Navigation
