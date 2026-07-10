import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { api } from '@/services/api';

export default function GlobalActionsWidget() {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getGlobalCommandCenterActions();
      setActions(data);
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
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Próximas Acciones</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2].map(i => (
            <div key={i} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ height: '14px', width: '60%', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                <div style={{ height: '10px', width: '90%', backgroundColor: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
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
        <div style={{ color: '#991b1b', fontSize: '0.9rem' }}>
          Error al cargar Acciones. <button onClick={loadActions} style={{ background:'none', border:'none', color:'#b91c1c', textDecoration:'underline', cursor:'pointer' }}>Reintentar</button>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Próximas Acciones</h3>
        {actions.length > 0 && <Badge variant="info">{actions.length}</Badge>}
      </div>

      {actions.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          No hay acciones pendientes sugeridas.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          {actions.map(action => (
            <div key={action.id} style={{ 
              padding: '12px', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{action.title}</span>
                <Badge variant={action.priority === 'Alta' ? 'danger' : action.priority === 'Media' ? 'warning' : 'neutral'}>{action.priority}</Badge>
              </div>
              
              {action.suggested_action && (
                <div style={{ fontSize: '0.85rem', color: '#0f172a', backgroundColor: '#f8fafc', padding: '6px', borderRadius: '4px', borderLeft: '3px solid #3b82f6' }}>
                  <strong>Sugerencia:</strong> {action.suggested_action}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>👤</span> {action.responsible}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>⏱️</span> {action.target_date ? new Date(action.target_date).toLocaleDateString() : 'Sin fecha'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', gridColumn: '1 / -1' }}>
                  <span>📍</span> Origen: {action.source}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
