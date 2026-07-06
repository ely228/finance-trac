import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
         BarChart, Bar, XAxis, YAxis, CartesianGrid,
         LineChart, Line } from 'recharts'
import { formatMoney, daysInMonth } from '../utils'

const COLORS = ['#2E75B6', '#C00000', '#375623', '#BF8F00', '#7030A0', '#00838F',
                '#E36C09', '#6A5ACD', '#008080', '#B22222', '#4682B4', '#8B4513']

export default function Dashboard({ transactions, monthKey }) {
  const income = transactions.filter(t => t.type === 'income')
  const expense = transactions.filter(t => t.type === 'expense')
  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = expense.reduce((s, t) => s + Number(t.amount), 0)
  const balance = totalIncome - totalExpense

  const byCategory = {}
  for (const t of expense) {
    byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount)
  }
  const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value }))

  const nDays = daysInMonth(monthKey)
  const dayMap = {}
  for (let d = 1; d <= nDays; d++) dayMap[d] = { day: d, Доход: 0, Расход: 0 }
  for (const t of transactions) {
    const d = Number(t.date.slice(8, 10))
    if (!dayMap[d]) continue
    if (t.type === 'income') dayMap[d].Доход += Number(t.amount)
    else dayMap[d].Расход += Number(t.amount)
  }
  const dayData = Object.values(dayMap)
  let running = 0
  const balanceData = dayData.map(d => {
    running += d.Доход - d.Расход
    return { day: d.day, Баланс: Math.round(running * 100) / 100 }
  })

  if (transactions.length === 0) {
    return <div className="card"><p className="muted">Нет данных за этот месяц — добавь первую операцию на вкладке «Добавить».</p></div>
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

      {pieData.length > 0 && (
        <div className="card">
          <h2>Расходы по категориям</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label={({ name }) => name}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatMoney(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <h2>Доходы и расходы по дням</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip formatter={(v) => formatMoney(v)} />
            <Legend />
            <Bar dataKey="Доход" fill="#375623" />
            <Bar dataKey="Расход" fill="#C00000" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Баланс нарастающим итогом</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={balanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip formatter={(v) => formatMoney(v)} />
            <Line type="monotone" dataKey="Баланс" stroke="#2E75B6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
