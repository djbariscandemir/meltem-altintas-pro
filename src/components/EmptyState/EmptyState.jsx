import { Inbox, Search, FileText, Users, Star, Clock, Phone } from 'lucide-react'
import AppLogo from '../AppLogo/AppLogo'
import './EmptyState.css'

const EMPTY_STATE_CONFIG = {
  listings: {
    icon: Search,
    title: 'Henüz ilan bulunmuyor',
    description: 'Filtreleri değiştirerek daha fazla sonuç görebilirsiniz',
    showLogo: true
  },
  tasks: {
    icon: Phone,
    title: 'Görev bulunmuyor',
    description: 'Arama görevi bulunmuyor'
  },
  todayTasks: {
    icon: Clock,
    title: 'Tüm görevler tamamlandı!',
    description: 'Bugün aramanız gereken görev bulunmuyor',
    variant: 'success'
  },
  notes: {
    icon: FileText,
    title: 'Henüz not eklenmemiş',
    description: 'İlanlara not ekleyerek takip edebilirsiniz'
  },
  buyerRequests: {
    icon: Users,
    title: 'Henüz alıcı talebi bulunmuyor',
    description: 'Yeni alıcı talepleri burada görünecek'
  },
  customStock: {
    icon: Star,
    title: 'Henüz özel stok ilanı bulunmuyor',
    description: 'Özel stok ilanlarınız burada görünecek'
  },
  default: {
    icon: Inbox,
    title: 'İçerik bulunamadı',
    description: 'Henüz veri bulunmuyor'
  }
}

function EmptyState({ type = 'default', customTitle, customDescription }) {
  const config = EMPTY_STATE_CONFIG[type] || EMPTY_STATE_CONFIG.default
  const Icon = config.icon

  return (
    <div className={`empty-state ${config.variant || ''}`}>
      {config.showLogo && (
        <div className="empty-state-logo-wrapper">
          <AppLogo imgClassName="empty-state-logo" fallbackClassName="empty-state-logo-fallback" />
        </div>
      )}
      {!config.showLogo && (
        <div className="empty-state-icon">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="empty-state-title">{customTitle || config.title}</h3>
      <p className="empty-state-description">{customDescription || config.description}</p>
    </div>
  )
}

export default EmptyState
