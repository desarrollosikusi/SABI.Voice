'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import HeroBanner from '@/components/dashboard/HeroBanner';
import KPICard from '@/components/dashboard/KPICard';
import Toolbar from '@/components/ui/Toolbar';
import Tabs, { TabItem } from '@/components/ui/Tabs';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function CustomerDashboard() {
  const router = useRouter();
  const [pqrsfs, setPqrsfs] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [filterType, setFilterType] = useState<string>("todos");
  const [activeTab, setActiveTab] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [casesData, statsData, meData, categoriesData] = await Promise.all([
        api.getMyPqrsfs(),
        api.getCustomerDashboard(),
        api.getCustomerMe(),
        api.getCaseCategories()
      ]);
      setPqrsfs(casesData);
      setDashboardStats(statsData);
      setMe(meData);
      setCategories(categoriesData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  // KPI Filters logic
  const applyKpiFilter = (p: any) => {
    if (filterType === 'todos') return true;
    if (filterType === 'mis_abiertos') return !p.estado_rel?.is_final;
    if (filterType === 'esperando_ikusi') return !p.estado_rel?.is_final && !p.estado_rel?.sla_paused;
    if (filterType === 'esperando_cliente') return !p.estado_rel?.is_final && p.estado_rel?.sla_paused;
    return true;
  };

  // Build the final displayed list
  let displayedPqrsfs = pqrsfs.filter(applyKpiFilter);
  
  if (activeTab !== 'todos') {
    displayedPqrsfs = displayedPqrsfs.filter(p => p.category_id === parseInt(activeTab));
  }
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    displayedPqrsfs = displayedPqrsfs.filter(p => 
      p.consecutivo.toLowerCase().includes(term) ||
      p.asunto.toLowerCase().includes(term)
    );
  }

  const getTabCount = (tabId: string) => {
    const baseList = pqrsfs.filter(applyKpiFilter);
    if (tabId === 'todos') return baseList.length;
    return baseList.filter(p => p.category_id === parseInt(tabId)).length;
  };

  const getCategoryMeta = (categoryId: number) => {
    return categories.find(c => c.id === categoryId) || { name: 'Desconocido', color: '#64748b', icon: 'Folder' };
  };

  if (loading && !me) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p className="text-secondary" style={{ marginTop: 'var(--space-md)' }}>Cargando Business Case Platform...</p>
      </div>
    );
  }

  // Define Tabs Data
  const tabsData: TabItem[] = [
    { id: 'todos', label: 'Todos', count: getTabCount('todos') },
    ...categories.filter(c => c.is_active).map(cat => ({
      id: cat.id.toString(),
      label: cat.name,
      count: getTabCount(cat.id.toString()),
      icon: cat.icon,
      color: cat.color
    }))
  ];

  // Define DataTable Columns
  const columns: ColumnDef<any>[] = [
    {
      key: 'consecutivo',
      header: 'Consecutivo',
      width: '140px',
      cell: (item) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.consecutivo}</span>
    },
    {
      key: 'categoria',
      header: 'Categoría',
      width: '180px',
      cell: (item) => {
        const cat = getCategoryMeta(item.category_id);
        return <Badge color={cat.color} icon={cat.icon}>{cat.name}</Badge>;
      }
    },
    {
      key: 'asunto',
      header: 'Asunto',
      cell: (item) => <span style={{ color: 'var(--text-secondary)' }}>{item.asunto}</span>
    },
    {
      key: 'estado',
      header: 'Estado',
      width: '160px',
      cell: (item) => {
        const isClosed = item.estado_visible === 'Cerrado';
        return (
          <Badge 
            variant="solid" 
            color={isClosed ? 'var(--color-success)' : 'var(--color-info)'}
          >
            {item.estado_visible}
          </Badge>
        );
      }
    },
    {
      key: 'responsable',
      header: 'Responsable',
      width: '140px',
      cell: (item) => (
        <span style={{ fontWeight: 500, color: item.responsable_actual === 'IKUSI' ? 'var(--color-info)' : 'var(--color-warning)' }}>
          {item.responsable_actual}
        </span>
      )
    },
    {
      key: 'fecha',
      header: 'Última actualización',
      width: '180px',
      cell: (item) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(item.fecha_ultima_actualizacion).toLocaleString()}</span>
    }
  ];

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--bg-color)' }}>
      
      {/* Dynamic Toolbar */}
      <Toolbar 
        title="Dashboard Cliente"
        showSearch
        searchPlaceholder="Buscar por consecutivo o asunto..."
        onSearch={setSearchTerm}
        showRefresh
        onRefresh={fetchData}
        actions={[
          { label: 'Nuevo Caso', icon: 'Plus', primary: true, onClick: () => router.push('/nueva-solicitud') }
        ]}
      />

      <div style={{ padding: 'var(--space-xl)', maxWidth: 1600, margin: '0 auto' }}>
        
        {errorMsg && (
          <div style={{ padding: 'var(--space-md)', backgroundColor: 'var(--color-danger)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-xl)' }}>
            {errorMsg}
          </div>
        )}

        {/* Hero Banner */}
        <HeroBanner 
          title={me?.name ? `Hola, ${me.name} 👋` : 'SABI te acompaña'}
          subtitle={dashboardStats?.ultima_actividad ? `Tu última interacción fue el ${new Date(dashboardStats.ultima_actividad).toLocaleDateString()}` : 'Todo marcha bien.'}
          companyName={dashboardStats?.customer?.name}
          companyLogoUrl={dashboardStats?.customer?.logo_url}
        />

        {/* KPI Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: 'var(--space-lg)', 
          marginBottom: 'var(--space-2xl)' 
        }}>
          <KPICard
            title="Mis Casos Abiertos"
            value={dashboardStats?.mis_casos_abiertos || 0}
            icon="FolderOpen"
            color="var(--color-info)"
            description="Total de tickets en seguimiento"
            isActive={filterType === 'mis_abiertos'}
            onClick={() => setFilterType('mis_abiertos')}
          />
          <KPICard
            title="Todos los Casos"
            value={pqrsfs.length}
            icon="Layers"
            color="var(--color-success)"
            description="Histórico completo"
            isActive={filterType === 'todos'}
            onClick={() => setFilterType('todos')}
          />
          <KPICard
            title="Esperando a Ikusi"
            value={dashboardStats?.esperando_ikusi || 0}
            icon="Clock"
            color="var(--color-warning)"
            description="En gestión de nuestro equipo"
            isActive={filterType === 'esperando_ikusi'}
            onClick={() => setFilterType('esperando_ikusi')}
          />
          <KPICard
            title="Esperando mi Respuesta"
            value={dashboardStats?.esperando_cliente || 0}
            icon="AlertCircle"
            color="var(--color-info)"
            description="Requieren tu atención"
            isActive={filterType === 'esperando_cliente'}
            onClick={() => setFilterType('esperando_cliente')}
          />
        </div>

        {/* The DataGrid Section */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--surface-border)',
          overflow: 'hidden' // So tabs and table fit nicely inside
        }}>
          
          <Tabs 
            tabs={tabsData} 
            activeTab={activeTab} 
            onChange={setActiveTab} 
          />

          {displayedPqrsfs.length === 0 ? (
            <EmptyState 
              title="No hay casos para mostrar" 
              description="No se encontraron tickets con los filtros actuales en esta bandeja." 
              icon="Inbox"
            />
          ) : (
            <DataTable 
              data={displayedPqrsfs}
              columns={columns}
              keyExtractor={(item) => item.id}
              onRowClick={(item) => router.push(`/portal-cliente/caso/${item.id}`)}
              actions={(item) => (
                <div style={{ color: 'var(--text-secondary)' }}>⋮</div>
              )}
            />
          )}

        </div>
      </div>
    </div>
  );
}
