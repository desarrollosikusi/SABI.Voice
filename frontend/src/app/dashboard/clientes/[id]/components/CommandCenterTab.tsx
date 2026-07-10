import React from 'react';
import AlertsWidget from './command-center/AlertsWidget';
import ActionsWidget from './command-center/ActionsWidget';
import AiSummaryWidget from './command-center/AiSummaryWidget';
import TimelineWidget from './command-center/TimelineWidget';

interface CommandCenterTabProps {
  customerId: number;
}

export default function CommandCenterTab({ customerId }: CommandCenterTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Zona 1: Centro de Alertas (Top Bar horizontal) */}
      <section>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Requiere Atención Inmediata</h2>
        <AlertsWidget customerId={customerId} />
      </section>

      {/* Zona 2 y 3: Layout de Columnas */}
      <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Columna Izquierda: IA y Próximas Acciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <AiSummaryWidget customerId={customerId} />
          <ActionsWidget customerId={customerId} />
        </div>
        
        {/* Columna Derecha: Timeline Corporativo */}
        <div style={{ height: '100%' }}>
          <TimelineWidget customerId={customerId} />
        </div>
        
      </section>

    </div>
  );
}
