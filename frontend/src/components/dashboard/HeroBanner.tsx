import React from 'react';
import Image from 'next/image';

type HeroBannerProps = {
  title: string;
  subtitle?: string;
  companyName?: string;
  companyLogoUrl?: string;
  stats?: React.ReactNode;
  action?: React.ReactNode;
};

export default function HeroBanner({ 
  title, 
  subtitle, 
  companyName,
  companyLogoUrl,
  stats,
  action
}: HeroBannerProps) {
  
  const getFullLogoUrl = (url: string) => {
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${baseUrl}${url}`;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: 'var(--space-lg) var(--space-xl)',
      backgroundColor: 'var(--surface-color)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--surface-border)',
      gap: 'var(--space-xl)',
      marginBottom: 'var(--space-xl)',
      justifyContent: 'space-between',
      flexWrap: 'wrap'
    }}>
      
      {/* Left Area - Avatar & Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flex: '1 1 auto', minWidth: '300px' }}>
        <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
          {/* We keep SABI but much smaller and cleaner */}
          <Image src="/sabi.png" alt="SABI" fill style={{ objectFit: 'contain' }} priority sizes="90px" />
        </div>
        <div>
          <h1 className="text-title" style={{ margin: '0 0 var(--space-xs) 0', fontSize: '1.75rem' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-secondary" style={{ margin: 0, fontSize: '1.05rem' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Middle Area - Stats or extra info */}
      {stats && (
        <div style={{ 
          flex: '1 1 auto', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-lg)', 
          padding: '0 var(--space-lg)', 
          borderLeft: '1px solid var(--surface-border)',
          borderRight: action || companyName ? '1px solid var(--surface-border)' : 'none',
          minWidth: '200px'
        }}>
          {stats}
        </div>
      )}

      {/* Right Area - Company & Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)', flex: '0 0 auto' }}>
        {action && (
          <div>
            {action}
          </div>
        )}

        {(companyName || companyLogoUrl) && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-xs)' }}>
            {companyLogoUrl ? (
              <div style={{ height: 40 }}>
                 <img src={getFullLogoUrl(companyLogoUrl)} alt={companyName} style={{ height: '100%', objectFit: 'contain' }} />
              </div>
            ) : (
              <span className="text-subtitle" style={{ color: 'var(--text-disabled)' }}>🏢</span>
            )}
            <span className="text-secondary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {companyName}
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
