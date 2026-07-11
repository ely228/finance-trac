import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AddCategorySheet({ onAdded, onClose }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    const { error: err } = await supabase.from('categories').insert({ name: trimmed })
    setSaving(false)
    if (err) {
      setError(err.code === '23505' ? 'Такая категория уже есть' : err.message)
      return
    }
    onAdded()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">✕</button>
        <form className="form" onSubmit={handleSubmit}>
          <h2>Новая категория</h2>
          <label>Название</label>
          <input type="text" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Например, Спортзал" />
          {error && <div className="error">{error}</div>}
          <button type="submit" className="submit-btn" disabled={saving}>{saving ? 'Сохраняю…' : 'Добавить'}</button>
        </form>
      </div>
    </div>
  )
}
