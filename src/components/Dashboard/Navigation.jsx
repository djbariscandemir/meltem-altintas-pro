import { Home, Clock, Phone, FileText, Users, Star, User, BarChart3, PlusCircle } from 'lucide-react'
import './Navigation.css'

function Navigation({ user, currentView, onViewChange, unreadNotifications, todayTasksCount = 0 }) {
  const showBrokerPanel = user && (user.role === 'broker' || user.role === 'admin')

  const menuItems = [
    { id: 'listings', icon: Home, label: 'İlanlar', description: 'Tüm ilanları görüntüle' },
    ...(showBrokerPanel ? [{ id: 'add-listing', icon: PlusCircle, label: 'İlan Ekle', description: 'Revy linki ile manuel ilan ekle' }] : []),
    { id: 'today-tasks', icon: Clock, label: 'Bugün', badge: todayTasksCount, description: 'Bugün yapılacak görevler' },
    { id: 'tasks', icon: Phone, label: 'Görevler', description: 'Tüm arama görevleri' },
    { id: 'notes', icon: FileText, label: 'Notlar', description: 'İlan notları' },
    { id: 'buyer-requests', icon: Users, label: 'Alıcılar', description: 'Alıcı talepleri' },
    { id: 'custom-stock', icon: Star, label: 'Özel Stok', description: 'Özel stok ilanları' },
    ...(showBrokerPanel ? [{ id: 'broker-panel', icon: BarChart3, label: 'Broker Paneli', description: 'Haftalık performans' }] : []),
    { id: 'profile', icon: User, label: 'Profil', description: 'Hesap bilgileri' }
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
