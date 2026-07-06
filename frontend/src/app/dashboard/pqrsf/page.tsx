'use client';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';

export default function PqrsfListPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'my_area' | 'mine'>('my_area');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    api.getMe().then(res => {
      setUser(res);
      // Only fetch after user is loaded so we can default to their area if they have one
      if (res.area) {
        setFilterMode('my_area');
        fetchData(res.area, undefined);
      } else {
        setFilterMode('all');
        fetchData();
      }
    }).catch(err => {
      console.error(err);
      fetchData(); // Fallback if error getting user
    });
    
    // Fetch states for filter
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

  const displayedCases = cases.filter(c => {
    if (statusFilter && c.estado_id !== parseInt(statusFilter)) return false;
    return true;
  });

  const handleFilterChange = (mode: 'all' | 'my_area' | 'mine') => {
    setFilterMode(mode);
    if (mode === 'my_area' && user?.area) {
      fetchData(user.area, undefined);
    } else if (mode === 'mine' && user?.id) {
      fetchData(undefined, user.id);
    } else {
      fetchData();
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Bandejas de Trabajo (PQRSF)</h1>
        
        {user && (
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
            <button 
              onClick={() => handleFilterChange('mine')}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                background: filterMode === 'mine' ? 'var(--accent-color)' : 'transparent',
                color: filterMode === 'mine' ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13
              }}
            >
              Mis Casos
            </button>
            {user.area && (
              <button 
                onClick={() => handleFilterChange('my_area')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  background: filterMode === 'my_area' ? 'var(--accent-color)' : 'transparent',
                  color: filterMode === 'my_area' ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13
                }}
              >
                Mi Área ({user.area})
              </button>
            )}
            <button 
              onClick={() => handleFilterChange('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                background: filterMode === 'all' ? 'var(--accent-color)' : 'transparent',
                color: filterMode === 'all' ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13
              }}
            >
                Todos los Casos
              </button>
            </div>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="input-field" 
              style={{ padding: '8px 16px', margin: 0, width: 'auto' }}
            >
              <option value="">Todos los Estados</option>
              {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
      </div>
      
      <div className="glass-panel table-container">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Consecutivo</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Área Responsable</th>
                <th>Arquitectura</th>
                <th>SLA</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {displayedCases.map((c: any) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>
                    <Link href={`/dashboard/pqrsf/${c.id}`} style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>
                      {c.consecutivo}
                    </Link>
                  </td>
                  <td>{c.cliente_empresa || c.correo}</td>
                  <td>{c.tipo}</td>
                  <td>{c.area_responsable || 'Sin asignar'}</td>
                  <td>{c.arquitectura}</td>
                  <td>
                    <span className={`badge status-${c.estado_sla === 'Vencido' ? 'vencido' : 'aldia'}`}>
                      {c.estado_sla || 'Al día'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge status-${['Cerrado', 'Cancelado'].includes(c.estado) ? 'cerrado' : 'abierto'}`}>
                      {c.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hay casos registrados en esta vista.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
