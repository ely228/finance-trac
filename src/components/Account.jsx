import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { formatMoney } from '../utils'
import { exportCSV, exportXLSX } from '../utils/export'

export default function Account({ email, transactions = [], monthLabelText }) {
  const userName = (email || '').split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Алексей'
  const initial = (userName || '?').trim().charAt(0).toUpperCase()
  
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const exportRef = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportDropdown(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleLogout() {
    if (!confirm('Выйти из аккаунта?')) return
    await supabase.auth.signOut()
  }

  // Calculate stats dynamically from transactions
  const safeTransactions = Array.isArray(transactions) ? transactions : []
  const totalOps = safeTransactions.length
  const totalExpenses = safeTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
  const totalIncomes = safeTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)

  // Common styles for monochromatic settings icon circles
  const monoIconStyle = {
    background: 'rgba(31, 29, 47, 0.05)',
    color: 'var(--ink-soft)',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }

  return (
    <div>
      {/* Profile Header - Mounted at the very top of Account view */}
      <div className="card" style={{ padding: '24px', marginBottom: '22px', marginTop: '0px' }}>
        <div className="account-hero" style={{ padding: '12px 0' }}>
          <div className="account-avatar-lg" style={{ width: '64px', height: '64px', fontSize: '24px', marginBottom: '8px' }}>{initial}</div>
          <div className="account-email-lg" style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px', color: 'var(--ink)' }}>{userName}</div>
          <div className="account-sub" style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>{email}</div>
        </div>
      </div>

      {/* Redesigned Premium 3-Column Stats Plate Layout */}
      <div className="card" style={{ padding: '20px 10px', marginBottom: '22px', display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid var(--hairline)', borderRadius: '24px', boxShadow: 'var(--el-1)' }}>
        {/* Operations */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, minWidth: 0 }}>
          <div style={{
            background: 'rgba(136, 101, 232, 0.08)',
            color: '#8865E8',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="22" y1="22" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
            {totalOps}
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-faint)' }}>
            Операций
          </div>
        </div>

        {/* Divider 1 */}
        <div style={{ width: '1px', height: '42px', background: 'var(--hairline)', flexShrink: 0 }} />

        {/* Expenses */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, minWidth: 0 }}>
          <div style={{
            background: 'rgba(236, 93, 166, 0.08)',
            color: '#EC5DA6',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
            {formatMoney(totalExpenses)}
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-faint)' }}>
            Расходов
          </div>
        </div>

        {/* Divider 2 */}
        <div style={{ width: '1px', height: '42px', background: 'var(--hairline)', flexShrink: 0 }} />

        {/* Incomes */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, minWidth: 0 }}>
          <div style={{
            background: 'rgba(55, 184, 145, 0.08)',
            color: '#37B891',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
            {formatMoney(totalIncomes)}
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-faint)' }}>
            Доходов
          </div>
        </div>
      </div>

      {/* Interactive Settings Block */}
      <div className="card" style={{ padding: '8px 20px', cursor: 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0', borderBottom: '1px solid var(--hairline)' }}>
          <span style={monoIconStyle}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '13px', fontWeight: 700, color: 'var(--ink-soft)' }}>Настройки профиля</span>
          <span style={{ color: 'var(--ink-faint)', fontSize: '14px' }}>›</span>
        </div>

        {/* Fully Clickable Export Row */}
        <div
          ref={exportRef}
          onClick={() => setShowExportDropdown(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0', borderBottom: '1px solid var(--hairline)', cursor: 'pointer', position: 'relative' }}
        >
          <span style={monoIconStyle}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '13px', fontWeight: 700, color: 'var(--ink-soft)' }}>Экспорт данных</span>
          <span style={{ color: 'var(--ink-faint)', fontSize: '14px' }}>›</span>

          {showExportDropdown && (
            <div
              onClick={e => e.stopPropagation()}
              className="dropdown-menu"
              style={{
                position: 'absolute',
                top: 'calc(100% - 2px)',
                right: 0,
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid var(--hairline)',
                boxShadow: '0 10px 30px rgba(31, 29, 47, 0.12)',
                zIndex: 100,
                minWidth: '190px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                animation: 'rise-in 0.15s ease'
              }}
            >
              <button
                onClick={() => { exportXLSX(transactions, monthLabelText); setShowExportDropdown(false) }}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ink)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--mat-1-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Скачать Excel (.xlsx)
              </button>
              <button
                onClick={() => { exportCSV(transactions, monthLabelText); setShowExportDropdown(false) }}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ink)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--mat-1-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Скачать CSV
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0', borderBottom: '1px solid var(--hairline)' }}>
          <span style={monoIconStyle}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '13px', fontWeight: 700, color: 'var(--ink-soft)' }}>Помощь и поддержка</span>
          <span style={{ color: 'var(--ink-faint)', fontSize: '14px' }}>›</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0', borderBottom: '1px solid var(--hairline)' }}>
          <span style={monoIconStyle}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '13px', fontWeight: 700, color: 'var(--ink-soft)' }}>О приложении</span>
          <span style={{ color: 'var(--ink-faint)', fontSize: '14px' }}>›</span>
        </div>

        {/* Integrated Exit Row */}
        <div
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0', cursor: 'pointer' }}
        >
          <span style={{
            background: 'rgba(236, 93, 166, 0.08)',
            color: 'var(--expense)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '13px', fontWeight: 700, color: 'var(--expense)' }}>Выйти из аккаунта</span>
          <span style={{ color: 'var(--expense)', opacity: 0.5, fontSize: '14px' }}>›</span>
        </div>
      </div>
    </div>
  )
}
