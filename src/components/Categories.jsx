import { useMemo, useState } from 'react'
import AddCategorySheet from './AddCategorySheet'
import EditCategorySheet from './EditCategorySheet'
import { formatMoney, categoryStyle } from '../utils'
import CategoryIcon, { categoryMeta } from './CategoryIcon'

export default function Categories({ categories, transactions, onChanged }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

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

  return (
    <div>
      <div className="topbar">
        <h1>Категории</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Add Category Button - exactly one action button in topbar */}
          <button
            className="header-icon-btn"
            onClick={() => setShowAdd(true)}
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
          return (
            <div
              className="cat-row category-list-row"
              key={c.id}
              onClick={() => setEditingCategory(c)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            >
              <div
                className="cat-avatar"
                style={{
                  background: style.bg,
                  color: style.fg,
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CategoryIcon name={c.name} />
              </div>
              <div className="cat-info" style={{ flex: 1, minWidth: 0 }}>
                <div className="cat-name" style={{ fontSize: '13.5px', fontWeight: 700 }}>{c.name}</div>
                <div className="cat-sub" style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{categoryMeta(c.name).description}</div>
                <div className="cat-progress"><div className="cat-progress-fill" style={{ width: `${Math.min(100, c.pct)}%`, background: style.fg }} /></div>
              </div>
              <div className="cat-numbers" style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="cat-amount" style={{ fontSize: '13px', fontWeight: 700 }}>{formatMoney(c.amount)}</div>
                <div className="cat-pct" style={{ fontSize: '10.5px', color: 'var(--ink-faint)' }}>{c.pct}%</div>
              </div>
              <span className="cat-chevron" style={{ color: 'var(--ink-faint)', fontSize: '14px', flexShrink: 0 }}>›</span>
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
            Откладывайте 10% от каждого дохода прямо в день его получения. Это сформирует вашу подушку безопасности без лишнего стресса.
          </div>
        </div>
      </div>

      {showAdd && <AddCategorySheet onAdded={onChanged} onClose={() => setShowAdd(false)} />}

      {editingCategory && (
        <EditCategorySheet
          category={editingCategory}
          onSaved={onChanged}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  )
}
