import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { buildUserFromAuth } from '../../utils/authHelpers'
import { storage, STORAGE_KEYS } from '../../utils/storage'
import AppLogo from '../AppLogo/AppLogo'
import './Login.css'

function Login({ onLogin, onGoToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (authError) {
        setError(authError.message || 'E-posta veya şifre hatalı.')
        setLoading(false)
        return
      }

      if (!data?.user) {
        setError('Giriş yapılamadı.')
        setLoading(false)
        return
      }

      const appUser = buildUserFromAuth(data.user)
      if (!appUser) {
        setError('Kullanıcı bilgisi alınamadı.')
        setLoading(false)
        return
      }

      if (rememberMe) {
        storage.set(STORAGE_KEYS.REMEMBER_ME, { username: email.trim(), rememberMe: true })
      } else {
        storage.remove(STORAGE_KEYS.REMEMBER_ME)
      }

      storage.set(STORAGE_KEYS.USER, appUser)
      onLogin(appUser)
    } catch (err) {
      setError(err?.message || 'Beklenmeyen bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    setShowForgotPassword(true)
    setTimeout(() => {
      setShowForgotPassword(false)
      setError('Parola sıfırlama özelliği yakında eklenecektir.')
    }, 500)
  }

  useEffect(() => {
    const remembered = storage.get(STORAGE_KEYS.REMEMBER_ME)
    if (remembered?.rememberMe && remembered?.username) {
      setEmail(remembered.username)
      setRememberMe(true)
    }
  }, [])

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-wrapper">
            <AppLogo imgClassName="login-logo-img" fallbackClassName="login-logo-fallback" />
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
                type="email"
                placeholder="E-posta"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>

            {onGoToSignup && (
              <p className="login-signup-cta">
                Hesabınız yok mu?{' '}
                <button type="button" className="link-btn" onClick={onGoToSignup}>
                  Kaydol
                </button>
              </p>
            )}
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
