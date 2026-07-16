import { useState } from 'react'
import AnimatedNumber from './AnimatedNumber'
import ConfirmDialog from './ConfirmDialog'
import { supabase } from '../supabaseClient'
import { formatMoney, categoryStyle, currentMonthKey, monthLabel, formatRelativeDate, shiftMonth } from '../utils'
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

const ArrowUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
)

const ArrowDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
)

export default function Home({ transactions, categories = [], email, onChanged, onOpenDashboard, onAdd, onViewAllTransactions, prevTotals, monthKey }) {
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

  // Dynamic font size computation for income/expense to prevent wrapping
  const getDuoFontSize = (val) => {
    if (hidden) return '14px'
    const str = formatMoney(val)
    const len = str.replace(/\s/g, '').length
    if (len > 12) return '10.5px'
    if (len > 9) return '12px'
    return '14px'
  }

  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)

  const activeMonthKey = monthKey || currentMonthKey()
  const monthRaw = monthLabel(activeMonthKey) // e.g. "июль 2026 г."
  const formattedCurrentMonth = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1) // "Июль 2026 г."

  // Calculate "Финансовый инсайт" dynamically based on current expense vs prevTotals.expense
  let insightText = null
  const currentExpense = expense
  const prevExpense = prevTotals ? prevTotals.expense : 0

  if (prevExpense > 0 && currentExpense > 0) {
    const procent = Math.round(((prevExpense - currentExpense) / prevExpense) * 100)

    const prevKey = shiftMonth(activeMonthKey, -1)
    const [prevY, prevM] = prevKey.split('-').map(Number)
    const tempDate = new Date(prevY, prevM - 1, 1)
    const prevMonthName = tempDate.toLocaleDateString('ru-RU', { month: 'long' }) // e.g. "июнь"
    
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
    } else {
      insightText = `Вы потратили столько же, сколько в ${prevMonthLocative}.`
    }
  }

  return (
    <div className="home-grid">
      {/* Grouping header/balance/insight on the left, recent transactions on the right for widescreen/PC */}
      <div className="home-main-col">
        <header className="home-greeting" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 4px', marginBottom: '8px' }}>
          <button className="notification-btn" aria-label="Уведомления" style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', boxShadow: 'var(--el-1)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px', color: 'var(--ink)' }}>
              <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
            </svg>
            <i style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3d6d', position: 'absolute', top: '10px', right: '11px', border: '1px solid #fff' }} />
          </button>
        </header>

        <div className="card hero-card g-balance" style={{ padding: '16px', background: '#FFFFFF', border: '1px solid var(--hairline)', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '0', boxShadow: 'var(--el-1)' }}>
          <div className="hero-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="hero-label" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-soft)' }}>Баланс</span>
              <div className="hero-date" style={{ fontSize: '12px', color: 'var(--ink-faint)', marginTop: '2px' }}>{formattedCurrentMonth}</div>
            </div>
            <button className="hero-eye" onClick={() => setHidden(h => !h)} aria-label="Скрыть баланс" style={{ width: '34px', height: '34px', border: 'none', background: '#F5F6FA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <EyeIcon off={hidden} />
            </button>
          </div>
          
          <div className="hero-balance-row" style={{ minHeight: '52px', margin: '0 0 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <div className="hero-balance" style={{ fontSize: '36px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', zIndex: 1 }}>
              {hidden ? '••••• ₽' : <AnimatedNumber value={balance} format={v => formatMoney(v)} />}
            </div>
            <img className="hero-wallet" src="/images/wallet.png" alt="" onError={e => { e.target.style.display = 'none' }} style={{ width: '160px', height: 'auto', position: 'absolute', right: '-14px', top: '50%', transform: 'translateY(-50%)', opacity: 1 }} />
          </div>

          <div className="hero-duo" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div className="hero-duo-item income" style={{ padding: '8px 10px', borderRadius: '16px', background: '#F5F6FA', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <span className="hdi-icon" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(55, 184, 145, 0.12)', color: '#37B891', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ArrowUpIcon />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
                <div className="hdi-label" style={{ fontSize: '10px', fontWeight: 500, color: 'var(--ink-faint)' }}>Доходы</div>
                <div className="hdi-value" style={{ fontSize: getDuoFontSize(income), fontWeight: 800, color: '#37B891', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{money(income)}</div>
              </div>
            </div>
            <div className="hero-duo-item expense" style={{ padding: '8px 10px', borderRadius: '16px', background: '#F5F6FA', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <span className="hdi-icon" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(236, 93, 166, 0.12)', color: '#EC5DA6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ArrowDownIcon />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
                <div className="hdi-label" style={{ fontSize: '10px', fontWeight: 500, color: 'var(--ink-faint)' }}>Расходы</div>
                <div className="hdi-value" style={{ fontSize: getDuoFontSize(expense), fontWeight: 800, color: '#EC5DA6', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{money(expense)}</div>
              </div>
            </div>
          </div>
        </div>

        <button
          className="new-tx-btn"
          onClick={onAdd}
          style={{
            padding: '16px',
            fontSize: '15px',
            fontWeight: 700,
            borderRadius: '18px',
            background: '#FFFFFF',
            color: '#8865E8',
            border: '1px solid var(--hairline)',
            boxShadow: 'var(--el-1)',
            cursor: 'pointer',
            textAlign: 'center',
            width: '100%',
            marginTop: '12px'
          }}
        >
          + Новая операция
        </button>

        {insightText && (
          <div className="card insight-card" style={{ padding: '16px', background: '#FFFFFF', border: '1px solid var(--hairline)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0', marginTop: '16px', boxShadow: 'var(--el-1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #EBE5FC 0%, #C8B9FA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#8865E8' }}>
                  <path d="M12 2a1 1 0 0 0-1 1c0 4.5-3.5 8-8 8a1 1 0 0 0 0 2c4.5 0 8 3.5 8 8a1 1 0 0 0 2 0c0-4.5 3.5-8 8-8a1 1 0 0 0 0-2c-4.5 0-8-3.5-8-8a1 1 0 0 0-1-1z" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Финансовый инсайт</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ink-soft)', marginTop: '2px' }}>{insightText}</span>
              </div>
            </div>
            <span style={{ fontSize: '18px', color: 'var(--ink-faint)', marginLeft: 'auto', paddingLeft: '8px', cursor: 'default' }}>›</span>
          </div>
        )}
      </div>

      <div className="recent-section" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="recent-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginTop: '4px' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)' }}>Последние операции</span>
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
                    <span className="tx-amount" style={{ fontSize: '14px', fontWeight: 800, color: t.type === 'expense' ? 'var(--expense)' : 'var(--income)' }}>
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
