import { useEffect } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'
import './Toast.css'

function Toast({ id, type, message, duration = 3000, onClose }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }

  const Icon = icons[type] || Info

  return (
    <div className={`toast toast-${type}`} role="alert">
      <div className="toast-icon">
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="toast-message">{message}</div>
      <button 
        className="toast-close"
        onClick={() => onClose(id)}
        aria-label="Kapat"
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  )
}

export default Toast
