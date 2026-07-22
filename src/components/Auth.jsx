import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
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
