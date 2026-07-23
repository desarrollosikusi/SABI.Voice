import React from 'react';
import { MoreVertical } from 'lucide-react';

export type ColumnDef<T> = {
  key: string;
  header: string;
  width?: string;
  cell: (item: T) => React.ReactNode;
};

export type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  // Future enterprise props
  sortable?: boolean;
  selectable?: boolean;
  actions?: (item: T) => React.ReactNode;
};

export default function DataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  onRowClick,
  actions
}: DataTableProps<T>) {
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
                {col.header}
              </th>
            ))}
            {actions && (
              <th style={{ padding: '16px 24px', width: '60px' }}></th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr 
              key={keyExtractor(item)}
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
                  {col.cell(item)}
                </td>
              ))}
              {actions && (
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button 
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-border)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // The real actions menu logic will go here
                    }}
                  >
                    <MoreVertical size={18} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
