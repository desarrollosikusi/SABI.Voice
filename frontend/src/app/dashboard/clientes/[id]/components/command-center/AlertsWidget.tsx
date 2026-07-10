import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { api } from '@/services/api';

export default function AlertsWidget({ customerId }: { customerId: number }) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, [customerId]);

  const loadAlerts = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getCommandCenterAlerts(customerId);
      setAlerts(data);
    } catch (e) {
      console.error("Error loading alerts:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}>
          {[1,2,3].map(i => <div key={i} style={{ minWidth: 250, height: 80, backgroundColor: '#e2e8f0', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171' }}>
        <div style={{ color: '#991b1b', fontSize: '0.9rem' }}>Error al cargar alertas. <button onClick={loadAlerts} style={{ background:'none', border:'none', color:'#b91c1c', textDecoration:'underline', cursor:'pointer' }}>Reintentar</button></div>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card style={{ backgroundColor: '#f8fafc', textAlign: 'center', padding: '24px' }}>
        <p style={{ margin: 0, color: '#64748b' }}>No hay alertas activas para este cliente.</p>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Crítico': return { bg: '#fee2e2', text: '#991b1b', border: '#f87171' };
      case 'Alto': return { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' };
      case 'Medio': return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case 'Informativo': return { bg: '#e0f2fe', text: '#075985', border: '#7dd3fc' };
      default: return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
    }
  };

  return (
    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
      {alerts.map(alert => {
        const colors = getSeverityColor(alert.severity);
        return (
          <div key={alert.id} style={{ 
            minWidth: 300, 
            maxWidth: 350,
            backgroundColor: colors.bg, 
            border: `1px solid ${colors.border}`, 
            borderRadius: 8, 
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text, textTransform: 'uppercase' }}>{alert.severity}</span>
              <span style={{ fontSize: '0.75rem', color: colors.text, opacity: 0.8 }}>{alert.source}</span>
            </div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: colors.text }}>{alert.title}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: colors.text, opacity: 0.9 }}>{alert.description}</p>
            
            <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text, marginBottom: '4px' }}>ACCIÓN RECOMENDADA:</div>
              <div style={{ fontSize: '0.85rem', color: colors.text }}>{alert.suggested_action}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
