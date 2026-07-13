import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import ConfirmDialog from './ConfirmDialog'

export default function EditCategorySheet({ category, onSaved, onClose }) {
  const [name, setName] = useState(category ? category.name : '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (category) {
      setName(category.name)
    }
  }, [category])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    const { error: err } = await supabase
      .from('categories')
      .update({ name: trimmed })
      .eq('id', category.id)
    if (err) {
      setSaving(false)
      setError(err.code === '23505' ? 'Такая категория уже есть' : err.message)
      return
    }
    onSaved()
    onClose()
  }

  async function handleDelete() {
    setShowConfirm(true)
  }

  async function confirmDelete() {
    const { error: err } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id)
    if (err) {
      setError(err.message)
      setShowConfirm(false)
      return
    }
    setShowConfirm(false)
    onSaved()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">✕</button>
        <form className="form" onSubmit={handleSubmit}>
          <h2>Редактировать категорию</h2>
          <label>Название</label>
          <input 
            type="text" 
            autoFocus 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Например, Спортзал"
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" className="submit-btn" disabled={saving || !name.trim()}>{saving ? 'Сохраняю…' : 'Сохранить'}</button>
        </form>

        <div style={{ marginTop: '16px', borderTop: '1px solid var(--hairline)', paddingTop: '16px' }}>
          <button 
            type="button" 
            onClick={handleDelete}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--r-md)',
              border: '1px solid rgba(226, 99, 122, 0.16)',
              background: 'rgba(226, 99, 122, 0.08)',
              fontWeight: '800',
              fontSize: '14px',
              color: 'var(--expense)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            Удалить категорию
          </button>
        </div>

        {showConfirm && (
          <ConfirmDialog
            title="Удалить категорию?"
            message={`«${category.name}» — прошлые операции с этой категорией останутся, но выбрать её заново будет нельзя.`}
            onConfirm={confirmDelete}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </div>
    </div>
  )
}
