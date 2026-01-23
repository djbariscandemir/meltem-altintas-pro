import { Cake } from 'lucide-react'
import './Profile.css'

function Profile({ user }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getBirthDay = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return `${date.getDate()} ${date.toLocaleDateString('tr-TR', { month: 'long' })}`
  }

  const roleLabel = user.role === 'broker' ? 'Broker' : 'Danışman'

  return (
    <div className="profile-view">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
        </div>
        <h2>{user.firstName} {user.lastName}</h2>
        <div className="profile-role">{roleLabel}</div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>Kişisel Bilgiler</h3>
          <div className="profile-info">
            <div className="info-row">
              <span className="label">Ad:</span>
              <span className="value">{user.firstName}</span>
            </div>
            <div className="info-row">
              <span className="label">Soyad:</span>
              <span className="value">{user.lastName}</span>
            </div>
            <div className="info-row">
              <span className="label">E-posta:</span>
              <span className="value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="label">Doğum Tarihi:</span>
              <span className="value">{formatDate(user.birthDate)}</span>
            </div>
            <div className="info-row">
              <span className="label">Doğum Günü:</span>
              <span className="value">
                <Cake size={16} strokeWidth={2} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
                {getBirthDay(user.birthDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Hesap Bilgileri</h3>
          <div className="profile-info">
            <div className="info-row">
              <span className="label">Kullanıcı Adı:</span>
              <span className="value">{user.username}</span>
            </div>
            <div className="info-row">
              <span className="label">Rol:</span>
              <span className="value">{roleLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
