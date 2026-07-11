import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import ExportMenu from './ExportMenu'
import { formatMoney, daysInMonth, categoryStyle, categoryInitial, formatPercent, monthLabel, shiftMonth } from '../utils'

const PALETTE = ['#9C87D6', '#E8659E', '#D9822E', '#3F9C7E', '#5586BE']

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
  const pieData = Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }))
  const totalExpense = pieData.reduce((sum, item) => sum + item.value, 0) || 1
  const days = daysInMonth(monthKey)
  let running = 0
  const dayData = Array.from({ length: days }, (_, i) => {
    const day = i + 1
    running += transactions.filter(t => t.type === 'expense' && Number(t.date.slice(8, 10)) === day).reduce((sum, t) => sum + Number(t.amount), 0)
    return { day, total: running }
  })
  const avgPerDay = expense / days

  return <div className="dashboard-page">
    <div className="topbar dashboard-header">
      <h1>Дашборд</h1>
      <div className="dashboard-actions">
        <div className="date-pill"><span>📅</span><span style={{ textTransform: 'capitalize' }}>{monthLabel(monthKey)}</span><span className="chev">⌄</span>
          <select value={monthKey} onChange={e => onMonthChange(e.target.value)}>{monthOptions.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}</select>
        </div>
        <ExportMenu transactions={transactions} monthLabelText={monthLabel(monthKey)} />
      </div>
    </div>

    <div className="kpi-row dashboard-kpis">
      {[['income', '↑', 'Доходы', income], ['expense', '↓', 'Расходы', expense], ['balance', '=', 'Баланс', balance]].map(([type, icon, label, value], i) => <div className={`kpi ${type}`} key={type}>
        <div className="kpi-icon">{icon}</div><div className="kpi-label">{label}</div><div className="kpi-value">{formatMoney(value)}</div>
        {changes[i] !== null && changes[i] !== undefined && <span className={`kpi-change ${changes[i] >= 0 ? 'up' : 'down'}`}>{formatPercent(changes[i])}</span>}
      </div>)}
    </div>

    <div className="dashboard-pair">
      <section className="card chart-card dashboard-expenses"><h2>Расходы по категориям</h2>
        {pieData.length ? <><div className="dashboard-donut-glass"><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={82} paddingAngle={3} stroke="none" cornerRadius={7} activeIndex={activeIndex} onClick={(_, i) => setActiveIndex(i)}>{pieData.map((item, i) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer></div>
        <div className="legend-list">{pieData.slice(0, 3).map(item => <div className="legend-row" key={item.name}><span className="legend-dot" style={{ background: item.color }} /><span className="legend-name">{item.name}</span><span className="legend-pct">{Math.round(item.value / totalExpense * 100)}%</span></div>)}</div></> : <p className="muted">Нет расходов</p>}
      </section>
      <section className="card dashboard-top-categories"><h2>Топ категорий</h2>{pieData.slice(0, 4).map(item => { const style = categoryStyle(item.name); return <div className="cat-row" key={item.name}><div className="cat-avatar" style={{ background: style.bg, color: style.fg }}>{categoryInitial(item.name)}</div><div className="cat-info"><div className="cat-name">{item.name}</div><div className="cat-progress"><div className="cat-progress-fill" style={{ width: `${item.value / totalExpense * 100}%`, background: style.fg }} /></div></div><div className="cat-numbers"><div className="cat-amount">{formatMoney(item.value)}</div><div className="cat-pct">{Math.round(item.value / totalExpense * 100)}%</div></div></div> })}</section>
    </div>

    <section className="card chart-card dashboard-trend"><div className="trend-title"><h2>Динамика расходов</h2><div className="avg-pill"><div className="label">Средний расход в день</div><div className="value">{formatMoney(avgPerDay)}</div></div></div>
      <ResponsiveContainer width="100%" height={210}><AreaChart data={dayData} margin={{ top: 4, right: 5, left: -14, bottom: 0 }}><defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9C87D6" stopOpacity=".38" /><stop offset="100%" stopColor="#9C87D6" stopOpacity="0" /></linearGradient></defs><CartesianGrid stroke="#EFEAF7" vertical={false} /><XAxis dataKey="day" fontSize={10} stroke="#B7B2C6" tickLine={false} axisLine={false} interval={Math.ceil(days / 4) - 1} /><YAxis fontSize={10} stroke="#B7B2C6" tickLine={false} axisLine={false} width={32} /><Tooltip formatter={v => formatMoney(v)} /><Area type="monotone" dataKey="total" stroke="#8D6BE0" strokeWidth={2.4} fill="url(#areaFill)" /></AreaChart></ResponsiveContainer>
    </section>
  </div>
}
