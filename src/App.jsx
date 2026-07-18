import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import Nav from './components/Nav'
import Home from './components/Home'
import Dashboard from './components/Dashboard'
import Categories from './components/Categories'
import Account from './components/Account'
import AddTransactionModal from './components/AddTransactionModal'
import Auth from './components/Auth'
import NewCategoryPage from './components/NewCategoryPage'
import AllTransactionsPage from './components/AllTransactionsPage'
import { currentMonthKey, monthLabel, shiftMonth } from './utils'

const visualTest = import.meta.env.DEV && new URLSearchParams(window.location.search).get('visual-test') === '1'
const visualTab = new URLSearchParams(window.location.search).get('tab') || 'home'
const visualCategories = [
  { id: '1', name: 'Zal i td' }, { id: '2', name: 'Еда' }, { id: '3', name: 'Sigi' },
  { id: '4', name: 'Dom' }, { id: '5', name: 'Transport' }, { id: '6', name: 'Здоровье' },
]
const visualTransactions = [
  { id: '1', type: 'income', amount: 5000, category: 'Доход', date: '2026-07-01', comment: 'Зарплата' },
  { id: '2', type: 'expense', amount: 3300, category: 'Zal i td', date: '2026-07-09', comment: 'Одежда' },
  { id: '3', type: 'expense', amount: 689, category: 'Еда', date: '2026-07-09', comment: 'Рестораны' },
  { id: '4', type: 'expense', amount: 404, category: 'Sigi', date: '2026-07-08', comment: 'Такси' },
]

export default function App() {
  const [session, setSession] = useState(visualTest ? { user: { email: 'test@fintrac.local' } } : undefined)
  const [tab, setTab] = useState(visualTest ? visualTab : 'home')
  const [monthKey, setMonthKey] = useState(currentMonthKey())
  const [categories, setCategories] = useState(visualTest ? visualCategories : [])
  const [transactions, setTransactions] = useState(visualTest ? visualTransactions : [])
  const [prevTotals, setPrevTotals] = useState(visualTest ? { income: 4450, expense: 4100 } : null)
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(!visualTest)

  // Sub-page state inside tabs (null | 'new-category' | 'edit-category' | 'all-transactions')
  const [subPage, setSubPage] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)

  useEffect(() => {
    if (visualTest) return
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

  useEffect(() => {
    if (visualTest) return
    if (!session) return
    setLoading(true)
    Promise.all([loadCategories(), loadTransactions(), loadPrevMonthTotals()]).finally(() => setLoading(false))
  }, [loadCategories, loadTransactions, loadPrevMonthTotals, session])

  // Reset subPage and editing category state when switching tabs
  useEffect(() => {
    setSubPage(null)
    setEditingCategory(null)
  }, [tab])

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

      {/* Nav is locked/fixed at bottom, visible even when viewing subPage based on Step 23.2 */}
      <Nav tab={tab} setTab={setTab} />

      <main className="content">
        {loading ? (
          <p className="muted">Загрузка…</p>
        ) : (
          <>
            {/* Sub-pages logic (renders instead of tab content if active) */}
            {subPage === 'new-category' ? (
              <NewCategoryPage
                onBack={() => setSubPage(null)}
                onAdded={() => {
                  loadCategories()
                  setSubPage(null)
                }}
              />
            ) : subPage === 'edit-category' && editingCategory ? (
              <NewCategoryPage
                isEditing={true}
                categoryToEdit={editingCategory}
                onBack={() => {
                  setSubPage(null)
                  setEditingCategory(null)
                }}
                onAdded={() => {
                  loadCategories()
                  setSubPage(null)
                  setEditingCategory(null)
                }}
              />
            ) : subPage === 'all-transactions' ? (
              <AllTransactionsPage
                onBack={() => setSubPage(null)}
                transactions={transactions}
                onChanged={loadTransactions}
              />
            ) : (
              <>
                {tab === 'home' && (
                  <Home
                    transactions={transactions}
                    categories={categories}
                    email={session.user.email}
                    onChanged={loadTransactions}
                    onOpenDashboard={() => setTab('dashboard')}
                    onAdd={() => setShowAdd(true)}
                    onViewAllTransactions={() => setSubPage('all-transactions')}
                    prevTotals={prevTotals}
                    monthKey={monthKey}
                  />
                )}
                {tab === 'dashboard' && (
                  <Dashboard
                    transactions={transactions}
                    monthKey={monthKey}
                    onMonthChange={setMonthKey}
                    prevTotals={prevTotals}
                  />
                )}
                {tab === 'categories' && (
                  <Categories
                    categories={categories}
                    transactions={transactions}
                    onChanged={loadCategories}
                    onNavigateToNewCategory={() => setSubPage('new-category')}
                    onNavigateToEditCategory={(c) => {
                      setEditingCategory(c)
                      setSubPage('edit-category')
                    }}
                  />
                )}
                {tab === 'account' && (
                  <Account email={session.user.email} transactions={transactions} monthLabelText={monthLabelText} />
                )}
              </>
            )}
          </>
        )}
      </main>

      {showAdd && (
        <AddTransactionModal
          categories={categories}
          onAdded={loadTransactions}
          onClose={() => setShowAdd(false)}
          onNavigateToNewCategory={() => setSubPage('new-category')}
        />
      )}

    </div>
  )
}
