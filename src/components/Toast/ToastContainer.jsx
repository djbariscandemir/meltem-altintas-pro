import { useState, useCallback, useEffect } from 'react'
import Toast from './Toast'
import './Toast.css'

let toastIdCounter = 0
let toastListeners = []

export const toast = {
  success: (message, duration = 3000) => {
    const id = ++toastIdCounter
    toastListeners.forEach(listener => listener({ type: 'add', toast: { id, type: 'success', message, duration } }))
    return id
  },
  error: (message, duration = 4000) => {
    const id = ++toastIdCounter
    toastListeners.forEach(listener => listener({ type: 'add', toast: { id, type: 'error', message, duration } }))
    return id
  },
  warning: (message, duration = 3000) => {
    const id = ++toastIdCounter
    toastListeners.forEach(listener => listener({ type: 'add', toast: { id, type: 'warning', message, duration } }))
    return id
  },
  info: (message, duration = 3000) => {
    const id = ++toastIdCounter
    toastListeners.forEach(listener => listener({ type: 'add', toast: { id, type: 'info', message, duration } }))
    return id
  }
}

function ToastContainer() {
  const [toasts, setToasts] = useState([])

  const handleAddToast = useCallback((action) => {
    if (action.type === 'add') {
      setToasts(prev => [...prev, action.toast])
    }
  }, [])

  const handleRemoveToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    toastListeners.push(handleAddToast)
    return () => {
      toastListeners = toastListeners.filter(l => l !== handleAddToast)
    }
  }, [handleAddToast])

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={handleRemoveToast}
        />
      ))}
    </div>
  )
}

export default ToastContainer
