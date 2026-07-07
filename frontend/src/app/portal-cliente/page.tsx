'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';
import SabiCompanion from '@/components/SabiCompanion';
import KpiCard from '@/components/KpiCard';

export default function CustomerDashboard() {
  const [pqrsfs, setPqrsfs] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [filterType, setFilterType] = useState<string>("todos");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [casesData, statsData, meData] = await Promise.all([
        api.getMyPqrsfs(),
        api.getCustomerDashboard(),
        api.getCustomerMe()
      ]);
      setPqrsfs(casesData);
      setDashboardStats(statsData);
      setMe(meData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (p: any) => {
    if (filterType === 'todos') return true;
    if (filterType === 'mis_abiertos') return !p.estado_rel?.is_final;
    if (filterType === 'esperando_ikusi') return !p.estado_rel?.is_final && !p.estado_rel?.sla_paused;
    if (filterType === 'esperando_cliente') return !p.estado_rel?.is_final && p.estado_rel?.sla_paused;
    if (filterType === 'vencidos_sla') return p.estado_sla === 'Vencido';
    return true;
  };

  const filteredPqrsfs = pqrsfs.filter(applyFilter);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <p style={{ marginTop: 16, color: '#666' }}>Cargando portal...</p>
    </div>
  );

  const getDashboardSabiMessage = () => {
    if (loading) return "Cargando información...";
    if (errorMsg) return "No pudimos obtener la información en este momento. Inténtalo nuevamente en unos minutos.";
    const abiertos = dashboardStats?.mis_casos_abiertos || 0;
    if (abiertos > 0) return `Hoy tienes ${abiertos} solicitudes en seguimiento.`;
    return "Todo marcha bien. No tienes casos pendientes.";
  };

  const getDashboardSabiSubmessage = () => {
    if (dashboardStats?.ultima_actividad) {
      // Just a mock of 'hace X días', we will just show the date nicely
      return `Tu última interacción fue el ${new Date(dashboardStats.ultima_actividad).toLocaleDateString()}`;
    }
    return "";
  };

  return (
    <div style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
      
      {/* Top Header Navigation */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.8rem' }}>Inicio</h1>
        <button onClick={() => { 
          localStorage.clear(); 
          sessionStorage.clear();
          window.location.href = '/portal-cliente/login'; 
        }} className="btn-secondary" style={{ padding: '8px 16px' }}>Cerrar Sesión</button>
      </header>

      {/* SABI Dashboard Card */}
      <SabiCompanion 
        layout="dashboard"
        message={getDashboardSabiMessage()}
        subMessage={getDashboardSabiSubmessage()}
        contactName={me?.name}
        customerName={dashboardStats?.customer?.name}
        logoUrl={dashboardStats?.customer?.logo_url}
      />

      {errorMsg && (
        <div style={{ padding: 16, backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: 8, marginBottom: 24 }}>
          {errorMsg}
        </div>
      )}

      {/* Interactive KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        <KpiCard
          title="Mis Casos Abiertos"
          value={dashboardStats?.mis_casos_abiertos || 0}
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
          color="#3B82F6"
          isActive={filterType === 'mis_abiertos'}
          onViewDetails={() => setFilterType('mis_abiertos')}
        />

        <KpiCard
          title="Abiertos Empresa"
          value={dashboardStats?.casos_abiertos_empresa || 0}
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>}
          color="#10B981"
          isActive={filterType === 'todos'}
          onViewDetails={() => setFilterType('todos')}
        />

        <KpiCard
          title="Esperando a Ikusi"
          value={dashboardStats?.esperando_ikusi || 0}
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          color="#F59E0B"
          isActive={filterType === 'esperando_ikusi'}
          onViewDetails={() => setFilterType('esperando_ikusi')}
        />

        <KpiCard
          title="Esperando mi Respuesta"
          value={dashboardStats?.esperando_cliente || 0}
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
          color="#8B5CF6"
          isActive={filterType === 'esperando_cliente'}
          onViewDetails={() => setFilterType('esperando_cliente')}
        />
        
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>Mis Casos (PQRSF) {filterType !== 'todos' ? '(Filtrado)' : ''}</h2>
        <Link href="/nueva-solicitud">
          <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: 8 }}>Nueva Solicitud</button>
        </Link>
      </div>
      
      {filteredPqrsfs.length === 0 ? (
        <div className="saas-card" style={{ padding: '40px 0' }}>
          <SabiCompanion 
            layout="empty" 
            message={filterType === 'todos' ? "¡Excelente! No encontramos solicitudes pendientes." : "No se encontraron casos con el filtro seleccionado."}
            subMessage={filterType === 'todos' ? "Cuando registres una nueva solicitud, aquí podrás hacer seguimiento." : undefined}
          />
        </div>
      ) : (
        <div className="saas-card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="saas-table" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th>Consecutivo</th>
                  <th>Asunto</th>
                  <th>Estado</th>
                  <th>Responsable</th>
                  <th>Última actualización</th>
                </tr>
              </thead>
              <tbody>
                {filteredPqrsfs.map((pqrsf, i) => (
                  <tr key={i}>
                    <td>
                      <Link href={`/portal-cliente/caso/${pqrsf.id}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                        {pqrsf.consecutivo}
                      </Link>
                    </td>
                    <td>{pqrsf.asunto}</td>
                    <td>
                      <span className="badge" style={{
                        backgroundColor: pqrsf.estado_visible === 'Cerrado' ? '#ecfdf5' : '#eff6ff',
                        color: pqrsf.estado_visible === 'Cerrado' ? '#10b981' : '#3b82f6',
                        border: `1px solid ${pqrsf.estado_visible === 'Cerrado' ? '#a7f3d0' : '#bfdbfe'}`
                      }}>
                        {pqrsf.estado_visible}
                      </span>
                    </td>
                    <td style={{ color: pqrsf.responsable_actual === 'IKUSI' ? '#3B82F6' : '#F59E0B', fontWeight: 500 }}>
                      {pqrsf.responsable_actual}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(pqrsf.fecha_ultima_actualizacion).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
