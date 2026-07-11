import { useState } from 'react'
import {
  PieChart, Pie, Cell, Sector, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import ExportMenu from './ExportMenu'
import { formatMoney, daysInMonth, categoryStyle, categoryInitial, formatPercent, monthLabel, shiftMonth } from '../utils'

const PALETTE = ['#9C87D6', '#E8659E', '#D9822E', '#3F9C7E', '#5586BE', '#BD5FA6', '#B8862A', '#3E8C96']

function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props
  const midAngle = (startAngle + endAngle) / 2
  return (
    <g style={{ transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${(midAngle % 2 === 0 ? 1 : -1) * 1.5}deg)`, transition: 'transform 420ms cubic-bezier(.34,1.56,.64,1)' }}>
      <defs>
        <filter id="segGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.35} filter="url(#segGlow)" />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 7} startAngle={startAngle} endAngle={endAngle} fill={fill} cornerRadius={8} />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="12" fontWeight="800" fill="#2A2740">{payload.name}</text>
      <text x={cx} y={cy + 11} textAnchor="middle" fontSize="10.5" fill="#85809A">{(percent * 100).toFixed(0)}%</text>
    </g>
  )
}

export default function Dashboard({ transactions, monthKey, onMonthChange, prevTotals, plan, onSavePlan }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [planInput, setPlanInput] = useState('')

  const monthOptions = Array.from({ length: 12 }, (_, i) => shiftMonth(monthKey, -i))
    .filter((v, i, arr) => arr.indexOf(v) === i)
  if (!monthOptions.includes(monthKey)) monthOptions.unshift(monthKey)

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expense

  const pctChange = (curr, prev) => (!prev ? null : Math.round(((curr - prev) / prev) * 100))
  const incomeChange = prevTotals ? pctChange(income, prevTotals.income) : null
  const expenseChange = prevTotals ? pctChange(expense, prevTotals.expense) : null
  const balanceChange = prevTotals ? pctChange(balance, prevTotals.income - prevTotals.expense) : null

  const byCategory = {}
  for (const t of transactions.filter(t => t.type === 'expense')) byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount)
  const pieData = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }))
  const totalExpense = pieData.reduce((s, d) => s + d.value, 0) || 1

  const nDays = daysInMonth(monthKey)
  const dayMap = {}
  for (let d = 1; d <= nDays; d++) dayMap[d] = 0
  for (const t of transactions.filter(t => t.type === 'expense')) {
    const d = Number(t.date.slice(8, 10))
    if (dayMap[d] !== undefined) dayMap[d] += Number(t.amount)
  }
  let running = 0
  const dayData = Object.entries(dayMap).map(([day, val]) => {
    running += val
    return { day: Number(day), total: Math.round(running * 100) / 100 }
  })
  const avgPerDay = expense / nDays

  const planPct = plan ? Math.min(100, Math.round((expense / plan.amount) * 100)) : 0
  const remaining = plan ? plan.amount - expense : 0

  const header = (
    <div className="topbar dashboard-header">
      <h1>Дашборд</h1>
      <div className="dashboard-actions">
        <div className="date-pill">
          <span>📅</span>
          <span style={{ textTransform: 'capitalize' }}>{monthLabel(monthKey)}</span>
          <span className="chev">⌄</span>
          <select value={monthKey} onChange={e => onMonthChange(e.target.value)}>
            {monthOptions.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        </div>
        <ExportMenu transactions={transactions} monthLabelText={monthLabel(monthKey)} />
      </div>
    </div>
  )

  if (transactions.length === 0) {
    return (
      <div>
        {header}
        <div className="card"><p className="muted">Нет данных за этот месяц — добавь первую операцию кнопкой «+».</p></div>
      </div>
    )
  }

  return (
    <div>
      {header}
      <div className="kpi-row dashboard-kpis">
        <div className="kpi income">
          <div className="kpi-icon">↑</div>
          <div className="kpi-label">Доходы</div>
          <div className="kpi-value">{formatMoney(income)}</div>
          {incomeChange !== null && <span className={`kpi-change ${incomeChange >= 0 ? 'up' : 'down'}`}>{formatPercent(incomeChange)} к пред. мес.</span>}
        </div>
        <div className="kpi expense">
          <div className="kpi-icon">↓</div>
          <div className="kpi-label">Расходы</div>
          <div className="kpi-value">{formatMoney(expense)}</div>
          {expenseChange !== null && <span className={`kpi-change ${expenseChange <= 0 ? 'up' : 'down'}`}>{formatPercent(expenseChange)} к пред. мес.</span>}
        </div>
        <div className="kpi balance">
          <div className="kpi-icon">=</div>
          <div className="kpi-label">Баланс</div>
          <div className="kpi-value">{formatMoney(balance)}</div>
          {balanceChange !== null && <span className={`kpi-change ${balanceChange >= 0 ? 'up' : 'down'}`}>{formatPercent(balanceChange)} к пред. мес.</span>}
        </div>
      </div>

      <div className="grid-2">
        <div className="card chart-card">
          <h2>Расходы по категориям</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData} dataKey="value" nameKey="name"
                    innerRadius={62} outerRadius={92} paddingAngle={3} stroke="none" cornerRadius={6}
                    animationDuration={500} animationEasing="ease-out"
                    activeIndex={activeIndex} activeShape={renderActiveShape}
                    onMouseEnter={(_, i) => setActiveIndex(i)} onClick={(_, i) => setActiveIndex(i)}
                  >
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="legend-list" style={{ marginTop: 8 }}>
                {pieData.slice(0, 5).map(d => (
                  <div className="legend-row" key={d.name}>
                    <span className="legend-dot" style={{ background: d.color }} />
                    <span className="legend-name">{d.name}</span>
                    <span className="legend-value">{formatMoney(d.value)}</span>
                    <span className="legend-pct">{Math.round((d.value / totalExpense) * 100)}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="muted">Нет расходов за этот месяц.</p>}
        </div>

        <div className="card chart-card">
          <h2>Динамика расходов</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dayData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9C87D6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#9C87D6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#EFEAF7" vertical={false} />
              <XAxis dataKey="day" fontSize={11} stroke="#B7B2C6" tickLine={false} axisLine={false} interval={Math.ceil(nDays / 4) - 1} />
              <YAxis fontSize={11} stroke="#B7B2C6" tickLine={false} axisLine={false} width={38} />
              <Tooltip formatter={v => formatMoney(v)} contentStyle={{ borderRadius: 12, border: '1px solid #EFEAF7', fontSize: 12 }} />
              <Area type="monotone" dataKey="total" stroke="#9C87D6" strokeWidth={2.5} fill="url(#areaFill)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="avg-pill">
            <div>
              <div className="label">Средний расход в день</div>
              <div className="value">{formatMoney(avgPerDay)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Топ категорий</h2>
          {pieData.map(d => {
            const style = categoryStyle(d.name)
            return (
              <div className="cat-row" key={d.name}>
                <div className="cat-avatar" style={{ background: style.bg, color: style.fg }}>{categoryInitial(d.name)}</div>
                <div className="cat-info">
                  <div className="cat-name">{d.name}</div>
                  <div className="cat-progress"><div className="cat-progress-fill" style={{ width: `${(d.value / totalExpense) * 100}%`, background: style.fg }} /></div>
                </div>
                <div className="cat-numbers">
                  <div className="cat-amount">{formatMoney(d.value)}</div>
                  <div className="cat-pct">{Math.round((d.value / totalExpense) * 100)}%</div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="card">
          <h2>План vs Факт</h2>
          {plan ? (
            <>
              <div className="plan-donut-wrap">
                <PieChart width={140} height={140}>
                  <Pie data={[{ v: planPct }, { v: 100 - planPct }]} dataKey="v" innerRadius={50} outerRadius={66} startAngle={90} endAngle={-270} stroke="none">
                    <Cell fill="#9C87D6" /><Cell fill="rgba(42,39,64,0.06)" />
                  </Pie>
                </PieChart>
                <div className="donut-center">
                  <div className="val">{planPct}%</div>
                  <div className="lbl">плана</div>
                </div>
              </div>
              <div className="plan-rows">
                <div className="plan-row"><span className="label">План на месяц</span><span className="value">{formatMoney(plan.amount)}</span></div>
                <div className="plan-row"><span className="label">Потрачено</span><span className="value" style={{ color: 'var(--expense)' }}>{formatMoney(expense)}</span></div>
                <div className="plan-row"><span className="label">Осталось</span><span className="value remaining" style={{ color: remaining >= 0 ? 'var(--income)' : 'var(--expense)' }}>{formatMoney(remaining)}</span></div>
              </div>
            </>
          ) : (
            <div className="plan-setup">
              <p className="muted">Задай план расходов на этот месяц, чтобы отслеживать прогресс.</p>
              <input type="number" placeholder="Например, 50000" value={planInput} onChange={e => setPlanInput(e.target.value)} />
              <button className="submit-btn" onClick={() => planInput && onSavePlan(Number(planInput))}>Сохранить план</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
