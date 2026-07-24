import React from 'react';
import { ArrowDownUp } from 'lucide-react';

export interface SortOption {
    label: string;
    value: string;
}

export interface SortControlProps {
    options: SortOption[];
    onSort: (value: string) => void;
    value?: string;
}

export function SortControl({ options, onSort, value }: SortControlProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowDownUp size={16} color="var(--text-secondary)" />
            <select
                value={value}
                onChange={(e) => onSort(e.target.value)}
                style={{
                    padding: '8px 12px',
                    border: '1px solid var(--surface-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-body)',
                    backgroundColor: 'var(--surface-color)',
                    outline: 'none',
                    cursor: 'pointer'
                }}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}
