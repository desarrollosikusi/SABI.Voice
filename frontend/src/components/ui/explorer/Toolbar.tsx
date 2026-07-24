import React from 'react';

export function Toolbar({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            backgroundColor: 'var(--surface-color)',
            borderBottom: '1px solid var(--surface-border)',
            gap: '24px',
            flexWrap: 'wrap'
        }}>
            {children}
        </div>
    );
}

export function ToolbarLeft({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
            {children}
        </div>
    );
}

export function ToolbarRight({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {children}
        </div>
    );
}
