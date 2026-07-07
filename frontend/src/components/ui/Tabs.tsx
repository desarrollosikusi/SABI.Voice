import React from 'react';

export interface TabOption {
  value: string;
  label: string;
}

export interface TabsProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function Tabs({ options, value, onChange, className = '', style = {} }: TabsProps) {
  return (
    <div className={className} style={{ width: '100%', ...style }}>
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: '24px',
          borderBottom: '1px solid var(--surface-border)',
        }}
      >
        {options.map((tab) => {
          const isActive = value === tab.value;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.value)}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 0',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
