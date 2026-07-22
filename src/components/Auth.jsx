import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth({ showToast }) {
  const [mode, setMode] = useState('welcome') // 'welcome' | 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      if (err) setError(err.message === 'Invalid login credentials' ? 'Неверный email или пароль' : err.message)
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

  if (mode === 'welcome') {
    return (
      <div className="auth-wrap welcome-mode">
        <div className="card auth-card welcome-card">
          <div className="auth-welcome-hero">
            <img src="/images/wallet.png" alt="Fin Trac Wallet" className="auth-welcome-wallet" />
            <h1 className="auth-welcome-title">Fin Trac</h1>
            <p className="auth-welcome-subtitle">Личный трекер доходов и расходов с премиальным мобильным интерфейсом</p>
          </div>

          <div className="auth-welcome-buttons">
            <button className="auth-welcome-btn primary" onClick={() => setMode('signin')}>
              Войти
            </button>
            <button className="auth-welcome-btn secondary" onClick={() => setMode('signup')}>
              Зарегистрироваться
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <button className="auth-back-btn" onClick={() => { setMode('welcome'); setError(''); setInfo(''); }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Назад</span>
        </button>

        <div className="brand-mark" style={{ display: 'none' }} />
        <h1>{mode === 'signin' ? 'Вход в Fin Trac' : 'Создать аккаунт'}</h1>
        <p className="sub muted">Личный доступ к твоим финансам с любого устройства</p>

        <form className="form" onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />

          <label>Пароль</label>
          <input type="password" required autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                 value={password} onChange={e => setPassword(e.target.value)} />

          {error && <div className="error">{error}</div>}
          {info && <div className="error" style={{ color: 'var(--income)' }}>{info}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Секунду…' : mode === 'signin' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-divider">
          <span>или войдите через</span>
        </div>

        <div className="social-auth-buttons">
          <button className="social-auth-btn google-btn" type="button" onClick={() => handleSocialClick('Google')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: '6px' }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span>Google</span>
          </button>

          <button className="social-auth-btn apple-btn" type="button" onClick={() => handleSocialClick('Apple')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#000000', marginRight: '6px' }}>
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z" />
            </svg>
            <span>Apple</span>
          </button>
        </div>

        <div className="auth-switch">
          {mode === 'signin' ? (
            <>Нет аккаунта? <button className="link-btn" onClick={() => { setMode('signup'); setError(''); setInfo('') }}>Создать</button></>
          ) : (
            <>Уже есть аккаунт? <button className="link-btn" onClick={() => { setMode('signin'); setError(''); setInfo('') }}>Войти</button></>
          )}
        </div>
      </div>
    </div>
  )
}
