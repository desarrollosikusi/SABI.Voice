import React, { useState } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  onSearch?: (query: string) => void;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  onSearch,
  className = '',
  style,
  ...props
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedSearch, setFocusedSearch] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div
      className={`data-table-wrapper ${className}`}
      style={{
        backgroundColor: 'var(--surface-color)',
        border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius-md, 0.5rem)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        ...style,
      }}
      {...props}
    >
      {onSearch && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            aria-label="Search table data"
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm, 0.25rem)',
              border: `1px solid ${focusedSearch ? 'var(--primary)' : 'var(--surface-border)'}`,
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              outline: 'none',
              minWidth: '250px',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={() => setFocusedSearch(true)}
            onBlur={() => setFocusedSearch(false)}
          />
        </div>
      )}

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
          }}
          role="grid"
        >
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={{
                    padding: '0.75rem 1rem',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    fontSize: '0.85rem',
                    borderBottom: '2px solid var(--surface-border)',
                    fontWeight: 600,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    borderBottom: '1px solid var(--surface-border)',
                  }}
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(item)}
                  role={onRowClick ? 'button' : 'row'}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onRowClick(item);
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  style={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    borderBottom: '1px solid var(--surface-border)',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: '1rem',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                      }}
                    >
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
