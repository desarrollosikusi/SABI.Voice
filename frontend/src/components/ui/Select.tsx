import React, { SelectHTMLAttributes, forwardRef, useState } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', style, containerClassName = '', containerStyle, id, onFocus, onBlur, ...props }, ref) => {
    const fallbackId = React.useId();
    const selectId = id || fallbackId;
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className={containerClassName} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', ...containerStyle }}>
        {label && (
          <label htmlFor={selectId} style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
            {label}
          </label>
        )}
        <select
          id={selectId}
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
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px top 50%',
            backgroundSize: '12px auto',
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
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '-4px' }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
