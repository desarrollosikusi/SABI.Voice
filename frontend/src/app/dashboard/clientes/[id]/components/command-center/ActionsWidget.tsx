import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { api } from '@/services/api';

export default function ActionsWidget({ customerId }: { customerId: number }) {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadActions();
  }, [customerId]);

  const loadActions = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getCommandCenterActions(customerId);
      setActions(data);
    } catch (e) {
      console.error("Error loading actions:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 60, backgroundColor: '#e2e8f0', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171' }}>
        <div style={{ color: '#991b1b', fontSize: '0.9rem' }}>Error al cargar próximas acciones. <button onClick={loadActions} style={{ background:'none', border:'none', color:'#b91c1c', textDecoration:'underline', cursor:'pointer' }}>Reintentar</button></div>
      </Card>
    );
  }

  if (actions.length === 0) {
    return (
      <Card style={{ backgroundColor: '#f8fafc', textAlign: 'center', padding: '24px' }}>
        <p style={{ margin: 0, color: '#64748b' }}>No hay acciones pendientes.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Próximas Acciones</h3>
        <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem' }}>+ Nueva Acción</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {actions.map(action => (
          <div key={action.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '12px 16px', 
            border: '1px solid var(--surface-border)', 
            borderRadius: 8,
            backgroundColor: 'var(--surface-color)'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <input type="checkbox" style={{ width: 18, height: 18, cursor: 'pointer' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>{action.title}</div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span><strong style={{ fontWeight: 500 }}>Responsable:</strong> {action.responsible}</span>
                  <span><strong style={{ fontWeight: 500 }}>Vence:</strong> {new Date(action.target_date).toLocaleDateString()}</span>
                  <span><strong style={{ fontWeight: 500 }}>Origen:</strong> {action.source}</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ 
                padding: '4px 10px', 
                borderRadius: 12, 
                fontSize: '0.75rem', 
                fontWeight: 600,
                backgroundColor: action.priority === 'Alta' ? '#fee2e2' : action.priority === 'Media' ? '#fef3c7' : '#e2e8f0',
                color: action.priority === 'Alta' ? '#991b1b' : action.priority === 'Media' ? '#92400e' : '#475569'
              }}>
                {action.priority}
              </span>
              <span style={{ 
                padding: '4px 10px', 
                borderRadius: 12, 
                fontSize: '0.75rem', 
                fontWeight: 600,
                backgroundColor: action.status === 'Pendiente' ? '#e2e8f0' : '#dbeafe',
                color: action.status === 'Pendiente' ? '#475569' : '#1e40af'
              }}>
                {action.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
