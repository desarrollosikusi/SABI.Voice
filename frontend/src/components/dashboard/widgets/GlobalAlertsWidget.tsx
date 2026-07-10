import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { api } from '@/services/api';

export default function GlobalAlertsWidget() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getGlobalCommandCenterAlerts();
      setAlerts(data);
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
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Alertas Operacionales</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2].map(i => (
            <div key={i} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e2e8f0', animation: 'pulse 1.5s infinite' }}></div>
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
          Error al cargar Alertas. <button onClick={loadAlerts} style={{ background:'none', border:'none', color:'#b91c1c', textDecoration:'underline', cursor:'pointer' }}>Reintentar</button>
        </div>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Crítico': return { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', icon: '🚨' };
      case 'Alto': return { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', icon: '⚠️' };
      case 'Medio': return { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: 'ℹ️' };
      default: return { bg: '#f8fafc', border: '#cbd5e1', text: '#475569', icon: '📌' };
    }
  };

  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Alertas Operacionales</h3>
        {alerts.length > 0 && <Badge variant="danger">{alerts.length}</Badge>}
      </div>

      {alerts.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          No hay alertas pendientes.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          {alerts.map(alert => {
            const style = getSeverityColor(alert.severity);
            return (
              <div key={alert.id} style={{ 
                padding: '12px', 
                backgroundColor: style.bg,
                border: `1px solid ${style.border}`, 
                borderRadius: '8px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{ fontSize: '1.2rem', marginTop: '2px' }}>{style.icon}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 600, color: style.text, fontSize: '0.95rem' }}>{alert.title}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(alert.date).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {alert.description}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: 'rgba(255,255,255,0.5)', padding: '2px 6px', borderRadius: '4px' }}>{alert.source}</span>
                    {alert.suggested_action && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, cursor: 'pointer' }}>{alert.suggested_action} →</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
