import React from 'react';
import DataTable, { ColumnDef } from '../DataTable';
import { ExplorerRecord, ExplorerColumn, ExplorerRenderer } from './types';
import Badge from '../Badge'; 

export function TableRendererComponent({ items, columns, onRowClick }: { items: ExplorerRecord[], columns: ExplorerColumn[], onRowClick?: (item: ExplorerRecord) => void }) {
    // Transform ExplorerColumn to ColumnDef for the legacy DataTable component
    const dataTableColumns: ColumnDef<ExplorerRecord>[] = columns.filter(c => c.visible !== false).map(col => ({
        key: col.id,
        header: col.title || col.id,
        width: col.width as string | undefined,
        cell: (item: ExplorerRecord) => {
            if (col.render) {
                return col.render(item);
            }
            // Default cell rendering
            const val = (item as any)[col.id];
            
            // Special rendering for 'category' if it's the column id
            if (col.id === 'category' && item.category?.badge) {
                return <Badge {...item.category.badge} />;
            }

            return val !== undefined && val !== null ? String(val) : '-';
        }
    }));

    return (
        <DataTable 
            data={items} 
            columns={dataTableColumns} 
            onRowClick={onRowClick}
            keyExtractor={(item) => item.id}
            actions={(item) => {
                if (!item.actions || item.actions.length === 0) return null;
                // Render actions somehow in the table, maybe a simple dropdown or buttons.
                // Since this is a framework, we can render simple buttons or icons.
                // For now we'll render small text buttons
                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {item.actions.map((action: any) => (
                            <button
                                key={action.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(item);
                                }}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    color: action.danger ? 'var(--danger-color)' : 'var(--color-primary)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                );
            }}
        />
    );
}

export class TableRenderer implements ExplorerRenderer {
    render(records: ExplorerRecord[], columns: ExplorerColumn[], onRowClick?: (item: ExplorerRecord) => void): React.ReactNode {
        return <TableRendererComponent items={records} columns={columns} onRowClick={onRowClick} />;
    }
}
