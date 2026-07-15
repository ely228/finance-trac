import { useState, useRef, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { todayISO, categoryStyle } from '../utils'

export default function AddTransactionModal({ categories, onAdded, onClose, onNavigateToNewCategory }) {
  const [date, setDate] = useState(todayISO())
  const [category, setCategory] = useState('')
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const dateInputRef = useRef(null)

  // Filter categories according to the active type (expense or income) if they have a 'type' attribute,
  // or fall back to displaying all if 'type' is not yet present on some/all entries.
  const filteredCategories = categories.filter(c => !c.type || c.type === type)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!category) return setError('Выбери категорию')
    if (!amount || Number(amount) <= 0) return setError('Укажи сумму больше нуля')

    setSaving(true)
    const { error: err } = await supabase.from('transactions').insert({
      date,
      category,
      type,
      amount: Number(amount),
      comment: comment || null,
    })
    setSaving(false)

    if (err) {
      setError('Ошибка сохранения: ' + err.message)
      return
    }
    setAmount('')
    setComment('')
    onAdded()
    onClose()
  }

  // When changing type, clear category if the currently selected category is not in the filtered categories
  useEffect(() => {
    if (category) {
      const exists = filteredCategories.some(c => c.name === category)
      if (!exists) {
        setCategory('')
      }
    }
  }, [type, categories])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">✕</button>

        <form className="form" onSubmit={handleSubmit}>
          <h2>Новая операция</h2>

          {/* Operation type toggle (Step 20.2: Income and Expense only) */}
          <div className="type-toggle" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              className={type === 'expense' ? 'active expense' : 'expense'}
              onClick={() => setType('expense')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'rgba(236, 93, 166, 0.15)',
                color: 'var(--expense)',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>↓</span>
              <span>Расход</span>
            </button>
            <button
              type="button"
              className={type === 'income' ? 'active income' : 'income'}
              onClick={() => setType('income')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'rgba(55, 184, 145, 0.15)',
                color: 'var(--income)',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>↑</span>
              <span>Доход</span>
            </button>
          </div>

          {/* Date Picker (Step 20.4: clickable compact row) */}
          <label>Дата</label>
          <div
            className="form-field-group"
            onClick={() => dateInputRef.current && dateInputRef.current.showPicker()}
            style={{ cursor: 'pointer', marginBottom: '20px' }}
          >
            <div className="form-field-icon-sq" style={{ background: 'rgba(136, 101, 232, 0.08)', color: 'var(--lavender-dark)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div style={{ flex: 1, fontSize: '15px', color: 'var(--ink)' }}>
              {date}
            </div>
            <input
              type="date"
              ref={dateInputRef}
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', left: 0, top: 0, pointerEvents: 'none' }}
              required
            />
            <div style={{ color: 'var(--ink-faint)', fontSize: '12px', paddingRight: '4px' }}>
              ▼
            </div>
          </div>

          {/* Category Selector (Step 20.3: scrollable horizontal row) */}
          <label>Категория</label>
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            padding: '4px 0 12px',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            marginBottom: '16px'
          }}>
            {filteredCategories.map(c => {
              const isSelected = category === c.name
              const style = categoryStyle(c.name)
              const customBg = c.color ? `rgba(${c.color}, 0.16)` : style.bg
              const customFg = c.color ? `rgb(${c.color})` : style.fg

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.name)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    border: isSelected ? '2px solid var(--lavender-dark)' : '1px solid var(--hairline)',
                    background: isSelected ? 'var(--mat-2-bg)' : 'var(--mat-1-bg)',
                    borderRadius: '14px',
                    padding: '10px 14px',
                    minWidth: '78px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: customBg,
                    color: customFg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    {c.icon ? c.icon : (c.name ? c.name.charAt(0).toUpperCase() : '?')}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: isSelected ? 'var(--ink)' : 'var(--ink-soft)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    maxWidth: '68px',
                    overflow: 'hidden'
                  }}>{c.name}</span>
                </button>
              )
            })}

            {/* "+" or "Other" item at the end of the scroll list to create new category */}
            <button
              type="button"
              onClick={() => {
                onClose()
                if (onNavigateToNewCategory) {
                  onNavigateToNewCategory()
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                border: '1px dashed var(--ink-faint)',
                background: 'var(--mat-1-bg)',
                borderRadius: '14px',
                padding: '10px 14px',
                minWidth: '78px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(31, 29, 47, 0.05)',
                color: 'var(--ink-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'normal'
              }}>
                +
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--ink-soft)',
                whiteSpace: 'nowrap'
              }}>Создать</span>
            </button>
          </div>

          {/* Sum input */}
          <label>Сумма, ₽</label>
          <div className="form-field-group" style={{ marginBottom: '20px' }}>
            <div className="form-field-icon-sq" style={{ background: 'rgba(236, 93, 166, 0.08)', color: 'var(--expense)' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>₽</span>
            </div>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Comment input */}
          <label>Комментарий (необязательно)</label>
          <div className="form-field-group" style={{ marginBottom: '24px' }}>
            <div className="form-field-icon-sq" style={{ background: 'rgba(136, 101, 232, 0.08)', color: 'var(--lavender-dark)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Например: обед в кафе"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>

          {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}

          {/* Save Action Button (Step 20.6) */}
          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? 'Сохраняю…' : (
              <>
                <span>Сохранить</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
