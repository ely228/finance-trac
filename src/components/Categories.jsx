import { useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import ConfirmDialog from './ConfirmDialog'
import AddCategorySheet from './AddCategorySheet'
import { formatMoney, categoryStyle, categoryInitial } from '../utils'

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
      return filter === 'expense' ? t.expense > 0 : t.income > 0
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
        <span>🔍</span>
        <input placeholder="Поиск категорий" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="filter-pills">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Все</button>
        <button className={filter === 'expense' ? 'active' : ''} onClick={() => setFilter('expense')}>Расходы</button>
        <button className={filter === 'income' ? 'active' : ''} onClick={() => setFilter('income')}>Доходы</button>
      </div>

      <div className="card">
        {rows.length === 0 ? (
          <p className="muted">Ничего не найдено. Добавь категорию кнопкой «+» сверху.</p>
        ) : rows.map(c => {
          const style = categoryStyle(c.name)
          return (
            <div className="cat-row" key={c.id}>
              <div className="cat-avatar" style={{ background: style.bg, color: style.fg }}>{categoryInitial(c.name)}</div>
              <div className="cat-info">
                <div className="cat-name">{c.name}</div>
                <div className="cat-progress"><div className="cat-progress-fill" style={{ width: `${Math.min(100, c.pct)}%`, background: style.fg }} /></div>
              </div>
              <div className="cat-numbers">
                <div className="cat-amount">{formatMoney(c.amount)}</div>
                <div className="cat-pct">{c.pct}%</div>
              </div>
              <button className="tx-delete" onClick={() => setPending(c)} aria-label="Удалить">✕</button>
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
