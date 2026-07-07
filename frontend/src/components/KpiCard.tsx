import React from 'react';

type KpiCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  onViewDetails?: () => void;
  isActive?: boolean;
};

export default function KpiCard({ title, value, icon, color, onViewDetails, isActive = false }: KpiCardProps) {
  return (
    <div 
      className="saas-card" 
      onClick={onViewDetails}
      style={{ 
        cursor: onViewDetails ? 'pointer' : 'default',
        border: isActive ? `2px solid ${color}` : '1px solid var(--surface-border)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: `${color}15`, color: color
        }}>
          {icon}
        </div>
        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </span>
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {title}
        </h3>
        {onViewDetails && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: color, fontSize: '0.85rem', fontWeight: 600 }}>
            Ver detalle <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        )}
      </div>
      
      {/* Indicador superior de color */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: color, opacity: isActive ? 1 : 0 }} />
    </div>
  );
}
