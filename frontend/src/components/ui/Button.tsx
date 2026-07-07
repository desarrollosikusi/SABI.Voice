import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const getButtonStyles = (variant: ButtonVariant): React.CSSProperties => {
  const base: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: 'var(--radius-md)',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  switch (variant) {
    case 'primary':
      return {
        ...base,
        backgroundColor: 'var(--primary)',
        color: '#ffffff',
      };
    case 'secondary':
      return {
        ...base,
        backgroundColor: 'var(--surface-color)',
        color: 'var(--text-primary)',
        border: '1px solid var(--surface-border)',
      };
    case 'danger':
      return {
        ...base,
        backgroundColor: 'var(--danger)',
        color: '#ffffff',
      };
    case 'ghost':
    default:
      return {
        ...base,
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
      };
  }
};

export default function Button({ children, variant = 'primary', fullWidth = false, style, ...props }: ButtonProps) {
  return (
    <button
      style={{
        ...getButtonStyles(variant),
        width: fullWidth ? '100%' : undefined,
        opacity: props.disabled ? 0.6 : 1,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
}
