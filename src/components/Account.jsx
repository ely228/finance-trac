import { supabase } from '../supabaseClient'
import { exportCSV, exportXLSX } from '../utils/export'

export default function Account({ email, transactions, monthLabelText }) {
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
        <h2>Экспорт данных</h2>
        <button className="settings-row" onClick={() => exportXLSX(transactions, monthLabelText)}>
          <span className="settings-icon">⬇</span>
          <span className="settings-label">Скачать Excel за {monthLabelText}</span>
          <span className="settings-chevron">›</span>
        </button>
        <button className="settings-row" onClick={() => exportCSV(transactions, monthLabelText)}>
          <span className="settings-icon">⬇</span>
          <span className="settings-label">Скачать CSV за {monthLabelText}</span>
          <span className="settings-chevron">›</span>
        </button>
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
