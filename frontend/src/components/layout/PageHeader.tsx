import React from 'react';
import Breadcrumb, { BreadcrumbItem } from './Breadcrumb';

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
};

export default function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: '32px' }}>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          {description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: 0, maxWidth: '800px' }}>
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
