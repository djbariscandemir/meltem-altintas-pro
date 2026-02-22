import { useState, useEffect, useRef } from 'react'
import Login from './components/Login/Login'
import Signup from './components/Signup/Signup'
import Dashboard from './components/Dashboard/Dashboard'
import ToastContainer from './components/Toast/ToastContainer'
import { storage, STORAGE_KEYS } from './utils/storage'
import { supabase } from './utils/supabase'
import { fetchAllListings } from './services/listingsRepository'
import { fetchAllNotes } from './services/notesRepository'
import { fetchProfileByUserId, upsertProfile } from './services/profilesRepository'
import { generateCallTasks, generateNotifications } from './data/mockData'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [listings, setListings] = useState([])
  const [tasks, setTasks] = useState([])
  const [buyerRequests, setBuyerRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [authView, setAuthView] = useState('login')

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
      // Uygulama açılışında profile'dan rolü yenile
      ;(async () => {
        const profile = await ensureProfileForUser(savedUser)
        if (!profile) {
          setRole(null)
          return
        }
        const finalUser = mergeUserWithProfileRole(savedUser, profile)
        setUser(finalUser)
        storage.set(STORAGE_KEYS.USER, finalUser)
      })()
    }

    // Load data from Supabase (sadece 1 kez)
    loadData()
  }, [])

  // Supabase Realtime: listings tablosu değişince (parse worker vb.) listeyi yenile
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('listings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, () => {
        loadData()
      })
    channel.subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

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

  const ensureProfileForUser = async (appUser) => {
    try {
      if (!appUser?.id) {
        setProfileLoading(false)
        return null
      }

      setProfileLoading(true)
      const existing = await fetchProfileByUserId(appUser.id)
      if (existing) {
        const resolvedRole = (existing.role ?? existing.rol) ?? 'user'
        console.log('[AUTH] profile full:', existing)
        console.log('[AUTH] profile.role:', existing.role ?? existing.rol)
        console.log('[AUTH] resolved role:', resolvedRole)
        console.log('[AUTH] isProfileLoading:', false)
        setRole(resolvedRole)
        setProfileLoading(false)
        return existing
      }

      const payload = {
        id: appUser.id,
        ad: appUser.firstName || null,
        soyad: appUser.lastName || null,
        email: appUser.email || '',
        telefon: null,
        dogum_tarihi: null,
        rol: appUser.role || 'user',
        calisma_baslangic_tarihi: null,
        sorumlu_bolgeler: null
      }

      const created = await upsertProfile(payload)
      const resolvedRole = (created.role ?? created.rol) ?? 'user'
      console.log('[AUTH] profile full:', created)
      console.log('[AUTH] profile.role:', created.role ?? created.rol)
      console.log('[AUTH] resolved role:', resolvedRole)
      console.log('[AUTH] isProfileLoading:', false)
      setRole(resolvedRole)
      setProfileLoading(false)
      return created
    } catch (e) {
      console.warn('[App] ensureProfileForUser error:', e)
      setRole(null)
      setProfileLoading(false)
      return null
    }
  }

  const mergeUserWithProfileRole = (appUser, profile) => {
    const roleFromProfile = (profile?.role ?? profile?.rol) ?? 'user'
    const finalUser = { ...appUser, role: roleFromProfile }
    if (import.meta.env.DEV) {
      console.log('[AUTH] current role:', roleFromProfile)
    }
    return finalUser
  }

  const handleLogin = async (loggedInUser) => {
    const profile = await ensureProfileForUser(loggedInUser)
    const finalUser = mergeUserWithProfileRole(loggedInUser, profile)
    setUser(finalUser)
    storage.set(STORAGE_KEYS.USER, finalUser)
    const allNotifications = storage.get(STORAGE_KEYS.NOTIFICATIONS) || []
    const userNotifications = allNotifications.filter(n => n.userId === finalUser.id)
    setNotifications(userNotifications)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (_) {}
    storage.remove(STORAGE_KEYS.USER)
    setUser(null)
  }

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser)
    storage.set(STORAGE_KEYS.USER, updatedUser)
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
    if (authView === 'signup') {
      return (
        <Signup
          onSignup={handleLogin}
          onGoToLogin={() => setAuthView('login')}
        />
      )
    }
    return (
      <Login
        onLogin={handleLogin}
        onGoToSignup={() => setAuthView('signup')}
      />
    )
  }

  // Sadece fetch süresince loading göster
  if (loading || profileLoading) {
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

  // Dashboard erişimi: sadece broker ve admin
  if (user && role !== 'admin' && role !== 'broker') {
    if (import.meta.env.DEV) {
      console.log('[AUTH] current role (no dashboard):', role)
    }
    return (
      <>
        <ToastContainer />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>Bu ekran sadece broker ve admin kullanıcılar içindir.</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Lütfen yetkili bir kullanıcıdan size uygun rolü atamasını isteyin.
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <ToastContainer />
      <Dashboard
        user={user}
        listings={listings}
        tasks={tasks}
        buyerRequests={buyerRequests}
        notifications={notifications}
        onLogout={handleLogout}
        onProfileUpdate={handleProfileUpdate}
        onUpdateListings={updateListings}
        onUpdateTasks={updateTasks}
        onUpdateBuyerRequests={updateBuyerRequests}
        onUpdateNotifications={updateNotifications}
      />
    </>
  )
}

export default App
