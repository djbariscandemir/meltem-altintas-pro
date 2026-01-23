import { useState, useEffect } from 'react'
import { mockUsers } from '../../data/mockData'
import { storage, STORAGE_KEYS } from '../../utils/storage'
import './Login.css'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const user = mockUsers.find(
      u => (u.username === username || u.email === username) && u.password === password
    )

    if (!user) {
      setError('Kullanıcı adı veya şifre hatalı!')
      return
    }

    // Set remember me
    if (rememberMe) {
      storage.set(STORAGE_KEYS.REMEMBER_ME, { username, rememberMe: true })
    } else {
      storage.remove(STORAGE_KEYS.REMEMBER_ME)
    }

    // Remove password before storing
    const { password: _, ...userWithoutPassword } = user
    storage.set(STORAGE_KEYS.USER, userWithoutPassword)

    onLogin(userWithoutPassword)
  }

  const handleForgotPassword = () => {
    setShowForgotPassword(true)
    setTimeout(() => {
      alert('Parola sıfırlama linki e-posta adresinize gönderildi!')
      setShowForgotPassword(false)
    }, 500)
  }

  // Load remembered username
  useEffect(() => {
    const remembered = storage.get(STORAGE_KEYS.REMEMBER_ME)
    if (remembered?.rememberMe) {
      setUsername(remembered.username)
      setRememberMe(true)
    }
  }, [])

  const [logoLoaded, setLogoLoaded] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const handleLogoLoad = () => {
    setLogoLoaded(true)
    setLogoError(false)
  }

  const handleLogoError = () => {
    setLogoError(true)
    setLogoLoaded(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-wrapper">
            <img 
              src="/logo.png" 
              alt="Meltem Altıntaş Pro" 
              className={`login-logo-img ${logoLoaded ? 'logo-loaded' : ''} ${logoError ? 'logo-error' : ''}`}
              onLoad={handleLogoLoad}
              onError={handleLogoError}
              style={{ display: logoError ? 'none' : 'block' }}
            />
            {logoError && (
              <span className="login-logo-fallback">Meltem Altıntaş Pro</span>
            )}
          </div>
          <h1>
            <span className="brand-name">Meltem Altıntaş</span>
            <span className="brand-pro">Pro</span>
          </h1>
          <p>Emlak CRM Sistemi</p>
        </div>

        {!showForgotPassword ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Kullanıcı adı veya E-posta"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Beni Hatırla</span>
              </label>

              <button
                type="button"
                className="forgot-password-btn"
                onClick={handleForgotPassword}
              >
                Parolamı Unuttum
              </button>
            </div>

            <button type="submit" className="login-btn">
              Giriş Yap
            </button>

            <div className="login-demo">
              <p>Demo Hesaplar:</p>
              <p>Broker: meltem / 123456</p>
              <p>Danışman: ahmet / 123456</p>
            </div>
          </form>
        ) : (
          <div className="forgot-password-form">
            <p>Parola sıfırlama işlemi başlatılıyor...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
