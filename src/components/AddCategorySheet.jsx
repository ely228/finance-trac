import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function AddCategorySheet({ onAdded, onClose }) {
  // Lock body scroll and set modal-open class
  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [])

  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [keyboardOffset, setKeyboardOffset] = useState(0)

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
          <h2>Новая категория</h2>
          <label>Название</label>
          <div className="form-field-group">
            <div className="form-field-icon-sq" style={{ background: 'rgba(184, 154, 244, 0.12)', color: '#8865E8' }}>
              {/* Tag Icon Left */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.6 12.4 12.6 3H5a2 2 0 0 0-2 2v7.6l9.4 9.4a1.5 1.5 0 0 0 2 0l6.2-6.2a1.5 1.5 0 0 0 0-2Z" />
                <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <input type="text" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Например, Спортзал" />
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
      </div>
    </div>
  )
}
