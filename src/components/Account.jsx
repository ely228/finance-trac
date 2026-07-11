import { supabase } from '../supabaseClient'

export default function Account({ email }) {
  const initial = (email || '?').trim().charAt(0).toUpperCase()

  async function handleLogout() {
    if (!confirm('Выйти из аккаунта?')) return
    await supabase.auth.signOut()
  }

  return (
    <div>
      <div className="topbar"><h1>Аккаунт</h1></div>

      <div className="card">
        <div className="account-hero">
          <div className="account-avatar-lg">{initial}</div>
          <div className="account-email-lg">{email}</div>
          <div className="account-sub">Личный доступ, вход по паролю</div>
        </div>
      </div>

      <div className="card">
        <h2>Сессия</h2>
        <button className="settings-row" onClick={handleLogout}>
          <span className="settings-icon danger">⏻</span>
          <span className="settings-label danger">Выйти из аккаунта</span>
        </button>
      </div>
    </div>
  )
}
