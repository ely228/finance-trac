import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import Nav from './components/Nav'
import Home from './components/Home'
import Dashboard from './components/Dashboard'
import CategoriesManager from './components/CategoriesManager'
import AddTransactionModal from './components/AddTransactionModal'
import { currentMonthKey, monthLabel, shiftMonth } from './utils'

export default function App() {
  const [tab, setTab] = useState('home')
  const [monthKey, setMonthKey] = useState(currentMonthKey())
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

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

  useEffect(() => {
    setLoading(true)
    Promise.all([loadCategories(), loadTransactions()]).finally(() => setLoading(false))
  }, [loadCategories, loadTransactions])

  const monthLabelText = monthLabel(monthKey)

  return (
    <div className="app">
      <Nav tab={tab} setTab={setTab} />

      <main className="content">
        {tab !== 'home' && (
          <div className="topbar">
            <h1>{tab === 'dashboard' ? 'Дашборд' : 'Категории'}</h1>
            {tab === 'dashboard' && (
              <div className="month-switch">
                <button onClick={() => setMonthKey(shiftMonth(monthKey, -1))}>‹</button>
                <span>{monthLabelText}</span>
                <button onClick={() => setMonthKey(shiftMonth(monthKey, 1))}>›</button>
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
              />
            )}
            {tab === 'dashboard' && <Dashboard transactions={transactions} monthKey={monthKey} />}
            {tab === 'categories' && <CategoriesManager categories={categories} onChanged={loadCategories} />}
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
