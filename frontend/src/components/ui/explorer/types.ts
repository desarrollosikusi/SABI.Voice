import React from 'react';

export interface DisplayBadge {
    label: string;
    icon: string;
    color: string;
    background: string;
}

export interface DisplayList {
    sort: number;
    featured: boolean;
}

export interface DisplayViews {
    list?: DisplayList;
    grid?: Record<string, unknown>;
    table?: Record<string, unknown>;
}

export interface DisplayCategory {
    id?: number | string;
    code?: string;
    name?: string;
    badge?: DisplayBadge;
    views?: DisplayViews;
}

export interface ExplorerAction {
    id: string;
    label: string;
    icon?: string;
    onClick: (record: ExplorerRecord) => void;
    danger?: boolean;
}

export interface ExplorerTag {
    id: string;
    label: string;
    color?: string;
}

export interface ExplorerLink {
    id: string;
    label: string;
    url: string;
}

export interface ExplorerRecord {
    id: string | number;
    title: string;
    subtitle?: string;
    description?: string;
    category?: DisplayCategory;
    metadata?: Record<string, unknown>;
    actions?: ExplorerAction[];
    tags?: ExplorerTag[];
    links?: ExplorerLink[];
}

export interface ExplorerRecordInternal extends ExplorerRecord {
    __raw?: unknown;
}

export interface ExplorerColumn {
    id: string;
    title: string;
    width?: number | string;
    sortable?: boolean;
    visible?: boolean;
    renderer?: string;
    render?: (record: ExplorerRecord) => React.ReactNode;
}

export interface ExplorerAdapter<TDomain> {
    toExplorerRecord(entity: TDomain): ExplorerRecord;
}

export interface ExplorerRenderer {
    render(records: ExplorerRecord[], columns: ExplorerColumn[], onRowClick?: (item: ExplorerRecord) => void): React.ReactNode;
}

export interface ToolbarConfig {
    search?: boolean;
    filterGroup?: boolean;
    sort?: boolean;
    viewToggle?: boolean;
    actions?: React.ReactNode;
}

export interface EmptyStateConfig {
    title: string;
    description: string;
    icon?: string;
    action?: React.ReactNode;
}

export interface DataExplorerProps {
    items: ExplorerRecord[];
    columns: ExplorerColumn[];
    view: "table" | "grid";
    toolbar?: ToolbarConfig;
    emptyState?: EmptyStateConfig;
    loading?: boolean;
    onRowClick?: (item: ExplorerRecord) => void;
    keyExtractor?: (item: ExplorerRecord) => string | number;
}

