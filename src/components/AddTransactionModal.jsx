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

  // Format date correctly like "13 июля 2026 г."
  const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length !== 3) return dateStr
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    if (isNaN(d.getTime())) return dateStr
    const formatted = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    return `${formatted} ${d.getFullYear()} г.`
  }

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

        <form className="form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 8px', color: 'var(--ink)' }}>Новая операция</h2>

          {/* Operation type toggle (Step 28.1: Expense, Income, Transfer) */}
          <div className="type-toggle-segment" style={{
            display: 'flex',
            background: '#F5F6FA',
            borderRadius: '14px',
            border: '1px solid var(--hairline)',
            overflow: 'hidden',
            padding: '2px',
            marginBottom: '4px'
          }}>
            <button
              type="button"
              onClick={() => setType('expense')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                border: 'none',
                background: type === 'expense' ? '#FFFFFF' : 'transparent',
                borderRadius: '12px',
                padding: '10px 4px',
                cursor: 'pointer',
                borderRight: '1px solid var(--hairline)',
                outline: 'none',
                transition: 'all 0.15s ease',
                boxShadow: type === 'expense' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC5DA6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                <polyline points="17 18 23 18 23 12" />
              </svg>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: type === 'expense' ? '#EC5DA6' : 'var(--ink-soft)' }}>Расход</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                border: 'none',
                background: type === 'income' ? '#FFFFFF' : 'transparent',
                borderRadius: '12px',
                padding: '10px 4px',
                cursor: 'pointer',
                borderRight: '1px solid var(--hairline)',
                outline: 'none',
                transition: 'all 0.15s ease',
                boxShadow: type === 'income' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#37B891" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: type === 'income' ? '#37B891' : 'var(--ink-soft)' }}>Доход</span>
            </button>
            <button
              type="button"
              disabled
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                border: 'none',
                background: 'transparent',
                borderRadius: '12px',
                padding: '10px 4px',
                cursor: 'not-allowed',
                opacity: 0.4,
                outline: 'none'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lavender-dark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.82 2.82 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink-soft)' }}>Перевод</span>
            </button>
          </div>

          {/* Sum input overhaul (Step 28.2) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)' }}>Сумма</span>
            <div style={{ display: 'flex', alignItems: 'baseline', border: 'none', background: 'transparent', width: '100%', position: 'relative' }}>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '40px',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  padding: '8px 0',
                  outline: 'none',
                  width: '100%',
                  textAlign: 'left'
                }}
              />
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ink)', position: 'absolute', right: '0', bottom: '14px', pointerEvents: 'none' }}>₽</span>
            </div>
            <div style={{ height: '1px', background: 'var(--hairline)', width: '100%', marginTop: '4px', marginBottom: '8px' }} />
          </div>

          {/* Category Selector Overhaul (Step 28.3: horizontal row) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)' }}>Категория</span>
            <div style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              padding: '2px 2px 10px',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
              width: '100%'
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
                      gap: '8px',
                      border: isSelected ? '1px solid var(--lavender-dark)' : '1px solid var(--hairline)',
                      background: isSelected ? 'rgba(184, 154, 244, 0.06)' : '#FFFFFF',
                      borderRadius: '16px',
                      padding: '12px',
                      minWidth: '82px',
                      maxWidth: '82px',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                  >
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      background: customBg,
                      color: customFg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      border: '1px solid rgba(0,0,0,0.02)'
                    }}>
                      {c.icon ? c.icon : (c.name ? c.name.charAt(0).toUpperCase() : '?')}
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: isSelected ? 'var(--lavender-dark)' : 'var(--ink-soft)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      maxWidth: '70px',
                      overflow: 'hidden'
                    }}>{c.name}</span>
                  </button>
                )
              })}

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
                  gap: '8px',
                  border: '1px dashed var(--ink-faint)',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '12px',
                  minWidth: '82px',
                  maxWidth: '82px',
                  cursor: 'pointer',
                  outline: 'none',
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(31, 29, 47, 0.04)',
                  color: 'var(--ink-faint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  ...
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--ink-soft)'
                }}>Другое</span>
              </button>
            </div>
          </div>

          {/* Date row overhauled (Step 28.4: clickable row without "Дата" label) */}
          <div
            className="form-field-group"
            onClick={() => dateInputRef.current && dateInputRef.current.showPicker()}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '16px',
              border: '1px solid var(--hairline)',
              background: '#FFFFFF',
              position: 'relative',
              marginTop: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(184, 154, 244, 0.12)', color: 'var(--lavender-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                {formatFriendlyDate(date)}
              </span>
            </div>

            <input
              type="date"
              ref={dateInputRef}
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', left: 0, top: 0, pointerEvents: 'none' }}
              required
            />

            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-faint)' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

          {/* Comment input overhaul (Step 28.5: simple rectangle, no icon) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)' }}>Комментарий (необязательно)</span>
            <input
              type="text"
              placeholder="Напишите комментарий"
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '14px',
                borderRadius: '16px',
                border: '1px solid var(--hairline)',
                background: '#FFFFFF',
                outline: 'none',
                color: 'var(--ink)'
              }}
            />
          </div>

          {/* New Tag field (Step 28.6: pure visualization/placeholder row) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-faint)' }}>Теги</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '16px',
                border: '1px solid var(--hairline)',
                background: '#FFFFFF',
                cursor: 'pointer'
              }}
              onClick={() => alert('Управление тегами появится в будущих обновлениях')}
            >
              <span style={{ fontSize: '14px', color: 'var(--ink-faint)' }}>Добавить тег</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-faint)' }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
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
