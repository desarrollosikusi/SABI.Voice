import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

export interface SearchProps {
    placeholder?: string;
    onSearch: (term: string) => void;
    value?: string;
    searchFields?: string[];
}

export function Search({ placeholder = 'Buscar...', onSearch, value, searchFields }: SearchProps) {
    return (
        <div style={{ position: 'relative', maxWidth: '320px', width: '100%' }}>
            <SearchIcon size={16} color="var(--text-disabled)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
                type="text" 
                placeholder={placeholder}
                value={value}
                onChange={(e) => onSearch(e.target.value)}
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
    );
}
