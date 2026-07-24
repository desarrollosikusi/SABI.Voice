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
import Modal from '@/components/ui/Modal';
import TicketWizard from '@/components/TicketWizard/TicketWizard';
import * as LucideIcons from 'lucide-react';

const renderIcon = (iconName: string, size: number = 16, color: string = 'currentColor') => {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.FileText;
  return <Icon size={size} color={color} />;
};

export default function PqrsfListPage() {
  const router = useRouter();
  const [cases, setCases] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [filterMode, setFilterMode] = useState<'my_area' | 'mine' | 'all'>('my_area');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [states, setStates] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
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
      credentials: "include"
    }).then(res => res.json()).then(data => setStates(data || [])).catch(console.error);

    // Fetch categories
    api.getCaseCategories().then(data => setCategories(data || [])).catch(console.error);
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
    { key: 'id', header: 'ID', cell: (c: any) => c.id },
    { 
      key: 'categoria', 
      header: 'Categoría', 
      cell: (c: any) => {
        const cat = categories.find(cat => cat.id === c.category_id) || {
          name: 'PQRSF',
          color: 'var(--success)',
          icon: 'FileText'
        };
        return (
          <Badge variant="subtle" color={cat.color || 'var(--color-success)'} icon={cat.icon}>
            {cat.name}
          </Badge>
        );
      }
    },
    { key: 'asunto', header: 'Asunto', cell: (c: any) => c.asunto },
    { key: 'cliente', header: 'Cliente', cell: (c: any) => c.cliente_empresa || '-' },
    { key: 'area', header: 'Área Asignada', cell: (c: any) => c.area_rel?.name || '-' },
    { 
      key: 'estado', 
      header: 'Estado', 
      cell: (c: any) => {
        const estado = c.estado_rel?.name || '-';
        return (
          <Badge variant="subtle" color={estado === 'Registrado' || estado === 'En Asignación' ? 'var(--color-warning)' : estado === 'Cerrado' ? 'var(--color-success)' : 'var(--color-info)'}>
            {estado}
          </Badge>
        );
      }
    },
    { key: 'fecha_creacion', header: 'Fecha Creado', cell: (c: any) => new Date(c.fecha_creacion).toLocaleDateString() }
  ];

  const tabOptions = [
    { id: 'my_area', label: 'Tickets de mi Área' },
    { id: 'mine', label: 'Mis Tickets Asignados' },
    { id: 'all', label: 'Todos los Tickets' }
  ];

  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <div>
      <PageHeader 
        title="Bandejas de Tickets (PQRSF)"
        description="Gestiona y haz seguimiento a las Peticiones, Quejas, Reclamos y Solicitudes."
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Gestión de Tickets' }]}
        actions={<Button variant="primary" onClick={() => setIsWizardOpen(true)}>Nuevo Ticket</Button>}
      />

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <Tabs 
            activeTab={filterMode} 
            onChange={handleFilterChange} 
            tabs={tabOptions} 
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
            Cargando tickets...
          </div>
        ) : (
          <DataTable 
            columns={columns}
            data={displayedCases}
            keyExtractor={(item) => item.id}
            onRowClick={(row) => router.push(`/dashboard/pqrsf/${row.id}`)}
          />
        )}
      </Card>

      <Modal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} maxWidth="1100px">
        <TicketWizard onClose={() => setIsWizardOpen(false)} onSuccess={() => { setIsWizardOpen(false); fetchData(filterMode === 'my_area' ? user?.area : undefined, filterMode === 'mine' ? user?.id : undefined); }} />
      </Modal>
    </div>
  );
}
