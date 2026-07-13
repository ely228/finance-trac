import { useState } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import AnimatedNumber from './AnimatedNumber'
import ConfirmDialog from './ConfirmDialog'
import { supabase } from '../supabaseClient'
import { formatMoney, categoryStyle, currentMonthKey, monthLabel } from '../utils'
import CategoryIcon, { categoryMeta } from './CategoryIcon'

const PALETTE = ['#9C87D6', '#E8659E', '#D9822E', '#3F9C7E', '#5586BE', '#BD5FA6', '#B8862A', '#3E8C96']

const EyeIcon = ({ off }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export default function Home({ transactions, email, onChanged, onOpenDashboard, onAdd }) {
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

  const byCategory = {}
  for (const t of transactions.filter(t => t.type === 'expense')) {
    byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount)
  }
  const catEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const pieData = catEntries.map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }))
  const totalExpense = pieData.reduce((s, d) => s + d.value, 0) || 1

  const money = v => hidden ? '••••• ₽' : formatMoney(v)

  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
  const userName = (email || '').split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Алексей'
  const currentMonth = monthLabel(currentMonthKey())

  // Dynamic greeting based on current hour
  const hour = new Date().getHours()
  const salutation = hour < 6 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'

  return (
    <div className="home-grid">
      <header className="home-greeting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {/* Lighter and smaller greeting salutation */}
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', margin: 0 }}>{salutation},</p>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {userName} 👋
          </h1>
        </div>
        <button className="notification-btn" aria-label="Уведомления" style={{ width: '38px', height: '38px', borderRadius: '12px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
            <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
          </svg>
          <i style={{ width: '6px', height: '6px', right: '7px', top: '7px' }} />
        </button>
      </header>

      <div className="card hero-card g-balance" style={{ padding: '16px' }}>
        <div className="hero-top">
          <span className="hero-label">Баланс</span>
          <button className="hero-eye" onClick={() => setHidden(h => !h)} aria-label="Скрыть баланс" style={{ width: '30px', height: '30px' }}>
            <EyeIcon off={hidden} />
          </button>
        </div>
        <div className="hero-date" style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>{currentMonth}</div>
        <div className="hero-balance-row" style={{ minHeight: '60px', margin: '4px 0 12px' }}>
          <div className="hero-balance" style={{ fontSize: '32px' }}>
            {hidden ? '••••• ₽' : <AnimatedNumber value={balance} format={v => formatMoney(v)} />}
          </div>
          <img className="hero-wallet" src="/images/wallet.png" alt="" onError={e => { e.target.style.display = 'none' }} style={{ width: '140px' }} />
        </div>
        <div className="hero-duo" style={{ gap: '8px' }}>
          <div className="hero-duo-item income" style={{ padding: '8px 10px', borderRadius: 'var(--r-md)' }}>
            <span className="hdi-icon" style={{ width: '28px', height: '28px' }}>↑</span>
            <div>
              <div className="hdi-label" style={{ fontSize: '10.5px' }}>Доходы</div>
              <div className="hdi-value" style={{ fontSize: '13.5px' }}>{money(income)}</div>
            </div>
          </div>
          <div className="hero-duo-item expense" style={{ padding: '8px 10px', borderRadius: 'var(--r-md)' }}>
            <span className="hdi-icon" style={{ width: '28px', height: '28px' }}>↓</span>
            <div>
              <div className="hdi-label" style={{ fontSize: '10.5px' }}>Расходы</div>
              <div className="hdi-value" style={{ fontSize: '13.5px' }}>{money(expense)}</div>
            </div>
          </div>
        </div>
        <button className="hero-cta" onClick={onAdd} style={{ padding: '10px 12px', fontSize: '14px', borderRadius: 'var(--r-sm)' }}>+ Новая операция</button>
      </div>

      <div className="card chart-card g-spending" style={{ padding: '16px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700 }}>Куда уходят деньги</h2>
        {pieData.length === 0 ? (
          <p className="muted" style={{ padding: '12px 0' }}>Пока нет расходов за этот месяц.</p>
        ) : (
          <div className="donut-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div className="donut-wrap glass-donut" onClick={onOpenDashboard} title="Открыть дашборд" style={{ width: 130, height: 130, flexShrink: 0 }}>
              <PieChart width={130} height={130}>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={46} outerRadius={63} paddingAngle={3} stroke="none" cornerRadius={4}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                </Pie>
              </PieChart>
            </div>
            <div className="legend-list" style={{ minWidth: '130px', flex: '1 1 130px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pieData.slice(0, 4).map(d => (
                <div className="legend-row" key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="legend-dot" style={{ background: d.color, width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 }} />
                  <span className="legend-name" style={{ fontSize: '12px', fontWeight: 700, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</span>
                  <span className="legend-pct" style={{ fontSize: '11px', color: 'var(--ink-faint)', width: '28px', textAlign: 'right' }}>{Math.round((d.value / totalExpense) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card g-recent" style={{ padding: '16px' }}>
        <div className="chart-card-head" style={{ marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Последние операции</h2>
          <button className="see-all-link" onClick={onOpenDashboard} style={{ fontSize: '12.5px' }}>Смотреть все</button>
        </div>
        {recent.length === 0 ? (
          <p className="muted" style={{ padding: '12px 0' }}>Пока нет операций за этот месяц.</p>
        ) : recent.map(t => {
          const style = categoryStyle(t.category)
          return (
            <div key={t.id} className={`tx-row ${t.type}`} style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                className="tx-icon" 
                style={{ 
                  background: style.bg, 
                  color: style.fg,
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CategoryIcon name={t.category} />
              </div>
              <div className="tx-main" style={{ flex: 1, minWidth: 0 }}>
                <span className="tx-cat" style={{ fontSize: '13.5px', fontWeight: 700 }}>{t.category}</span>
                <span className="tx-comment" style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>{t.comment || categoryMeta(t.category).description}</span>
              </div>
              <div className="tx-right" style={{ textAlign: 'right', flexShrink: 0 }}>
                <span className="tx-amount" style={{ fontSize: '13px', fontWeight: 700 }}>{t.type === 'expense' ? '−' : '+'}{money(t.amount)}</span>
                <span className="tx-date" style={{ fontSize: '10.5px', color: 'var(--ink-faint)' }}>{new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
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
                  flexShrink: 0
                }}
              >
                ✕
              </button>
            </div>
          )
        })}
        {pending && (
          <ConfirmDialog
            title="Удалить операцию?"
            message={`«${pending.category}», ${formatMoney(pending.amount)} — это действие нельзя отменить.`}
            onConfirm={confirmDelete}
            onCancel={() => setPending(null)}
          />
        )}
      </div>
    </div>
  )
}
