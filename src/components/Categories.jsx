import { useMemo, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import EditCategorySheet from './EditCategorySheet'
import ConfirmDialog from './ConfirmDialog'
import { formatMoney, categoryStyle } from '../utils'
import CategoryIcon, { categoryMeta } from './CategoryIcon'

export default function Categories({ categories, transactions, onChanged, onNavigateToNewCategory }) {
  const [search, setSearch] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [contextCategoryId, setContextCategoryId] = useState(null)
  const [deletingCategory, setDeletingCategory] = useState(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setContextCategoryId(null)
      }
    }
    const handleOutsideClick = () => {
      setContextCategoryId(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleOutsideClick)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleOutsideClick)
    }
  }, [])

  // Toggle body class to trigger full-screen blur when context menu is open
  useEffect(() => {
    if (contextCategoryId) {
      document.body.classList.add('context-blur-active')
    } else {
      document.body.classList.remove('context-blur-active')
    }
    return () => {
      document.body.classList.remove('context-blur-active')
    }
  }, [contextCategoryId])

  const totals = useMemo(() => {
    const map = {}
    for (const t of transactions) {
      map[t.category] = map[t.category] || { expense: 0, income: 0 }
      map[t.category][t.type] += Number(t.amount)
    }
    return map
  }, [transactions])

  const totalExpenseAll = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const totalIncomeAll = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expenseDivisor = totalExpenseAll || 1
  const incomeDivisor = totalIncomeAll || 1

  const latestDateMap = useMemo(() => {
    const map = {}
    for (const t of transactions) {
      const cat = t.category
      const d = t.date
      if (!map[cat] || d > map[cat]) {
        map[cat] = d
      }
    }
    return map
  }, [transactions])

  const rows = categories
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .map(c => {
      const t = totals[c.name] || { expense: 0, income: 0 }
      // Show appropriate amount depending on category type or fallback to expense
      const isIncome = c.type === 'income'
      const amount = isIncome ? t.income : t.expense
      const pct = isIncome 
        ? Math.round((t.income / incomeDivisor) * 100)
        : Math.round((t.expense / expenseDivisor) * 100)
      const latestDate = latestDateMap[c.name] || ''
      return { ...c, amount, pct, latestDate }
    })
    .sort((a, b) => {
      if (a.latestDate && b.latestDate) {
        return b.latestDate.localeCompare(a.latestDate)
      }
      if (a.latestDate) return -1
      if (b.latestDate) return 1
      return a.name.localeCompare(b.name)
    })

  async function confirmDeleteCategory() {
    if (!deletingCategory) return
    const { error: err } = await supabase
      .from('categories')
      .delete()
      .eq('id', deletingCategory.id)
    if (err) {
      alert(err.message)
      return
    }
    setDeletingCategory(null)
    onChanged()
  }

  return (
    <div className="home-grid">
      {/* Full viewport dim and blur backdrop for the context menu */}
      {contextCategoryId && (
        <div
          className="context-blur-overlay"
          onClick={() => setContextCategoryId(null)}
        />
      )}

      <div className="home-main-col">
        <div className="home-greeting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: '8px' }}>
          <h1 style={{ margin: 0, fontSize: '30px', fontWeight: 800, color: 'var(--ink)' }}>Категории</h1>
          <button
            className="notification-btn"
            onClick={onNavigateToNewCategory}
            aria-label="Добавить категорию"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#FFFFFF',
              border: '1px solid var(--hairline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: 'var(--el-1)',
              outline: 'none',
              padding: 0
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink)' }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        <div className="search-bar" style={{ marginBottom: '16px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input placeholder="Поиск категорий" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Clean, Unified categories. Expense/Income tabs deleted as requested */}

        <div className="card categories-card" style={{ overflow: 'visible', marginBottom: 0 }}>
          {rows.length === 0 ? (
            <p className="muted">Ничего не найдено. Добавь категорию кнопкой «+» сверху.</p>
          ) : rows.map(c => {
            const style = categoryStyle(c.name)
            const customBg = c.color ? `rgba(${c.color}, 0.16)` : style.bg
            const customFg = c.color ? `rgb(${c.color})` : style.fg
            const isSelected = contextCategoryId === c.id

            return (
              <div
                className={`cat-row category-list-row ${isSelected ? 'context-menu-unblurred' : ''}`}
                key={c.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (contextCategoryId === c.id) {
                    setContextCategoryId(null)
                  } else {
                    setContextCategoryId(c.id)
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: isSelected ? 1010 : 1,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  background: isSelected ? '#FFFFFF' : 'transparent',
                  borderRadius: isSelected ? '16px' : '16px', // constant 16px to prevent layout changes
                  padding: isSelected ? '16px 12px' : '16px 12px', // constant padding prevents stutter
                  boxShadow: isSelected ? '0 10px 30px rgba(31, 29, 47, 0.12)' : 'none',
                  transition: 'all 0.24s cubic-bezier(0.22, 1, 0.36, 1)'
                }}
              >
                <div
                  className="cat-avatar"
                  style={{
                    background: customBg,
                    color: customFg,
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  <CategoryIcon name={c.icon || c.name} />
                </div>
                <div className="cat-info" style={{ flex: 1, minWidth: 0 }}>
                  <div className="cat-name" style={{ fontSize: '13.5px', fontWeight: 700 }}>{c.name}</div>
                  <div className="cat-sub" style={{ fontSize: '11px', color: 'var(--ink-soft)', marginBottom: '4px' }}>
                    {categoryMeta(c.name).description}
                  </div>
                  <div className="cat-progress">
                    <div className="cat-progress-fill" style={{ width: `${Math.min(100, c.pct || 0)}%`, background: customFg }} />
                  </div>
                </div>
                <div className="cat-numbers" style={{ textAlign: 'right', flexShrink: 0, marginRight: '8px' }}>
                  <div className="cat-amount" style={{ fontSize: '13px', fontWeight: 700 }}>{formatMoney(c.amount || 0)}</div>
                  <div className="cat-pct" style={{ fontSize: '10.5px', color: 'var(--ink-faint)' }}>{c.pct || 0}%</div>
                </div>
                <div className="cat-chevron" style={{ color: 'var(--ink-faint)', fontSize: '18px', flexShrink: 0, marginLeft: '4px' }}>
                  ›
                </div>

                {/* Native iOS-style Context Menu with SF Symbols / SVG style outline icons */}
                {isSelected && (
                  <div
                    className="ios-context-menu"
                    onClick={e => e.stopPropagation()}
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
                        setContextCategoryId(null)
                        setEditingCategory(c)
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
                        setContextCategoryId(null)
                        setDeletingCategory(c)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#FF3B30', // System iOS red
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
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="recent-section">
        {/* "Совет на сегодня" Card */}
        <div className="card advice-card" style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #E6E2F3 0%, #DFE8F0 100%)',
          border: '1px solid rgba(42, 39, 64, 0.08)',
          marginBottom: 0
        }}>
          <div className="advice-icon" style={{
            background: 'rgba(184, 154, 244, 0.15)',
            color: '#8865E8',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5.5 5.5 0 0 0 12.5 2.5a5.5 5.5 0 0 0-5.5 5.5c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
              <path d="M9 18h6M10 22h4" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, textTransform: 'none', color: 'var(--ink)' }}>Совет на сегодня</h2>
            <div style={{ fontSize: '12.5px', fontWeight: 600, marginTop: '4px', lineHeight: '1.4', color: 'var(--ink-soft)' }}>
              Откладывайте 10% от каждого дохода прямо в день его получения. Это сформирует вашу подушку безопасности без лишнего стресса.
            </div>
          </div>
        </div>
      </div>

      {editingCategory && (
        <EditCategorySheet
          category={editingCategory}
          onSaved={onChanged}
          onClose={() => setEditingCategory(null)}
        />
      )}

      {deletingCategory && (
        <ConfirmDialog
          title="Удалить категорию?"
          message="Это действие нельзя отменить."
          onConfirm={confirmDeleteCategory}
          onCancel={() => setDeletingCategory(null)}
        />
      )}
    </div>
  )
}
