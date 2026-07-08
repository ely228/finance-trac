import { useEffect, useRef, useState } from 'react'
import { exportCSV, exportXLSX } from '../utils/export'

export default function ExportMenu({ transactions, monthLabelText }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="export-wrap" ref={ref}>
      <button className="export-btn" onClick={() => setOpen(o => !o)}>
        ⭳ Экспорт
      </button>
      {open && (
        <div className="export-menu">
          <button onClick={() => { exportXLSX(transactions, monthLabelText); setOpen(false) }}>Скачать Excel (.xlsx)</button>
          <button onClick={() => { exportCSV(transactions, monthLabelText); setOpen(false) }}>Скачать CSV</button>
        </div>
      )}
    </div>
  )
}
