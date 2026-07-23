import React from 'react';
import * as Icons from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: string;
  action?: React.ReactNode;
};

export default function EmptyState({ title, description, icon = 'Inbox', action }: EmptyStateProps) {
  let IconComponent = (Icons as any)[icon] || Icons.Inbox;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-2xl) var(--space-lg)',
      textAlign: 'center',
      backgroundColor: 'var(--surface-color)'
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        backgroundColor: 'var(--surface-hover)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--space-md)',
        color: 'var(--text-disabled)'
      }}>
        <IconComponent size={32} />
      </div>
      <h3 className="text-subtitle" style={{ marginBottom: 'var(--space-xs)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-secondary" style={{ maxWidth: 400, marginBottom: 'var(--space-lg)', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}
