import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { supabase } from '../supabaseClient'
import ExportMenu from './ExportMenu'
import { formatMoney, daysInMonth, categoryStyle, categoryInitial, formatPercent, monthLabel, shiftMonth, currentMonthKey } from '../utils'
import CategoryIcon, { categoryMeta } from './CategoryIcon'

const isVisualTest = new URLSearchParams(window.location.search).get('visual-test') === '1'

const mockTransactions = [
  // Current month (July 2026) daily transactions
  { id: 'm1', type: 'income', amount: 120000, category: 'Зарплата', date: '2026-07-01' },
  { id: 'm2', type: 'expense', amount: 15000, category: 'Еда', date: '2026-07-02' },
  { id: 'm3', type: 'expense', amount: 8000, category: 'Такси/Транспорт', date: '2026-07-05' },
  { id: 'm4', type: 'expense', amount: 12000, category: 'Подарки', date: '2026-07-10' },
  { id: 'm5', type: 'income', amount: 45000, category: 'Перевод/Семья', date: '2026-07-15' },
  { id: 'm6', type: 'expense', amount: 35000, category: 'Еда', date: '2026-07-18' },
  { id: 'm7', type: 'expense', amount: 22000, category: 'Кино/Развлеч.', date: '2026-07-22' },
  { id: 'm8', type: 'expense', amount: 14000, category: 'Такси/Транспорт', date: '2026-07-25' },

  // Transactions in other months of 2026
  { id: 'jan1', type: 'income', amount: 95000, category: 'Зарплата', date: '2026-01-10' },
  { id: 'jan2', type: 'expense', amount: 60000, category: 'Еда', date: '2026-01-15' },
  { id: 'feb1', type: 'income', amount: 100000, category: 'Зарплата', date: '2026-02-10' },
  { id: 'feb2', type: 'expense', amount: 45000, category: 'Еда', date: '2026-02-15' },
  { id: 'mar1', type: 'income', amount: 110000, category: 'Зарплата', date: '2026-03-10' },
  { id: 'mar2', type: 'expense', amount: 55000, category: 'Еда', date: '2026-03-15' },
  { id: 'apr1', type: 'income', amount: 105000, category: 'Зарплата', date: '2026-04-10' },
  { id: 'apr2', type: 'expense', amount: 72000, category: 'Еда', date: '2026-04-15' },
  { id: 'may1', type: 'income', amount: 125000, category: 'Зарплата', date: '2026-05-10' },
  { id: 'may2', type: 'expense', amount: 50000, category: 'Еда', date: '2026-05-15' },
  { id: 'jun1', type: 'income', amount: 130000, category: 'Зарплата', date: '2026-06-10' },
  { id: 'jun2', type: 'expense', amount: 80000, category: 'Еда', date: '2026-06-15' },

  // Transactions in 2025
  { id: 'y25_1', type: 'income', amount: 1100000, category: 'Зарплата', date: '2025-06-10' },
  { id: 'y25_2', type: 'expense', amount: 800000, category: 'Еда', date: '2025-06-15' },

  // Transactions in 2024
  { id: 'y24_1', type: 'income', amount: 950000, category: 'Зарплата', date: '2024-06-10' },
  { id: 'y24_2', type: 'expense', amount: 700000, category: 'Еда', date: '2024-06-15' },
]

