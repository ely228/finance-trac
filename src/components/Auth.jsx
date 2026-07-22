import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth({ showToast }) {
  const [mode, setMode] = useState('welcome') // 'welcome' | 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    if (mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        setError(err.message === 'Invalid login credentials' ? 'Неверный email или пароль' : err.message)
      }
    } else {
      if (password.length < 6) {
        setError('Пароль должен быть не короче 6 символов')
        setLoading(false)
        return
      }
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) {
        setError(err.message)
      } else {
        setInfo('Готово! Если в проекте включено подтверждение почты — проверь письмо, затем войди.')
      }
    }
    setLoading(false)
  }

  function handleSocialClick(provider) {
    if (showToast) {
      showToast(`Вход через ${provider} появится в будущих обновлениях`)
    }
  }

  function handleForgotPassword() {
    if (showToast) {
      showToast('Функция восстановления пароля появится в будущих обновлениях')
    }
  }

  if (mode === 'welcome') {
    return (
      <div className="auth-outer welcome-screen">
        <div className="auth-container">
          {/* Top Wallet Image */}
          <div className="auth-hero-section">
            <img src="/images/wallet.png" alt="Wallet" className="auth-hero-wallet" />
          </div>

          {/* Title & Description */}
          <div className="auth-text-section">
            <h1 className="auth-main-title">Ваши финансы<br />под контролем</h1>
            <p className="auth-main-subtitle">
              Удобный учет доходов и расходов для достижения ваших целей
            </p>
          </div>

          {/* Page Dots Indicator */}
          <div className="auth-dots-container">
            <span className="auth-dot auth-dot-pill"></span>
            <span className="auth-dot"></span>
            <span className="auth-dot"></span>
            <span className="auth-dot"></span>
          </div>

          {/* Action Buttons */}
          <div className="auth-action-buttons">
            <button className="auth-primary-btn" onClick={() => setMode('signin')}>
              Войти
            </button>
            <button className="auth-secondary-btn" onClick={() => setMode('signup')}>
              Создать аккаунт
            </button>
          </div>

          {/* Disclaimer Text */}
          <div className="auth-disclaimer">
            Продолжая, вы соглашаетесь с{' '}
            <span className="auth-disclaimer-link">Условиями использования</span>{' '}
            и{' '}
            <span className="auth-disclaimer-link">Политикой конфиденциальности</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`auth-outer form-screen ${mode}-mode`}>
      <div className="auth-container">
        {/* Top Header Row with Back Button */}
        <div className="auth-top-header">
          <button
            className="auth-circular-back-btn"
            onClick={() => { setMode('welcome'); setError(''); setInfo(''); }}
            aria-label="Назад"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Titles */}
        <div className="auth-form-titles">
          <h1 className="auth-form-title">
            {mode === 'signin' ? 'Вход' : 'Регистрация'}
          </h1>
          <p className="auth-form-subtitle">
            {mode === 'signin' ? 'Добро пожаловать обратно' : 'Создайте новый аккаунт'}
          </p>
        </div>

        {/* Form */}
        <form className="auth-form-fields" onSubmit={handleSubmit}>
          {/* Email Input Field */}
          <div className="auth-input-wrapper">
            <span className="auth-input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              className="auth-custom-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input Field */}
          <div className="auth-input-wrapper">
            <span className="auth-input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              placeholder="Пароль"
              className="auth-custom-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="auth-password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Forgot Password Link (Sign-in mode only) */}
          {mode === 'signin' && (
            <div className="auth-forgot-password-row">
              <button
                type="button"
                className="auth-forgot-password-link"
                onClick={handleForgotPassword}
              >
                Забыли пароль?
              </button>
            </div>
          )}

          {/* Feedback/Error messages */}
          {error && <div className="auth-feedback-error">{error}</div>}
          {info && <div className="auth-feedback-info">{info}</div>}

          {/* Main Action Button */}
          <button type="submit" className="auth-form-submit-btn" disabled={loading}>
            {loading ? 'Секунду…' : mode === 'signin' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        {/* Divider "или" */}
        <div className="auth-form-divider">
          <span className="auth-divider-line"></span>
          <span className="auth-divider-text">или</span>
          <span className="auth-divider-line"></span>
        </div>

        {/* Social Auth Buttons */}
        <div className="auth-social-buttons-container">
          <button className="auth-social-btn" onClick={() => handleSocialClick('Apple')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="auth-social-apple-svg">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z" />
            </svg>
            Продолжить с Apple
          </button>

          <button className="auth-social-btn" onClick={() => handleSocialClick('Google')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="auth-social-google-svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Продолжить с Google
          </button>
        </div>

        {/* Footer switch text */}
        <div className="auth-footer-switcher">
          {mode === 'signin' ? (
            <>
              Нет аккаунта?{' '}
              <button
                type="button"
                className="auth-switcher-link"
                onClick={() => { setMode('signup'); setError(''); setInfo(''); }}
              >
                Создать
              </button>
            </>
          ) : (
            <>
              Уже есть аккаунт?{' '}
              <button
                type="button"
                className="auth-switcher-link"
                onClick={() => { setMode('signin'); setError(''); setInfo(''); }}
              >
                Войти
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
