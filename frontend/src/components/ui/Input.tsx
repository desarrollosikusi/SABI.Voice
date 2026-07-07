import React, { InputHTMLAttributes, forwardRef, useState } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', style, containerClassName = '', containerStyle, id, onFocus, onBlur, ...props }, ref) => {
    const fallbackId = React.useId();
    const inputId = id || fallbackId;
    const [isFocused, setIsFocused] = useState(false);
    
    return (
      <div className={containerClassName} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', ...containerStyle }}>
        {label && (
          <label htmlFor={inputId} style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={className}
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${error ? 'var(--danger)' : isFocused ? 'var(--primary)' : 'var(--surface-border)'}`,
            backgroundColor: 'var(--surface-color)',
            color: 'var(--text-primary)',
            outline: 'none',
            fontSize: '14px',
            boxShadow: isFocused ? `0 0 0 2px ${error ? 'var(--danger)' : 'var(--primary)'}33` : 'var(--shadow-sm)',
            transition: 'all 0.2s ease-in-out',
            ...style,
          }}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          {...props}
        />
        {error && (
          <span style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '-4px' }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
