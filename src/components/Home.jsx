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

  return (
    <div className="home-grid">
      <header className="home-greeting">
        <div><p>Добрый вечер,</p><h1>{userName} <span aria-hidden="true">👋</span></h1></div>
        <button className="notification-btn" aria-label="Уведомления"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg><i /></button>
      </header>
      <div className="card hero-card g-balance">
        <div className="hero-top">
          <span className="hero-label">Баланс</span>
          <button className="hero-eye" onClick={() => setHidden(h => !h)} aria-label="Скрыть баланс">
            <EyeIcon off={hidden} />
          </button>
        </div>
        <div className="hero-date">{currentMonth}</div>
        <div className="hero-balance-row">
          <div className="hero-balance">
            {hidden ? '••••• ₽' : <AnimatedNumber value={balance} format={v => formatMoney(v)} />}
          </div>
          <img className="hero-wallet" src="/images/wallet.png" alt="" onError={e => { e.target.style.display = 'none' }} />
        </div>
        <div className="hero-duo">
          <div className="hero-duo-item income">
            <span className="hdi-icon">↑</span>
            <div>
              <div className="hdi-label">Доходы</div>
              <div className="hdi-value">{money(income)}</div>
            </div>
          </div>
          <div className="hero-duo-item expense">
            <span className="hdi-icon">↓</span>
            <div>
              <div className="hdi-label">Расходы</div>
              <div className="hdi-value">{money(expense)}</div>
            </div>
          </div>
        </div>
        <button className="hero-cta" onClick={onAdd}>+ Новая операция</button>
      </div>

      <div className="card chart-card g-spending">
        <h2>Куда уходят деньги</h2>
        {pieData.length === 0 ? (
          <p className="muted">Пока нет расходов за этот месяц.</p>
        ) : (
          <div className="donut-row">
            <div className="donut-wrap" onClick={onOpenDashboard} title="Открыть дашборд">
              <PieChart width={130} height={130}>
                <defs>
                  {pieData.map((d, i) => <linearGradient key={d.name} id={`home-slice-${i}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity=".5" /><stop offset="28%" stopColor={d.color} /><stop offset="100%" stopColor={d.color} stopOpacity=".78" /></linearGradient>)}
                  <filter id="home-pie-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" /><feFlood floodColor="#9c7cf0" floodOpacity=".34" result="color" /><feComposite in="color" in2="blur" operator="in" result="shadow" /><feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={44} outerRadius={62} paddingAngle={3} stroke="none">
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
              <div className="donut-center">
                <div className="val">{money(expense)}</div>
                <div className="lbl">расходы</div>
              </div>
            </div>
            <div className="legend-list">
              {pieData.slice(0, 4).map(d => (
                <div className="legend-row" key={d.name}>
                  <span className="legend-dot" style={{ background: d.color }} />
                  <span className="legend-name">{d.name}</span>
                  <span className="legend-value">{money(d.value)}</span>
                  <span className="legend-pct">{Math.round((d.value / totalExpense) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card g-recent">
        <div className="chart-card-head">
          <h2 style={{ margin: 0 }}>Последние операции</h2>
          <button className="see-all-link" onClick={onOpenDashboard}>Смотреть все</button>
        </div>
        {recent.length === 0 ? (
          <p className="muted">Пока нет операций за этот месяц.</p>
        ) : recent.map(t => {
          const style = categoryStyle(t.category)
          return (
            <div key={t.id} className={`tx-row ${t.type}`}>
              <div className={`tx-icon category-icon ${categoryMeta(t.category).tone}`} style={{ color: style.fg }}><CategoryIcon name={t.category} /></div>
              <div className="tx-main">
                <span className="tx-cat">{t.category}</span>
                <span className="tx-comment">{t.comment || categoryMeta(t.category).description}</span>
              </div>
              <div className="tx-right">
                <span className="tx-amount">{t.type === 'expense' ? '−' : '+'}{money(t.amount)}</span>
                <span className="tx-date">{new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
              </div>
              <button className="tx-delete" onClick={() => setPending(t)} aria-label="Удалить">✕</button>
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
