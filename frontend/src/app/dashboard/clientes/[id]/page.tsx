'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/services/api';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
import DataTable from '@/components/ui/DataTable';

export default function ClienteDetail() {
  const params = useParams();
  const router = useRouter();
  const [cliente, setCliente] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (params.id) {
      loadData(params.id as string);
    }
  }, [params.id]);

  const loadData = async (id: string) => {
    setLoading(true);
    try {
      const [clienteData, contactsData] = await Promise.all([
        api.getAdminCustomerById(id),
        api.getCustomerContacts(Number(id))
      ]);
      setCliente(clienteData);
      setContacts(contactsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Cargando detalles del cliente...</div>;
  }

  if (!cliente) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Cliente no encontrado</div>;
  }

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '-';

  const tabOptions = [
    { value: 'general', label: 'Información General' },
    { value: 'stakeholders', label: `Stakeholders (${contacts.length})` }
  ];

  const contactColumns = [
    { key: 'full_name', label: 'Nombre', render: (row: any) => `${row.name || ''} ${row.apellidos || ''}`.trim() },
    { key: 'role_name', label: 'Cargo / Rol', render: (row: any) => row.cargo || 'N/A' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Teléfono', render: (row: any) => row.phone || row.celular || 'N/A' },
    { key: 'nps_score', label: 'NPS', render: (row: any) => row.nps_score || 'N/A' },
    { key: 'csat_score', label: 'CSAT', render: (row: any) => row.csat_score || 'N/A' }
  ];

  return (
    <div>
      <PageHeader 
        title={cliente.name}
        description={cliente.sector || 'Sin sector'}
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Clientes IKUSI', href: '/dashboard/clientes' }, { label: cliente.name }]}
      />

      <Card style={{ marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: 'var(--text-primary)' }}>{cliente.name}</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>NIT: {cliente.nit || 'No registrado'}</p>
        </div>
        
        {cliente.logo_path ? (
          <img src={`http://localhost:8000${cliente.logo_path}`} alt={cliente.name} style={{ width: 140, height: 60, borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
        ) : (
          <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 'bold', color: 'var(--text-secondary)' }}>
            {cliente.name.substring(0, 2).toUpperCase()}
          </div>
        )}
      </Card>

      <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--surface-border)' }}>
        <Tabs value={activeTab} onChange={setActiveTab} options={tabOptions} />
      </div>

      {activeTab === 'general' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <Card>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Datos Comerciales</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Actividad Económica</div><div style={{ fontWeight: 500 }}>{cliente.sector || '-'}</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ciudad / País</div><div style={{ fontWeight: 500 }}>{cliente.ciudad ? `${cliente.ciudad}, ${cliente.pais}` : '-'}</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fecha Alta Comercial</div><div style={{ fontWeight: 500 }}>{formatDate(cliente.fecha_alta_comercial)}</div></div>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Equipo Asignado</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Account Manager (AM)</div><div style={{ fontWeight: 500 }}>{cliente.ejecutivo_cuenta?.name || '-'}</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Project Manager (PM)</div><div style={{ fontWeight: 500 }}>{cliente.pm?.name || '-'}</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Service Delivery Manager (SDM)</div><div style={{ fontWeight: 500 }}>{cliente.sdm?.name || '-'}</div></div>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Métricas de Relacionamiento</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nivel de Cercanía Global</div><div style={{ fontWeight: 500, color: 'var(--primary)' }}>{cliente.relationship_score || 0}%</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Casos Activos</div><div style={{ fontWeight: 500, color: 'var(--warning)' }}>{cliente.open_cases || 0} Casos</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Stakeholders Identificados</div><div style={{ fontWeight: 500 }}>{contacts.length} Contactos</div></div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'stakeholders' && (
        <Card noPadding>
          {contacts.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No hay contactos registrados.</div>
          ) : (
            <DataTable columns={contactColumns} data={contacts} />
          )}
        </Card>
      )}
    </div>
  );
}
