import { useState, useEffect, useRef } from 'react'
import Login from './components/Login/Login'
import Dashboard from './components/Dashboard/Dashboard'
import { storage, STORAGE_KEYS } from './utils/storage'
import { fetchAllListings } from './services/listingsRepository'
import { fetchAllNotes } from './services/notesRepository'
import { generateCallTasks, generateNotifications } from './data/mockData'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [listings, setListings] = useState([])
  const [tasks, setTasks] = useState([])
  const [buyerRequests, setBuyerRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  
  // useRef guard: React 18 StrictMode double invoke'u önlemek için
  const hasLoaded = useRef(false)

  // Check if user is already logged in
  useEffect(() => {
    // Guard: loadData sadece bir kez çalışsın (StrictMode için)
    if (hasLoaded.current) return
    hasLoaded.current = true
    
    const savedUser = storage.get(STORAGE_KEYS.USER)
    if (savedUser) {
      setUser(savedUser)
    }

    // Load data from Supabase (sadece 1 kez)
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('[App] loadData başlatılıyor...')
      
      // Supabase'ten normalize edilmiş ilanları getir (TEK VERİ KAYNAĞI)
      const allListings = await fetchAllListings()

      // KABUL KRİTERİ: Console'a data.length yazdır
      console.log(`[App] ✅ Supabase'ten ${allListings.length} adet ilan yüklendi`)
      console.log(`[App] 📊 Frontend state'e set edilen ilan sayısı: ${allListings.length}`)
      
      setListings(allListings)

      // Generate tasks from listings
      const allTasks = []
      allListings.forEach(listing => {
        const listingTasks = generateCallTasks(listing)
        listingTasks.forEach(task => {
          task.listingId = listing.id
          task.id = `${listing.id}-${task.type}`
        })
        allTasks.push(...listingTasks)
      })

      // Notes tablosundan hatırlatıcı görevleri ekle
      try {
        console.log('[App] Notes tablosundan hatırlatıcı görevleri çekiliyor...')
        const allNotes = await fetchAllNotes()
        const now = new Date()
        
        allNotes.forEach(note => {
          if (note.reminder_at && !note.is_completed) {
            const reminderDate = new Date(note.reminder_at)
            // Eğer hatırlatıcı zamanı geçmişse veya şimdiyse görev oluştur
            if (reminderDate <= now) {
              allTasks.push({
                id: `note-${note.id}`,
                listingId: note.listing_id,
                type: 'reminder',
                dueDate: reminderDate.toISOString(),
                isCalled: false,
                calledAt: null,
                calledBy: null,
                isCustom: true, // Özel görev etiketi
                noteId: note.id,
                noteText: note.note_text || note.content || ''
              })
            }
          }
        })
        console.log(`[App] ✅ ${allNotes.filter(n => n.reminder_at && !n.is_completed && new Date(n.reminder_at) <= now).length} hatırlatıcı görevi eklendi`)
      } catch (error) {
        console.error('[App] ❌ Notes görevleri çekilirken hata:', error)
      }

      setTasks(allTasks)

      // Load buyer requests (Supabase dışı mock data KULLANILMIYOR)
      const savedRequests = storage.get(STORAGE_KEYS.BUYER_REQUESTS)
      if (savedRequests && savedRequests.length > 0) {
        setBuyerRequests(savedRequests)
      } else {
        // Başlangıçta boş liste
        setBuyerRequests([])
      }

      // Generate notifications (şimdilik kullanıcı listesi yok, bildirim üretme)
      setNotifications([])

    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Supabase] Veri yükleme hatası:', error)
      }
      setListings([])
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser)
    // Reload notifications for this user
    const allNotifications = storage.get(STORAGE_KEYS.NOTIFICATIONS) || []
    const userNotifications = allNotifications.filter(n => n.userId === loggedInUser.id)
    setNotifications(userNotifications)
  }

  const handleLogout = () => {
    storage.remove(STORAGE_KEYS.USER)
    setUser(null)
  }

  /**
   * Update listings - Merkezi güncelleme fonksiyonu
   * Supabase'den veri çeker ve state'i günceller
   * @param {Array} updatedListings - Güncellenmiş ilanlar array'i (opsiyonel, boşsa Supabase'den çeker)
   */
  const updateListings = async (updatedListings = null) => {
    try {
      if (updatedListings) {
        // Eğer veri verilmişse direkt set et (Supabase'den geldiği için)
        setListings(updatedListings)
      } else {
        // Supabase'den yeniden yükle
        await loadData()
        return
      }
      
      // Regenerate tasks for new listings
      const newTasks = []
      updatedListings.forEach(listing => {
        const existingTasks = tasks.filter(t => t.listingId === listing.id)
        if (existingTasks.length === 0) {
          const listingTasks = generateCallTasks(listing)
          listingTasks.forEach(task => {
            task.listingId = listing.id
            task.id = `${listing.id}-${task.type}`
          })
          newTasks.push(...listingTasks)
        } else {
          newTasks.push(...existingTasks)
        }
      })
      setTasks(newTasks)

      // Regenerate notifications (şimdilik devre dışı)
      setNotifications([])
      
      console.log(`[Listings] ${updatedListings.length} adet ilan güncellendi`)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Supabase] Listings güncelleme hatası:', error)
      }
    }
  }

  const updateTasks = (updatedTasks) => {
    setTasks(updatedTasks)
    // Tasks localStorage'da kalabilir (şimdilik)

    // Regenerate notifications (şimdilik devre dışı)
    setNotifications([])
  }

  const updateBuyerRequests = (updatedRequests) => {
    setBuyerRequests(updatedRequests)
    // Buyer requests localStorage'da kalabilir (şimdilik)
    storage.set(STORAGE_KEYS.BUYER_REQUESTS, updatedRequests)
  }

  const updateNotifications = (updatedNotifications) => {
    setNotifications(updatedNotifications)
    // Notifications localStorage'da kalabilir (şimdilik)
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '24px' }}>📊</div>
        <div>Veriler yükleniyor...</div>
      </div>
    )
  }

  return (
    <Dashboard
      user={user}
      listings={listings}
      tasks={tasks}
      buyerRequests={buyerRequests}
      notifications={notifications}
      onLogout={handleLogout}
      onUpdateListings={updateListings}
      onUpdateTasks={updateTasks}
      onUpdateBuyerRequests={updateBuyerRequests}
      onUpdateNotifications={updateNotifications}
    />
  )
}

export default App
