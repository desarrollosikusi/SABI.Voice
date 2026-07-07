'use client';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import PageHeader from '@/components/layout/PageHeader';
import OperationalHealthWidget from '@/components/dashboard/widgets/OperationalHealthWidget';
import RecentActivityWidget from '@/components/dashboard/widgets/RecentActivityWidget';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const summary = await api.getExecutiveSummary();
      setStats(summary);
      
      const data = await api.getPqrsfs();
      setCases(data.slice(0, 5)); // Just the 5 most recent for the dashboard
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column' }}>
        <div className="spinner" style={{ width: 40, height: 40, border: '4px solid var(--surface-border)', borderTop: '4px solid var(--primary)', borderRadius: '50%' }} />
        <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Cargando Centro de Comando...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ padding: '24px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)' }}>
        {errorMsg}
      </div>
    );
  }

  const opHealthKPIs = [
    { label: 'Total Casos Activos', value: stats?.total_open || 0, status: 'info' as const },
    { label: 'Casos Críticos', value: stats?.open_critical || 0, status: 'danger' as const, trend: '+2' },
    { label: 'SLA en Riesgo', value: Math.floor((stats?.open_critical || 0) / 2), status: 'warning' as const },
    { label: 'Resolución Promedio', value: '4.2 Días', status: 'success' as const, trend: '-12%' }
  ];

  const recentActivities = cases.map((c, i) => ({
    id: c.id,
    description: `Nuevo caso reportado: ${c.subject}`,
    timestamp: new Date(c.created_at).toLocaleDateString(),
    type: (i % 3 === 0 ? 'alert' : i % 2 === 0 ? 'create' : 'update') as any
  }));

  const caseColumns = [
    { key: 'id', label: 'ID' },
    { key: 'subject', label: 'Asunto' },
    { 
      key: 'status', 
      label: 'Estado',
      render: (c: any) => (
        <Badge variant={c.status === 'Open' ? 'warning' : c.status === 'Resolved' ? 'success' : 'neutral'}>
          {c.status}
        </Badge>
      )
    },
    { key: 'created_at', label: 'Fecha', render: (c: any) => new Date(c.created_at).toLocaleDateString() }
  ];

  return (
    <div>
      <PageHeader 
        title="Centro de Comando SABI" 
        description="Monitor en tiempo real del estado de servicio al cliente, alertas tempranas de SLAs y salud de las cuentas."
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Centro de Comando' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {/* Top KPIs */}
        <OperationalHealthWidget kpis={opHealthKPIs} />

        {/* Middle Section: Recent Cases & Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem' }}>Casos Recientes</h3>
            </div>
            <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
              <DataTable 
                columns={caseColumns} 
                data={cases} 
                onRowClick={(row) => router.push(`/dashboard/pqrsf/${row.id}`)}
              />
            </div>
          </div>

          <div>
            <RecentActivityWidget activities={recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
}
