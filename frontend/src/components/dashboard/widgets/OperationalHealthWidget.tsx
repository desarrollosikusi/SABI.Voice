import React from 'react';
import Card from '@/components/ui/Card';

type KPI = {
  label: string;
  value: string | number;
  status?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  trend?: string;
};

type OperationalHealthWidgetProps = {
  kpis: KPI[];
};

export default function OperationalHealthWidget({ kpis }: OperationalHealthWidgetProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'danger': return 'var(--danger)';
      case 'info': return 'var(--info)';
      default: return 'var(--text-primary)';
    }
  };

  return (
    <Card>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px', color: 'var(--text-primary)' }}>
        Salud Operacional
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{ 
            padding: '16px', 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: 'var(--surface-hover)',
            borderLeft: `4px solid ${getStatusColor(kpi.status)}`
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {kpi.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {kpi.value}
              </span>
              {kpi.trend && (
                <span style={{ fontSize: '0.85rem', color: kpi.trend.includes('-') ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                  {kpi.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
