// LocalStorage utilities
// NOT: Bu fonksiyonlar gelecekte Supabase/Backend API'ye taşınabilir
// İleride bu fonksiyonlar API çağrıları yapabilir, şimdilik localStorage kullanıyor

export const storage = {
  /**
   * Get data from storage (localStorage şimdilik, ileride API olabilir)
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} - Parsed data or default value
   */
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  
  /**
   * Set data to storage (localStorage şimdilik, ileride API olabilir)
   * @param {string} key - Storage key
   * @param {any} value - Data to store
   */
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      // İleride burada API çağrısı yapılabilir:
      // await api.saveListings(key, value)
    } catch (error) {
      console.error('Storage set error:', error)
    }
  },
  
  /**
   * Remove data from storage
   * @param {string} key - Storage key to remove
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Storage remove error:', error)
    }
  },
  
  /**
   * Clear all storage
   */
  clear: () => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Storage clear error:', error)
    }
  }
}

// Storage keys
export const STORAGE_KEYS = {
  USER: 'meltem-user',
  REMEMBER_ME: 'meltem-remember',
  MODE: 'meltem-mode',
  LISTINGS: 'meltem-listings',
  TASKS: 'meltem-tasks',
  BUYER_REQUESTS: 'meltem-buyer-requests',
  NOTIFICATIONS: 'meltem-notifications'
}
