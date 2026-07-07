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

      <div className="type-toggle">
        <button type="button" className={type === 'expense' ? 'active expense' : 'expense'} onClick={() => setType('expense')}>
          Расход
        </button>
        <button type="button" className={type === 'income' ? 'active income' : 'income'} onClick={() => setType('income')}>
          Доход
        </button>
      </div>

      <label>Дата</label>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} required />

      <label>Категория</label>
      <select value={category} onChange={e => setCategory(e.target.value)} required>
        <option value="" disabled>Выбери категорию…</option>
        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
      </select>

      <label>Сумма, ₽</label>
      <input type="number" inputMode="decimal" step="0.01" min="0" placeholder="0.00"
             value={amount} onChange={e => setAmount(e.target.value)} required />

      <label>Комментарий (необязательно)</label>
      <input type="text" placeholder="Например: обед в кафе" value={comment} onChange={e => setComment(e.target.value)} />

      {error && <div className="error">{error}</div>}

      <button type="submit" className="submit-btn" disabled={saving}>
        {saving ? 'Сохраняю…' : 'Добавить'}
      </button>
    </form>
  )
}
