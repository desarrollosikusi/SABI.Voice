import React from 'react';

export interface TimelineEvent {
  id: string;
  event_type: string;
  title: string;
  description: string;
  date: string;
  source: string;
  severity: string;
  entity_type?: string;
  entity_id?: number;
  metadata?: any;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'PQRSF': return { icon: '🎫', bg: '#e0e7ff', color: '#4338ca' };
      case 'Calendario': return { icon: '📅', bg: '#fce7f3', color: '#be185d' };
      case 'Directorio': return { icon: '👥', bg: '#dcfce7', color: '#166534' };
      case 'Planview': return { icon: '📊', bg: '#ffedd5', color: '#c2410c' };
      case 'Contratos': return { icon: '📄', bg: '#fef3c7', color: '#b45309' };
      case 'Motor de Reglas': return { icon: '🤖', bg: '#e0e7ff', color: '#3730a3' };
      default: return { icon: '📌', bg: '#f1f5f9', color: '#475569' };
    }
  };

  if (!events || events.length === 0) {
    return <p style={{ margin: 0, color: '#64748b', textAlign: 'center', padding: '24px 0' }}>No hay eventos registrados.</p>;
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Línea vertical conectora */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '31px', width: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }}></div>

      {events.map((event) => {
        const style = getSourceIcon(event.source);
        return (
          <div key={event.id} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
            
            {/* Icono circular */}
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              backgroundColor: style.bg, color: style.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, border: '2px solid white', fontSize: '14px'
            }}>
              {style.icon}
            </div>

            {/* Contenido */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{event.title}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>{event.source}</span>
                {event.severity === 'Crítico' && (
                  <span style={{ fontSize: '0.75rem', color: '#991b1b', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Crítico</span>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{event.description}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                {new Date(event.date).toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
