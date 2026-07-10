import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { api } from '@/services/api';

export default function OperationalStatusWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const summary = await api.getGlobalCommandCenterSummary();
      setData(summary);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {[1,2,3,4,5,6].map(i => (
          <Card key={i} style={{ height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ height: '16px', width: '50%', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite', marginBottom: '8px' }}></div>
            <div style={{ height: '24px', width: '30%', backgroundColor: '#cbd5e1', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171' }}>
        <div style={{ color: '#991b1b', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>Error al cargar Estado Operacional.</span>
          <button onClick={loadData} style={{ background:'none', border:'none', color:'#b91c1c', textDecoration:'underline', cursor:'pointer' }}>Reintentar</button>
        </div>
      </Card>
    );
  }

  const kpis = [
    { label: 'Casos Abiertos', value: data.open_cases, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Casos Críticos', value: data.critical_cases, color: '#ef4444', bg: '#fef2f2' },
    { label: 'Cumplimiento SLA', value: `${data.sla_compliance_pct}%`, color: '#10b981', bg: '#ecfdf5' },
    { label: 'SLA en Riesgo', value: data.sla_at_risk, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Clientes en Riesgo', value: data.customers_at_risk, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Eventos Críticos', value: data.critical_events, color: '#be185d', bg: '#fdf2f8' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
      {kpis.map((kpi, index) => (
        <Card key={index} style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: `4px solid ${kpi.color}`, backgroundColor: kpi.bg }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{kpi.value}</div>
        </Card>
      ))}
    </div>
  );
}
