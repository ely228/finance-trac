import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import ConfirmDialog from './ConfirmDialog'

export default function EditCategorySheet({ category, onSaved, onClose, overlayClassName, sheetClassName, overlayStyle, sheetStyle }) {
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
    <div className={overlayClassName || "modal-overlay"} style={overlayStyle} onClick={onClose}>
      <div className={sheetClassName || "modal-sheet"} style={sheetStyle} onClick={e => e.stopPropagation()}>
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

          <button 
            type="button" 
            onClick={handleDelete}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '24px',
              border: '1.5px solid rgba(216, 88, 88, 0.25)',
              background: '#FFFFFF',
              fontWeight: '700',
              fontSize: '15px',
              color: '#D85858',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              marginTop: '12px',
              boxShadow: '0 2px 8px rgba(216, 88, 88, 0.04)',
              outline: 'none'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Удалить категорию</span>
          </button>
        </form>

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
