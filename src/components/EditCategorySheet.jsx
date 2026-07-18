import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import ConfirmDialog from './ConfirmDialog'

export default function EditCategorySheet({ category, onSaved, onClose }) {
  const [name, setName] = useState(category ? category.name : '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  useEffect(() => {
    if (category) {
      setName(category.name)
    }
  }, [category])

  useEffect(() => {
    if (!window.visualViewport) return
    const handler = () => {
      const vv = window.visualViewport
      const offset = window.innerHeight - vv.height
      setKeyboardOffset(offset > 40 ? offset : 0)
    }
    window.visualViewport.addEventListener('resize', handler)
    window.visualViewport.addEventListener('scroll', handler)
    handler()
    return () => {
      window.visualViewport.removeEventListener('resize', handler)
      window.visualViewport.removeEventListener('scroll', handler)
    }
  }, [])

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
    <div className="modal-overlay" onClick={onClose} style={{
      alignItems: keyboardOffset > 0 ? 'flex-end' : 'center',
      paddingBottom: keyboardOffset > 0 ? `${keyboardOffset + 12}px` : '12px'
    }}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{
        transform: keyboardOffset > 0 ? 'none' : undefined,
        transition: 'all 0.15s ease-out'
      }}>
        <div className="modal-handle" />
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">✕</button>
        <form className="form" onSubmit={handleSubmit}>
          <h2>Редактировать категорию</h2>
          <label>Название</label>
          <div className="form-field-group">
            <div className="form-field-icon-sq" style={{ background: 'rgba(184, 154, 244, 0.12)', color: '#8865E8' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например, Спортзал"
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="submit-btn" disabled={saving || !name.trim()}>
            {saving ? 'Сохраняю…' : 'Сохранить изменения'}
          </button>
        </form>

        <div style={{ marginTop: '16px', borderTop: '1px solid var(--hairline)', paddingTop: '16px' }}>
          <button 
            type="button" 
            onClick={handleDelete}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '14px',
              border: 'none',
              background: 'rgba(236, 93, 166, 0.08)',
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
