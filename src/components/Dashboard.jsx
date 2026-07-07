import { useState } from 'react'
import {
  PieChart, Pie, Cell, Sector, Tooltip, ResponsiveContainer,
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { formatMoney, daysInMonth } from '../utils'

const PALETTE = ['#9C87D6', '#E888AC', '#F3AF77', '#6FBFA6', '#7FA8D8', '#D89ACB', '#E0B15C', '#8FC3C9']

function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props
  return (
    <g>
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="15" fontWeight="800" fill="#2E2A45">
        {payload.name}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="12" fill="#837C99">
        {formatMoney(payload.value)} · {(percent * 100).toFixed(0)}%
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
              startAngle={startAngle} endAngle={endAngle} fill={fill} cornerRadius={8} />
    </g>
  )
}

export default function Dashboard({ transactions, monthKey }) {
  const [activeIndex, setActiveIndex] = useState(0)

  const income = transactions.filter(t => t.type === 'income')
  const expense = transactions.filter(t => t.type === 'expense')
  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = expense.reduce((s, t) => s + Number(t.amount), 0)
  const balance = totalIncome - totalExpense

  const byCategory = {}
  for (const t of expense) byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount)
  const pieData = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }))

  const nDays = daysInMonth(monthKey)
  const dayMap = {}
  for (let d = 1; d <= nDays; d++) dayMap[d] = { day: d, Доход: 0, Расход: 0 }
  for (const t of transactions) {
    const d = Number(t.date.slice(8, 10))
    if (!dayMap[d]) continue
    if (t.type === 'income') dayMap[d].Доход += Number(t.amount)
    else dayMap[d].Расход += Number(t.amount)
  }
  let running = 0
  const dayData = Object.values(dayMap).map(d => {
    running += d.Доход - d.Расход
    return { ...d, Баланс: Math.round(running * 100) / 100 }
  })

  if (transactions.length === 0) {
    return <div className="card"><p className="muted">Нет данных за этот месяц — добавь первую операцию кнопкой «+».</p></div>
  }

  return (
    <div>
      <div className="kpi-row">
        <div className="kpi income">
          <div className="kpi-label">Доходы</div>
          <div className="kpi-value">{formatMoney(totalIncome)}</div>
        </div>
        <div className="kpi expense">
          <div className="kpi-label">Расходы</div>
          <div className="kpi-value">{formatMoney(totalExpense)}</div>
        </div>
        <div className="kpi balance">
          <div className="kpi-label">Баланс</div>
          <div className="kpi-value">{formatMoney(balance)}</div>
        </div>
      </div>

      <div className="grid-2">
        {pieData.length > 0 && (
          <div className="card chart-card">
            <h2>Расходы по категориям</h2>
            <p className="muted" style={{ marginTop: -8, marginBottom: 10 }}>Нажми на сектор, чтобы увидеть детали</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={68}
                  outerRadius={94}
                  paddingAngle={2}
                  stroke="none"
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, i) => setActiveIndex(i)}
                  onClick={(_, i) => setActiveIndex(i)}
                >
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend-row">
              {pieData.map(d => (
                <span className="li" key={d.name}><span className="sw" style={{ background: d.color }} />{d.name}</span>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <h2>Категории по сумме</h2>
          <div className="top-cats">
            {pieData.map(d => {
              const max = pieData[0].value
              return (
                <div className="top-cat-row" key={d.name}>
                  <span className="top-cat-name">{d.name}</span>
                  <div className="top-cat-bar-bg">
                    <div className="top-cat-bar-fill" style={{ width: `${(d.value / max) * 100}%`, background: d.color }} />
                  </div>
                  <span className="top-cat-val">{formatMoney(d.value)}</span>
                </div>
              )
            })}
            {pieData.length === 0 && <p className="muted">Нет данных за этот месяц.</p>}
          </div>
        </div>
      </div>

      <div className="card chart-card">
        <h2>Доходы, расходы и баланс по дням</h2>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={dayData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6FBFA6" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#6FBFA6" stopOpacity={0.55} />
              </linearGradient>
              <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E888AC" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#E888AC" stopOpacity={0.55} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#EFEAF7" vertical={false} />
            <XAxis dataKey="day" fontSize={11} stroke="#B3ADC4" tickLine={false} axisLine={false} />
            <YAxis fontSize={11} stroke="#B3ADC4" tickLine={false} axisLine={false} width={40} />
            <Tooltip
              formatter={(v, name) => [formatMoney(v), name]}
              contentStyle={{ borderRadius: 12, border: '1px solid #EFEAF7', fontSize: 12 }}
            />
            <Bar dataKey="Доход" fill="url(#gradIncome)" radius={[5, 5, 0, 0]} barSize={7} />
            <Bar dataKey="Расход" fill="url(#gradExpense)" radius={[5, 5, 0, 0]} barSize={7} />
            <Line type="monotone" dataKey="Баланс" stroke="#9C87D6" strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="chart-legend-row">
          <span className="li"><span className="sw" style={{ background: '#6FBFA6' }} />Доход</span>
          <span className="li"><span className="sw" style={{ background: '#E888AC' }} />Расход</span>
          <span className="li"><span className="sw" style={{ background: '#9C87D6' }} />Баланс нарастающим итогом</span>
        </div>
      </div>
    </div>
  )
}
