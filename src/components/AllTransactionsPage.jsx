import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'
import { supabase } from '../supabaseClient'
import { formatMoney, categoryStyle, formatRelativeDate } from '../utils'
import CategoryIcon, { categoryMeta } from './CategoryIcon'

import { useEffect } from 'react'
import EditTransactionModal from './EditTransactionModal'

export default function AllTransactionsPage({ transactions = [], categories = [], onBack, onChanged, onNavigateToNewCategory, activeContext, onTriggerContext }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'expense' | 'income'
  const [limit, setLimit] = useState(15) // spacious default limit
  const [pending, setPending] = useState(null)
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false) // toggle dropdown inside AllTransactionsPage
  const [editingTransaction, setEditingTransaction] = useState(null)

  // Outside click logic for dropdown
  useEffect(() => {
    if (!showFiltersDropdown) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.filter-dropdown-container')) {
        setShowFiltersDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showFiltersDropdown]);

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
    .sort((a, b) => {
      const dateComp = b.date.localeCompare(a.date)
      if (dateComp !== 0) return dateComp
      const aIdNum = Number(a.id)
      const bIdNum = Number(b.id)
      if (!isNaN(aIdNum) && !isNaN(bIdNum)) {
        return bIdNum - aIdNum
      }
      return String(b.id || '').localeCompare(String(a.id || ''))
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
      {/* Back button plain, filter toggle is now in the search bar line */}
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
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Search Input and Filter Button on the same row with height 48px */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', marginBottom: '16px', position: 'relative' }}>
          <div className="search-bar" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', borderRadius: '16px', border: '1px solid var(--hairline)', background: '#F5F6FA', height: '48px', margin: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Поиск по названию…"
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setLimit(15) // reset pagination on search
              }}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%', color: 'var(--ink)' }}
            />
          </div>

          {/* Filter button, white monolith style, height 48px */}
          <div className="filter-dropdown-container" style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
            <button
              onClick={() => setShowFiltersDropdown(f => !f)}
              aria-label="Фильтры"
              style={{
                background: '#F5F6FA',
                border: '1px solid var(--hairline)',
                borderRadius: '16px',
                color: showFiltersDropdown ? 'var(--lavender-dark)' : 'var(--ink-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                padding: 0,
                cursor: 'pointer',
                outline: 'none',
                boxShadow: 'var(--el-1)',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <circle cx="9" cy="7" r="2" fill="#FFFFFF" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <circle cx="15" cy="12" r="2" fill="#FFFFFF" />
                <line x1="4" y1="17" x2="20" y2="17" />
                <circle cx="11" cy="17" r="2" fill="#FFFFFF" />
              </svg>
            </button>

            {/* iOS-Style Dropdown Menu with Slide/Fade animation */}
            <div
              style={{
                position: 'absolute',
                top: '56px',
                right: 0,
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid var(--hairline)',
                boxShadow: '0 10px 30px rgba(31, 29, 47, 0.12)',
                zIndex: 100,
                minWidth: '150px',
                padding: '6px',
                pointerEvents: showFiltersDropdown ? 'auto' : 'none',
                opacity: showFiltersDropdown ? 1 : 0,
                transform: showFiltersDropdown ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)',
                transition: 'opacity 0.2s cubic-bezier(0.22, 1, 0.36, 1), transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                transformOrigin: 'top right'
              }}
            >
              {[
                { key: 'all', label: 'Все' },
                { key: 'expense', label: 'Расходы' },
                { key: 'income', label: 'Доходы' }
              ].map(opt => {
                const isActive = filter === opt.key
                return (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setFilter(opt.key)
                      setLimit(15)
                      setShowFiltersDropdown(false)
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: isActive ? 'rgba(136, 101, 232, 0.08)' : 'transparent',
                      border: 'none',
                      color: isActive ? 'var(--lavender-dark)' : 'var(--ink)',
                      fontSize: '13.5px',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      outline: 'none',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <span>{opt.label}</span>
                    {isActive && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--lavender-dark)' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Transactions List with clean visual, no white elevated box */}
        <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          {groups.length === 0 ? (
            <p className="muted" style={{ padding: '32px 0', textAlign: 'center' }}>Операций не найдено.</p>
          ) : (
            groups.map(group => (
              <div key={group.label} className="day-group">
                <div className="day-group-title" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink-faint)', textTransform: 'none', marginBottom: '8px', marginTop: '16px' }}>
                  {group.label}
                </div>
                {group.items.map(t => {
                  const catData = categories.find(c => c.name === t.category)
                  const style = categoryStyle(t.category)
                  const customBg = catData && catData.color ? `rgba(${catData.color}, 0.16)` : style.bg
                  const customFg = catData && catData.color ? `rgb(${catData.color})` : style.fg
                  const customIcon = catData && catData.icon ? catData.icon : null
                  const isHidden = activeContext && activeContext.type === 'transaction' && activeContext.data.id === t.id

                  return (
                    <div
                      key={t.id}
                      className={`tx-row ${t.type}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        onTriggerContext({
                          type: 'transaction',
                          data: t,
                          rect,
                          onEdit: () => setEditingTransaction(t),
                          onDelete: () => setPending(t)
                        });
                      }}
                      style={{
                        padding: '14px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        borderRadius: '16px',
                        borderBottom: '1px solid var(--hairline)',
                        position: 'relative',
                        background: 'transparent',
                        visibility: isHidden ? 'hidden' : 'visible',
                        transition: 'background 0.24s cubic-bezier(0.22, 1, 0.36, 1)'
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
                          border: '1px solid rgba(0,0,0,0.02)'
                        }}
                      >
                        <CategoryIcon name={customIcon || t.category} />
                      </div>
                      <div className="tx-main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="tx-cat" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>{t.category}</span>
                        <span className="tx-comment" style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>
                          {t.comment || categoryMeta(t.category).description}
                        </span>
                      </div>
                      <div className="tx-right" style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px' }}>
                        <span className="tx-amount" style={{ fontSize: '14px', fontWeight: 800, color: t.type === 'expense' ? 'var(--expense)' : 'var(--income)' }}>
                          {t.type === 'expense' ? '−' : '+'}{formatMoney(t.amount)}
                        </span>
                        <span className="tx-date" style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>
                          {formatRelativeDate(t.date)}
                        </span>
                      </div>
                      <div className="cat-chevron" style={{ color: 'var(--ink-faint)', fontSize: '18px', flexShrink: 0 }}>
                        ›
                      </div>
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

        {editingTransaction && (
          <EditTransactionModal
            transaction={editingTransaction}
            categories={categories}
            onSaved={onChanged}
            onClose={() => setEditingTransaction(null)}
            onNavigateToNewCategory={onNavigateToNewCategory}
          />
        )}
      </div>
    </div>
  )
}
