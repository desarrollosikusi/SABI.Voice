import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { api } from '@/services/api';

interface MetricsTabProps {
  customerId: number;
  cliente: any;
}

export default function MetricsTab({ customerId, cliente }: MetricsTabProps) {
  const [loading, setLoading] = useState(true);
  const [contractMetrics, setContractMetrics] = useState<any>(null);
  const [pqrsfStats, setPqrsfStats] = useState<any>(null);

  useEffect(() => {
    loadMetrics();
  }, [customerId]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // We load contract metrics for this customer
      const cMetrics = await api.getCustomerContractMetrics(customerId).catch(() => null);
      setContractMetrics(cMetrics);
      
      // We can get pqrsfs to calculate some basic metrics
      const pqrsfs = await api.getPqrsfs({ customer_id: customerId }).catch(() => []);
      
      const criticalOpen = pqrsfs.filter((p: any) => 
        (p.prioridad_rel?.name === 'Alta' || p.prioridad_rel?.name === 'Urgente') && 
        p.estado_rel?.is_final === false
      ).length;
      
      const slaVencido = pqrsfs.filter((p: any) => p.estado_sla === 'Vencido').length;
      const totalSla = pqrsfs.length;
      const slaCompliance = totalSla > 0 ? Math.round(((totalSla - slaVencido) / totalSla) * 100) : 100;

      setPqrsfStats({
        criticalOpen,
        slaCompliance,
        totalOpen: pqrsfs.filter((p:any) => p.estado_rel?.is_final === false).length
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderHealthBadge = (health: string) => {
    let bgColor = '#e2e8f0';
    let textColor = '#475569';
    if (health === 'Verde' || health === 'Buena') { bgColor = '#dcfce7'; textColor = '#166534'; }
    if (health === 'Amarillo' || health === 'Regular') { bgColor = '#fef08a'; textColor = '#854d0e'; }
    if (health === 'Rojo' || health === 'Crítica') { bgColor = '#fee2e2'; textColor = '#991b1b'; }
    
    return (
      <span style={{ backgroundColor: bgColor, color: textColor, padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-block' }}>
        {health || 'N/A'}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: '120px', backgroundColor: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>)}
        </div>
      </div>
    );
  }

  // Derive some statuses
  const overallHealth = cliente.relationship_score >= 80 ? 'Buena' : cliente.relationship_score >= 50 ? 'Regular' : 'Crítica';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>Estado General del Cliente</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        
        <Card style={{ textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem' }}>Salud del Cliente</h4>
          <div style={{ marginTop: '12px' }}>
            {renderHealthBadge(overallHealth)}
          </div>
        </Card>

        <Card style={{ textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem' }}>Relationship Score</h4>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            {cliente.relationship_score || 0}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>↑ Tendencia Positiva</div>
        </Card>

        <Card style={{ textAlign: 'center', border: pqrsfStats?.slaCompliance < 90 ? '1px solid #f87171' : '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem' }}>Cumplimiento de SLA</h4>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: pqrsfStats?.slaCompliance < 90 ? '#dc2626' : '#10b981' }}>
            {pqrsfStats?.slaCompliance}%
          </div>
        </Card>

        <Card style={{ textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem' }}>Contratos Venciendo (90d)</h4>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: contractMetrics?.ending_soon > 0 ? '#d97706' : '#64748b' }}>
            {contractMetrics?.ending_soon || 0}
          </div>
        </Card>

        <Card style={{ textAlign: 'center', border: pqrsfStats?.criticalOpen > 0 ? '1px solid #f87171' : '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem' }}>PQRSF Críticas Abiertas</h4>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: pqrsfStats?.criticalOpen > 0 ? '#dc2626' : '#64748b' }}>
            {pqrsfStats?.criticalOpen || 0}
          </div>
        </Card>

        <Card style={{ textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem' }}>Riesgos Activos (Planview)</h4>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#64748b' }}>
            -
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Pendiente integración</div>
        </Card>

      </div>
      
    </div>
  );
}
