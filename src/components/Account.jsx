import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { formatMoney } from '../utils'
import { exportCSV, exportXLSX } from '../utils/export'

export default function Account({ email, transactions = [], monthLabelText = 'Июль 2026' }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [showExport, setShowExport] = useState(false)

  const userName = (email || '').split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Алексей'

  async function handleLogout() {
    if (!confirm('Выйти из аккаунта?')) return
    await supabase.auth.signOut()
  }

  // Calculate stats dynamically from transactions
  const safeTransactions = Array.isArray(transactions) ? transactions : []
  const totalOps = safeTransactions.length
  const totalExpenses = safeTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
  const totalIncomes = safeTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)

  // Style helper for settings list rows
  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 0',
    borderBottom: '1px solid var(--hairline)',
    cursor: 'pointer',
    userSelect: 'none'
  }

  const iconContainerStyle = {
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
    <div style={{ paddingBottom: '24px' }}>

      {/* Centered Registration Date (matching account_ref.jpg) */}
      <div style={{ textAlign: 'center', color: 'var(--ink-faint)', fontSize: '12.5px', fontWeight: 600, margin: '14px 0 20px' }}>
        Дата регистрации: 12.06.2026
      </div>

      {/* Reorganized operations/expenses/incomes card with vertical lines & rounded colored badges (matching account_ref.jpg) */}
      <div className="card" style={{ padding: '18px 12px', marginBottom: '22px', background: '#FFFFFF', borderRadius: '24px', boxShadow: 'var(--el-1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', textAlign: 'center' }}>

          {/* Column 1: Operations */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(124, 110, 242, 0.08)',
              color: '#7C6EF2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}>
              {/* Badge key outline SVG */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)' }}>
              {totalOps}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', marginTop: '4px' }}>
              Операций
            </span>
          </div>

          {/* Column 2: Expenses */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid rgba(0, 0, 0, 0.04)', borderRight: '1px solid rgba(0, 0, 0, 0.04)' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(196, 100, 224, 0.08)',
              color: '#C464E0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}>
              {/* Spline trend outline SVG */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', padding: '0 4px' }}>
              {formatMoney(totalExpenses)}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', marginTop: '4px' }}>
              Расходов
            </span>
          </div>

          {/* Column 3: Incomes */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.08)',
              color: '#22C55E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}>
              {/* Document/Plus outline SVG */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M12 10v4M10 12h4" />
              </svg>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', padding: '0 4px' }}>
              {formatMoney(totalIncomes)}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', marginTop: '4px' }}>
              Доходов
            </span>
          </div>

        </div>
      </div>

      {/* Settings Block Card (matching account_ref.jpg) */}
      <div className="card" style={{ padding: '8px 20px', background: '#FFFFFF', borderRadius: '24px', boxShadow: 'var(--el-1)' }}>

        {/* Row 1: Настройки профиля */}
        <div style={rowStyle} onClick={() => alert('Настройки профиля появятся в будущем обновлении')}>
          <span style={iconContainerStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
            Настройки профиля
          </span>
          <span className="settings-chevron" style={{ color: 'var(--ink-faint)', fontSize: '15px' }}>›</span>
        </div>

        {/* Row 2: Валюта */}
        <div style={rowStyle} onClick={() => alert('Смена валюты появится в будущем обновлении')}>
          <span style={iconContainerStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
            Валюта
          </span>
          <span style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600, marginRight: '4px' }}>
            Российский рубль (₽)
          </span>
          <span className="settings-chevron" style={{ color: 'var(--ink-faint)', fontSize: '15px' }}>›</span>
        </div>

        {/* Row 3: Тема */}
        <div style={rowStyle} onClick={() => alert('Переключение тем появится в будущем обновлении')}>
          <span style={iconContainerStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
            Тема
          </span>
          <span style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600, marginRight: '4px' }}>
            Светлая
          </span>
          <span className="settings-chevron" style={{ color: 'var(--ink-faint)', fontSize: '15px' }}>›</span>
        </div>

        {/* Row 4: Уведомления */}
        <div style={rowStyle} onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
          <span style={iconContainerStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
            Уведомления
          </span>
          <span style={{ fontSize: '12px', color: notificationsEnabled ? '#22C55E' : 'var(--ink-faint)', fontWeight: 700, marginRight: '4px' }}>
            {notificationsEnabled ? 'Включены' : 'Выключены'}
          </span>
          <span className="settings-chevron" style={{ color: 'var(--ink-faint)', fontSize: '15px' }}>›</span>
        </div>

        {/* Row 5: Экспорт данных (integrated dropdown triggers) */}
        <div style={{ ...rowStyle, borderBottom: showExport ? 'none' : '1px solid var(--hairline)' }} onClick={() => setShowExport(!showExport)}>
          <span style={iconContainerStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
            Экспорт данных
          </span>
          <span className="settings-chevron" style={{ color: 'var(--ink-faint)', fontSize: '15px', transform: showExport ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease' }}>›</span>
        </div>

        {/* Inline Export Download buttons */}
        {showExport && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '4px 0 14px 44px',
            borderBottom: '1px solid var(--hairline)',
            animation: 'rise-in 0.2s ease forwards'
          }}>
            <button
              onClick={() => {
                exportXLSX(safeTransactions, monthLabelText)
                setShowExport(false)
              }}
              style={{
                background: 'rgba(136, 101, 232, 0.06)',
                border: '1px solid rgba(136, 101, 232, 0.12)',
                color: '#8865E8',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '12.5px',
                fontWeight: 700,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              Скачать Excel (.xlsx)
            </button>
            <button
              onClick={() => {
                exportCSV(safeTransactions, monthLabelText)
                setShowExport(false)
              }}
              style={{
                background: 'rgba(136, 101, 232, 0.06)',
                border: '1px solid rgba(136, 101, 232, 0.12)',
                color: '#8865E8',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '12.5px',
                fontWeight: 700,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              Скачать CSV
            </button>
          </div>
        )}

        {/* Row 6: Выйти из аккаунта (last item, no emoji sticker, normal text, matching account_ref.jpg) */}
        <div style={{ ...rowStyle, borderBottom: 'none' }} onClick={handleLogout}>
          <span style={{ ...iconContainerStyle, background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 700, color: '#EF4444' }}>
            Выйти из аккаунта
          </span>
          <span className="settings-chevron" style={{ color: 'rgba(239, 68, 68, 0.4)', fontSize: '15px' }}>›</span>
        </div>

      </div>

    </div>
  )
}