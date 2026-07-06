import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import CategoriesManager from './components/CategoriesManager'
import Dashboard from './components/Dashboard'
import { currentMonthKey, monthLabel, shiftMonth } from './utils'

export default function App() {
  const [tab, setTab] = useState('add')
  const [monthKey, setMonthKey] = useState(currentMonthKey())
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="app">
      <header className="topbar">
        <h1>Мой финансовый трекер</h1>
        <div className="month-switch">
          <button onClick={() => setMonthKey(shiftMonth(monthKey, -1))}>‹</button>
          <span>{monthLabel(monthKey)}</span>
          <button onClick={() => setMonthKey(shiftMonth(monthKey, 1))}>›</button>
        </div>
      </header>

      <main className="content">
        {loading ? (
          <p className="muted">Загрузка…</p>
        ) : (
          <>
            {tab === 'add' && (
              <>
                <TransactionForm categories={categories} onAdded={loadTransactions} />
                <TransactionList transactions={transactions} onChanged={loadTransactions} />
              </>
            )}
            {tab === 'dashboard' && <Dashboard transactions={transactions} monthKey={monthKey} />}
            {tab === 'categories' && <CategoriesManager categories={categories} onChanged={loadCategories} />}
          </>
        )}
      </main>

      <nav className="tabbar">
        <button className={tab === 'add' ? 'active' : ''} onClick={() => setTab('add')}>Добавить</button>
        <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>Дашборд</button>
        <button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>Категории</button>
      </nav>
    </div>
  )
}
