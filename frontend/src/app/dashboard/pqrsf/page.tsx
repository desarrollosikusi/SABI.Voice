'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Tabs from '@/components/ui/Tabs';

export default function PqrsfListPage() {
  const router = useRouter();
  const [cases, setCases] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [filterMode, setFilterMode] = useState<'my_area' | 'mine' | 'all'>('my_area');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    api.getMe().then(res => {
      setUser(res);
      if (res.area) {
        setFilterMode('my_area');
        fetchData(res.area, undefined);
      } else {
        setFilterMode('all');
        fetchData();
      }
    }).catch(err => {
      console.error(err);
      fetchData(); 
    });
    
    // Fetch states
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/states`, {
      headers: { ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}) }
    }).then(res => res.json()).then(data => setStates(data || [])).catch(console.error);
  }, []);

  const fetchData = async (areaFilter?: string, myId?: number) => {
    setLoading(true);
    try {
      const data = await api.getPqrsfs(areaFilter);
      let filtered = data;
      if (myId) {
        filtered = data.filter((c: any) => c.responsable_id === myId);
      }
      setCases(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (mode: string) => {
    setFilterMode(mode as any);
    if (mode === 'my_area' && user?.area) {
      fetchData(user.area, undefined);
    } else if (mode === 'mine' && user?.id) {
      fetchData(undefined, user.id);
    } else {
      fetchData();
    }
  };

  const displayedCases = cases.filter(c => {
    if (statusFilter && c.estado_id !== parseInt(statusFilter)) return false;
    return true;
  });

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'subject', label: 'Asunto' },
    { key: 'customer', label: 'Cliente', render: (c: any) => c.customer?.name || '-' },
    { key: 'area', label: 'Área Asignada', render: (c: any) => c.area?.name || '-' },
    { 
      key: 'status', 
      label: 'Estado', 
      render: (c: any) => (
        <Badge variant={c.status === 'Open' ? 'warning' : c.status === 'Resolved' ? 'success' : 'neutral'}>
          {c.status}
        </Badge>
      )
    },
    { key: 'created_at', label: 'Fecha Creado', render: (c: any) => new Date(c.created_at).toLocaleDateString() }
  ];

  const tabOptions = [
    { value: 'my_area', label: 'Casos de mi Área' },
    { value: 'mine', label: 'Mis Casos Asignados' },
    { value: 'all', label: 'Todos los Casos' }
  ];

  return (
    <div>
      <PageHeader 
        title="Bandejas de Trabajo (PQRSF)"
        description="Gestiona y haz seguimiento a las Peticiones, Quejas, Reclamos y Solicitudes."
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Gestión de Casos' }]}
        actions={<Button variant="primary">Nuevo Caso</Button>}
      />

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <Tabs 
            value={filterMode} 
            onChange={handleFilterChange} 
            options={tabOptions} 
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '250px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filtrar por Estado:</span>
            <Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[{ value: '', label: 'Todos los estados' }, ...states.map(s => ({ value: s.id.toString(), label: s.name }))]}
            />
          </div>

        </div>
      </Card>

      <Card noPadding>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Cargando casos...
          </div>
        ) : (
          <DataTable 
            columns={columns}
            data={displayedCases}
            onRowClick={(row) => router.push(`/dashboard/pqrsf/${row.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
