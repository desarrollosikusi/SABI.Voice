'use client';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CustomerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [customer, setCustomer] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Usar getCustomer (el que acabamos de crear)
      const data = await api.getCustomer(parseInt(id));
      setCustomer(data);
      
      // En MVP no tenemos un endpoint separado para contactos de un cliente en /admin/, 
      // pero para esta prueba, asumiendo que el getCustomer devuelve algunos datos o usamos un mock si no hay
      // asuminos que en un futuro se traerán de api.getContactsByCustomer(id)
      
    } catch (err) {
      console.error(err);
    }
  };

  if (!customer) return <div>Cargando Perfil del Cliente...</div>;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/dashboard" className="btn btn-secondary">← Volver</Link>
        <h1 className="page-title" style={{ margin: 0 }}>Cliente: {customer.name}</h1>
        {customer.estado && (
          <span className={`badge status-${customer.estado === 'Inactivo' ? 'vencido' : 'aldia'}`}>
            {customer.estado}
          </span>
        )}
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--panel-bg)' }}>
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
            style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'info' ? '2px solid var(--accent-color)' : '2px solid transparent', color: activeTab === 'info' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
          >
            Información General
          </button>
          <button 
            className={`tab-btn ${activeTab === 'relacion' ? 'active' : ''}`}
            onClick={() => setActiveTab('relacion')}
            style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'relacion' ? '2px solid var(--accent-color)' : '2px solid transparent', color: activeTab === 'relacion' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
          >
            Relación y Cercanía
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {activeTab === 'info' && (
            <div>
              <h3 style={{ marginBottom: 16 }}>Datos del Cliente</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>NIT</label>
                  <div>{customer.nit || 'No registrado'}</div>
                </div>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Sector</label>
                  <div>{customer.sector || 'No registrado'}</div>
                </div>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Ciudad / País</label>
                  <div>{customer.ciudad ? `${customer.ciudad}, ${customer.pais || ''}` : 'No registrado'}</div>
                </div>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Criticidad</label>
                  <div>{customer.criticality}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'relacion' && (
            <div>
              <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="20" height="20" fill="none" stroke="var(--accent-color)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                Relación y Cercanía (CVM)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--accent-color)' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Ejecutivo de Cuenta (CSM)</label>
                  <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>
                    {customer.ejecutivo_cuenta_id ? `ID: ${customer.ejecutivo_cuenta_id}` : 'No asignado'}
                  </div>
                </div>
                
                <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #8b5cf6' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Fecha de Alta (Aniversario)</label>
                  <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>
                    {customer.fecha_alta_comercial ? customer.fecha_alta_comercial : 'No registrada'}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ marginBottom: 12 }}>Notas de Relacionamiento</h4>
                <div className="glass-panel" style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <p style={{ margin: 0, color: customer.notas_relacionamiento ? 'inherit' : 'var(--text-secondary)' }}>
                    {customer.notas_relacionamiento || 'No hay observaciones cualitativas sobre las preferencias de interacción o relacionamiento del cliente.'}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 style={{ marginBottom: 12 }}>Contactos Clave</h4>
                <div className="table-container">
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '12px' }}>Nombre</th>
                        <th style={{ padding: '12px' }}>Rol</th>
                        <th style={{ padding: '12px' }}>Cumpleaños</th>
                        <th style={{ padding: '12px' }}>Canal Preferido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Aquí se iterarían los contactos reales del cliente */}
                      <tr>
                        <td colSpan={4} style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          Para ver los contactos es necesario implementar el endpoint /admin/contacts?customer_id=...
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
