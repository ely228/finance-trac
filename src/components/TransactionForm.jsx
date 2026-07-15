import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { todayISO, categoryStyle, categoryInitial } from '../utils'

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

  // Automatically select the first category if none is set
  useEffect(() => {
    if (categories && categories.length > 0 && !category) {
      setCategory(categories[0].name)
    }
  }, [categories, category])

  function handleTransferClick(e) {
    e.preventDefault()
    alert('Переводы появятся в будущих обновлениях!')
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 var(--gap-block) 0', textAlign: 'center' }}>Новая операция</h2>

      <div className="ops-toggle">
        <button
          type="button"
          className={type === 'expense' ? 'active expense' : ''}
          onClick={() => setType('expense')}
        >
          <span style={{ fontSize: '15px' }}>↓</span>
          <span>Расход</span>
        </button>
        <button
          type="button"
          className={type === 'income' ? 'active income' : ''}
          onClick={() => setType('income')}
        >
          <span style={{ fontSize: '15px' }}>↑</span>
          <span>Доход</span>
        </button>
        <button
          type="button"
          onClick={handleTransferClick}
          className=""
        >
          {/* arrow.right.arrow.left SF Symbol style */}
          <span style={{ fontSize: '15px' }}>⇄</span>
          <span>Перевод</span>
        </button>
      </div>

      <div className="dynamic-amount-wrapper">
        <div className="dynamic-amount-label">Сумма</div>
        <div className="dynamic-amount-row">
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            style={{ width: amount ? `${Math.max(80, amount.length * 20)}px` : '90px' }}
          />
          <span
            className="ruble-sym"
            style={{ color: amount ? 'var(--ink)' : 'var(--ink-faint)' }}
          >
            ₽
          </span>
        </div>
      </div>

      <label style={{ marginBottom: '8px' }}>Категория</label>
      <div className="categories-horizontal-grid">
        {categories.map(c => {
          const style = categoryStyle(c.name)
          const isActive = category === c.name
          const initial = categoryInitial(c.name)
          return (
            <div
              key={c.id}
              className={`category-horizontal-item ${isActive ? 'active' : ''}`}
              onClick={() => setCategory(c.name)}
            >
              <div
                className="category-plate"
                style={{
                  background: isActive ? style.bg : '#f1f1f5',
                  color: isActive ? style.fg : 'var(--ink-soft)'
                }}
              >
                {initial}
              </div>
              <div className="category-name-lbl">{c.name}</div>
            </div>
          )
        })}
      </div>

      <label>Дата</label>
      <div className="form-field-group">
        <div className="form-field-icon-sq" style={{ background: 'rgba(184, 154, 244, 0.12)', color: '#8865E8' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ textAlign: 'left' }} />
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
        {saving ? 'Сохраняю…' : 'Сохранить'}
      </button>
    </form>
  )
}
