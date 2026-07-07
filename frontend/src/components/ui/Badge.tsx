import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: React.CSSProperties;
};

const getVariantStyles = (variant: BadgeVariant) => {
  switch (variant) {
    case 'success':
      return { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' };
    case 'warning':
      return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' };
    case 'danger':
      return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' };
    case 'info':
      return { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)' };
    case 'neutral':
    default:
      return { backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' };
  }
};

export default function Badge({ children, variant = 'neutral', className = '', style = {} }: BadgeProps) {
  const variantStyles = getVariantStyles(variant);
  
  return (
    <span 
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        ...variantStyles,
        ...style
      }}
    >
      {children}
    </span>
  );
}
