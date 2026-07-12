import { useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import ConfirmDialog from './ConfirmDialog'
import AddCategorySheet from './AddCategorySheet'
import { formatMoney, categoryStyle } from '../utils'
import CategoryIcon, { categoryMeta } from './CategoryIcon'

export default function Categories({ categories, transactions, onChanged }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [pending, setPending] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

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

  async function confirmDelete() {
    if (!pending) return
    await supabase.from('categories').delete().eq('id', pending.id)
    setPending(null)
    onChanged()
  }

  return (
    <div>
      <div className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontWeight: 500, color: 'var(--ink-soft)' }}>Категории</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Edit Mode Toggle Button */}
          <button 
            className="header-icon-btn" 
            onClick={() => setIsEditing(!isEditing)} 
            aria-label="Режим редактирования" 
            style={{ 
              background: isEditing ? 'rgba(232, 99, 122, 0.12)' : 'transparent', 
              borderColor: isEditing ? 'var(--expense)' : 'var(--hairline)',
              color: isEditing ? 'var(--expense)' : 'var(--ink-soft)',
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
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* Add Category Button */}
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
            <div className="cat-row category-list-row" key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              
              {isEditing ? (
                <button 
                  className="cat-delete" 
                  onClick={() => setPending(c)} 
                  aria-label={`Удалить категорию ${c.name}`}
                  style={{
                    background: 'rgba(232, 99, 122, 0.1)',
                    border: 'none',
                    color: 'var(--expense)',
                    borderRadius: '50%',
                    width: '26px',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              ) : (
                <span className="cat-chevron" style={{ color: 'var(--ink-faint)', fontSize: '14px', flexShrink: 0 }}>›</span>
              )}
            </div>
          )
        })}
        <div className="cat-total-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--hairline)', paddingTop: '12px' }}>
          <div className="cat-avatar" style={{ background: 'rgba(42, 39, 64, 0.05)', color: 'var(--ink-soft)', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Σ</div>
          <div className="cat-info" style={{ flex: 1 }}><div className="cat-name" style={{ fontSize: '13.5px', fontWeight: 700 }}>Всего расходов</div></div>
          <div className="cat-numbers" style={{ textAlign: 'right' }}><div className="cat-amount" style={{ fontSize: '13.5px', fontWeight: 800 }}>{formatMoney(totalExpenseAll)}</div></div>
        </div>
      </div>

      {/* "Совет на сегодня" Card */}
      <div className="advice-card" style={{
        background: 'linear-gradient(135deg, #F78DC5 0%, #EC5DA6 100%)',
        color: '#fff',
        borderRadius: 'var(--r-lg)',
        padding: '14px 16px',
        marginTop: '16px',
        boxShadow: 'var(--el-1)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}>
        <div className="advice-icon" style={{
          background: 'rgba(255, 255, 255, 0.2)',
          width: '36px',
          height: '36px',
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
          <div style={{ fontWeight: 800, fontSize: '11px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Совет на сегодня</div>
          <div style={{ fontSize: '12.5px', fontWeight: 600, marginTop: '2px', lineHeight: '1.35', opacity: 0.95 }}>
            Откладывайте 10% от каждого дохода прямо в день его получения. Это сформирует вашу подушку безопасности без лишнего стресса.
          </div>
        </div>
      </div>

      {pending && (
        <ConfirmDialog
          title="Удалить категорию?"
          message={`«${pending.name}» — прошлые операции с этой категорией останутся, но выбрать её заново будет нельзя.`}
          onConfirm={confirmDelete}
          onCancel={() => setPending(null)}
        />
      )}

      {showAdd && <AddCategorySheet onAdded={onChanged} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
