import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import Nav from './components/Nav'
import Home from './components/Home'
import Dashboard from './components/Dashboard'
import CategoriesManager from './components/CategoriesManager'
import AccountCard from './components/AccountCard'
import AddTransactionModal from './components/AddTransactionModal'
import ExportMenu from './components/ExportMenu'
import Auth from './components/Auth'
import { currentMonthKey, monthLabel, shiftMonth } from './utils'

function greetingForNow() {
  const h = new Date().getHours()
  if (h < 5) return 'Доброй ночи'
  if (h < 12) return 'Доброе утро'
  if (h < 18) return 'Добрый день'
  return 'Добрый вечер'
}

export default function App() {
  const [session, setSession] = useState(undefined)
  const [tab, setTab] = useState('home')
  const [monthKey, setMonthKey] = useState(currentMonthKey())
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [prevTotals, setPrevTotals] = useState(null)
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  const loadCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
  }, [])

  const loadTransactions = useCallback(async () => {
    const start = `${monthKey}-01`
    const [y, m] = monthKey.split('-').map(Number)
    const end = new Date(y, m, 1).toISOString().slice(0, 10)
    const { data } = await supabase.from('transactions')
      .select('*').gte('date', start).lt('date', end).order('date', { ascending: false })
    setTransactions(data || [])
  }, [monthKey])

  const loadPrevMonthTotals = useCallback(async () => {
    const prevKey = shiftMonth(monthKey, -1)
    const start = `${prevKey}-01`
    const [y, m] = prevKey.split('-').map(Number)
    const end = new Date(y, m, 1).toISOString().slice(0, 10)
    const { data } = await supabase.from('transactions').select('type, amount').gte('date', start).lt('date', end)
    if (!data) return setPrevTotals(null)
    const income = data.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const expense = data.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    setPrevTotals({ income, expense })
  }, [monthKey])

  const loadTrend = useCallback(async () => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 6)
    const { data } = await supabase.from('transactions')
      .select('date, type, amount')
      .eq('type', 'expense')
      .gte('date', start.toISOString().slice(0, 10))
      .lte('date', end.toISOString().slice(0, 10))
    const byDate = {}
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      byDate[d.toISOString().slice(0, 10)] = 0
    }
    for (const t of data || []) byDate[t.date] = (byDate[t.date] || 0) + Number(t.amount)
    setTrend(Object.entries(byDate).map(([date, total]) => ({ date, total })))
  }, [])

  useEffect(() => {
    if (!session) return
    setLoading(true)
    Promise.all([loadCategories(), loadTransactions(), loadPrevMonthTotals(), loadTrend()]).finally(() => setLoading(false))
  }, [loadCategories, loadTransactions, loadPrevMonthTotals, loadTrend, session])

  if (session === undefined) return null
  if (!session) return <Auth />

  const monthLabelText = monthLabel(monthKey)

  return (
    <div className="app">
      <div className="bg-scene">
        <div className="bg-blob b1" /><div className="bg-blob b2" /><div className="bg-blob b3" />
        <div className="bg-blob b4" /><div className="bg-blob b5" />
      </div>
      <div className="grain" />

      <Nav tab={tab} setTab={setTab} />

      <main className="content">
        {tab !== 'home' && (
          <div className="topbar">
            <h1>{tab === 'dashboard' ? 'Дашборд' : 'Категории'}</h1>
            {tab === 'dashboard' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="month-switch">
                  <button onClick={() => setMonthKey(shiftMonth(monthKey, -1))}>‹</button>
                  <span>{monthLabelText}</span>
                  <button onClick={() => setMonthKey(shiftMonth(monthKey, 1))}>›</button>
                </div>
                <ExportMenu transactions={transactions} monthLabelText={monthLabelText} />
              </div>
            )}
          </div>
        )}

        {loading ? (
          <p className="muted">Загрузка…</p>
        ) : (
          <>
            {tab === 'home' && (
              <Home
                transactions={transactions}
                monthLabelText={monthLabelText}
                onPrevMonth={() => setMonthKey(shiftMonth(monthKey, -1))}
                onNextMonth={() => setMonthKey(shiftMonth(monthKey, 1))}
                onChanged={loadTransactions}
                onOpenDashboard={() => setTab('dashboard')}
                onAdd={() => setShowAdd(true)}
                prevTotals={prevTotals}
                trend={trend}
                greeting={greetingForNow()}
              />
            )}
            {tab === 'dashboard' && <Dashboard transactions={transactions} monthKey={monthKey} />}
            {tab === 'categories' && (
              <>
                <CategoriesManager categories={categories} onChanged={loadCategories} />
                <AccountCard email={session.user.email} />
              </>
            )}
          </>
        )}
      </main>

      {tab !== 'categories' && (
        <button className="fab" onClick={() => setShowAdd(true)} aria-label="Добавить операцию">+</button>
      )}

      {showAdd && (
        <AddTransactionModal
          categories={categories}
          onAdded={loadTransactions}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
