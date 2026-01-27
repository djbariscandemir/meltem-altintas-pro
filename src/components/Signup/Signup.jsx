import { useState } from 'react'
import { supabase } from '../../utils/supabase'
import { buildUserFromAuth } from '../../utils/authHelpers'
import { storage, STORAGE_KEYS } from '../../utils/storage'
import AppLogo from '../AppLogo/AppLogo'
import '../Login/Login.css'
import './Signup.css'

function Signup({ onSignup, onGoToLogin }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim() } }
      })

      if (signUpError) {
        setError(signUpError.message || 'Kayıt sırasında bir hata oluştu.')
        setLoading(false)
        return
      }

      if (!signUpData?.user) {
        setError('Kayıt tamamlanamadı.')
        setLoading(false)
        return
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (signInError || !signInData?.user) {
        setError('Hesap oluşturuldu ancak giriş yapılamadı. Lütfen giriş yapın.')
        setLoading(false)
        return
      }

      const appUser = buildUserFromAuth(signInData.user)
      if (!appUser) {
        setError('Kullanıcı bilgisi alınamadı.')
        setLoading(false)
        return
      }

      storage.set(STORAGE_KEYS.USER, appUser)
      onSignup(appUser)
    } catch (err) {
      setError(err?.message || 'Beklenmeyen bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

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
          <p>Hesap oluştur</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Ad Soyad"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kaydol'}
          </button>

          <p className="signup-footer">
            Zaten hesabınız var?{' '}
            <button type="button" className="link-btn" onClick={onGoToLogin}>
              Giriş yap
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Signup
