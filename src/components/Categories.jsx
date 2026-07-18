import { useMemo, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import ConfirmDialog from './ConfirmDialog'
import { formatMoney, categoryStyle } from '../utils'
import CategoryIcon, { categoryMeta } from './CategoryIcon'

export default function Categories({ categories, transactions, onChanged, onNavigateToNewCategory, onNavigateToEditCategory }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [contextCategoryId, setContextCategoryId] = useState(null)
  const [deletingCategory, setDeletingCategory] = useState(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setContextCategoryId(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const totals = useMemo(() => {
    const map = {}
    for (const t of transactions) {
      map[t.category] = map[t.category] || { expense: 0, income: 0 }
      map[t.category][t.type] += Number(t.amount)
    }
    return map
  }, [transactions])

  const totalExpenseAll = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const expenseDivisor = totalExpenseAll || 1

  const rows = categories
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter(c => {
      if (filter === 'all') return true
      const t = totals[c.name]
      if (!t) return false
      return filter === 'expense' ? t.expense > 0 : filter === 'income' ? t.income > 0 : false
    })
    .map(c => {
      const t = totals[c.name] || { expense: 0, income: 0 }
      const amount = filter === 'income' ? t.income : t.expense
      const pct = Math.round((t.expense / expenseDivisor) * 100)
      return { ...c, amount, pct }
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
    <div>
      {/* Full viewport dim and blur backdrop for the context menu */}
      {contextCategoryId && (
        <div
          className="context-blur-overlay"
          onClick={() => setContextCategoryId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(31, 29, 47, 0.28)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            transition: 'opacity 0.26s ease'
          }}
        />
      )}

      <div className="topbar">
        <h1>Категории</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="header-icon-btn"
            onClick={onNavigateToNewCategory}
            aria-label="Добавить категорию"
            style={{
              background: 'transparent',
              color: 'var(--ink-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--hairline)',
              cursor: 'pointer'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="search-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input placeholder="Поиск категорий" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="filter-pills">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Все</button>
        <button className={filter === 'expense' ? 'active' : ''} onClick={() => setFilter('expense')}>Расходы</button>
        <button className={filter === 'income' ? 'active' : ''} onClick={() => setFilter('income')}>Доходы</button>
      </div>

      <div className="card categories-card">
        {rows.length === 0 ? (
          <p className="muted">Ничего не найдено. Добавь категорию кнопкой «+» сверху.</p>
        ) : rows.map(c => {
          const style = categoryStyle(c.name)
          const customBg = c.color ? `rgba(${c.color}, 0.16)` : style.bg
          const customFg = c.color ? `rgb(${c.color})` : style.fg
          const isSelected = contextCategoryId === c.id

          return (
            <div
              className="cat-row category-list-row"
              key={c.id}
              onClick={() => {
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
                borderRadius: isSelected ? '16px' : '0',
                padding: isSelected ? '16px 12px' : '16px 6px',
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
                {c.icon ? c.icon : <CategoryIcon name={c.name} />}
              </div>
              <div className="cat-info" style={{ flex: 1, minWidth: 0 }}>
                <div className="cat-name" style={{ fontSize: '13.5px', fontWeight: 700 }}>{c.name}</div>
                <div className="cat-sub" style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                  {c.type ? (c.type === 'expense' ? 'Расходная категория' : 'Доходная категория') : categoryMeta(c.name).description}
                </div>
                <div className="cat-progress">
                  <div className="cat-progress-fill" style={{ width: `${Math.min(100, c.pct)}%`, background: customFg }} />
                </div>
              </div>
              <div className="cat-numbers" style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="cat-amount" style={{ fontSize: '13px', fontWeight: 700 }}>{formatMoney(c.amount)}</div>
                <div className="cat-pct" style={{ fontSize: '10.5px', color: 'var(--ink-faint)' }}>{c.pct}%</div>
              </div>
              <div className="cat-chevron" style={{ color: 'var(--ink-faint)', fontSize: '18px', flexShrink: 0 }}>
                ›
              </div>

              {/* Native iOS-style Context Menu */}
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
                    flexDirection: 'column',
                    transform: 'scale(1)',
                    opacity: 1,
                    animation: 'ios-context-appear 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                  }}
                >
                  <button
                    className="ios-context-item"
                    onClick={() => {
                      setContextCategoryId(null)
                      if (onNavigateToEditCategory) {
                        onNavigateToEditCategory(c)
                      }
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
                    <span style={{ fontSize: '16px', opacity: 0.8 }}>✏️</span>
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
                    <span style={{ fontSize: '16px', color: '#FF3B30' }}>🗑️</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* "Совет на сегодня" Card */}
      <div className="card advice-card" style={{
        marginTop: '16px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #E6E2F3 0%, #DFE8F0 100%)',
        border: '1px solid rgba(42, 39, 64, 0.08)'
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
            Откладывайте 10% от каждого дохода прямо в день его получения. Это сформирует вашу подушку безопасности без лишстого стресса.
          </div>
        </div>
      </div>

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
