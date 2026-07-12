import { supabase } from '../supabaseClient'
import { formatMoney } from '../utils'

export default function Account({ email, transactions = [] }) {
  const userName = (email || '').split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Алексей'
  const initial = (userName || '?').trim().charAt(0).toUpperCase()

  async function handleLogout() {
    if (!confirm('Выйти из аккаунта?')) return
    await supabase.auth.signOut()
  }

  // Calculate stats dynamically from transactions
  const safeTransactions = Array.isArray(transactions) ? transactions : []
  const totalOps = safeTransactions.length
  const totalExpenses = safeTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
  const totalIncomes = safeTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)

  // Find favorite category by spending amount
  const categorySpending = {}
  safeTransactions.filter(t => t.type === 'expense').forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + Number(t.amount)
  })
  let favCategory = '—'
  let maxSpending = 0
  Object.entries(categorySpending).forEach(([cat, amount]) => {
    if (amount > maxSpending) {
      maxSpending = amount
      favCategory = cat
    }
  })

  return (
    <div>
      <div className="topbar"><h1>Аккаунт</h1></div>

      {/* Profile Header */}
      <div className="card">
        <div className="account-hero">
          <div className="account-avatar-lg">{initial}</div>
          <div className="account-email-lg" style={{ fontSize: '20px', fontWeight: 800, marginTop: '8px' }}>{userName}</div>
          <div className="account-sub" style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '2px' }}>{email}</div>
          <div className="account-sub" style={{ fontSize: '12px', color: 'var(--ink-faint)', marginTop: '8px' }}>Дата регистрации: 12.06.2026</div>
        </div>
      </div>

      {/* Dynamic Stats Block */}
      <div className="card" style={{ padding: '8px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--hairline)' }}>
          <span className="settings-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '14px', fontWeight: 700 }}>Всего операций</span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>{totalOps}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--hairline)' }}>
          <span className="settings-icon" style={{ background: 'var(--expense-bg)', color: 'var(--expense)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '14px', fontWeight: 700 }}>Всего расходов</span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--expense)' }}>{formatMoney(totalExpenses)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--hairline)' }}>
          <span className="settings-icon" style={{ background: 'var(--income-bg)', color: 'var(--income)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '14px', fontWeight: 700 }}>Всего доходов</span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--income)' }}>{formatMoney(totalIncomes)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0' }}>
          <span className="settings-icon" style={{ background: 'rgba(255, 194, 135, 0.15)', color: 'var(--peach)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '14px', fontWeight: 700 }}>Любимая категория</span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>{favCategory}</span>
        </div>
      </div>

      {/* Inactive Settings Block */}
      <div className="card" style={{ padding: '8px 20px', cursor: 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--hairline)' }}>
          <span className="settings-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Настройки профиля</span>
          <span style={{ color: 'var(--ink-faint)', fontSize: '15px' }}>›</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--hairline)' }}>
          <span className="settings-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Экспорт данных</span>
          <span style={{ color: 'var(--ink-faint)', fontSize: '15px' }}>›</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--hairline)' }}>
          <span className="settings-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Помощь и поддержка</span>
          <span style={{ color: 'var(--ink-faint)', fontSize: '15px' }}>›</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0' }}>
          <span className="settings-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>О приложении</span>
          <span style={{ color: 'var(--ink-faint)', fontSize: '15px' }}>›</span>
        </div>
      </div>

      {/* Redesigned Logout Button */}
      <button className="logout-btn" onClick={handleLogout} style={{
        marginTop: '20px',
        width: '100%',
        padding: '14px',
        borderRadius: 'var(--r-md)',
        border: '1px solid rgba(226, 99, 122, 0.16)',
        background: 'rgba(226, 99, 122, 0.08)',
        fontWeight: '800',
        fontSize: '15px',
        color: 'var(--expense)',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.2s ease',
      }}>
        Выйти из аккаунта
      </button>
    </div>
  )
}
