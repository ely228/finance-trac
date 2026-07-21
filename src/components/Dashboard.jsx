import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import ExportMenu from './ExportMenu'
import { formatMoney, daysInMonth, categoryStyle, categoryInitial, formatPercent, monthLabel, shiftMonth, currentMonthKey } from '../utils'
import CategoryIcon, { categoryMeta } from './CategoryIcon'

export default function Dashboard({ transactions, monthKey, onMonthChange, prevTotals }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const anchor = currentMonthKey()
  const monthOptions = Array.from({ length: 12 }, (_, i) => shiftMonth(anchor, -i))
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expense
  const change = (value, previous) => (!previous ? null : Math.round(((value - previous) / previous) * 100))
  const changes = prevTotals ? [change(income, prevTotals.income), change(expense, prevTotals.expense), change(balance, prevTotals.income - prevTotals.expense)] : []
  
  const totals = {}
  transactions.filter(t => t.type === 'expense').forEach(t => { totals[t.category] = (totals[t.category] || 0) + Number(t.amount) })
  const pieData = Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value, color: categoryStyle(name).fg }))
  const totalExpense = pieData.reduce((sum, item) => sum + item.value, 0) || 1
  
  const days = daysInMonth(monthKey)
  const dailyData = Array.from({ length: days }, (_, i) => {
    const day = i + 1
    const dayIncome = transactions
      .filter(t => t.type === 'income' && Number(t.date.slice(8, 10)) === day)
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const dayExpense = transactions
      .filter(t => t.type === 'expense' && Number(t.date.slice(8, 10)) === day)
      .reduce((sum, t) => sum + Number(t.amount), 0)
    return { day, income: dayIncome, expense: dayExpense }
  })

  let balanceRunning = 0
  const dailyBalanceData = Array.from({ length: days }, (_, i) => {
    const day = i + 1
    const dayIncome = transactions
      .filter(t => t.type === 'income' && Number(t.date.slice(8, 10)) === day)
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const dayExpense = transactions
      .filter(t => t.type === 'expense' && Number(t.date.slice(8, 10)) === day)
      .reduce((sum, t) => sum + Number(t.amount), 0)
    balanceRunning += (dayIncome - dayExpense)
    return { day, balance: balanceRunning }
  })

  return (
    <div className="dashboard-page">
      <div className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div className="dashboard-title-select" style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
          <h1 style={{ textTransform: 'capitalize', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontSize: '20px', fontWeight: 700 }}>
            {monthLabel(monthKey)}
            <span className="chev" style={{ fontSize: '15px', color: 'var(--ink-soft)', display: 'inline-block', transform: 'translateY(0.5px)' }}>⌄</span>
          </h1>
          <select value={monthKey} onChange={e => onMonthChange(e.target.value)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}>
            {monthOptions.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Stats Blocks */}
      <div className="kpi-row dashboard-kpis" style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {[
          ['income', '↑', 'Доходы', income],
          ['expense', '↓', 'Расходы', expense],
          ['balance', '=', 'Баланс', balance]
        ].map(([type, icon, label, value], i) => {
          const valStr = formatMoney(value)
          const len = valStr.length
          const dynamicStyle = {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            width: '100%',
            fontWeight: 800,
            fontSize: len > 12 
              ? 'clamp(10px, 3.2vw, 13px)' 
              : len > 9 
                ? 'clamp(12px, 3.8vw, 15px)' 
                : 'clamp(15px, 4.8vw, 19px)'
          }
          return (
            <div 
              className={`kpi ${type}`} 
              key={type} 
              title={valStr} 
              style={{ 
                padding: '12px 10px', 
                aspectRatio: '1 / 1', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                <div className="kpi-icon" style={{ width: '28px', height: '28px', fontSize: '12px', margin: 0 }}>{icon}</div>
                <div className="kpi-label" style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>{label}</div>
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div className="kpi-value" style={dynamicStyle}>{valStr}</div>
                {changes[i] !== null && changes[i] !== undefined && (
                  <span className={`kpi-change ${changes[i] >= 0 ? 'up' : 'down'}`} style={{ fontSize: '9px', padding: '2px 6px', margin: 0, display: 'inline-flex', alignSelf: 'flex-start', width: 'fit-content' }}>
                    {formatPercent(changes[i])}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Динамика доходов и расходов */}
      <section className="card chart-card dashboard-trend" style={{ marginTop: '12px', padding: '14px' }}>
        <div className="trend-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Динамика доходов и расходов</h2>
          <div className="trend-select-pill" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.5)', padding: '4px 10px', borderRadius: 'var(--r-sm)', fontSize: '12px', fontWeight: 700, color: 'var(--ink)', cursor: 'pointer', border: '1px solid var(--hairline)' }}>
            <span>По дням</span>
            <span style={{ fontSize: '10px', opacity: 0.7, transform: 'translateY(1px)', display: 'inline-block' }}>⌄</span>
            <select value="days" readOnly style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}>
              <option value="days">По дням</option>
            </select>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={115}>
          <LineChart data={dailyData} margin={{ top: 4, right: 5, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="#EFEAF7" vertical={false} />
            <XAxis dataKey="day" fontSize={9} stroke="#B7B2C6" tickLine={false} axisLine={false} interval={Math.ceil(days / 5) - 1} />
            <YAxis fontSize={9} stroke="#B7B2C6" tickLine={false} axisLine={false} width={34} />
            <Tooltip 
              formatter={(value, name) => [formatMoney(value), name === 'income' ? 'Доходы' : 'Расходы']}
              contentStyle={{ background: '#FFF', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            />
            <Line type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} name="income" />
            <Line type="monotone" dataKey="expense" stroke="#C464E0" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} name="expense" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Динамика баланса */}
      <section className="card chart-card dashboard-trend" style={{ marginTop: '12px', padding: '14px' }}>
        <div className="trend-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Динамика баланса</h2>
        </div>
        
        <ResponsiveContainer width="100%" height={115}>
          <AreaChart data={dailyBalanceData} margin={{ top: 4, right: 5, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C6EF2" stopOpacity=".24" />
                <stop offset="100%" stopColor="#7C6EF2" stopOpacity="0" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#EFEAF7" vertical={false} />
            <XAxis dataKey="day" fontSize={9} stroke="#B7B2C6" tickLine={false} axisLine={false} interval={Math.ceil(days / 5) - 1} />
            <YAxis fontSize={9} stroke="#B7B2C6" tickLine={false} axisLine={false} width={34} />
            <Tooltip 
              formatter={v => [formatMoney(v), 'Баланс']}
              contentStyle={{ background: '#FFF', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            />
            <Area type="monotone" dataKey="balance" stroke="#7C6EF2" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} fill="url(#balanceAreaFill)" name="balance" />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Side-by-side square categories row */}
      <div className="dashboard-pair" style={{ marginTop: '12px' }}>
        {/* Card 1: Расходы по категориям (Donut) */}
        <div className="card" style={{ padding: '12px', aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Расходы по категориям</h2>
          
          {pieData.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '6px' }}>
              <div className="donut-wrap glass-donut" style={{ width: 84, height: 84, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PieChart width={84} height={84}>
                  <Pie 
                    data={pieData} 
                    dataKey="value" 
                    nameKey="name" 
                    innerRadius={28} 
                    outerRadius={40} 
                    paddingAngle={3} 
                    stroke="none" 
                    cornerRadius={3} 
                    activeIndex={activeIndex} 
                    onClick={(_, i) => setActiveIndex(i)}
                  >
                    {pieData.map((item, i) => (
                      <Cell key={item.name} fill={item.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </div>

              {/* Side Legend list wrapped under donut */}
              <div className="legend-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 6px', justifyContent: 'center', width: '100%' }}>
                {pieData.slice(0, 3).map(item => (
                  <div className="legend-row" key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span className="legend-dot" style={{ background: item.color, width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0 }} />
                    <span className="legend-name" style={{ fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '38px' }}>{item.name}</span>
                    <span className="legend-pct" style={{ fontSize: '9px', color: 'var(--ink-faint)' }}>{Math.round(item.value / totalExpense * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="muted" style={{ padding: '12px 0', fontSize: '11px', margin: 0 }}>Нет расходов</p>
          )}
        </div>

        {/* Card 2: Топ категорий */}
        <div className="card" style={{ padding: '12px', aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Топ категорий</h2>
          
          {pieData.length ? (
            <div className="dashboard-top-categories" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, gap: '4px' }}>
              {pieData.slice(0, 3).map(item => {
                return (
                  <div className="cat-row" key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0', borderBottom: '1px solid rgba(42,39,64,0.02)' }}>
                    <div 
                      className="cat-avatar" 
                      style={{ 
                        background: `${item.color}14`,
                        color: item.color,
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <CategoryIcon name={item.name} style={{ width: '12px', height: '12px' }} />
                    </div>
                    <div className="cat-info" style={{ flex: 1, minWidth: 0 }}>
                      <div className="cat-name" style={{ fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                      <div className="cat-progress" style={{ marginTop: '3px', height: '3px', borderRadius: '2px' }}>
                        <div className="cat-progress-fill" style={{ height: '100%', borderRadius: '2px', width: `${item.value / totalExpense * 100}%`, background: item.color }} />
                      </div>
                    </div>
                    <div className="cat-numbers" style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="cat-amount" style={{ fontSize: '11px', fontWeight: 700 }}>{formatMoney(item.value)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="muted" style={{ padding: '12px 0', fontSize: '11px', margin: 0 }}>Нет расходов</p>
          )}
        </div>
      </div>
    </div>
  )
}
