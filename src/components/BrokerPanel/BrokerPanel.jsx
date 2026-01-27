import { useState, useEffect, useMemo } from 'react'
import { BarChart3, User, Eye, Phone, FileText } from 'lucide-react'
import { fetchAllUsers } from '../../services/usersRepository'
import { fetchActivitiesForBrokerPanel } from '../../services/activitiesRepository'
import './BrokerPanel.css'

function getWeekStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = d.getDate() - (day === 0 ? 6 : day - 1)
  const monday = new Date(d)
  monday.setDate(diff)
  return monday.toISOString()
}

const ACTION_LABELS = { viewed: 'Görüntülendi', called: 'Aranıldı', note_added: 'Not eklendi', skipped: 'Geçildi', marked_as_opportunity: 'Fırsat' }

function BrokerPanel() {
  const [users, setUsers] = useState([])
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const since = getWeekStart()
      const [u, a] = await Promise.all([
        fetchAllUsers(),
        fetchActivitiesForBrokerPanel({ since })
      ])
      if (!mounted) return
      setUsers(u || [])
      setActions(a || [])
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const weekly = useMemo(() => {
    const t = { viewed: 0, called: 0, note_added: 0, skipped: 0, marked_as_opportunity: 0 }
    actions.forEach(({ action_type }) => { if (t[action_type] !== undefined) t[action_type]++ })
    return t
  }, [actions])

  const consultants = useMemo(() => {
    const byUser = {}
    actions.forEach((a) => {
      if (!byUser[a.user_id]) byUser[a.user_id] = { viewed: 0, called: 0, note_added: 0, skipped: 0, marked_as_opportunity: 0, items: [] }
      const u = byUser[a.user_id]
      u[a.action_type]++
      u.items.push(a)
    })
    return Object.entries(byUser).map(([userId, stats]) => {
      const us = users.find((x) => x.id === userId)
      const name = us?.full_name || 'Kullanıcı'
      const rate = stats.viewed > 0 ? Math.round((100 * stats.called) / stats.viewed) : 0
      return { userId, name, ...stats, rate }
    }).sort((a, b) => (b.viewed + b.called) - (a.viewed + a.called))
  }, [actions, users])

  const selectedActions = useMemo(() => {
    if (!selectedUserId) return []
    const c = consultants.find((x) => x.userId === selectedUserId)
    return c ? [...c.items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : []
  }, [selectedUserId, consultants])

  const selectedName = consultants.find((c) => c.userId === selectedUserId)?.name || ''

  if (loading) return <div className="broker-panel"><div className="broker-panel-loading">Yükleniyor...</div></div>

  return (
    <div className="broker-panel">
      <div className="broker-panel-header">
        <BarChart3 size={24} strokeWidth={2} />
        <h2>Broker Paneli</h2>
      </div>
      <section className="broker-section">
        <h3>Haftalık performans özeti</h3>
        <div className="broker-summary-cards">
          <div className="broker-summary-card"><Eye size={18} /><span>Görüntülenen</span><strong>{weekly.viewed}</strong></div>
          <div className="broker-summary-card"><Phone size={18} /><span>Aranan</span><strong>{weekly.called}</strong></div>
          <div className="broker-summary-card"><FileText size={18} /><span>Not</span><strong>{weekly.note_added}</strong></div>
          <div className="broker-summary-card"><span>Geçilen</span><strong>{weekly.skipped}</strong></div>
          <div className="broker-summary-card"><span>Fırsat</span><strong>{weekly.marked_as_opportunity}</strong></div>
        </div>
      </section>
      <section className="broker-section">
        <h3>Danışman bazlı kartlar</h3>
        <div className="broker-consultant-grid">
          {consultants.map((c) => (
            <button key={c.userId} type="button" className={`broker-consultant-card ${selectedUserId === c.userId ? 'selected' : ''}`} onClick={() => setSelectedUserId(selectedUserId === c.userId ? null : c.userId)}>
              <div className="broker-card-header"><User size={16} /><span className="broker-card-name">{c.name}</span></div>
              <div className="broker-card-stats">
                <span>Bakılan: <strong>{c.viewed}</strong></span>
                <span>Aranan: <strong>{c.called}</strong></span>
                <span>Arama oranı: <strong>%{c.rate}</strong></span>
              </div>
            </button>
          ))}
        </div>
        {consultants.length === 0 && <p className="broker-empty">Bu hafta henüz aksiyon kaydı yok.</p>}
      </section>
      {selectedUserId && (
        <section className="broker-section broker-detail">
          <h3>Detay: {selectedName}</h3>
          <div className="broker-detail-table-wrap">
            <table className="broker-detail-table">
              <thead><tr><th>Entity</th><th>Aksiyon</th><th>Tarih</th></tr></thead>
              <tbody>
                {selectedActions.map((a) => (
                  <tr key={a.id}>
                    <td>{a.entity_type === 'listing' ? (a.entity_id || '-') : (a.entity_id || '-')}</td>
                    <td>{ACTION_LABELS[a.action_type] ?? a.action_type}</td>
                    <td>{a.created_at ? new Date(a.created_at).toLocaleString('tr-TR') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

export default BrokerPanel
