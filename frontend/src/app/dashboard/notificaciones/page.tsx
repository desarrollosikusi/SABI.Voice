'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import { api } from '@/services/api';

type EventReceipt = {
  id: number;
  event_type: string;
  severity: string;
  payload?: any;
  created_at: string;
  read_at: string | null;
  archived_at: string | null;
  entity_type: string | null;
  entity_id: number | null;
  origin: string;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>(''); // '', 'unread', 'read', 'archived'
  const [filterSeverity, setFilterSeverity] = useState<string>(''); // '', 'Crítico', 'Alto', 'Medio', 'Información'

  useEffect(() => {
    fetchEvents();
  }, [filterStatus, filterSeverity]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getMyEvents(filterStatus || undefined, filterSeverity || undefined);
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await api.markEventRead(id);
      fetchEvents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await api.archiveEvent(id);
      fetchEvents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleNavigate = (event: EventReceipt) => {
    if (!event.read_at) {
      api.markEventRead(event.id);
    }

    if (event.entity_type === 'customer' && event.entity_id) {
      router.push(`/dashboard/clientes/${event.entity_id}`);
    } else if (event.entity_type === 'pqrsf' && event.entity_id) {
      if (event.payload?.customer_id) {
        router.push(`/dashboard/clientes/${event.payload.customer_id}`);
      } else {
        router.push(`/dashboard/pqrsf/${event.entity_id}`);
      }
    }
  };

  const severityColors: Record<string, string> = {
    'Crítico': 'var(--danger)',
    'Alto': 'var(--warning)',
    'Medio': 'var(--primary)',
    'Información': 'var(--text-secondary)'
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader 
        title="Centro de Notificaciones" 
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Notificaciones' }
        ]} 
      />

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--surface-border)' }}
        >
          <option value="">Todas (No archivadas)</option>
          <option value="unread">No leídas</option>
          <option value="read">Leídas</option>
          <option value="archived">Archivadas</option>
        </select>

        <select 
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--surface-border)' }}
        >
          <option value="">Todas las prioridades</option>
          <option value="Crítico">Crítico</option>
          <option value="Alto">Alto</option>
          <option value="Medio">Medio</option>
          <option value="Información">Información</option>
        </select>

        <button 
          onClick={() => fetchEvents()}
          style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'var(--surface-color)', cursor: 'pointer' }}
        >
          Actualizar
        </button>
      </div>

      <Card>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Cargando notificaciones...</div>
        ) : events.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-disabled)' }}>
            <h3>No hay notificaciones</h3>
            <p>No se encontraron eventos con los filtros actuales.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {events.map((event) => (
              <div 
                key={event.id}
                style={{
                  display: 'flex',
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--surface-border)',
                  backgroundColor: event.read_at ? 'transparent' : 'var(--bg-color)',
                  transition: 'background-color 0.2s',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: severityColors[event.severity] || 'var(--text-secondary)' }} />
                
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleNavigate(event)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: event.read_at ? 500 : 700 }}>
                      {event.payload?.title || event.event_type}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {event.payload?.description}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
                    <span>Origen: {event.origin}</span>
                    <span>•</span>
                    <span>Severidad: {event.severity}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', opacity: 0.7 }}>
                  {!event.read_at && (
                    <button 
                      onClick={() => handleMarkRead(event.id)}
                      title="Marcar como leída"
                      style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'var(--surface-color)', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      Leída
                    </button>
                  )}
                  {!event.archived_at && (
                    <button 
                      onClick={() => handleArchive(event.id)}
                      title="Archivar"
                      style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'var(--surface-color)', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                    >
                      Archivar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
