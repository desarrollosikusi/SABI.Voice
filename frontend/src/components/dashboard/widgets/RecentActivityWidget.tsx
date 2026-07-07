import React from 'react';
import Card from '@/components/ui/Card';

type Activity = {
  id: string | number;
  description: string;
  timestamp: string;
  user?: string;
  type?: 'create' | 'update' | 'resolve' | 'alert';
};

type RecentActivityWidgetProps = {
  activities: Activity[];
};

export default function RecentActivityWidget({ activities }: RecentActivityWidgetProps) {
  const getIcon = (type?: string) => {
    switch (type) {
      case 'create': return '📝';
      case 'resolve': return '✅';
      case 'alert': return '⚠️';
      case 'update':
      default: return '🔄';
    }
  };

  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
          Actividad Reciente
        </h3>
        <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
          Ver Todo
        </button>
      </div>

      {activities.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-disabled)', fontSize: '0.9rem' }}>
          No hay actividad reciente.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}>
          {activities.map((act) => (
            <div key={act.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                backgroundColor: 'var(--surface-hover)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
              }}>
                {getIcon(act.type)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {act.description}
                </p>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>{act.timestamp}</span>
                  {act.user && (
                    <>
                      <span>•</span>
                      <span>{act.user}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
