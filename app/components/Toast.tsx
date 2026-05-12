'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: 'rgba(0, 229, 160, 0.12)', border: 'rgba(0, 229, 160, 0.3)', color: '#00e5a0', icon: '✅' },
    error: { bg: 'rgba(255, 107, 157, 0.12)', border: 'rgba(255, 107, 157, 0.3)', color: '#ff6b9d', icon: '❌' },
    info: { bg: 'rgba(108, 99, 255, 0.12)', border: 'rgba(108, 99, 255, 0.3)', color: '#8b85ff', icon: 'ℹ️' },
  };

  const style = colors[type];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        borderRadius: '14px',
        background: style.bg,
        border: `1px solid ${style.border}`,
        backdropFilter: 'blur(20px)',
        color: style.color,
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '380px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        animation: 'slideInRight 0.3s ease',
      }}
    >
      <span style={{ fontSize: '18px' }}>{style.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          opacity: 0.6,
          fontSize: '18px',
          padding: '0',
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Hook untuk manage toast state
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  return { toast, showToast, hideToast };
}

// LoadingSpinner
export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid rgba(108, 99, 255, 0.2)`,
        borderTopColor: 'var(--purple)',
        animation: 'spin 0.7s linear infinite',
        display: 'inline-block',
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Full page loading
export function PageLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <LoadingSpinner size={40} />
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Memuat...</p>
    </div>
  );
}
