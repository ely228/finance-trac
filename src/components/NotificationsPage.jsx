import React from 'react'

export default function NotificationsPage({ onBack }) {
  return (
    <div className="notifications-page" style={{ position: 'relative', zIndex: 10 }}>
      {/* Centered top bar matching iOS native screens */}
      <div className="topbar" style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '44px',
        marginBottom: '40px'
      }}>
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            left: '0px',
            background: 'none',
            border: 'none',
            color: 'var(--ink)',
            cursor: 'pointer',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Назад"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--ink)', textAlign: 'center' }}>
          Уведомления
        </h1>
      </div>

      {/* Elegant Minimalist Empty State */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 20px',
        maxWidth: '380px',
        margin: '40px auto 0'
      }}>
        <div style={{
          background: 'rgba(136, 101, 232, 0.06)',
          color: '#8865E8',
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: '0 8px 20px rgba(136, 101, 232, 0.08)'
        }}>
          {/* Stylized bell icon matching our flared notification theme */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0-6 6v4a2 2 0 0 1-.6 1.4l-1 1A1 1 0 0 0 5.1 17h13.8a1 1 0 0 0 .7-1.6l-1-1a2 2 0 0 1-.6-1.4V9a6 6 0 0 0-6-6z" />
            <path d="M10.2 17a1.8 1.8 0 0 0 3.6 0" />
          </svg>
        </div>
        <h2 style={{
          fontSize: '17px',
          fontWeight: 800,
          color: 'var(--ink)',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em'
        }}>
          У вас нет уведомлений
        </h2>
        <p style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--ink-soft)',
          margin: 0,
          lineHeight: '1.5'
        }}>
          Мы сообщим, когда появится что-то новое или изменится статус ваших операций.
        </p>
      </div>
    </div>
  )
}
