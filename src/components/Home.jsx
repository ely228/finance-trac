import { useState } from 'react'
import AnimatedNumber from './AnimatedNumber'
import ConfirmDialog from './ConfirmDialog'
import { supabase } from '../supabaseClient'
import { formatMoney, categoryStyle, currentMonthKey, monthLabel, formatRelativeDate } from '../utils'
import CategoryIcon, { categoryMeta } from './CategoryIcon'

const EyeIcon = ({ off }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {off ? (
      <>
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.6 20.6 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.6 20.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
)

export default function Home({ transactions, categories = [], email, onChanged, onOpenDashboard, onAdd, onViewAllTransactions, prevTotals }) {
  const [hidden, setHidden] = useState(false)
  const [pending, setPending] = useState(null)

  async function confirmDelete() {
    if (!pending) return
    await supabase.from('transactions').delete().eq('id', pending.id)
    setPending(null)
    onChanged()
  }

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expense

  const money = v => hidden ? '••••• ₽' : formatMoney(v)

  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)
  const userName = (email || '').split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Алексей'

  // Format current month specifically as "Июль 2026 г." with low-case "г."
  const monthRaw = monthLabel(currentMonthKey()) // e.g. "июль 2026 г." or similar
  const formattedCurrentMonth = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1) // "Июль 2026 г."

  // Dynamic greeting based on current hour
  const hour = new Date().getHours()
  const salutation = hour < 6 ? 'Добрый ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'

  // Calculate "Финансовый инсайт" dynamically based on current expense vs prevTotals.expense
  let insightText = null
  const currentExpense = expense
  const prevExpense = prevTotals ? prevTotals.expense : 0

  if (prevExpense > 0 && currentExpense > 0) {
    const procent = Math.round(((prevExpense - currentExpense) / prevExpense) * 100)

    // Get past month name
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    const prevMonthName = d.toLocaleDateString('ru-RU', { month: 'long' }) // e.g. "июне" in prepositional or similar, but let's translate to correct form or use general prep.
    // For general month matching like "в июне", let's format safely
    let prevMonthLocative = prevMonthName
    const monthPrepositional = {
      'январь': 'январе', 'февраль': 'феврале', 'март': 'марте', 'апрель': 'апреле', 'май': 'мае', 'июнь': 'июне',
      'июль': 'июле', 'август': 'августе', 'сентябрь': 'сентябре', 'октябрь': 'октябре', 'ноябрь': 'ноябре', 'декабрь': 'декабре'
    }
    const cleanMonth = prevMonthName.toLowerCase().trim()
    if (monthPrepositional[cleanMonth]) {
      prevMonthLocative = monthPrepositional[cleanMonth]
    }

    if (procent > 0) {
      insightText = `Вы потратили на ${procent}% меньше, чем в ${prevMonthLocative}.`
    } else if (procent < 0) {
      insightText = `Вы потратили на ${Math.abs(procent)}% больше, чем в ${prevMonthLocative}.`
    }
  }

  return (
    <div className="home-grid">
      {/* Grouping header/balance/insight on the left, recent transactions on the right for widescreen/PC */}
      <div className="home-main-col">
        <header className="home-greeting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: '8px' }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-soft)', margin: 0 }}>{salutation},</p>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '24px', fontWeight: 800, margin: '4px 0 0' }}>
              {userName} 👋
            </h1>
          </div>
          <button className="notification-btn" aria-label="Уведомления" style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', color: 'var(--ink)' }}>
              <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
            </svg>
            <i style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3d6d', position: 'absolute', top: '10px', right: '10px', border: '1px solid #fff' }} />
          </button>
        </header>

        <div className="card hero-card g-balance" style={{ padding: '24px', background: '#FFFFFF', border: '1px solid var(--hairline)', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '0' }}>
          <div className="hero-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="hero-label" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ink-soft)' }}>Баланс</span>
            <button className="hero-eye" onClick={() => setHidden(h => !h)} aria-label="Скрыть баланс" style={{ width: '30px', height: '30px', border: 'none', background: '#F5F6FA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <EyeIcon off={hidden} />
            </button>
          </div>
          <div className="hero-date" style={{ fontSize: '11px', color: 'var(--ink-faint)', marginTop: '-8px' }}>{formattedCurrentMonth}</div>
          <div className="hero-balance-row" style={{ minHeight: '60px', margin: '4px 0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="hero-balance" style={{ fontSize: '36px', fontWeight: 800, color: 'var(--ink)' }}>
              {hidden ? '••••• ₽' : <AnimatedNumber value={balance} format={v => formatMoney(v)} />}
            </div>
            <img className="hero-wallet" src="/images/wallet.png" alt="" onError={e => { e.target.style.display = 'none' }} style={{ width: '100px', height: 'auto' }} />
          </div>

          <div className="hero-duo" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="hero-duo-item income" style={{ padding: '12px', borderRadius: '14px', background: '#F5F6FA', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="hdi-icon" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(55, 184, 145, 0.12)', color: '#37B891', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>↑</span>
              <div>
                <div className="hdi-label" style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ink-faint)' }}>Доходы</div>
                <div className="hdi-value" style={{ fontSize: '14px', fontWeight: 800, color: '#37B891', marginTop: '2px' }}>{money(income)}</div>
              </div>
            </div>
            <div className="hero-duo-item expense" style={{ padding: '12px', borderRadius: '14px', background: '#F5F6FA', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="hdi-icon" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(236, 93, 166, 0.12)', color: '#EC5DA6', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>↓</span>
              <div>
                <div className="hdi-label" style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ink-faint)' }}>Расходы</div>
                <div className="hdi-value" style={{ fontSize: '14px', fontWeight: 800, color: '#EC5DA6', marginTop: '2px' }}>{money(expense)}</div>
              </div>
            </div>
          </div>
          <button className="hero-cta" onClick={onAdd} style={{ padding: '14px', fontSize: '14px', fontWeight: 700, borderRadius: '14px', background: '#FFFFFF', color: 'var(--lavender-dark)', border: '1px solid var(--hairline)', cursor: 'pointer', textAlign: 'center', marginTop: '4px', width: '100%' }}>+ Новая операция</button>
        </div>

        {insightText && (
          <div className="card insight-card" style={{ padding: '16px', background: '#FFFFFF', border: '1px solid var(--hairline)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(184, 154, 244, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lavender-dark)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ink-faint)' }}>Финансовый инсайт</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>{insightText}</span>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-faint)' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        )}
      </div>

      <div className="recent-section" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="recent-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>Последние операции</span>
          <button className="see-all-link" onClick={onViewAllTransactions} style={{ fontSize: '13px', fontWeight: 700, color: 'var(--lavender-dark)', background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>Смотреть все</button>
        </div>

        {recent.length === 0 ? (
          <p className="muted" style={{ padding: '12px 4px', fontSize: '13px', color: 'var(--ink-faint)' }}>Пока нет операций за этот месяц.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recent.map(t => {
              const catData = categories.find(c => c.name === t.category)
              const style = categoryStyle(t.category)
              const customBg = catData && catData.color ? `rgba(${catData.color}, 0.16)` : style.bg
              const customFg = catData && catData.color ? `rgb(${catData.color})` : style.fg
              const customIcon = catData && catData.icon ? catData.icon : null

              return (
                <div key={t.id} className={`tx-row ${t.type}`} style={{ padding: '14px 4px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--hairline)' }}>
                  <div
                    className="tx-icon"
                    style={{
                      background: customBg,
                      color: customFg,
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '18px',
                      fontWeight: 'bold',
                      border: '1px solid rgba(0,0,0,0.03)'
                    }}
                  >
                    {customIcon ? customIcon : <CategoryIcon name={t.category} />}
                  </div>
                  <div className="tx-main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="tx-cat" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>{t.category}</span>
                    <span className="tx-comment" style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>{t.comment || categoryMeta(t.category).description}</span>
                  </div>
                  <div className="tx-right" style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="tx-amount" style={{ fontSize: '14px', fontWeight: 800, color: t.type === 'expense' ? 'var(--ink)' : 'var(--income)' }}>
                      {t.type === 'expense' ? '−' : '+'}{money(t.amount)}
                    </span>
                    <span className="tx-date" style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>{formatRelativeDate(t.date)}</span>
                  </div>
                  <button
                    className="tx-delete"
                    onClick={() => setPending(t)}
                    aria-label="Удалить"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--ink-faint)',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '4px',
                      marginLeft: '4px',
                      flexShrink: 0,
                      opacity: '0.4'
                    }}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {pending && (
        <ConfirmDialog
          title="Удалить операцию?"
          message={`«${pending.category}», ${formatMoney(pending.amount)} — это действие нельзя отменить.`}
          onConfirm={confirmDelete}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  )
}
