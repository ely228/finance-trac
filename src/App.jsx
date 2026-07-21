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
import { currentMonthKey, monthLabel, shiftMonth, formatMoney, categoryStyle, formatRelativeDate } from './utils'
import CategoryIcon, { categoryMeta } from './components/CategoryIcon'

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

  // Step 21.1: subPage state for render routing inside tabs (null | 'new-category' | 'all-transactions')
  const [subPage, setSubPage] = useState(null)
  const [activeContext, setActiveContext] = useState(null)

  useEffect(() => {
    const handleClose = () => {
      setActiveContext(null)
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveContext(null)
    }
    if (activeContext) {
      window.addEventListener('click', handleClose)
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('scroll', handleClose, { passive: true })
      document.body.classList.add('context-blur-active')
    } else {
      document.body.classList.remove('context-blur-active')
    }
    return () => {
      window.removeEventListener('click', handleClose)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleClose)
      document.body.classList.remove('context-blur-active')
    }
  }, [activeContext])

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
      .select('*').gte('date', start).lt('date', end)
      .order('date', { ascending: false })
      .order('id', { ascending: false })
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

  // Reset subPage when switching tabs
  useEffect(() => {
    setSubPage(null)
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
            ) : subPage === 'all-transactions' ? (
              <AllTransactionsPage
                onBack={() => setSubPage(null)}
                transactions={transactions}
                categories={categories}
                onChanged={loadTransactions}
                onNavigateToNewCategory={() => setSubPage('new-category')}
                activeContext={activeContext}
                onTriggerContext={setActiveContext}
              />
            ) : (
              <>
                {/* Unified, Adaptive Premium Header across main views */}
                <header className="unified-header">
                  <h1 className="uh-title">
                    {tab === 'home' && "Главная"}
                    {tab === 'dashboard' && "Дашборд"}
                    {tab === 'categories' && "Категории"}
                    {tab === 'account' && "Аккаунт"}
                  </h1>
                  <div className="uh-actions">
                    {/* Inner Action Slot (Bell): Visible on home, dashboard, categories */}
                    {(tab === 'home' || tab === 'dashboard' || tab === 'categories') && (
                      <button
                        className="uh-btn bell-btn"
                        title="Уведомления"
                        onClick={() => alert('Новых уведомлений нет')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </button>
                    )}

                    {/* Outer Action Slot (Adaptive): Avatar on home/dashboard; Purple Plus on categories; Gear on account */}
                    {(tab === 'home' || tab === 'dashboard') && (
                      <button
                        className="uh-btn avatar-btn"
                        title="Профиль"
                        onClick={() => setTab('account')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </button>
                    )}

                    {tab === 'categories' && (
                      <button
                        className="uh-btn purple-plus-btn"
                        title="Добавить категорию"
                        onClick={() => setSubPage('new-category')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    )}

                    {tab === 'account' && (
                      <button
                        className="uh-btn settings-btn"
                        title="Настройки"
                        onClick={() => alert('Настройки будут доступны в следующем обновлении')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </header>

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
                    onNavigateToNewCategory={() => setSubPage('new-category')}
                    activeContext={activeContext}
                    onTriggerContext={setActiveContext}
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
                    activeContext={activeContext}
                    onTriggerContext={setActiveContext}
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

      {activeContext && (
        <div className="context-blur-overlay" onClick={() => setActiveContext(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: `${activeContext.rect.top}px`,
              left: `${activeContext.rect.left}px`,
              width: `${activeContext.rect.width}px`,
              zIndex: 1010,
              pointerEvents: 'auto'
            }}
          >
            {activeContext.type === 'category' ? (
              (() => {
                const c = activeContext.data;
                const style = categoryStyle(c.name);
                const customBg = c.color ? `rgba(${c.color}, 0.16)` : style.bg;
                const customFg = c.color ? `rgb(${c.color})` : style.fg;
                return (
                  <div
                    className="cat-row category-list-row context-menu-unblurred"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '12px 12px',
                      boxShadow: '0 10px 30px rgba(31, 29, 47, 0.12)',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div
                      className="cat-avatar"
                      style={{
                        background: customBg,
                        color: customFg,
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '18px',
                        fontWeight: 'bold',
                        border: '1px solid rgba(0,0,0,0.03)'
                      }}
                    >
                      <CategoryIcon name={c.icon || c.name} />
                    </div>
                    <div className="cat-info" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div className="cat-name" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>{c.name}</div>
                      <div className="cat-sub" style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>
                        {categoryMeta(c.name).description}
                      </div>
                    </div>
                    <div className="cat-numbers" style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px' }}>
                      <div className="cat-amount" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>{formatMoney(c.amount || 0)}</div>
                    </div>
                    <div className="cat-chevron" style={{ color: 'var(--ink-faint)', fontSize: '18px', flexShrink: 0 }}>
                      ›
                    </div>
                  </div>
                );
              })()
            ) : (
              (() => {
                const t = activeContext.data;
                const catData = categories.find(cat => cat.name === t.category);
                const style = categoryStyle(t.category);
                const customBg = catData && catData.color ? `rgba(${catData.color}, 0.16)` : style.bg;
                const customFg = catData && catData.color ? `rgb(${catData.color})` : style.fg;
                const customIcon = catData && catData.icon ? catData.icon : null;
                return (
                  <div
                    className={`tx-row ${t.type} context-menu-unblurred`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '12px 12px',
                      boxShadow: '0 10px 30px rgba(31, 29, 47, 0.12)',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div
                      className="tx-icon"
                      style={{
                        background: customBg,
                        color: customFg,
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '18px',
                        fontWeight: 'bold',
                        border: '1px solid rgba(0,0,0,0.03)'
                      }}
                    >
                      <CategoryIcon name={customIcon || t.category} />
                    </div>
                    <div className="tx-main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="tx-cat" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>{t.category}</span>
                      <span className="tx-comment" style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>{t.comment || categoryMeta(t.category).description}</span>
                    </div>
                    <div className="tx-right" style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px' }}>
                      <span className="tx-amount" style={{ fontSize: '14px', fontWeight: 800, color: t.type === 'expense' ? 'var(--expense)' : 'var(--income)' }}>
                        {t.type === 'expense' ? '−' : '+'}{formatMoney(t.amount)}
                      </span>
                      <span className="tx-date" style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>{formatRelativeDate(t.date)}</span>
                    </div>
                    <div className="cat-chevron" style={{ color: 'var(--ink-faint)', fontSize: '18px', flexShrink: 0 }}>
                      ›
                    </div>
                  </div>
                );
              })()
            )}

            <div
              className="ios-context-menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: '12px',
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '18px',
                padding: '4px',
                minWidth: '180px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                zIndex: 1011,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <button
                className="ios-context-item"
                onClick={() => {
                  activeContext.onEdit()
                  setActiveContext(null)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ink)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '14px',
                  textAlign: 'left',
                  transition: 'background 0.15s ease'
                }}
              >
                <span>Редактировать</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <div style={{ height: '1px', background: 'rgba(0, 0, 0, 0.05)', margin: '2px 8px' }} />
              <button
                className="ios-context-item danger"
                onClick={() => {
                  activeContext.onDelete()
                  setActiveContext(null)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: '#FF3B30',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '14px',
                  textAlign: 'left',
                  transition: 'background 0.15s ease'
                }}
              >
                <span>Удалить</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FF3B30' }}>
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
