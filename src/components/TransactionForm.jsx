import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { todayISO } from '../utils'

export default function TransactionForm({ categories, onAdded }) {
  const [date, setDate] = useState(todayISO())
  const [category, setCategory] = useState('')
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!category) return setError('Выбери категорию')
    if (!amount || Number(amount) <= 0) return setError('Укажи сумму больше нуля')

    setSaving(true)
    const { error: err } = await supabase.from('transactions').insert({
      date, category, type, amount: Number(amount), comment: comment || null,
    })
    setSaving(false)

    if (err) {
      setError('Ошибка сохранения: ' + err.message)
      return
    }
    setAmount('')
    setComment('')
    onAdded()
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Новая операция</h2>

      {/* Operation type toggle: Expense, Income, Transfer */}
      <div className="type-toggle-segment" style={{
        display: 'flex',
        background: '#F5F6FA',
        borderRadius: '14px',
        border: '1px solid var(--hairline)',
        overflow: 'hidden',
        padding: '2px',
        marginBottom: '16px'
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC5DA6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#37B891" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: type === 'income' ? '#37B891' : 'var(--ink-soft)' }}>Доход</span>
        </button>
        <button
          type="button"
          onClick={() => alert('Переводы появятся в будущих обновлениях')}
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
            cursor: 'pointer',
            opacity: 0.55,
            outline: 'none'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lavender-dark)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3 4 7l4 4" />
            <path d="M4 7h16" />
            <path d="M16 21l4-4-4-4" />
            <path d="M20 17H4" />
          </svg>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink-soft)' }}>Перевод</span>
        </button>
      </div>

      <label>Дата</label>
      <div className="form-field-group">
        <div className="form-field-icon-sq" style={{ background: 'rgba(184, 154, 244, 0.12)', color: '#8865E8' }}>
          {/* Calendar Icon Left */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ textAlign: 'left' }} />
        {/* Calendar Icon Right (trigger/indicator) */}
        <div style={{ color: 'var(--ink-faint)', display: 'flex', alignItems: 'center', paddingRight: '4px', cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
      </div>

      <label>Категория</label>
      <div className="form-field-group">
        <div className="form-field-icon-sq" style={{ background: 'rgba(184, 154, 244, 0.12)', color: '#8865E8' }}>
          {/* Tag Icon Left */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.6 12.4 12.6 3H5a2 2 0 0 0-2 2v7.6l9.4 9.4a1.5 1.5 0 0 0 2 0l6.2-6.2a1.5 1.5 0 0 0 0-2Z" />
            <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} required style={{ paddingRight: '24px' }}>
          <option value="" disabled>Выбери категорию…</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        {/* Down chevron right */}
        <div style={{ position: 'absolute', right: '14px', pointerEvents: 'none', color: 'var(--ink-faint)', fontSize: '11px', fontWeight: 'bold' }}>
          v
        </div>
      </div>

      <label>Сумма, ₽</label>
      <div className="form-field-group">
        <div className="form-field-icon-sq" style={{ background: 'rgba(247, 141, 197, 0.12)', color: '#EC5DA6' }}>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>₽</span>
        </div>
        <input type="number" inputMode="decimal" step="0.01" min="0" placeholder="0.00"
               value={amount} onChange={e => setAmount(e.target.value)} required />
      </div>

      <label>Комментарий (необязательно)</label>
      <div className="form-field-group">
        <div className="form-field-icon-sq" style={{ background: 'rgba(184, 154, 244, 0.12)', color: '#8865E8' }}>
          {/* Speech bubble/comment icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <input type="text" placeholder="Например: обед в кафе" value={comment} onChange={e => setComment(e.target.value)} />
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" className="submit-btn" disabled={saving}>
        {saving ? 'Сохраняю…' : (
          <>
            <span style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>+</span>
            <span>Добавить</span>
          </>
        )}
      </button>
    </form>
  )
}
