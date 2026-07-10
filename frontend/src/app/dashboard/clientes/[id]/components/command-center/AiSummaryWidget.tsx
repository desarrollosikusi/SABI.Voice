import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { api } from '@/services/api';

export default function AiSummaryWidget({ customerId }: { customerId: number }) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadSummary();
  }, [customerId]);

  const loadSummary = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getCommandCenterAiSummary(customerId);
      setSummary(data);
    } catch (e) {
      console.error("Error loading AI summary:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ height: 24, width: 200, backgroundColor: '#e2e8f0', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 100, backgroundColor: '#e2e8f0', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171' }}>
        <div style={{ color: '#991b1b', fontSize: '0.9rem' }}>Error al generar resumen IA. <button onClick={loadSummary} style={{ background:'none', border:'none', color:'#b91c1c', textDecoration:'underline', cursor:'pointer' }}>Reintentar</button></div>
      </Card>
    );
  }

  if (!summary) return null;

  return (
    <Card style={{ 
      background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '1.25rem' }}>✨</span>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>SABI Voice - Resumen Ejecutivo IA</h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Bloque 1: Estado General */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado General</h4>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
            {summary.general_status}
          </p>
        </div>

        {/* Bloque 2: Riesgos Detectados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Riesgos Detectados</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {summary.detected_risks.map((risk: string, i: number) => (
              <li key={i}>{risk}</li>
            ))}
            {summary.detected_risks.length === 0 && <li style={{ color: '#64748b', listStyleType: 'none', marginLeft: '-20px' }}>No hay riesgos latentes detectados.</li>}
          </ul>
        </div>

        {/* Bloque 3: Oportunidades */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Oportunidades</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {summary.opportunities.map((opp: string, i: number) => (
              <li key={i}>{opp}</li>
            ))}
            {summary.opportunities.length === 0 && <li style={{ color: '#64748b', listStyleType: 'none', marginLeft: '-20px' }}>No hay oportunidades detectadas.</li>}
          </ul>
        </div>

        {/* Bloque 4: Próxima Mejor Acción */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Próxima Mejor Acción</h4>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e3a8a', lineHeight: '1.5', fontWeight: 500 }}>
            {summary.next_best_action}
          </p>
        </div>

      </div>
    </Card>
  );
}
