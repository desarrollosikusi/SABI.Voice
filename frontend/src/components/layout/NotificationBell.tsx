'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

type EventReceipt = {
  id: number;
  event_type: string;
  severity: string;
  payload?: any;
  created_at: string;
  read_at: string | null;
  entity_type: string | null;
  entity_id: number | null;
};

export default function NotificationBell() {
  const router = useRouter();
  const [events, setEvents] = useState<EventReceipt[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
    // In a real event-driven app, this would be a WebSocket or SSE.
    // For now, we poll every 30 seconds.
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await api.getMyEvents('unread');
      setEvents(data || []);
      setUnreadCount((data || []).length);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleMarkRead = async (e: React.MouseEvent, receiptId: number) => {
    e.stopPropagation();
    try {
      await api.markEventRead(receiptId);
      fetchEvents();
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  const handleNavigate = (event: EventReceipt) => {
    setIsOpen(false);
    
    // Marcar como leída automáticamente al navegar
    if (!event.read_at) {
      api.markEventRead(event.id).then(() => fetchEvents());
    }

    if (event.entity_type === 'customer' && event.entity_id) {
      router.push(`/dashboard/clientes/${event.entity_id}`);
    } else if (event.entity_type === 'pqrsf' && event.entity_id) {
      // Find which customer this PQRSF belongs to from payload or just redirect to PQRSF detail when available
      // For now we redirect to customer dashboard if customer_id is available in payload
      if (event.payload?.customer_id) {
        router.push(`/dashboard/clientes/${event.payload.customer_id}`);
      } else {
        router.push(`/dashboard/pqrsf/${event.entity_id}`); // Standard detail page
      }
    } else {
      router.push('/dashboard/notificaciones');
    }
  };

  const severityColors: Record<string, string> = {
    'Crítico': 'var(--danger)',
    'Alto': 'var(--warning)',
    'Medio': 'var(--primary)',
    'Información': 'var(--text-secondary)'
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: isOpen ? 'var(--surface-border)' : 'transparent',
          transition: 'background-color 0.2s'
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0px',
            right: '0px',
            backgroundColor: 'var(--danger)',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            borderRadius: '10px',
            padding: '2px 6px',
            minWidth: '16px',
            textAlign: 'center',
            border: '2px solid var(--surface-color)'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
            onClick={() => setIsOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '320px',
            backgroundColor: 'var(--surface-color)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '400px'
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--surface-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Notificaciones</h3>
              <button 
                onClick={() => router.push('/dashboard/notificaciones')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
              >
                Ver todas
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {events.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.85rem' }}>
                  No tienes notificaciones nuevas
                </div>
              ) : (
                events.slice(0, 5).map(event => (
                  <div 
                    key={event.id}
                    onClick={() => handleNavigate(event)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--surface-border)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: severityColors[event.severity] || 'var(--text-secondary)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {event.payload?.title || event.event_type}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => handleMarkRead(e, event.id)}
                        title="Marcar como leída"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                      >
                        ✓
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {event.payload?.description}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginTop: '4px' }}>
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            {events.length > 5 && (
              <div style={{
                padding: '8px',
                textAlign: 'center',
                borderTop: '1px solid var(--surface-border)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                +{events.length - 5} notificaciones más
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