export default function Dashboard({ transactions = [], monthKey, onMonthChange, prevTotals }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [chartMode, setChartMode] = useState('days') // 'days' | 'months' | 'years'
  const [allTransactions, setAllTransactions] = useState([])

  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showModeDropdown, setShowModeDropdown] = useState(false)
  const [zoomedBlock, setZoomedBlock] = useState(null) // null | 'donut' | 'top-categories'

  // Fetch all transactions for multi-timeframe trends
  useEffect(() => {
    if (isVisualTest) {
      setAllTransactions(mockTransactions)
      return
    }
    async function fetchAll() {
      const { data } = await supabase.from('transactions').select('*')
      if (data) {
        setAllTransactions(data)
      }
    }
    fetchAll()
  }, [transactions])

  // Prevent page scroll when zoomed overlay modal is open
  useEffect(() => {
    if (zoomedBlock) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [zoomedBlock])

  // Handle click outside to close dropdowns
  useEffect(() => {
    if (!showMonthDropdown && !showModeDropdown) return
    const handleOutsideClick = (e) => {
      if (showMonthDropdown && !e.target.closest('.month-dropdown-container')) {
        setShowMonthDropdown(false)
      }
      if (showModeDropdown && !e.target.closest('.mode-dropdown-container')) {
        setShowModeDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [showMonthDropdown, showModeDropdown])

  const anchor = currentMonthKey()
  const monthOptions = Array.from({ length: 12 }, (_, i) => shiftMonth(anchor, -i))

  // Totals for current month KPIs
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expense
  const change = (value, previous) => (!previous ? null : Math.round(((value - previous) / previous) * 100))
  const changes = prevTotals ? [change(income, prevTotals.income), change(expense, prevTotals.expense), change(balance, prevTotals.income - prevTotals.expense)] : []
  
  // Expense Totals by category for selected month
  const totals = {}
  transactions.filter(t => t.type === 'expense').forEach(t => { totals[t.category] = (totals[t.category] || 0) + Number(t.amount) })
  const pieData = Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value, color: categoryStyle(name).fg }))
  const totalExpense = pieData.reduce((sum, item) => sum + item.value, 0) || 1

  // Dynamic Chart Data Generation based on chartMode
  let trendData = []
  let balanceData = []

  const days = daysInMonth(monthKey)
  const [selectedYear, selectedMonth] = monthKey.split('-').map(Number)

  if (chartMode === 'days') {
    // Group by days of selected month
    trendData = Array.from({ length: days }, (_, i) => {
      const day = i + 1
      const dayStr = String(day).padStart(2, '0')
      const targetDate = `${monthKey}-${dayStr}`
      const dayIncome = allTransactions
        .filter(t => t.type === 'income' && t.date === targetDate)
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const dayExpense = allTransactions
        .filter(t => t.type === 'expense' && t.date === targetDate)
        .reduce((sum, t) => sum + Number(t.amount), 0)
      return { name: day, fullLabel: `${day} ${monthLabel(monthKey)}`, income: dayIncome, expense: dayExpense }
    })

    let runningBalance = 0
    balanceData = trendData.map(item => {
      runningBalance += (item.income - item.expense)
      return { name: item.name, fullLabel: item.fullLabel, balance: runningBalance }
    })

  } else if (chartMode === 'months') {
    // Group by months of selected year (1 to 12)
    const shortMonths = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
    const fullMonths = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

    trendData = Array.from({ length: 12 }, (_, i) => {
      const mNum = i + 1
      const mStr = String(mNum).padStart(2, '0')
      const prefix = `${selectedYear}-${mStr}`
      const mIncome = allTransactions
        .filter(t => t.type === 'income' && t.date.startsWith(prefix))
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const mExpense = allTransactions
        .filter(t => t.type === 'expense' && t.date.startsWith(prefix))
        .reduce((sum, t) => sum + Number(t.amount), 0)
      return { name: shortMonths[i], fullLabel: `${fullMonths[i]} ${selectedYear}`, income: mIncome, expense: mExpense }
    })

    let runningBalance = 0
    balanceData = trendData.map(item => {
      runningBalance += (item.income - item.expense)
      return { name: item.name, fullLabel: item.fullLabel, balance: runningBalance }
    })

  } else if (chartMode === 'years') {
    // Group by years in transaction history
    let yearsRange = []
    const currentYear = new Date().getFullYear()
    if (allTransactions.length > 0) {
      const yearsSet = new Set(allTransactions.map(t => new Date(t.date).getFullYear()).filter(y => !isNaN(y)))
      yearsSet.add(currentYear)
      yearsSet.add(currentYear - 1)
      yearsRange = Array.from(yearsSet).sort((a, b) => a - b)
    } else {
      yearsRange = [currentYear - 1, currentYear]
    }

    trendData = yearsRange.map(yr => {
      const yIncome = allTransactions
        .filter(t => t.type === 'income' && new Date(t.date).getFullYear() === yr)
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const yExpense = allTransactions
        .filter(t => t.type === 'expense' && new Date(t.date).getFullYear() === yr)
        .reduce((sum, t) => sum + Number(t.amount), 0)
      return { name: String(yr), fullLabel: `${yr} год`, income: yIncome, expense: yExpense }
    })

    let runningBalance = 0
    balanceData = trendData.map(item => {
      runningBalance += (item.income - item.expense)
      return { name: item.name, fullLabel: item.fullLabel, balance: runningBalance }
    })
  }

  console.log('DASHBOARD PLOTTING DATA:', JSON.stringify({
    chartMode,
    monthKey,
    allTransactionsCount: allTransactions.length,
    trendDataLength: trendData.length,
    nonZeroTrendData: trendData.filter(d => d.income > 0 || d.expense > 0),
    balanceDataLength: balanceData.length,
    nonZeroBalanceData: balanceData.filter(d => d.balance !== 0)
  }, null, 2))

  const modeLabels = {
    days: 'По дням',
    months: 'По месяцам',
    years: 'По годам'
  }

  const cleanMonthLabel = (mKey) => {
    const rawLabel = monthLabel(mKey)
    const cleanLabel = rawLabel.replace(/\s*г\s*\.?\s*$/i, '')
    return cleanLabel.charAt(0).toUpperCase() + cleanLabel.slice(1)
  }

  return (
    <div className="dashboard-page" style={{ position: 'relative' }}>
      {/* topbar layout aligning perfectly with other top elements */}
      <div className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', marginBottom: '16px', marginTop: '0' }}>
        {/* Beautiful Custom Dropdown for Month Selection */}
        <div className="month-dropdown-container" style={{ position: 'relative', display: 'inline-block' }}>
          {/* Pill-shaped month selector button - smaller and compact */}
          <div
            onClick={() => setShowMonthDropdown(p => !p)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FFFFFF',
              border: '1px solid var(--hairline)',
              borderRadius: '999px',
              padding: '6px 14px',
              boxShadow: 'var(--el-1)',
              transition: 'background 0.2s ease, transform 0.1s ease',
              userSelect: 'none'
            }}
            className="month-pill-btn"
          >
            {/* Calendar Icon in SF Symbols style */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8865E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="18" rx="4" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>

            {/* Month and Year Text */}
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--ink)',
                whiteSpace: 'nowrap'
              }}
            >
              {cleanMonthLabel(monthKey)}
            </span>

            {/* Downward chevron icon */}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8865E8" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: showMonthDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {showMonthDropdown && (
            <div
              className="dropdown-menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid var(--hairline)',
                boxShadow: '0 10px 30px rgba(31, 29, 47, 0.12)',
                zIndex: 100,
                minWidth: '200px',
                maxHeight: '250px',
                overflowY: 'auto',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                animation: 'rise-in 0.15s ease'
              }}
            >
              {monthOptions.map(m => {
                const isActive = monthKey === m
                return (
                  <button
                    key={m}
                    onClick={() => {
                      onMonthChange(m)
                      setShowMonthDropdown(false)
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: isActive ? 'rgba(136, 101, 232, 0.08)' : 'transparent',
                      border: 'none',
                      color: isActive ? 'var(--lavender-dark)' : 'var(--ink)',
                      fontSize: '13.5px',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      outline: 'none',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <span>{cleanMonthLabel(m)}</span>
                    {isActive && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--lavender-dark)' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Custom Dropdown for Timeframe selection (days/months/years) relocated to the right of month-dropdown in the sub-header row */}
        <div className="mode-dropdown-container" style={{ position: 'relative', display: 'inline-block' }}>
          <div
            onClick={() => setShowModeDropdown(p => !p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF',
              border: '1px solid var(--hairline)',
              borderRadius: '999px',
              padding: '6px 14px',
              boxShadow: 'var(--el-1)',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--ink)',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <span>{modeLabels[chartMode]}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8865E8" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: showModeDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {showModeDropdown && (
            <div
              className="dropdown-menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid var(--hairline)',
                boxShadow: '0 10px 30px rgba(31, 29, 47, 0.12)',
                zIndex: 100,
                minWidth: '130px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                animation: 'rise-in 0.15s ease'
              }}
            >
              {[
                { key: 'days', label: 'По дням' },
                { key: 'months', label: 'По месяцам' },
                { key: 'years', label: 'По годам' }
              ].map(opt => {
                const isActive = chartMode === opt.key
                return (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setChartMode(opt.key)
                      setShowModeDropdown(false)
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: isActive ? 'rgba(136, 101, 232, 0.08)' : 'transparent',
                      border: 'none',
                      color: isActive ? 'var(--lavender-dark)' : 'var(--ink)',
                      fontSize: '12.5px',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      outline: 'none',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <span>{opt.label}</span>
                    {isActive && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--lavender-dark)' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          )}
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
        </div>
        
        <ResponsiveContainer width="100%" height={115}>
          <LineChart key={`line-${chartMode}-${allTransactions.length}`} data={trendData} margin={{ top: 4, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#EFEAF7" vertical={false} />
            <XAxis dataKey="name" fontSize={9} stroke="#B7B2C6" tickLine={false} axisLine={false} interval={chartMode === 'days' ? Math.ceil(days / 5) - 1 : 0} />
            <YAxis
              fontSize={9}
              stroke="#B7B2C6"
              tickLine={false}
              axisLine={false}
              width={34}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <Tooltip 
              labelFormatter={(_, items) => items[0]?.payload.fullLabel || ''}
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
          <AreaChart key={`area-${chartMode}-${allTransactions.length}`} data={balanceData} margin={{ top: 4, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C6EF2" stopOpacity=".24" />
                <stop offset="100%" stopColor="#7C6EF2" stopOpacity="0" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#EFEAF7" vertical={false} />
            <XAxis dataKey="name" fontSize={9} stroke="#B7B2C6" tickLine={false} axisLine={false} interval={chartMode === 'days' ? Math.ceil(days / 5) - 1 : 0} />
            <YAxis
              fontSize={9}
              stroke="#B7B2C6"
              tickLine={false}
              axisLine={false}
              width={34}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <Tooltip 
              labelFormatter={(_, items) => items[0]?.payload.fullLabel || ''}
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
        <div
          className="card"
          onClick={() => setZoomedBlock('donut')}
          style={{
            padding: '12px',
            aspectRatio: '1 / 1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            cursor: 'pointer',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
            transform: 'scale(1)'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <h2 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Расходы по категориям</h2>
          
          {pieData.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              {/* Increased donut width/height to 116px for clean, large focus and removed legend list */}
              <div className="donut-wrap glass-donut" style={{ width: 116, height: 116, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PieChart width={116} height={116}>
                  <Pie 
                    data={pieData} 
                    dataKey="value" 
                    nameKey="name" 
                    innerRadius={36}
                    outerRadius={54}
                    paddingAngle={3} 
                    stroke="none" 
                    cornerRadius={3} 
                    activeIndex={activeIndex} 
                    onClick={(e, i) => {
                      e.stopPropagation()
                      setActiveIndex(i)
                    }}
                  >
                    {pieData.map((item, i) => {
                      const isActive = activeIndex === i
                      return (
                        <Cell
                          key={item.name}
                          fill={item.color}
                          stroke={isActive ? '#FFFFFF' : 'none'}
                          strokeWidth={isActive ? 1.5 : 0}
                          opacity={isActive ? 1.0 : 0.55}
                          style={{ outline: 'none' }}
                        />
                      )
                    })}
                  </Pie>
                </PieChart>
              </div>
            </div>
          ) : (
            <p className="muted" style={{ padding: '12px 0', fontSize: '11px', margin: 0 }}>Нет расходов</p>
          )}
        </div>

        {/* Card 2: Топ категорий */}
        <div
          className="card"
          onClick={() => setZoomedBlock('top-categories')}
          style={{
            padding: '12px',
            aspectRatio: '1 / 1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            cursor: 'pointer',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
            transform: 'scale(1)'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
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
                      {/* Percentages instead of sums on mini version */}
                      <div className="cat-amount" style={{ fontSize: '11px', fontWeight: 700 }}>
                        {Math.round(item.value / totalExpense * 100)}%
                      </div>
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

      {/* Zoomed Block Feature Modal Over Blurred Backdrop */}
      {zoomedBlock && (
        <div
          className="zoom-blur-overlay"
          onClick={() => setZoomedBlock(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(230, 226, 243, 0.5)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            pointerEvents: 'auto',
            touchAction: 'none'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="context-menu-unblurred"
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '350px', // matches width of trend cards
              boxSizing: 'border-box',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(31, 29, 47, 0.15)',
              position: 'relative',
              animation: 'zoom-block-appear 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
              pointerEvents: 'auto'
            }}
          >
            {zoomedBlock === 'donut' ? (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 20px 0', color: 'var(--ink)' }}>Расходы по категориям</h2>
                {pieData.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <div className="donut-wrap glass-donut" style={{ width: 140, height: 140, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PieChart width={140} height={140}>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          stroke="none"
                          cornerRadius={3}
                          activeIndex={activeIndex}
                          onClick={(e, i) => {
                            e.stopPropagation()
                            setActiveIndex(i)
                          }}
                        >
                          {pieData.map((item, i) => {
                            const isActive = activeIndex === i
                            return (
                              <Cell
                                key={item.name}
                                fill={item.color}
                                stroke={isActive ? '#FFFFFF' : 'none'}
                                strokeWidth={isActive ? 2 : 0}
                                opacity={isActive ? 1.0 : 0.45}
                                style={{ outline: 'none' }}
                              />
                            )
                          })}
                        </Pie>
                      </PieChart>
                      {/* Interactive text in center of donut chart */}
                      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: '80px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                          {pieData[activeIndex]?.name || 'Всего'}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>
                          {pieData[activeIndex] ? `${Math.round(pieData[activeIndex].value / totalExpense * 100)}%` : formatMoney(totalExpense)}
                        </span>
                      </div>
                    </div>

                    {/* All categories listed below with dot, name, sum and percentage */}
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                      {pieData.map((item, idx) => {
                        const isActive = activeIndex === idx
                        return (
                          <div
                            key={item.name}
                            onClick={() => setActiveIndex(idx)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 8px',
                              borderRadius: '10px',
                              background: isActive ? 'rgba(136, 101, 232, 0.08)' : 'transparent',
                              cursor: 'pointer',
                              transition: 'background 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ background: item.color, width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 }} />
                              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ink)' }}>{item.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ink)' }}>{formatMoney(item.value)}</span>
                              <span style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 600 }}>
                                ({Math.round(item.value / totalExpense * 100)}%)
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="muted" style={{ fontSize: '13px', margin: 0 }}>Нет расходов</p>
                )}
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 20px 0', color: 'var(--ink)' }}>Топ категорий</h2>
                {pieData.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '340px', overflowY: 'auto' }}>
                    {pieData.map(item => {
                      return (
                        <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid rgba(31, 29, 47, 0.04)' }}>
                          <div
                            className="cat-avatar"
                            style={{
                              background: `${item.color}1c`,
                              color: item.color,
                              width: '40px',
                              height: '40px',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              fontSize: '18px',
                              border: '1px solid rgba(0,0,0,0.02)'
                            }}
                          >
                            <CategoryIcon name={item.name} style={{ width: '20px', height: '20px' }} />
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>{item.name}</span>
                              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                                {formatMoney(item.value)}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                              <div style={{ flex: 1, height: '6px', background: 'rgba(31, 29, 47, 0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: item.color, width: `${item.value / totalExpense * 100}%`, borderRadius: '3px' }} />
                              </div>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)' }}>
                                {Math.round(item.value / totalExpense * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="muted" style={{ fontSize: '13px', margin: 0 }}>Нет расходов</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
