import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import DataTable from '@/components/ui/DataTable';

interface ContractsTabProps {
  customerId: number;
}

export default function ContractsTab({ customerId }: ContractsTabProps) {
  const router = useRouter();
  const [contracts, setContracts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [integrationStatus, setIntegrationStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadContractsData();
  }, [customerId, filterType, filterStatus]);

  const loadContractsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [contractsData, metricsData, statusData] = await Promise.all([
        api.getCustomerContracts(customerId, {
          contract_type: filterType || undefined,
          status: filterStatus || undefined
        }),
        api.getCustomerContractMetrics(customerId),
        api.getIntegrationStatus()
      ]);
      setContracts(contractsData);
      setMetrics(metricsData);
      setIntegrationStatus(statusData);
    } catch (err: any) {
      console.error("Error loading contracts data:", err);
      setError("El servicio de contratos no está disponible en este momento. Por favor, intente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const renderHealthBadge = (health: string) => {
    let bgColor = '#e2e8f0';
    let textColor = '#475569';
    if (health === 'Verde') { bgColor = '#dcfce7'; textColor = '#166534'; }
    if (health === 'Amarillo') { bgColor = '#fef08a'; textColor = '#854d0e'; }
    if (health === 'Rojo') { bgColor = '#fee2e2'; textColor = '#991b1b'; }
    
    return (
      <span style={{ 
        backgroundColor: bgColor, 
        color: textColor, 
        padding: '4px 8px', 
        borderRadius: '12px', 
        fontSize: '0.75rem', 
        fontWeight: 'bold' 
      }}>
        {health}
      </span>
    );
  };

  const columns = [
    { key: 'external_id', label: 'Cód. Externo', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true, render: (row: any) => <strong>{row.name}</strong> },
    { key: 'contract_type', label: 'Tipo', sortable: true },
    { key: 'architecture', label: 'Arquitectura' },
    { key: 'status', label: 'Estado', sortable: true },
    { key: 'pm', label: 'PM', render: (row: any) => row.pm || '-' },
    { key: 'sdm', label: 'SDM', render: (row: any) => row.sdm || '-' },
    { key: 'start_date', label: 'Inicio', render: (row: any) => formatDate(row.start_date) },
    { key: 'end_date', label: 'Fin', render: (row: any) => formatDate(row.end_date) },
    { key: 'health', label: 'Salud', render: (row: any) => renderHealthBadge(row.health) },
    { key: 'progress', label: 'Avance', render: (row: any) => (
      <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '8px', backgroundColor: 'var(--primary)', width: `${row.progress}%` }}></div>
      </div>
    )},
    { key: 'actions', label: 'Acciones', render: (row: any) => (
      <button 
        onClick={() => router.push(`/dashboard/clientes/${customerId}/contratos/${row.external_id}`)}
        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
      >
        Ver Detalle
      </button>
    )}
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Skeleton for Integration Status */}
        <div style={{ height: '44px', backgroundColor: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
        {/* Skeleton for Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: '110px', backgroundColor: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>)}
        </div>
        {/* Skeleton for Filters & Table */}
        <div style={{ height: '40px', width: '300px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '300px', backgroundColor: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #f87171' }}>
        <h3 style={{ color: '#991b1b', marginBottom: '8px' }}>Atención</h3>
        <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>
        <button onClick={loadContractsData} style={{ marginTop: '16px', padding: '8px 16px', background: '#991b1b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Integration Status Header */}
      {integrationStatus && (
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}><strong>Fuente de datos:</strong> {integrationStatus.provider_name}</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              <strong>Estado de Integración:</strong> 
              <span style={{ marginLeft: '4px', color: integrationStatus.is_available ? '#166534' : '#b45309' }}>
                {integrationStatus.status}
              </span>
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              <strong>Última Sincronización:</strong> {integrationStatus.last_sync ? new Date(integrationStatus.last_sync).toLocaleString() : 'No disponible'}
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem' }}>Proyectos Activos</h4>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{metrics.active_projects}</div>
          </div>
          <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem' }}>Servicios Activos</h4>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{metrics.active_services}</div>
          </div>
          <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem' }}>Próximos a Vencer</h4>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#b45309' }}>{metrics.ending_soon}</div>
          </div>
          <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem' }}>Salud General</h4>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '8px' }}>
              {renderHealthBadge(metrics.overall_health)}
            </div>
          </div>
        </div>
      )}

      {/* Filters and DataTable */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">Todos los Tipos</option>
            <option value="Proyecto">Proyectos</option>
            <option value="Servicio Administrado">Servicios Administrados</option>
            <option value="Soporte">Soporte</option>
          </select>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">Todos los Estados</option>
            <option value="Activo">Activos</option>
            <option value="En Ejecución">En Ejecución</option>
          </select>
        </div>

        {contracts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📄</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#475569' }}>No hay contratos</h3>
            <p style={{ color: '#64748b', margin: 0 }}>No se encontraron contratos para este cliente con los filtros seleccionados.</p>
          </div>
        ) : (
          <DataTable 
            data={contracts}
            columns={columns}
          />
        )}
      </div>
    </div>
  );
}
