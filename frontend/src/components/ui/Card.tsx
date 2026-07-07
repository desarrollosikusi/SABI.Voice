import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  noPadding?: boolean;
};

export default function Card({ children, className = '', style = {}, noPadding = false }: CardProps) {
  return (
    <div 
      className={`saas-card ${className}`} 
      style={{
        padding: noPadding ? 0 : 24,
        backgroundColor: 'var(--surface-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--surface-border)',
        ...style
      }}
    >
      {children}
    </div>
  );
}
