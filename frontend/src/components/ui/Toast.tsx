'use client';

import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({ id, message, type, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for fade out animation
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return { bg: '#ecfdf5', text: '#065f46', border: '#10b981', icon: '✓' };
      case 'error':
        return { bg: '#fef2f2', text: '#991b1b', border: '#ef4444', icon: '✕' };
      case 'warning':
        return { bg: '#fffbeb', text: '#92400e', border: '#f59e0b', icon: '⚠' };
      case 'info':
      default:
        return { bg: '#eff6ff', text: '#1e40af', border: '#3b82f6', icon: 'ℹ' };
    }
  };

  const style = getStyles();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        margin: '8px 0',
        backgroundColor: style.bg,
        borderLeft: `4px solid ${style.border}`,
        borderRadius: '4px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        minWidth: '300px',
        maxWidth: '400px',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        pointerEvents: 'auto',
      }}
    >
      <span style={{ color: style.border, fontSize: '1.2rem', marginRight: '12px', fontWeight: 'bold' }}>
        {style.icon}
      </span>
      <span style={{ color: style.text, fontSize: '0.95rem', flex: 1 }}>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(id), 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: style.text,
          cursor: 'pointer',
          fontSize: '1rem',
          marginLeft: '12px',
          opacity: 0.6,
        }}
      >
        ×
      </button>
    </div>
  );
}
