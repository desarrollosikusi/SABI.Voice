import React, { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        backgroundColor: 'var(--surface-color)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--surface-border)',
        boxShadow: 'var(--shadow-sm)',
        ...style,
      }}
    >
      {icon && (
        <div style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '48px' }}>
          {icon}
        </div>
      )}
      <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>
        {title}
      </h3>
      {description && (
        <p style={{ margin: '0 0 24px', color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px' }}>
          {description}
        </p>
      )}
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
