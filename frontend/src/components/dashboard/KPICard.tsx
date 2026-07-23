import React from 'react';
import * as Icons from 'lucide-react';

export type KPICardProps = {
  title: string;
  value: string | number;
  trend?: string; // e.g. "+3 hoy" or "12%"
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: string;
  description?: string;
  color?: string;
  loading?: boolean;
  onClick?: () => void;
  isActive?: boolean;
};

export default function KPICard({ 
  title, 
  value, 
  trend, 
  trendDirection = 'neutral',
  icon, 
  description,
  color = 'var(--color-primary)', 
  loading = false,
  onClick, 
  isActive = false 
}: KPICardProps) {
  
  let IconComponent = null;
  if (icon && (Icons as any)[icon]) {
    IconComponent = (Icons as any)[icon];
  }

  // Trend colors
  let trendColor = 'var(--text-secondary)';
  if (trendDirection === 'up') trendColor = 'var(--color-success)';
  if (trendDirection === 'down') trendColor = 'var(--color-danger)';

  if (loading) {
    return (
      <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', animation: 'pulse 1.5s infinite' }}>
        <div style={{ width: 40, height: 40, backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }} />
        <div style={{ width: '60%', height: 24, backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }} />
        <div style={{ width: '80%', height: 16, backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }} />
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      style={{ 
        backgroundColor: 'var(--surface-color)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        border: isActive ? `1px solid ${color}` : '1px solid var(--surface-border)',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)'
      }}
      onMouseEnter={(e) => {
        if (onClick && !isActive) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !isActive) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 className="text-secondary" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
          {title}
        </h3>
        {IconComponent && (
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: `${color}15`, color: color
          }}>
            <IconComponent size={18} />
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: trendColor }}>
            {trend}
          </span>
        )}
      </div>

      {description && (
        <p className="text-secondary" style={{ margin: 0, fontSize: '0.8rem', marginTop: 'var(--space-xs)' }}>
          {description}
        </p>
      )}
      
      {/* Top color indicator for active state */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: color, opacity: isActive ? 1 : 0, transition: 'opacity 0.2s' }} />
    </div>
  );
}
