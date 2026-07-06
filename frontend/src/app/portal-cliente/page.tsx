'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';

export default function CustomerDashboard() {
  const [pqrsfs, setPqrsfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchMyCases();
  }, []);

  const fetchMyCases = async () => {
    try {
      const data = await api.getMyPqrsfs();
      setPqrsfs(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusName: string) => {
    switch (statusName?.toLowerCase()) {
      case 'nuevo': return '#3B82F6';
      case 'en análisis': return '#F59E0B';
      case 'cerrado': return '#10B981';
      default: return '#6B7280';
    }
  };

  const kpis = {
    abiertos: pqrsfs.filter(p => !p.fecha_cierre).length,
    cerrados: pqrsfs.filter(p => p.fecha_cierre).length,
    total: pqrsfs.length
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <p style={{ marginTop: 16, color: '#666' }}>Cargando portal...</p>
    </div>
  );

  return (
    <div style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: '2rem' }}>Portal del Cliente</h1>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>Gestione y consulte el estado de sus solicitudes en tiempo real.</p>
        </div>
        <button onClick={() => { 
          localStorage.clear(); 
          sessionStorage.clear();
          window.location.href = '/portal-cliente/login'; 
        }} className="btn-secondary">Cerrar Sesión</button>
      </header>

      {errorMsg && (
        <div style={{ padding: 16, backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: 8, marginBottom: 24 }}>
          {errorMsg}
        </div>
      )}

      {/* Light KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#666' }}>Casos Abiertos</h3>
          <p style={{ margin: 0, fontSize: '3rem', fontWeight: 700, color: '#3B82F6' }}>{kpis.abiertos}</p>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#666' }}>Casos Cerrados</h3>
          <p style={{ margin: 0, fontSize: '3rem', fontWeight: 700, color: '#10B981' }}>{kpis.cerrados}</p>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#666' }}>Total de Solicitudes</h3>
          <p style={{ margin: 0, fontSize: '3rem', fontWeight: 700, color: '#6B7280' }}>{kpis.total}</p>
        </div>
      </div>

      <h2 style={{ marginBottom: 24, fontSize: '1.5rem', color: '#333' }}>Mis Casos (PQRSF)</h2>
      
      {pqrsfs.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
          No tiene casos registrados actualmente.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', textAlign: 'left' }}>
                  <th style={{ padding: '16px 24px', borderBottom: '1px solid #eee' }}>Consecutivo</th>
                  <th style={{ padding: '16px 24px', borderBottom: '1px solid #eee' }}>Asunto</th>
                  <th style={{ padding: '16px 24px', borderBottom: '1px solid #eee' }}>Fecha Creación</th>
                  <th style={{ padding: '16px 24px', borderBottom: '1px solid #eee' }}>Estado</th>
                  <th style={{ padding: '16px 24px', borderBottom: '1px solid #eee', textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
            <tbody>
              {pqrsfs.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>{p.consecutivo}</td>
                  <td style={{ padding: '16px 24px' }}>{p.asunto || 'Sin asunto'}</td>
                  <td style={{ padding: '16px 24px' }}>{new Date(p.fecha_creacion).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '4px 12px', 
                      borderRadius: '100px', 
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      backgroundColor: getStatusColor(p.estado?.name) + '22',
                      color: getStatusColor(p.estado?.name)
                    }}>
                      {p.estado?.name || 'Desconocido'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <Link href={`/portal-cliente/pqrsf/${p.id}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                      Ver Detalles
                    </Link>
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
