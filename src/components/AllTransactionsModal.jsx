import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'
import { supabase } from '../supabaseClient'
import { formatMoney, categoryStyle } from '../utils'
import CategoryIcon, { categoryMeta } from './CategoryIcon'

export default function AllTransactionsModal({ transactions = [], onClose, onChanged }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'expense' | 'income'
  const [limit, setLimit] = useState(10)
  const [pending, setPending] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-handle" />
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">✕</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>Все операции</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink-soft)',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
            aria-label="Фильтры"
          >
            {/* 3 lines with sliders filter icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </button>
        </div>

        {showFilters && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <div className="search-bar" style={{ margin: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                placeholder="Поиск операций"
                value={search}
                onChange={e => {
                  setSearch(e.target.value)
                  setLimit(10) // reset pagination on search
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <div className="filter-pills" style={{ display: 'flex', gap: '8px', margin: 0, flex: 1 }}>
                <button className={filter === 'all' ? 'active' : ''} onClick={() => { setFilter('all'); setLimit(10); }}>Все</button>
                <button className={filter === 'expense' ? 'active' : ''} onClick={() => { setFilter('expense'); setLimit(10); }}>Расходы</button>
                <button className={filter === 'income' ? 'active' : ''} onClick={() => { setFilter('income'); setLimit(10); }}>Доходы</button>
              </div>
              <button
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '19px',
                  background: '#f1f1f5',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink-soft)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 150ms ease'
                }}
                onClick={() => alert('Календарь появится в будущих обновлениях!')}
                aria-label="Выбрать дату"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: '16px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '4px' }}>
          {groups.length === 0 ? (
            <p className="muted" style={{ padding: '16px 0', textAlign: 'center' }}>Операций не найдено.</p>
          ) : (
            groups.map(group => (
              <div key={group.label} className="day-group">
                <div className="day-group-title" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: '8px', marginTop: '12px' }}>
                  {group.label}
                </div>
                {group.items.map(t => {
                  const style = categoryStyle(t.category)
                  return (
                    <div key={t.id} className={`tx-row ${t.type}`} style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        className="tx-icon"
                        style={{
                          background: style.bg,
                          color: style.fg,
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <CategoryIcon name={t.category} />
                      </div>
                      <div className="tx-main" style={{ flex: 1, minWidth: 0 }}>
                        <span className="tx-cat" style={{ fontSize: '13.5px', fontWeight: 700 }}>{t.category}</span>
                        <span className="tx-comment" style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>{t.comment || categoryMeta(t.category).description}</span>
                      </div>
                      <div className="tx-right" style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span className="tx-amount" style={{ fontSize: '13px', fontWeight: 700 }}>{t.type === 'expense' ? '−' : '+'}{formatMoney(t.amount)}</span>
                        <span className="tx-date" style={{ fontSize: '10.5px', color: 'var(--ink-faint)' }}>{new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
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
                          flexShrink: 0
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

        {totalFilteredCount > paginated.length && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <p className="muted" style={{ fontSize: '12px', marginBottom: '8px' }}>
              Показано {paginated.length} из {totalFilteredCount} операций
            </p>
            <button
              className="submit-btn"
              onClick={() => setLimit(l => l + 10)}
              style={{ padding: '10px', fontSize: '13px', width: 'auto', display: 'inline-flex', margin: '0 auto' }}
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
