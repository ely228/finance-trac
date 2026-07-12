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
      <div className="topbar">
        <h1>Категории</h1>
        <button className="header-icon-btn" onClick={() => setShowAdd(true)} aria-label="Добавить категорию">+</button>
      </div>

      <div className="search-bar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input placeholder="Поиск категорий" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="filter-pills">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Все</button>
        <button className={filter === 'expense' ? 'active' : ''} onClick={() => setFilter('expense')}>Расходы</button>
        <button className={filter === 'income' ? 'active' : ''} onClick={() => setFilter('income')}>Доходы</button>
        <button className={filter === 'transfer' ? 'active' : ''} onClick={() => setFilter('transfer')}>Трансферы</button>
      </div>

      <div className="card categories-card">
        {rows.length === 0 ? (
          <p className="muted">Ничего не найдено. Добавь категорию кнопкой «+» сверху.</p>
        ) : rows.map(c => {
          const style = categoryStyle(c.name)
          return (
            <div className="cat-row category-list-row" key={c.id}>
              <div className={`cat-avatar category-icon ${categoryMeta(c.name).tone}`} style={{ color: style.fg }}><CategoryIcon name={c.name} /></div>
              <div className="cat-info">
                <div className="cat-name">{c.name}</div>
                <div className="cat-sub">{categoryMeta(c.name).description}</div>
                <div className="cat-progress"><div className="cat-progress-fill" style={{ width: `${Math.min(100, c.pct)}%`, background: style.fg }} /></div>
              </div>
              <div className="cat-numbers">
                <div className="cat-amount">{formatMoney(c.amount)}</div>
                <div className="cat-pct">{c.pct}%</div>
              </div>
              <span className="cat-chevron">›</span>
              <button className="cat-delete" onClick={() => setPending(c)} aria-label={`Удалить категорию ${c.name}`}>×</button>
            </div>
          )
        })}
        <div className="cat-total-row">
          <div className="cat-avatar" style={{ background: 'rgba(156,135,214,0.14)', color: 'var(--lavender-dark)' }}>Σ</div>
          <div className="cat-info"><div className="cat-name">Всего расходов</div></div>
          <div className="cat-numbers"><div className="cat-amount">{formatMoney(totalExpenseAll)}</div></div>
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
