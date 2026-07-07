import TransactionForm from './TransactionForm'

export default function AddTransactionModal({ categories, onAdded, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">✕</button>
        <TransactionForm
          categories={categories}
          onAdded={() => { onAdded(); onClose(); }}
        />
      </div>
    </div>
  )
}
