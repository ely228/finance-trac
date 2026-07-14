import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'
import { supabase } from '../supabaseClient'
import { formatMoney, categoryStyle } from '../utils'
import CategoryIcon, { categoryMeta } from './CategoryIcon'

export default function AllTransactionsPage({ transactions = [], categories = [], onBack, onChanged }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'expense' | 'income'
  const [limit, setLimit] = useState(15) // spacious default limit
  const [pending, setPending] = useState(null)
  const [showFilters, setShowFilters] = useState(true) // toggleable filters as per Step 22.2

  async function confirmDelete() {
    if (!pending) return
    await supabase.from('transactions').delete().eq('id', pending.id)
    setPending(null)
    onChanged()
  }

  // Filter transactions based on type and case-insensitive match on Category or Comment
  const filtered = transactions
    .filter(t => {
      if (filter === 'expense' && t.type !== 'expense') return false
      if (filter === 'income' && t.type !== 'income') return false
      return true
    })
    .filter(t => {
      const s = search.toLowerCase()
      const catMatch = (t.category || '').toLowerCase().includes(s)
      const commentMatch = (t.comment || '').toLowerCase().includes(s)
      return catMatch || commentMatch
    })

  const totalFilteredCount = filtered.length
  const paginated = filtered.slice(0, limit)

  // Group transactions by date
  const groups = []
  const todayStr = new Date().toISOString().slice(0, 10)

  paginated.forEach(t => {
    const dateLabel = t.date === todayStr ? 'Сегодня' : new Date(t.date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    let group = groups.find(g => g.label === dateLabel)
    if (!group) {
      group = { label: dateLabel, items: [] }
      groups.push(group)
    }
    group.items.push(t)
  })

  return (
    <div className="all-transactions-page" style={{ position: 'relative', zIndex: 10 }}>
      {/* Step 22.2: Header with Back Arrow and Funnel Icon */}
      <div className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Назад"
          >
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>Все операции</h1>
        </div>

        {/* Funnel/Filter toggle icon button (Step 22.2) */}
        <button
          className="header-icon-btn"
          onClick={() => setShowFilters(f => !f)}
          aria-label="Фильтры"
          style={{
            background: showFilters ? 'var(--mat-1-bg)' : 'transparent',
            color: 'var(--ink-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid var(--hairline)',
            cursor: 'pointer'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Search Input */}
        <div className="search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="Поиск по категории или описанию…"
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setLimit(15) // reset pagination on search
            }}
          />
        </div>

        {/* Toggleable Filter Pills (Step 22.2) */}
        {showFilters && (
          <div className="filter-pills" style={{ animation: 'rise-in 180ms ease' }}>
            <button className={filter === 'all' ? 'active' : ''} onClick={() => { setFilter('all'); setLimit(15); }}>Все</button>
            <button className={filter === 'expense' ? 'active' : ''} onClick={() => { setFilter('expense'); setLimit(15); }}>Расходы</button>
            <button className={filter === 'income' ? 'active' : ''} onClick={() => { setFilter('income'); setLimit(15); }}>Доходы</button>
          </div>
        )}

        {/* Transactions List */}
        <div className="card" style={{ padding: '20px', minHeight: '300px' }}>
          {groups.length === 0 ? (
            <p className="muted" style={{ padding: '32px 0', textAlign: 'center' }}>Операций не найдено.</p>
          ) : (
            groups.map(group => (
              <div key={group.label} className="day-group">
                <div className="day-group-title" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: '10px', marginTop: '14px' }}>
                  {group.label}
                </div>
                {group.items.map(t => {
                  const catData = categories.find(c => c.name === t.category)
                  const style = categoryStyle(t.category)
                  const customBg = catData && catData.color ? `rgba(${catData.color}, 0.16)` : style.bg
                  const customFg = catData && catData.color ? `rgb(${catData.color})` : style.fg
                  const customIcon = catData && catData.icon ? catData.icon : null

                  return (
                    <div key={t.id} className={`tx-row ${t.type}`} style={{ padding: '14px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        className="tx-icon"
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
                        {customIcon ? customIcon : <CategoryIcon name={t.category} />}
                      </div>
                      <div className="tx-main" style={{ flex: 1, minWidth: 0 }}>
                        <span className="tx-cat" style={{ fontSize: '13.5px', fontWeight: 700 }}>{t.category}</span>
                        <span className="tx-comment" style={{ fontSize: '11.5px', color: 'var(--ink-faint)', marginTop: '2px' }}>
                          {t.comment || categoryMeta(t.category).description}
                        </span>
                      </div>
                      <div className="tx-right" style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span className="tx-amount" style={{ fontSize: '14px', fontWeight: 800 }}>
                          {t.type === 'expense' ? '−' : '+'}{formatMoney(t.amount)}
                        </span>
                        <span className="tx-date" style={{ fontSize: '10.5px', color: 'var(--ink-faint)', marginTop: '2px' }}>
                          {new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <button
                        className="tx-delete"
                        onClick={() => setPending(t)}
                        aria-label="Удалить"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--ink-faint)',
                          fontSize: '14px',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          flexShrink: 0,
                          transition: 'color 0.15s ease'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Spacious Pagination Footnotes */}
        {totalFilteredCount > paginated.length && (
          <div style={{ textAlign: 'center', marginTop: '24px', paddingBottom: '32px' }}>
            <p className="muted" style={{ fontSize: '12px', marginBottom: '12px' }}>
              Показано {paginated.length} из {totalFilteredCount} операций
            </p>
            <button
              className="submit-btn"
              onClick={() => setLimit(l => l + 15)}
              style={{ padding: '12px 24px', fontSize: '13px', width: 'auto', display: 'inline-flex', margin: '0 auto' }}
            >
              Смотреть далее ⌄
            </button>
          </div>
        )}

        {pending && (
          <ConfirmDialog
            title="Удалить операцию?"
            message={`«${pending.category}», ${formatMoney(pending.amount)} — это действие нельзя отменить.`}
            onConfirm={confirmDelete}
            onCancel={() => setPending(null)}
          />
        )}
      </div>
    </div>
  )
}
