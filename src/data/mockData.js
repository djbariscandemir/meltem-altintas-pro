// Login için kullanılan basit demo kullanıcı listesi
// NOT: İlan verisi DEĞİL, sadece kimlik doğrulama için frontend tarafında tutuluyor.
export const mockUsers = [
  {
    id: '1',
    username: 'meltem',
    email: 'meltem@altintas.com',
    password: '123456',
    firstName: 'Meltem',
    lastName: 'Altıntaş',
    birthDate: '1985-05-15',
    role: 'broker',
    rememberMe: false
  },
  {
    id: '2',
    username: 'ahmet',
    email: 'ahmet@altintas.com',
    password: '123456',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    birthDate: '1990-08-20',
    role: 'consultant',
    rememberMe: false
  },
  {
    id: '3',
    username: 'ayse',
    email: 'ayse@altintas.com',
    password: '123456',
    firstName: 'Ayşe',
    lastName: 'Demir',
    birthDate: '1992-12-10',
    role: 'consultant',
    rememberMe: false
  }
]

// Arama görevlerini oluşturan yardımcı fonksiyon
export const generateCallTasks = (listing) => {
  const tasks = []
  
  // Hatırlatıcı kontrolü listing'den kaldırıldı - artık notes tablosundan çekilecek
  // Bu fonksiyon sadece listing_date bazlı görevler oluşturur
  
  // Güvenli tarih parse: listing_date veya createdAt (fallback)
  const listingDate = listing.listing_date || listing.createdAt
  const isoDate = listingDate && !isNaN(Date.parse(listingDate))
    ? new Date(listingDate).toISOString()
    : null
  
  // Tarih yoksa görev oluşturma (sessizce skip)
  if (!isoDate) {
    return tasks // Boş array döndür, crash etme
  }
  
  const createdAt = new Date(isoDate)
  const expirationDate = listing.expirationDate && !isNaN(Date.parse(listing.expirationDate))
    ? new Date(listing.expirationDate)
    : null
  
  // 1. gün araması
  const day1 = new Date(createdAt)
  day1.setDate(day1.getDate() + 1)
  tasks.push({
    id: `${listing.id}-task-1`,
    listingId: listing.id,
    type: 'day1',
    dueDate: day1.toISOString(),
    isCalled: false,
    calledAt: null,
    calledBy: null
  })

  // 3. gün araması
  const day3 = new Date(createdAt)
  day3.setDate(day3.getDate() + 3)
  tasks.push({
    id: `${listing.id}-task-2`,
    listingId: listing.id,
    type: 'day3',
    dueDate: day3.toISOString(),
    isCalled: false,
    calledAt: null,
    calledBy: null
  })

  if (expirationDate && !isNaN(expirationDate.getTime())) {
    // Sondan 1 gün önce
    const dayBeforeEnd = new Date(expirationDate)
    dayBeforeEnd.setDate(dayBeforeEnd.getDate() - 1)
    tasks.push({
      id: `${listing.id}-task-3`,
      listingId: listing.id,
      type: 'dayBeforeEnd',
      dueDate: dayBeforeEnd.toISOString(),
      isCalled: false,
      calledAt: null,
      calledBy: null
    })

    // Son gün araması
    tasks.push({
      id: `${listing.id}-task-4`,
      listingId: listing.id,
      type: 'endDay',
      dueDate: expirationDate.toISOString(),
      isCalled: false,
      calledAt: null,
      calledBy: null
    })
  }

  return tasks
}

// Bildirimleri oluşturan yardımcı fonksiyon
export const generateNotifications = (users, listings, tasks, buyerRequests) => {
  const notifications = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check birthdays
  users.forEach(user => {
    const birthDate = new Date(user.birthDate)
    const currentYear = today.getFullYear()
    birthDate.setFullYear(currentYear)
    
    if (birthDate.getTime() === today.getTime()) {
      notifications.push({
        id: `birthday-${user.id}`,
        type: 'birthday',
        userId: user.id,
        title: `${user.firstName} ${user.lastName} doğum günü!`,
        message: `${user.firstName}'in doğum gününü kutlayalım!`,
        createdAt: new Date().toISOString(),
        isRead: false
      })

      // Inform others
      users.forEach(otherUser => {
        if (otherUser.id !== user.id) {
          notifications.push({
            id: `birthday-info-${user.id}-${otherUser.id}`,
            type: 'birthday_info',
            userId: otherUser.id,
            title: 'Doğum Günü Hatırlatıcı',
            message: `${user.firstName} ${user.lastName}'ın doğum günü bugün!`,
            createdAt: new Date().toISOString(),
            isRead: false
          })
        }
      })
    }
  })

  // Check overdue tasks
  tasks.forEach(task => {
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(23, 59, 59, 999)
    
    if (!task.isCalled && dueDate < today) {
      const listing = listings.find(l => l.id === task.listingId)
      users.forEach(user => {
        notifications.push({
          id: `overdue-${task.id}-${user.id}`,
          type: 'overdue_task',
          userId: user.id,
          title: 'Geciken Görev',
          message: `${listing?.title || 'İlan'} için arama görevi gecikti!`,
          taskId: task.id,
          createdAt: new Date().toISOString(),
          isRead: false
        })
      })
    } else if (!task.isCalled && dueDate.getTime() === today.getTime()) {
      const listing = listings.find(l => l.id === task.listingId)
      users.forEach(user => {
        notifications.push({
          id: `due-today-${task.id}-${user.id}`,
          type: 'call_task',
          userId: user.id,
          title: 'Arama Görevi',
          message: `${listing?.title || 'İlan'} için bugün arama yapılmalı!`,
          taskId: task.id,
          createdAt: new Date().toISOString(),
          isRead: false
        })
      })
    }
  })

  return notifications
}
