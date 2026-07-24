import React from 'react';
import { MoreVertical } from 'lucide-react';

export type ColumnDef<T> = {
  key: string;
  header?: string;
  label?: string; // Legacy
  width?: string;
  cell?: (item: T) => React.ReactNode;
  render?: (item: T) => React.ReactNode; // Legacy
};

export type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor?: (item: T) => string | number; // Made optional for legacy support
  onRowClick?: (item: T) => void;
  // Future enterprise props
  sortable?: boolean;
  selectable?: boolean;
  actions?: (item: T) => React.ReactNode;
};

export default function DataTable({ 
  data, 
  columns, 
  keyExtractor, 
  onRowClick,
  actions
}: DataTableProps<any>) {
  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      backgroundColor: 'var(--surface-color)',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        minWidth: '800px'
      }}>
        <thead style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--surface-color)',
          borderBottom: '1px solid var(--surface-border)',
          zIndex: 10
        }}>
          <tr>
            {actions && (
              <th style={{ padding: '16px 8px 16px 24px', width: '40px' }}></th>
            )}
            {columns.map(col => (
              <th 
                key={col.key}
                style={{
                  padding: '16px 24px',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: col.width
                }}
              >
                {col.header || col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            const rowKey = keyExtractor ? keyExtractor(item) : (item as any).id || idx;
            return (
            <tr 
              key={rowKey}
              onClick={() => onRowClick && onRowClick(item)}
              style={{
                borderBottom: '1px solid var(--surface-border)',
                backgroundColor: 'var(--surface-color)',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-color)';
              }}
            >
              {actions && (
                <td style={{ padding: '16px 8px 16px 24px', width: '40px', verticalAlign: 'middle' }}>
                  <div
                    style={{ display: 'inline-flex', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRowClick) onRowClick(item);
                    }}
                  >
                    {actions(item)}
                  </div>
                </td>
              )}
              {columns.map(col => (
                <td 
                  key={col.key}
                  style={{
                    padding: '16px 24px',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-body)',
                    verticalAlign: 'middle'
                  }}
                >
                  {col.cell ? col.cell(item) : (col.render ? col.render(item) : null)}
                </td>
              ))}
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  );
}

