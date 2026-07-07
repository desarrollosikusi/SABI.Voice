'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

export default function ClientesList() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Catalogs for filters
  const [sectors, setSectors] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    sector: '',
    pm_id: '',
    sdm_id: '',
    am_id: ''
  });

  useEffect(() => {
    loadCatalogs();
    loadClientes();
  }, []);

  useEffect(() => {
    loadClientes();
  }, [filters.sector, filters.pm_id, filters.sdm_id, filters.am_id]);

  const loadCatalogs = async () => {
    try {
      const [sectRes, usersRes] = await Promise.all([
        api.getCustomerSectors(),
        api.getAdminUsers()
      ]);
      setSectors(sectRes);
      setUsers(usersRes);
    } catch (err) {
      console.error(err);
    }
  };

  const loadClientes = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminCustomers(filters);
      setClientes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadClientes();
  };

  const columns = [
    { key: 'name', label: 'Nombre Cliente' },
    { key: 'nit', label: 'NIT' },
    { key: 'sector', label: 'Sector' },
    { 
      key: 'contacts_count', 
      label: 'Contactos',
      render: (row: any) => row.contacts_count || 0
    },
    { 
      key: 'active_cases', 
      label: 'Casos Activos',
      render: (row: any) => row.open_cases || 0
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Directorio de Clientes"
        description="Gestiona la base de clientes IKUSI, asigna Account Managers y monitorea su actividad."
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Clientes IKUSI' }]}
        actions={
          <Button variant="primary">Nuevo Cliente</Button>
        }
      />

      <Card style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <Input 
                placeholder="Buscar por nombre o NIT..." 
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <Button type="submit" variant="secondary">Buscar</Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Select 
              value={filters.sector} 
              onChange={(e) => setFilters({...filters, sector: e.target.value})}
              options={[{ value: '', label: 'Todos los sectores' }, ...sectors.map(s => ({ value: s, label: s }))]}
            />
            
            <Select 
              value={filters.am_id} 
              onChange={(e) => setFilters({...filters, am_id: e.target.value})}
              options={[{ value: '', label: 'Todos los Account Managers' }, ...users.filter(u => u.role === 'am' || u.role === 'admin').map(u => ({ value: u.id, label: u.full_name }))]}
            />

            <Select 
              value={filters.sdm_id} 
              onChange={(e) => setFilters({...filters, sdm_id: e.target.value})}
              options={[{ value: '', label: 'Todos los SDM' }, ...users.filter(u => u.role === 'sdm' || u.role === 'admin').map(u => ({ value: u.id, label: u.full_name }))]}
            />

            <Select 
              value={filters.pm_id} 
              onChange={(e) => setFilters({...filters, pm_id: e.target.value})}
              options={[{ value: '', label: 'Todos los PM' }, ...users.filter(u => u.role === 'pm' || u.role === 'admin').map(u => ({ value: u.id, label: u.full_name }))]}
            />
          </div>
        </form>
      </Card>

      <Card noPadding>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Cargando clientes...
          </div>
        ) : (
          <DataTable 
            columns={columns}
            data={clientes}
            onRowClick={(row) => router.push(`/dashboard/clientes/${row.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
