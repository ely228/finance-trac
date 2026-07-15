import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'
import { supabase } from '../supabaseClient'
import { formatMoney, categoryStyle, formatRelativeDate } from '../utils'
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

  // Group transactions by date using utils relative date helper
  const groups = []

  paginated.forEach(t => {
    // Relative date grouping title formatted cleanly
    const dateLabel = formatRelativeDate(t.date, true) // Pass true to show full year if old
    let group = groups.find(g => g.label === dateLabel)
    if (!group) {
      group = { label: dateLabel, items: [] }
      groups.push(group)
    }
    group.items.push(t)
  })

  return (
    <div className="all-transactions-page" style={{ position: 'relative', zIndex: 10, margin: '0 auto' }}>
      {/* Step 29.1 & 29.2: Back button plain, filter button subtle */}
      <div className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink)',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none'
            }}
            aria-label="Назад"
          >
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>Все операции</h1>
        </div>

        <button
          onClick={() => setShowFilters(f => !f)}
          aria-label="Фильтры"
          style={{
            background: 'none',
            color: 'var(--ink-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: '1px solid var(--hairline)',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Search Input (Step 29.3 placeholder) */}
        <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '16px', border: '1px solid var(--hairline)', background: '#F5F6FA' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
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
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%', color: 'var(--ink)' }}
          />
        </div>

        {/* Toggleable Filter Pills (Step 29.4) */}
        {showFilters && (
          <div className="filter-pills-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', margin: '4px 0 16px' }}>
            <div className="filter-pills" style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => { setFilter('all'); setLimit(15); }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '999px',
                  border: '1px solid var(--hairline)',
                  background: filter === 'all' ? 'var(--gradient-btn)' : '#FFFFFF',
                  color: filter === 'all' ? '#FFFFFF' : 'var(--ink-soft)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                Все
              </button>
              <button
                className={filter === 'expense' ? 'active' : ''}
                onClick={() => { setFilter('expense'); setLimit(15); }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '999px',
                  border: '1px solid var(--hairline)',
                  background: filter === 'expense' ? 'var(--gradient-btn)' : '#FFFFFF',
                  color: filter === 'expense' ? '#FFFFFF' : 'var(--ink-soft)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                Расходы
              </button>
              <button
                className={filter === 'income' ? 'active' : ''}
                onClick={() => { setFilter('income'); setLimit(15); }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '999px',
                  border: '1px solid var(--hairline)',
                  background: filter === 'income' ? 'var(--gradient-btn)' : '#FFFFFF',
                  color: filter === 'income' ? '#FFFFFF' : 'var(--ink-soft)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                Доходы
              </button>
            </div>

            {/* Separated calendar icon button (Step 29.4) */}
            <button
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                border: '1px solid var(--hairline)',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                outline: 'none',
                flexShrink: 0
              }}
              onClick={() => alert('Фильтр по календарю появится в будущих обновлениях')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-soft)' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>
          </div>
        )}

        {/* Transactions List with clean visual, no white elevated box */}
        <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          {groups.length === 0 ? (
            <p className="muted" style={{ padding: '32px 0', textAlign: 'center' }}>Операций не найдено.</p>
          ) : (
            groups.map(group => (
              <div key={group.label} className="day-group">
                <div className="day-group-title" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: '8px', marginTop: '16px' }}>
                  {group.label}
                </div>
                {group.items.map(t => {
                  const catData = categories.find(c => c.name === t.category)
                  const style = categoryStyle(t.category)
                  const customBg = catData && catData.color ? `rgba(${catData.color}, 0.16)` : style.bg
                  const customFg = catData && catData.color ? `rgb(${catData.color})` : style.fg
                  const customIcon = catData && catData.icon ? catData.icon : null

                  return (
                    <div key={t.id} className={`tx-row ${t.type}`} style={{ padding: '14px 4px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--hairline)' }}>
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
                          border: '1px solid rgba(0,0,0,0.02)'
                        }}
                      >
                        {customIcon ? customIcon : <CategoryIcon name={t.category} />}
                      </div>
                      <div className="tx-main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="tx-cat" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>{t.category}</span>
                        <span className="tx-comment" style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>
                          {t.comment || categoryMeta(t.category).description}
                        </span>
                      </div>
                      <div className="tx-right" style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="tx-amount" style={{ fontSize: '14px', fontWeight: 800, color: t.type === 'expense' ? 'var(--ink)' : 'var(--income)' }}>
                          {t.type === 'expense' ? '−' : '+'}{formatMoney(t.amount)}
                        </span>
                        <span className="tx-date" style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>
                          {formatRelativeDate(t.date)}
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
                          padding: '4px',
                          marginLeft: '4px',
                          flexShrink: 0,
                          opacity: '0.4'
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
