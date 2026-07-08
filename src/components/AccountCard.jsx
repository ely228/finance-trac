import { supabase } from '../supabaseClient'

export default function AccountCard({ email }) {
  const initial = (email || '?').trim().charAt(0).toUpperCase()

  async function handleLogout() {
    if (!confirm('Выйти из аккаунта?')) return
    await supabase.auth.signOut()
  }

  return (
    <div className="card">
      <h2>Аккаунт</h2>
      <div className="account-row">
        <div className="account-avatar">{initial}</div>
        <div className="account-email">{email}</div>
      </div>
      <button className="logout-btn" onClick={handleLogout}>Выйти из аккаунта</button>
    </div>
  )
}
