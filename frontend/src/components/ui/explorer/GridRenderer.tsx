import React from 'react';
import { ExplorerRecord, ExplorerColumn, ExplorerRenderer } from './types';
import Badge from '../Badge'; 

export function GridRendererComponent({ items, columns, onRowClick }: { items: ExplorerRecord[], columns: ExplorerColumn[], onRowClick?: (item: ExplorerRecord) => void }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
            padding: '24px'
        }}>
            {items.map((item) => (
                <div 
                    key={item.id}
                    onClick={() => onRowClick && onRowClick(item)}
                    style={{
                        backgroundColor: 'var(--surface-color)',
                        border: '1px solid var(--surface-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '20px',
                        cursor: onRowClick ? 'pointer' : 'default',
                        transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</h3>
                        {item.category?.badge && (
                            <Badge {...item.category.badge} />
                        )}
                    </div>
                    {item.description && (
                        <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                            {item.description}
                        </p>
                    )}
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: 'auto' }}>
                        {columns.filter(c => c.visible !== false).map(col => (
                            <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', textTransform: 'uppercase' }}>{col.title || col.id}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                    {col.renderer && col.id === 'category' ? <Badge {...item.category?.badge!} /> : (item as any)[col.id]}
                                </span>
                            </div>
                        ))}
                    </div>

                    {item.actions && item.actions.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
                            {item.actions.map((action: any) => (
                                <button 
                                    key={action.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        action.onClick(item);
                                    }}
                                    className={action.danger ? "btn-danger-outline" : "btn-secondary"}
                                    style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export class GridRenderer implements ExplorerRenderer {
    render(records: ExplorerRecord[], columns: ExplorerColumn[], onRowClick?: (item: ExplorerRecord) => void): React.ReactNode {
        return <GridRendererComponent items={records} columns={columns} onRowClick={onRowClick} />;
    }
}
