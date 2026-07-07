import React from 'react';
import Link from 'next/link';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link href={item.href} style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} 
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                {item.label}
              </Link>
            ) : (
              <span style={{ color: isLast ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isLast ? 600 : 400 }}>
                {item.label}
              </span>
            )}
            
            {!isLast && (
              <span style={{ margin: '0 8px', color: 'var(--surface-border)' }}>/</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
