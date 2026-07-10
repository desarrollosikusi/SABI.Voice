'use client'; // force-rebuild-1
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { formatDocument } from '@/utils/formatters';

export default function ClientesList() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Catalogs for filters
  const [sectors, setSectors] = useState<string[]>([]);
  const [economicSectors, setEconomicSectors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Creation Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', nit: '', economic_sector_id: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    sector: '',
    economic_sector_id: '',
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
  }, [filters.sector, filters.economic_sector_id, filters.pm_id, filters.sdm_id, filters.am_id]);

  const loadCatalogs = async () => {
    try {
      const [sectRes, ecoSectRes, usersRes] = await Promise.all([
        api.getCustomerSectors(),
        api.getEconomicSectors(),
        api.getAdminUsers()
      ]);
      setSectors(sectRes);
      setEconomicSectors(ecoSectRes);
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

  const handleOpenCreateModal = () => {
    setNewCustomer({ name: '', nit: '', economic_sector_id: '' });
    setCreateError('');
    setIsCreateModalOpen(true);
  };

  const handleCreateCustomer = async (force: boolean = false) => {
    try {
      setCreateError('');
      setCreateLoading(true);

      if (!newCustomer.name || !newCustomer.nit || !newCustomer.economic_sector_id) {
        setCreateError("Todos los campos son obligatorios.");
        setCreateLoading(false);
        return;
      }

      if (!force) {
        const { exists } = await api.checkNit(newCustomer.nit);
        if (exists) {
          // Sector 4 is "Sector Público Territorial"
          if (parseInt(newCustomer.economic_sector_id) !== 4) {
            setCreateError("El NIT ya se encuentra registrado.");
            setCreateLoading(false);
            return;
          } else {
            // Confirm modal
            setIsConfirmModalOpen(true);
            setIsCreateModalOpen(false);
            setCreateLoading(false);
            return;
          }
        }
      }

      // Proceed to create
      const payload = {
        name: newCustomer.name,
        nit: newCustomer.nit,
        economic_sector_id: parseInt(newCustomer.economic_sector_id),
        estado: 'Activo'
      };
      
      await api.createCustomer(payload);
      
      setIsCreateModalOpen(false);
      setIsConfirmModalOpen(false);
      loadClientes(); // reload table
    } catch (err: any) {
      setCreateError(err.message || 'Error al crear el cliente');
    } finally {
      setCreateLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Nombre Cliente' },
    { key: 'nit', label: 'NIT' },
    { 
      key: 'sector', 
      label: 'Sector',
      render: (row: any) => row.economic_sector?.name || row.sector || 'Sin sector'
    },
    { 
      key: 'contacts_count', 
      label: 'Contactos',
      render: (row: any) => row.total_contactos || 0
    },
    { 
      key: 'active_cases', 
      label: 'Casos Activos',
      render: (row: any) => row.pqrsf_abiertas || 0
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Directorio de Clientes"
        description="Gestiona la base de clientes IKUSI, asigna Account Managers y monitorea su actividad."
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Clientes IKUSI' }]}
        actions={
          <Button variant="primary" onClick={handleOpenCreateModal}>Nuevo Cliente</Button>
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
              value={filters.economic_sector_id} 
              onChange={(e) => setFilters({...filters, economic_sector_id: e.target.value})}
              options={[{ value: '', label: 'Todos los sectores' }, ...economicSectors.map(s => ({ value: s.id, label: s.name }))]}
            />
            
            <Select 
              value={filters.am_id} 
              onChange={(e) => setFilters({...filters, am_id: e.target.value})}
              options={[{ value: '', label: 'Todos los Account Managers' }, ...users.filter(u => u.job_title === 'AM').map(u => ({ value: u.id, label: u.name }))]}
            />

            <Select 
              value={filters.sdm_id} 
              onChange={(e) => setFilters({...filters, sdm_id: e.target.value})}
              options={[{ value: '', label: 'Todos los SDM' }, ...users.filter(u => u.job_title === 'SDM').map(u => ({ value: u.id, label: u.name }))]}
            />

            <Select 
              value={filters.pm_id} 
              onChange={(e) => setFilters({...filters, pm_id: e.target.value})}
              options={[{ value: '', label: 'Todos los PM' }, ...users.filter(u => u.job_title === 'PM').map(u => ({ value: u.id, label: u.name }))]}
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
            data={clientes.map(c => ({ ...c, nit: formatDocument(c.nit) }))}
            onRowClick={(row) => router.push(`/dashboard/clientes/${row.id}`)}
          />
        )}
      </Card>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>Nuevo Cliente</h3>
            
            {createError && (
              <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', border: '1px solid #ef9a9a' }}>
                {createError}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <Input 
                label="Nombre Cliente" 
                value={newCustomer.name} 
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} 
                required 
              />
              <Input 
                label="NIT" 
                value={newCustomer.nit} 
                onChange={(e) => setNewCustomer({...newCustomer, nit: e.target.value})} 
                required 
              />
              <Select 
                label="Sector Económico"
                value={newCustomer.economic_sector_id}
                onChange={(e) => setNewCustomer({...newCustomer, economic_sector_id: e.target.value})}
                options={[{ value: '', label: 'Seleccione un sector...' }, ...economicSectors.map(s => ({ value: s.id, label: s.name }))]}
                required
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" onClick={() => handleCreateCustomer(false)} disabled={createLoading}>
                {createLoading ? 'Verificando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {isConfirmModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: '#f57c00' }}>NIT ya registrado</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
              El NIT <strong>{formatDocument(newCustomer.nit)}</strong> ya se encuentra registrado en el sistema. Al pertenecer al Sector Público Territorial, está permitido crear un registro adicional. ¿Desea continuar con la creación bajo estas condiciones?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" onClick={() => handleCreateCustomer(true)} disabled={createLoading}>
                {createLoading ? 'Guardando...' : 'Sí, crear cliente'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
