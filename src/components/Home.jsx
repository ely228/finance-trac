import { useState } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import TransactionList from './TransactionList'
import AnimatedNumber from './AnimatedNumber'
import { formatMoney } from '../utils'

const PALETTE = ['#9C87D6', '#E888AC', '#F3AF77', '#6FBFA6', '#82A9D6', '#D89ACB', '#E0B15C', '#8FC3C9']

function Sparkline({ points }) {
  if (!points || points.length < 2) return null
  const max = Math.max(...points.map(p => p.total), 1)
  const w = 100, h = 40
  const step = w / (points.length - 1)
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step},${h - (p.total / max) * h}`).join(' ')
  return (
    <svg width="100%" height="56" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="spark-wrap">
      <path d={path} fill="none" stroke="var(--lavender-dark)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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

export default function Home({
  transactions, monthLabelText, onPrevMonth, onNextMonth, onChanged, onOpenDashboard, onAdd,
  prevTotals, trend, greeting,
}) {
  const [hidden, setHidden] = useState(false)

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expense

  const byCategory = {}
  for (const t of transactions.filter(t => t.type === 'expense')) {
    byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount)
  }
  const catEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const pieData = catEntries.map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }))
  const topCats = catEntries.slice(0, 4)
  const maxCat = topCats[0]?.[1] || 1

  const pctChange = (curr, prev) => {
    if (!prev) return null
    return Math.round(((curr - prev) / prev) * 100)
  }
  const incomeChange = prevTotals ? pctChange(income, prevTotals.income) : null
  const expenseChange = prevTotals ? pctChange(expense, prevTotals.expense) : null
  const balanceChange = prevTotals ? pctChange(balance, prevTotals.income - prevTotals.expense) : null

  const money = v => hidden ? '••••• ₽' : formatMoney(v)

  return (
    <div className="home-grid">
      {/* ---- balance hero ---- */}
      <div className="hero g-balance">
        <div className="hero-orb o1" /><div className="hero-orb o2" />
        <div className="hero-top">
          <div>
            <div className="hero-label">Баланс · {monthLabelText}</div>
            <div className="hero-balance">
              {hidden ? '••••• ₽' : <AnimatedNumber value={balance} format={v => formatMoney(v)} />}
            </div>
          </div>
          <button className="hero-eye" onClick={() => setHidden(h => !h)} aria-label="Скрыть баланс">
            <EyeIcon off={hidden} />
          </button>
        </div>
        <div className="hero-month-nav">
          <button onClick={onPrevMonth} aria-label="Предыдущий месяц">‹</button>
          <button onClick={onNextMonth} aria-label="Следующий месяц">›</button>
        </div>
      </div>

      {/* ---- greeting card (desktop only) ---- */}
      <div className="card g-greeting greeting-card">
        <div>
          <div className="greeting-date">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <div className="greeting-title">{greeting} 👋</div>
        </div>
        <button className="cta-btn" onClick={onAdd}>
          + Новая операция
        </button>
      </div>

      {/* ---- compact income / expense duo (mobile) ---- */}
      <div className="quick-duo g-quick">
        <div className="quick-card income">
          <div className="qc-top"><span className="qc-label">Доходы</span><span className="qc-arrow">↑</span></div>
          <div className="qc-value">{money(income)}</div>
        </div>
        <div className="quick-card expense">
          <div className="qc-top"><span className="qc-label">Расходы</span><span className="qc-arrow">↓</span></div>
          <div className="qc-value">{money(expense)}</div>
        </div>
      </div>

      {/* ---- CTA (mobile) ---- */}
      <button className="cta-btn g-cta" onClick={onAdd}>+ Новая операция</button>

      {/* ---- spending breakdown ---- */}
      <div className="card chart-card g-spending">
        <h2>Куда уходят деньги</h2>
        {pieData.length === 0 ? (
          <p className="muted">Пока нет расходов за этот месяц.</p>
        ) : (
          <>
            <div className="donut-wrap" onClick={onOpenDashboard} title="Открыть дашборд">
              <PieChart width={180} height={180}>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={82} paddingAngle={3} stroke="none" onClick={onOpenDashboard}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
              <div className="donut-center">
                <div className="val">{money(expense)}</div>
                <div className="lbl">расходы</div>
              </div>
            </div>
            <div className="top-cats">
              {topCats.map(([name, val], i) => (
                <div className="top-cat-row" key={name}>
                  <span className="top-cat-name">{name}</span>
                  <div className="top-cat-bar-bg">
                    <div className="top-cat-bar-fill" style={{ width: `${(val / maxCat) * 100}%`, background: PALETTE[i % PALETTE.length] }} />
                  </div>
                  <span className="top-cat-val">{money(val)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="g-recent">
        <TransactionList transactions={transactions} onChanged={onChanged} limit={8} title="Последние операции" />
      </div>

      {/* ---- monthly summary + trend (desktop only) ---- */}
      <div className="card g-summary">
        <h2>Текущий месяц</h2>
        <div className="summary-row">
          <div className="summary-left">
            <div className="summary-icon" style={{ background: 'var(--income-bg)', color: 'var(--income)' }}>↑</div>
            <span className="summary-name">Доходы</span>
          </div>
          <div>
            <span className="summary-value">{money(income)}</span>
            {incomeChange !== null && <span className={`summary-change ${incomeChange >= 0 ? 'up' : 'down'}`}>{incomeChange >= 0 ? '↑' : '↓'}{Math.abs(incomeChange)}%</span>}
          </div>
        </div>
        <div className="summary-row">
          <div className="summary-left">
            <div className="summary-icon" style={{ background: 'var(--expense-bg)', color: 'var(--expense)' }}>↓</div>
            <span className="summary-name">Расходы</span>
          </div>
          <div>
            <span className="summary-value">{money(expense)}</span>
            {expenseChange !== null && <span className={`summary-change ${expenseChange <= 0 ? 'up' : 'down'}`}>{expenseChange >= 0 ? '↑' : '↓'}{Math.abs(expenseChange)}%</span>}
          </div>
        </div>
        <div className="summary-row">
          <div className="summary-left">
            <div className="summary-icon" style={{ background: 'rgba(199,185,234,0.25)', color: 'var(--lavender-dark)' }}>=</div>
            <span className="summary-name">Баланс</span>
          </div>
          <div>
            <span className="summary-value">{money(balance)}</span>
            {balanceChange !== null && <span className={`summary-change ${balanceChange >= 0 ? 'up' : 'down'}`}>{balanceChange >= 0 ? '↑' : '↓'}{Math.abs(balanceChange)}%</span>}
          </div>
        </div>
        {trend && trend.length > 1 && (
          <>
            <h2 style={{ marginTop: 20 }}>Расходы за 7 дней</h2>
            <Sparkline points={trend} />
          </>
        )}
      </div>
    </div>
  )
}
