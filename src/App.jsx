import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import Nav from './components/Nav'
import Home from './components/Home'
import Dashboard from './components/Dashboard'
import Categories from './components/Categories'
import Account from './components/Account'
import AddTransactionModal from './components/AddTransactionModal'
import Auth from './components/Auth'
import { currentMonthKey, monthLabel, shiftMonth } from './utils'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [tab, setTab] = useState('home')
  const [monthKey, setMonthKey] = useState(currentMonthKey())
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [prevTotals, setPrevTotals] = useState(null)
  const [plan, setPlan] = useState(null)
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

  const loadPlan = useCallback(async () => {
    const { data } = await supabase.from('plans').select('*').eq('month', monthKey).maybeSingle()
    setPlan(data || null)
  }, [monthKey])

  useEffect(() => {
    if (!session) return
    setLoading(true)
    Promise.all([loadCategories(), loadTransactions(), loadPrevMonthTotals(), loadPlan()]).finally(() => setLoading(false))
  }, [loadCategories, loadTransactions, loadPrevMonthTotals, loadPlan, session])

  async function savePlan(amount) {
    await supabase.from('plans').upsert({ month: monthKey, amount }, { onConflict: 'user_id,month' })
    loadPlan()
  }

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

      <Nav tab={tab} setTab={setTab} onAdd={() => setShowAdd(true)} />

      <main className="content">
        {loading ? (
          <p className="muted">Загрузка…</p>
        ) : (
          <>
            {tab === 'home' && (
              <Home
                transactions={transactions}
                onChanged={loadTransactions}
                onOpenDashboard={() => setTab('dashboard')}
                onAdd={() => setShowAdd(true)}
              />
            )}
            {tab === 'dashboard' && (
              <Dashboard
                transactions={transactions}
                monthKey={monthKey}
                onMonthChange={setMonthKey}
                prevTotals={prevTotals}
                plan={plan}
                onSavePlan={savePlan}
              />
            )}
            {tab === 'categories' && (
              <Categories categories={categories} transactions={transactions} onChanged={loadCategories} />
            )}
            {tab === 'account' && (
              <Account email={session.user.email} transactions={transactions} monthLabelText={monthLabelText} />
            )}
          </>
        )}
      </main>

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
