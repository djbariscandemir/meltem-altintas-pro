import { useEffect, useState } from 'react'
import { Shield, User, Mail } from 'lucide-react'
import { fetchAllProfiles, upsertProfile } from '../../services/profilesRepository'
import './AdminPanel.css'

function AdminPanel({ user }) {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await fetchAllProfiles()
        if (!mounted) return
        setProfiles(data || [])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-panel-view">
        <div className="admin-panel-card">
          <p>Bu sayfaya sadece admin kullanıcılar erişebilir.</p>
        </div>
      </div>
    )
  }

  const handleChangeRole = async (profile, role) => {
    setUpdatingId(profile.id)
    try {
      const payload = {
        ...profile,
        rol: role
      }
      const updated = await upsertProfile(payload)
      setProfiles(prev =>
        prev.map(p => (p.id === updated.id ? updated : p))
      )
    } catch (e) {
      // sessiz hata
    } finally {
      setUpdatingId(null)
    }
  }

  const getRoleLabel = (rol) => {
    if (rol === 'admin') return 'Admin'
    if (rol === 'broker') return 'Broker'
    return 'Kullanıcı'
  }

  return (
    <div className="admin-panel-view">
      <div className="admin-panel-header">
        <Shield size={24} />
        <div>
          <h2>Admin Paneli</h2>
          <p>Kullanıcı rolleri: user / broker / admin</p>
        </div>
      </div>

      <div className="admin-panel-card">
        {loading ? (
          <div className="admin-panel-loading">Yükleniyor...</div>
        ) : (
          <table className="admin-panel-table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>E-posta</th>
                <th>Rol</th>
                <th>Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-user-cell">
                      <User size={14} />
                      <span>{(p.ad || '') + ' ' + (p.soyad || '') || 'İsim yok'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-user-cell">
                      <Mail size={14} />
                      <span>{p.email}</span>
                    </div>
                  </td>
                  <td>{getRoleLabel(p.rol)}</td>
                  <td>
                    <div className="admin-role-actions">
                      <button
                        type="button"
                        className="role-btn broker"
                        disabled={updatingId === p.id || p.rol === 'broker'}
                        onClick={() => handleChangeRole(p, 'broker')}
                      >
                        Broker yap
                      </button>
                      <button
                        type="button"
                        className="role-btn admin"
                        disabled={updatingId === p.id || p.rol === 'admin'}
                        onClick={() => handleChangeRole(p, 'admin')}
                      >
                        Admin yap
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminPanel

