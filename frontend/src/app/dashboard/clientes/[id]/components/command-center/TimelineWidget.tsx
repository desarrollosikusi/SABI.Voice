import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Timeline from '@/components/ui/Timeline';
import { api } from '@/services/api';

export default function TimelineWidget({ customerId }: { customerId: number }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadTimeline();
  }, [customerId]);

  const loadTimeline = async () => {
    setLoading(true);
    setError(false);
    try {
      // Usar la nueva API global filtrada
      const data = await api.getGlobalTimeline({ customer_id: customerId });
      setEvents(data);
    } catch (e) {
      console.error("Error loading timeline:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card style={{ height: '100%' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Timeline Corporativo</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingLeft: '12px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#cbd5e1', flexShrink: 0, marginTop: 4 }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div style={{ height: 16, width: '40%', backgroundColor: '#e2e8f0', borderRadius: 4, animation: 'pulse 1.5s infinite' }}></div>
                <div style={{ height: 12, width: '80%', backgroundColor: '#e2e8f0', borderRadius: 4, animation: 'pulse 1.5s infinite' }}></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171', height: '100%' }}>
        <div style={{ color: '#991b1b', fontSize: '0.9rem' }}>Error al cargar timeline. <button onClick={loadTimeline} style={{ background:'none', border:'none', color:'#b91c1c', textDecoration:'underline', cursor:'pointer' }}>Reintentar</button></div>
      </Card>
    );
  }

  return (
    <Card style={{ height: '100%' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Timeline Corporativo</h3>
      <Timeline events={events} />
    </Card>
  );
}
