import { PieChart, Pie, Cell } from 'recharts'
import TransactionList from './TransactionList'
import { formatMoney } from '../utils'

const PALETTE = ['#9C87D6', '#E888AC', '#F3AF77', '#6FBFA6', '#7FA8D8', '#D89ACB', '#E0B15C', '#8FC3C9']

export default function Home({ transactions, monthLabelText, onPrevMonth, onNextMonth, onChanged, onOpenDashboard }) {
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

  return (
    <div>
      <div className="hero">
        <img
          className="hero-texture"
          src="/images/hero-bg.jpg"
          alt=""
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div className="hero-label">Баланс · {monthLabelText}</div>
        <div className="hero-balance">{formatMoney(balance)}</div>
        <div className="hero-chips">
          <span className="hero-chip in"><span className="dot" />{formatMoney(income)}</span>
          <span className="hero-chip out"><span className="dot" />{formatMoney(expense)}</span>
          <span className="hero-chip clickable" onClick={onPrevMonth}>‹</span>
          <span className="hero-chip clickable" onClick={onNextMonth}>›</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="card chart-card">
          <h2>Куда уходят деньги</h2>
          {pieData.length === 0 ? (
            <p className="muted">Пока нет расходов за этот месяц.</p>
          ) : (
            <>
              <div className="donut-wrap" onClick={onOpenDashboard} title="Открыть дашборд">
                <PieChart width={180} height={180}>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={80} paddingAngle={2} stroke="none" onClick={onOpenDashboard}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
                <div className="donut-center">
                  <div className="val">{formatMoney(expense)}</div>
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
                    <span className="top-cat-val">{formatMoney(val)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <TransactionList transactions={transactions} onChanged={onChanged} limit={8} title="Последние операции" />
      </div>
    </div>
  )
}
