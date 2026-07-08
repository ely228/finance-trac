import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
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

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="brand-mark" />
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
