'use client';
import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import OperationalStatusWidget from '@/components/dashboard/widgets/OperationalStatusWidget';
import MyWorkWidget from '@/components/dashboard/widgets/MyWorkWidget';
import GlobalAlertsWidget from '@/components/dashboard/widgets/GlobalAlertsWidget';
import GlobalActionsWidget from '@/components/dashboard/widgets/GlobalActionsWidget';
import Timeline from '@/components/ui/Timeline';
import Card from '@/components/ui/Card';
import { api } from '@/services/api';

export default function DashboardPage() {
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      const data = await api.getGlobalTimeline(); // get all timeline events
      setTimelineEvents(data);
    } catch (e) {
      console.error("Error loading global timeline", e);
    } finally {
      setLoadingTimeline(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Centro de Comando" 
        description="Monitor en tiempo real. Responde rápidamente: ¿Qué requiere mi atención? ¿Qué está en riesgo? ¿Qué debo hacer?"
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Centro de Comando' }]}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Zona 1: Estado Operacional (KPIs Horizontales) */}
        <section>
          <OperationalStatusWidget />
        </section>

        {/* Zona 2: Widgets Operativos (Grid Principal) */}
        <section style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '24px', 
          alignItems: 'stretch' 
        }}>
          {/* Columna Izquierda: Mi Trabajo (ocupa el 50% en pantallas grandes) */}
          <div style={{ minHeight: '400px' }}>
            <MyWorkWidget />
          </div>

          {/* Columna Central: Alertas (ocupa 25%) */}
          <div style={{ minHeight: '400px' }}>
            <GlobalAlertsWidget />
          </div>

          {/* Columna Derecha: Próximas Acciones (ocupa 25%) */}
          <div style={{ minHeight: '400px' }}>
            <GlobalActionsWidget />
          </div>
        </section>

        {/* Zona 3: Timeline Global */}
        <section>
          <Card>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Línea de Tiempo Operacional (Global)</h3>
            {loadingTimeline ? (
              <div style={{ display: 'flex', gap: '16px', padding: '12px' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#cbd5e1', flexShrink: 0, marginTop: 4 }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div style={{ height: 16, width: '40%', backgroundColor: '#e2e8f0', borderRadius: 4, animation: 'pulse 1.5s infinite' }}></div>
                  <div style={{ height: 12, width: '80%', backgroundColor: '#e2e8f0', borderRadius: 4, animation: 'pulse 1.5s infinite' }}></div>
                </div>
              </div>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <Timeline events={timelineEvents} />
              </div>
            )}
          </Card>
        </section>

      </div>
    </div>
  );
}
