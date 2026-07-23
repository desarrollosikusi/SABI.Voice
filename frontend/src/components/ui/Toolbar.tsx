import React from 'react';
import { Search, Filter, Download, RefreshCw, Plus, Settings, Upload } from 'lucide-react';

export type ToolbarAction = {
  label: string;
  icon?: 'Plus' | 'Upload' | 'Settings' | 'Filter' | string;
  onClick: () => void;
  primary?: boolean;
};

export type ToolbarProps = {
  title?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showExport?: boolean;
  showRefresh?: boolean;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  onFilter?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  actions?: ToolbarAction[];
};

export default function Toolbar({
  title,
  showSearch = false,
  showFilters = false,
  showExport = false,
  showRefresh = false,
  searchPlaceholder = 'Buscar...',
  onSearch,
  onFilter,
  onExport,
  onRefresh,
  actions = []
}: ToolbarProps) {
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
      
      {/* Left Area - Title & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
        {title && (
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {title}
          </h2>
        )}
        
        {showSearch && (
          <div style={{ position: 'relative', maxWidth: '320px', width: '100%' }}>
            <Search size={16} color="var(--text-disabled)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                border: '1px solid var(--surface-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-body)',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: 'var(--bg-color)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
            />
          </div>
        )}
      </div>

      {/* Right Area - Filters, Refresh & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {showFilters && (
          <button className="btn-secondary" onClick={onFilter} style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} /> Filtros
          </button>
        )}

        {showExport && (
          <button className="btn-secondary" onClick={onExport} style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Exportar
          </button>
        )}

        {showRefresh && (
          <button className="btn-secondary" onClick={onRefresh} style={{ padding: '8px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Actualizar">
            <RefreshCw size={16} />
          </button>
        )}

        {actions.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginLeft: '12px', paddingLeft: '12px', borderLeft: '1px solid var(--surface-border)' }}>
            {actions.map((action, idx) => {
              // Basic icon resolver for the toolbar actions
              const renderIcon = () => {
                if (action.icon === 'Plus') return <Plus size={16} />;
                if (action.icon === 'Upload') return <Upload size={16} />;
                if (action.icon === 'Settings') return <Settings size={16} />;
                return null;
              };

              return (
                <button 
                  key={idx}
                  className={action.primary ? 'btn-primary' : 'btn-secondary'}
                  onClick={action.onClick}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: 'var(--radius-md)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px' 
                  }}
                >
                  {renderIcon()}
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
