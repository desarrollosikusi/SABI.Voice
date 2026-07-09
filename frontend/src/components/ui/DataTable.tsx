import React, { useState, useMemo } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  onSearch?: (query: string) => void;
  pagination?: boolean;
  itemsPerPage?: number;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  onSearch,
  pagination = true,
  itemsPerPage = 10,
  className = '',
  style,
  ...props
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedSearch, setFocusedSearch] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const processedData = useMemo(() => {
    let result = [...data];

    // Note: If onSearch is provided, we assume the parent handles filtering,
    // otherwise we could do basic client-side filtering here, but we will leave
    // it to the parent for now.

    // Sorting
    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA === valB) return 0;
        if (valA == null) return sortDir === 'asc' ? 1 : -1;
        if (valB == null) return sortDir === 'asc' ? -1 : 1;
        if (typeof valA === 'string') {
          return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortDir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
    }

    return result;
  }, [data, sortKey, sortDir]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = pagination 
    ? processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : processedData;

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
            placeholder="Buscar..."
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
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{
                    padding: '0.75rem 1rem',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    fontSize: '0.85rem',
                    borderBottom: '2px solid var(--surface-border)',
                    fontWeight: 600,
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span style={{ fontSize: '0.7rem' }}>
                        {sortDir === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
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
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIndex) => (
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

      {pagination && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, processedData.length)} de {processedData.length} registros
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.25rem 0.75rem',
                border: '1px solid var(--surface-border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: currentPage === 1 ? 'var(--surface-color)' : 'var(--bg-color)',
                color: currentPage === 1 ? 'var(--text-disabled, #94a3b8)' : 'var(--text-primary)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Anterior
            </button>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontSize: '0.9rem' }}>
              Página {currentPage} de {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.25rem 0.75rem',
                border: '1px solid var(--surface-border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: currentPage === totalPages ? 'var(--surface-color)' : 'var(--bg-color)',
                color: currentPage === totalPages ? 'var(--text-disabled, #94a3b8)' : 'var(--text-primary)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
