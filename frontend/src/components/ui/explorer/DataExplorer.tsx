import React from 'react';
import { DataExplorerProps, ExplorerRecord } from './types';
import { ExplorerRendererRegistry } from './Registry';
import EmptyState from '../EmptyState';

export function DataExplorer({ 
    items, 
    columns, 
    view, 
    emptyState,
    loading,
    onRowClick 
}: DataExplorerProps) {

    if (loading) {
        return (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Cargando...
            </div>
        );
    }

    if (items.length === 0) {
        if (emptyState) {
            return (
                <EmptyState 
                    title={emptyState.title}
                    description={emptyState.description}
                    icon={emptyState.icon}
                    action={emptyState.action}
                />
            );
        }
        return (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No hay resultados para mostrar.
            </div>
        );
    }

    try {
        const renderer = ExplorerRendererRegistry.get(view);
        return <>{renderer.render(items, columns, onRowClick)}</>;
    } catch (e: any) {
        return <div style={{ color: 'red', padding: 24 }}>Error: {e.message}</div>;
    }
}
