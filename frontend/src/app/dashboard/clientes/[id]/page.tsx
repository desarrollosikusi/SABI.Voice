'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/services/api';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
import { formatDocument } from '@/utils/formatters';

// Tab Components
import CommandCenterTab from './components/CommandCenterTab';
import GeneralTab from './components/GeneralTab';
import StakeholdersTab from './components/StakeholdersTab';
import ContractsTab from './components/ContractsTab';
import PqrsfTab from './components/PqrsfTab';
import MetricsTab from './components/MetricsTab';

export default function ClienteDetail() {
  const params = useParams();
  const router = useRouter();
  const [cliente, setCliente] = useState<any>(null);
  const [sectors, setSectors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('command-center');

  useEffect(() => {
    if (params.id) {
      loadData(params.id as string);
    }
  }, [params.id]);

  const loadData = async (id: string) => {
    setLoading(true);
    try {
      const [clienteData, sectorsData, usersData] = await Promise.all([
        api.getAdminCustomerById(id),
        api.getEconomicSectors().catch(() => []),
        api.getInternalUsers().catch(() => [])
      ]);
      setCliente(clienteData);
      setSectors(sectorsData);
      setUsers([...usersData].sort((a: any, b: any) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ height: '80px', backgroundColor: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '100px', backgroundColor: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '400px', backgroundColor: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
      </div>
    );
  }

  if (!cliente) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Cliente no encontrado</div>;
  }

  const tabOptions = [
    { value: 'command-center', label: 'Command Center' },
    { value: 'general', label: 'Información General' },
    { value: 'stakeholders', label: `Stakeholders` },
    { value: 'contratos', label: 'Contratos' },
    { value: 'pqrsf', label: 'PQRSF' },
    { value: 'indicadores', label: 'Indicadores' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader 
        title={cliente.name}
        description={cliente.economic_sector?.name || cliente.sector || 'Sin sector'}
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Clientes', href: '/dashboard/clientes' }, { label: cliente.name }]}
      />

      <Card style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 600 }}>{cliente.name}</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>NIT: {formatDocument(cliente.nit) || 'No registrado'}</p>
        </div>
        
        {cliente.logo_path ? (
          <img src={`http://localhost:8000/${cliente.logo_path}`} alt={cliente.name} style={{ width: 140, height: 60, borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
        ) : (
          <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 'bold', color: 'var(--text-secondary)' }}>
            {cliente.name.substring(0, 2).toUpperCase()}
          </div>
        )}
      </Card>

      <div style={{ borderBottom: '1px solid var(--surface-border)' }}>
        <Tabs value={activeTab} onChange={setActiveTab} options={tabOptions} />
      </div>

      <div style={{ minHeight: '400px' }}>
        {activeTab === 'command-center' && (
          <CommandCenterTab customerId={Number(cliente.id)} />
        )}
        
        {activeTab === 'general' && (
          <GeneralTab 
            cliente={cliente} 
            sectors={sectors} 
            users={users} 
            onUpdate={(updatedCliente) => setCliente(updatedCliente)} 
          />
        )}
        
        {activeTab === 'stakeholders' && (
          <StakeholdersTab customerId={Number(cliente.id)} />
        )}
        
        {activeTab === 'contratos' && (
          <ContractsTab customerId={Number(cliente.id)} />
        )}
        
        {activeTab === 'pqrsf' && (
          <PqrsfTab customerId={Number(cliente.id)} />
        )}

        {activeTab === 'indicadores' && (
          <MetricsTab customerId={Number(cliente.id)} cliente={cliente} />
        )}
      </div>
    </div>
  );
}
