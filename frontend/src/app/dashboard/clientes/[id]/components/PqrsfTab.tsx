import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';

interface PqrsfTabProps {
  customerId: number;
}

export default function PqrsfTab({ customerId }: PqrsfTabProps) {
  const router = useRouter();
  const [pqrsfs, setPqrsfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadPqrsfs();
  }, [customerId, statusFilter]);

  const loadPqrsfs = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = { customer_id: customerId };
      if (statusFilter) filters.status_id = statusFilter;
      
      const data = await api.getPqrsfs(filters);
      setPqrsfs(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar los casos PQRSF.");
    } finally {
      setLoading(false);
    }
  };

  const renderSlaBadge = (slaStatus: string) => {
    let bgColor = '#e2e8f0';
    let textColor = '#475569';
    if (slaStatus === 'En tiempo') { bgColor = '#dcfce7'; textColor = '#166534'; }
    if (slaStatus === 'Por vencer') { bgColor = '#fef08a'; textColor = '#854d0e'; }
    if (slaStatus === 'Vencido') { bgColor = '#fee2e2'; textColor = '#991b1b'; }
    
    return (
      <span style={{ backgroundColor: bgColor, color: textColor, padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
        {slaStatus || 'N/A'}
      </span>
    );
  };

  const columns = [
    { key: 'consecutivo', label: 'Ticket', sortable: true, render: (row: any) => <strong>{row.consecutivo}</strong> },
    { key: 'asunto', label: 'Asunto', render: (row: any) => <span title={row.asunto}>{row.asunto?.length > 40 ? row.asunto.substring(0,40)+'...' : row.asunto}</span> },
    { key: 'tipo', label: 'Tipo', sortable: true, render: (row: any) => row.tipo_rel?.name || '-' },
    { key: 'estado', label: 'Estado', sortable: true, render: (row: any) => row.estado_rel?.name || '-' },
    { key: 'prioridad', label: 'Prioridad', sortable: true, render: (row: any) => row.prioridad_rel?.name || '-' },
    { key: 'responsable', label: 'Responsable', render: (row: any) => row.responsable?.name || 'Sin asignar' },
    { key: 'fecha_creacion', label: 'Creación', sortable: true, render: (row: any) => new Date(row.fecha_creacion).toLocaleDateString() },
    { key: 'estado_sla', label: 'SLA', sortable: true, render: (row: any) => renderSlaBadge(row.estado_sla) },
    { key: 'actions', label: 'Acciones', render: (row: any) => (
      <button 
        onClick={() => router.push(`/dashboard/pqrsf/${row.id}`)}
        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
      >
        Ver Caso
      </button>
    )}
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <div style={{ height: '30px', width: '200px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
        </div>
        <div style={{ height: '300px', backgroundColor: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #f87171' }}>
        <h3 style={{ color: '#991b1b', marginBottom: '8px' }}>Atención</h3>
        <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>
        <button onClick={loadPqrsfs} style={{ marginTop: '16px', padding: '8px 16px', background: '#991b1b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <Card noPadding>
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Minimal filter for now, can be expanded */}
            <button 
              onClick={() => { setStatusFilter(''); loadPqrsfs(); }}
              style={{ padding: '6px 12px', background: !statusFilter ? 'var(--primary)' : 'transparent', color: !statusFilter ? 'white' : 'var(--text-secondary)', border: '1px solid #e2e8f0', borderRadius: 4, cursor: 'pointer' }}
            >
              Todos
            </button>
          </div>
        </div>
        
        {pqrsfs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📋</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#475569' }}>No hay casos PQRSF</h3>
            <p style={{ color: '#64748b', margin: 0 }}>No se encontraron casos registrados para este cliente.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={pqrsfs} />
        )}
      </Card>
    </div>
  );
}
