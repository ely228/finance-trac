import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import ExportMenu from './ExportMenu'
import { formatMoney, daysInMonth, categoryStyle, categoryInitial, formatPercent, monthLabel, shiftMonth } from '../utils'
import CategoryIcon, { categoryMeta } from './CategoryIcon'

export default function Dashboard({ transactions, monthKey, onMonthChange, prevTotals }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const monthOptions = Array.from({ length: 12 }, (_, i) => shiftMonth(monthKey, -i))
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
  let running = 0
  const dayData = Array.from({ length: days }, (_, i) => {
    const day = i + 1
    running += transactions.filter(t => t.type === 'expense' && Number(t.date.slice(8, 10)) === day).reduce((sum, t) => sum + Number(t.amount), 0)
    return { day, total: running }
  })
  const avgPerDay = expense / days

  return (
    <div className="dashboard-page">
      <div className="topbar">
        <h1>Дашборд</h1>
        <div className="dashboard-actions">
          {/* Custom Date Selector Pill with Vector Icon */}
          <div className="date-pill" style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-soft)' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: '12.5px' }}>{monthLabel(monthKey)}</span>
            <span className="chev">⌄</span>
            <select value={monthKey} onChange={e => onMonthChange(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}>
              {monthOptions.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
          </div>
          <ExportMenu transactions={transactions} monthLabelText={monthLabel(monthKey)} />
        </div>
      </div>

      {/* KPI Stats Blocks */}
      <div className="kpi-row dashboard-kpis" style={{ marginBottom: '14px' }}>
        {[
          ['income', '↑', 'Доходы', income],
          ['expense', '↓', 'Расходы', expense],
          ['balance', '=', 'Баланс', balance]
        ].map(([type, icon, label, value], i) => {
          const valStr = formatMoney(value)
          const len = valStr.length
          // Larger, beautifully scaled KPI font sizes
          const dynamicStyle = {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            width: '100%',
            fontWeight: 800,
            fontSize: len > 12 
              ? 'clamp(13px, 3.8vw, 17px)' 
              : len > 9 
                ? 'clamp(16px, 4.4vw, 20px)' 
                : 'clamp(20px, 5.5vw, 24px)'
          }
          return (
            <div className={`kpi ${type}`} key={type} title={valStr} style={{ padding: '12px 10px' }}>
              <div className="kpi-icon" style={{ width: '28px', height: '28px', fontSize: '12px', marginBottom: '6px' }}>{icon}</div>
              <div className="kpi-label" style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{label}</div>
              <div className="kpi-value" style={dynamicStyle}>{valStr}</div>
              {changes[i] !== null && changes[i] !== undefined && (
                <span className={`kpi-change ${changes[i] >= 0 ? 'up' : 'down'}`} style={{ fontSize: '9px', padding: '2px 6px', marginTop: '4px' }}>
                  {formatPercent(changes[i])}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Unified Block combining Expenses by Categories & Top Categories */}
      <div className="card" style={{ padding: '16px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: 'var(--ink)' }}>Расходы по категориям</h2>
        
        {pieData.length ? (
          <div>
            {/* Top portion: Donut chart */}
            <div className="donut-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div className="donut-wrap glass-donut" style={{ width: 130, height: 130, position: 'relative' }}>
                <PieChart width={130} height={130}>
                  <Pie 
                    data={pieData} 
                    dataKey="value" 
                    nameKey="name" 
                    innerRadius={46} 
                    outerRadius={63} 
                    paddingAngle={3} 
                    stroke="none" 
                    cornerRadius={4} 
                    activeIndex={activeIndex} 
                    onClick={(_, i) => setActiveIndex(i)}
                  >
                    {pieData.map((item, i) => (
                      <Cell key={item.name} fill={item.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </div>

              {/* Side Legend list with explicit responsive fit */}
              <div className="legend-list" style={{ minWidth: '130px', flex: '1 1 130px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {pieData.slice(0, 4).map(item => (
                  <div className="legend-row" key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="legend-dot" style={{ background: item.color, width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 }} />
                    <span className="legend-name" style={{ fontSize: '12px', fontWeight: 700, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                    <span className="legend-pct" style={{ fontSize: '11px', color: 'var(--ink-faint)', width: '28px', textAlign: 'right' }}>{Math.round(item.value / totalExpense * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hairline Separator */}
            <div style={{ height: '1px', background: 'var(--hairline)', margin: '14px 0' }} />

            <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: 'var(--ink-soft)' }}>Топ категорий</h2>

            {/* Bottom portion: Top Categories list */}
            <div className="dashboard-top-categories">
              {pieData.slice(0, 4).map(item => {
                return (
                  <div className="cat-row" key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(42,39,64,0.03)' }}>
                    <div 
                      className="cat-avatar" 
                      style={{ 
                        background: `${item.color}1a`,
                        color: item.color,
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <CategoryIcon name={item.name} />
                    </div>
                    <div className="cat-info" style={{ flex: 1, minWidth: 0 }}>
                      <div className="cat-name" style={{ fontSize: '12.5px', fontWeight: 700 }}>{item.name}</div>
                      <div className="cat-progress" style={{ marginTop: '5px' }}>
                        <div className="cat-progress-fill" style={{ width: `${item.value / totalExpense * 100}%`, background: item.color }} />
                      </div>
                    </div>
                    <div className="cat-numbers" style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="cat-amount" style={{ fontSize: '12px', fontWeight: 700 }}>{formatMoney(item.value)}</div>
                      <div className="cat-pct" style={{ fontSize: '10px', color: 'var(--ink-faint)' }}>{Math.round(item.value / totalExpense * 100)}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="muted" style={{ padding: '12px 0' }}>Нет расходов за этот месяц</p>
        )}
      </div>

      {/* Trend Area Chart */}
      <section className="card chart-card dashboard-trend" style={{ marginTop: '12px', padding: '14px' }}>
        <div className="trend-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Динамика расходов</h2>
          <div className="avg-pill" style={{ margin: 0, padding: '4px 10px', borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div className="label" style={{ fontSize: '9px', color: 'var(--ink-soft)', fontWeight: 700 }}>Ср. расход в день</div>
            <div className="value" style={{ fontSize: '13px', fontWeight: 800, marginTop: '2px' }}>{formatMoney(avgPerDay)}</div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={dayData} margin={{ top: 4, right: 5, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9C87D6" stopOpacity=".24" />
                <stop offset="100%" stopColor="#9C87D6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#EFEAF7" vertical={false} />
            <XAxis dataKey="day" fontSize={9} stroke="#B7B2C6" tickLine={false} axisLine={false} interval={Math.ceil(days / 5) - 1} />
            <YAxis fontSize={9} stroke="#B7B2C6" tickLine={false} axisLine={false} width={34} />
            <Tooltip formatter={v => formatMoney(v)} />
            <Area type="monotone" dataKey="total" stroke="#AC7AE0" strokeWidth={2.0} fill="url(#areaFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}
