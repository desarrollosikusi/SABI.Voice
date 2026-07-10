import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { api } from '@/services/api';
import Link from 'next/link';

export default function MyWorkWidget() {
  const [workItems, setWorkItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadMyWork();
  }, []);

  const loadMyWork = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getGlobalCommandCenterMyWork();
      setWorkItems(data);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Mi Trabajo Hoy</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ height: '16px', width: '40%', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite', marginBottom: '8px' }}></div>
              <div style={{ height: '12px', width: '70%', backgroundColor: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171', height: '100%' }}>
        <div style={{ color: '#991b1b', fontSize: '0.9rem' }}>
          Error al cargar Mi Trabajo Hoy. <button onClick={loadMyWork} style={{ background:'none', border:'none', color:'#b91c1c', textDecoration:'underline', cursor:'pointer' }}>Reintentar</button>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Mi Trabajo Hoy</h3>
        <Badge variant="neutral">{workItems.length} pendientes</Badge>
      </div>

      {workItems.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          No tienes casos ni actividades asignadas para hoy.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          {workItems.map(item => (
            <div key={item.id} style={{ 
              padding: '12px', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px',
              borderLeft: item.prioridad.toLowerCase().includes('alta') ? '4px solid #ef4444' : '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              backgroundColor: item.is_sla_at_risk ? '#fffbeb' : 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Link href={`/dashboard/pqrsf/${item.id}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                  {item.consecutivo}
                </Link>
                <Badge variant={item.estado === 'Abierto' ? 'warning' : 'info'}>{item.estado}</Badge>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {item.asunto}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Prioridad: {item.prioridad}</span>
                {item.fecha_limite && <span>Vence: {new Date(item.fecha_limite).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
