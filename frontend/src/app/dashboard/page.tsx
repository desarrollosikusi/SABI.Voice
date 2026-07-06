'use client';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [rootCauses, setRootCauses] = useState<any>(null);
  const [insightsData, setInsightsData] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [relationshipData, setRelationshipData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const summary = await api.getExecutiveSummary();
      setStats(summary);
      
      const causes = await api.getRootCauses();
      setRootCauses(causes);
      
      const insights = await api.getExecutiveInsights();
      setInsightsData(insights);
      
      const data = await api.getPqrsfs();
      setCases(data);
      
      const relData = await api.getCustomerRelationshipDashboard();
      setRelationshipData(relData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al cargar los datos. Verifique su conexión o inicie sesión nuevamente.");
    }
  };

  if (!stats || !rootCauses) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ marginTop: 16, color: '#666' }}>Cargando Centro de Comando...</p>
      </div>
    );
  }

  // Preparar datos para Mapa de Calor
  const areas = Array.from(new Set(stats.mapa_calor?.map((m: any) => m.area) || []));
  const arquitecturas = Array.from(new Set(stats.mapa_calor?.map((m: any) => m.arquitectura) || []));
  
  const getHeatmapColor = (value: number) => {
    if (value === 0) return 'rgba(255, 255, 255, 0.05)';
    if (value < 3) return 'rgba(59, 130, 246, 0.4)'; // Blue
    if (value < 6) return 'rgba(245, 158, 11, 0.4)'; // Yellow
    return 'rgba(239, 68, 68, 0.5)'; // Red
  };

  // Atención Inmediata: Vencidos, Próximos a vencer, Clientes estratégicos, Prioridad Alta
  const atencionInmediata = cases.filter(c => 
    c.estado !== 'Cerrado' && (c.estado_sla === 'Vencido' || c.estado_sla === 'Próximo a vencer' || c.prioridad === 'Alta')
  ).slice(0, 10);

  // Evolucion Mensual Data
  const monthlyTrendMap: any = {};
  rootCauses.trend?.forEach((t: any) => {
    const month = `Mes ${t.mes}`;
    if (!monthlyTrendMap[month]) monthlyTrendMap[month] = { name: month, Casos: 0 };
    monthlyTrendMap[month].Casos += t.cantidad;
  });
  const trendData = Object.values(monthlyTrendMap);

  const pieData = Object.keys(stats.por_arquitectura || {}).map(k => ({
    name: k,
    value: stats.por_arquitectura[k]
  }));

  const variacionColor = stats.variacion_porcentual_casos > 0 ? 'var(--status-danger)' : 'var(--status-closed)';
  const variacionSign = stats.variacion_porcentual_casos > 0 ? '+' : '';

  return (
    <>
      <h1 className="page-title">Centro de Comando Operacional</h1>
      
      {errorMsg && (
        <div style={{ padding: 16, backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: 8, marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} style={{ background: 'transparent', border: 'none', color: '#991B1B', cursor: 'pointer' }}>✖</button>
        </div>
      )}

      {/* 1. Estado General de la Operación */}
      <div className="stats-grid">
        <div className="glass-panel">
          <div className="stat-label">Salud Operacional (Abiertos vs Total)</div>
          <div className="stat-value" style={{ color: 'var(--status-open)' }}>{stats.abiertos} / {stats.total_casos}</div>
          <div style={{ fontSize: '13px', color: variacionColor }}>
            {variacionSign}{stats.variacion_porcentual_casos}% vs mes anterior
          </div>
        </div>
        <div className="glass-panel">
          <div className="stat-label">Riesgos Activos</div>
          <div className="stat-value" style={{ color: 'var(--status-danger)' }}>{stats.riesgos_activos || 0}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Prioridad alta o impacto severo</div>
        </div>
        <div className="glass-panel">
          <div className="stat-label">Casos Vencidos</div>
          <div className="stat-value" style={{ color: 'var(--status-warning)' }}>{stats.vencidos}</div>
        </div>
        <div className="glass-panel">
          <div className="stat-label">Tiempo Promedio (Hrs)</div>
          <div className="stat-value" style={{ color: 'var(--status-closed)' }}>{stats.tiempo_promedio_horas}</div>
        </div>
      </div>
      
      {/* Widget: Relación y Cercanía */}
      {relationshipData && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 16 }}>Relación y Cercanía</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Inactivos (+90 días)
              </div>
              <div className="stat-value" style={{ fontSize: '24px', color: '#f59e0b' }}>{relationshipData.inactivos?.length || 0}</div>
              {relationshipData.inactivos?.slice(0,2).map((i:any, idx:number) => (
                <div key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{i.cliente}</div>
              ))}
            </div>
            
            <div className="glass-panel" style={{ borderLeft: '4px solid #ec4899' }}>
              <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" /></svg>
                Cumpleaños (Hoy)
              </div>
              <div className="stat-value" style={{ fontSize: '24px', color: '#ec4899' }}>{relationshipData.cumpleanos_hoy?.length || 0}</div>
              {relationshipData.cumpleanos_hoy?.slice(0,2).map((c:any, idx:number) => (
                <div key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.nombre}</div>
              ))}
            </div>
            
            <div className="glass-panel" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                Aniversarios (Mes)
              </div>
              <div className="stat-value" style={{ fontSize: '24px', color: '#8b5cf6' }}>{relationshipData.aniversarios_mes?.length || 0}</div>
              {relationshipData.aniversarios_mes?.slice(0,2).map((a:any, idx:number) => (
                <div key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{a.nombre}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 10. Insights Inteligentes */}
      {insightsData && insightsData.insights && insightsData.insights.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 16 }}>Hallazgos Automáticos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {insightsData.insights.map((insight: string, idx: number) => (
              <div key={idx} className="insight-card">
                <span style={{ fontSize: '20px', marginRight: '8px' }}>💡</span> {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Central */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
        
        {/* 3. Tendencias */}
        <div className="glass-panel">
          <h2 style={{ marginBottom: 16 }}>Tendencia Mensual</h2>
          <div className="trend-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="Casos" stroke="var(--accent-color)" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Arquitecturas */}
        <div className="glass-panel">
          <h2 style={{ marginBottom: 16 }}>Distribución por Arquitectura</h2>
          <div className="trend-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
        
        {/* 4. Mapa de Calor */}
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <h2 style={{ marginBottom: 16 }}>Mapa de Calor (Área vs Arquitectura)</h2>
          {areas.length > 0 ? (
            <table style={{ width: '100%', minWidth: '400px' }}>
              <thead>
                <tr>
                  <th>Área</th>
                  {arquitecturas.map((arq: any) => <th key={arq} style={{ textAlign: 'center' }}>{arq}</th>)}
                </tr>
              </thead>
              <tbody>
                {areas.map((area: any) => (
                  <tr key={area}>
                    <td style={{ fontWeight: 600 }}>{area}</td>
                    {arquitecturas.map((arq: any) => {
                      const item = stats.mapa_calor?.find((m: any) => m.area === area && m.arquitectura === arq);
                      const val = item ? item.cantidad : 0;
                      return (
                        <td key={`${area}-${arq}`}>
                          <div className="heatmap-cell" style={{ background: getHeatmapColor(val) }}>
                            {val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No hay suficientes datos para el mapa de calor.</p>
          )}
        </div>

        {/* 5. Clientes y 2. Riesgos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel">
            <h2 style={{ marginBottom: 16 }}>Top Clientes Estratégicos Afectados</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Nivel</th>
                    <th>Casos Activos</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.clientes_estrategicos_afectados?.map((c: any, i: number) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 'bold' }}>{c.cliente}</td>
                      <td>
                        <span className={`badge status-${c.nivel.toLowerCase().replace('é', 'e').replace(' ', '')}`}>{c.nivel}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>{c.casos_activos}</td>
                    </tr>
                  ))}
                  {!stats.clientes_estrategicos_afectados?.length && (
                    <tr><td colSpan={3}>Sin clientes estratégicos afectados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="glass-panel">
            <h2 style={{ marginBottom: 16 }}>Top Causas Recurrentes</h2>
            <div className="trend-container" style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.top_causas} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                  <YAxis type="category" dataKey="causa" stroke="rgba(255,255,255,0.5)" width={120} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="total" fill="var(--status-open)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Recomendaciones IA */}
      {insightsData && insightsData.recomendaciones && insightsData.recomendaciones.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 16 }}>Oportunidades de Mejora Detectadas por SABI</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {insightsData.recomendaciones.map((rec: any, idx: number) => (
              <div key={idx} className="recomendacion-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className={`badge status-${rec.prioridad === 'Alta' ? 'vencido' : 'aldia'}`}>Prioridad: {rec.prioridad}</span>
                  <span className="badge status-estandar">{rec.area_responsable}</span>
                </div>
                <h3 style={{ fontSize: '18px', marginTop: '8px' }}>{rec.accion}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Impacto esperado: <strong>{rec.impacto}</strong></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. Atención Inmediata */}
      <h2 style={{ marginBottom: 16 }}>Atención Inmediata Requerida</h2>
      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>Consecutivo</th>
              <th>Prioridad</th>
              <th>Cliente</th>
              <th>SLA</th>
              <th>Acción Inmediata Sugerida</th>
            </tr>
          </thead>
          <tbody>
            {atencionInmediata.map((c: any) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>
                  <Link href={`/dashboard/pqrsf/${c.id}`} style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>
                    {c.consecutivo}
                  </Link>
                </td>
                <td>
                  <span className={`badge status-${c.prioridad === 'Alta' ? 'vencido' : 'abierto'}`}>{c.prioridad}</span>
                </td>
                <td>{c.cliente_empresa || c.correo}</td>
                <td>
                  <span className={`badge status-${c.estado_sla === 'Vencido' ? 'vencido' : 'aldia'}`}>
                    {c.estado_sla || 'Al día'}
                  </span>
                </td>
                <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {c.accion_recomendada || 'Revisar urgente'}
                </td>
              </tr>
            ))}
            {atencionInmediata.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hay casos que requieran atención inmediata urgente.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
