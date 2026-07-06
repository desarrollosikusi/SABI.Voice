'use client';
import { useState, useEffect } from 'react';

const CATALOGS = [
  { id: 'areas', name: 'Áreas' },
  { id: 'architectures', name: 'Arquitecturas' },
  { id: 'types', name: 'Tipos PQRSF' },
  { id: 'priorities', name: 'Prioridades' },
  { id: 'states', name: 'Estados Workflow' },
  { id: 'causes', name: 'Causas Probables' },
  { id: 'categories', name: 'Categorías de Causas' },
  { id: 'sentiments', name: 'Sentimientos' },
  { id: 'management-systems', name: 'Sistemas de Gestión' },
  { id: 'processes', name: 'Procesos' }
];

export default function AdminPage() {
  const [selectedCatalog, setSelectedCatalog] = useState(CATALOGS[0].id);
  const [data, setData] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState('');

  const fetchData = async () => {
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/${selectedCatalog}`, {
        headers: { ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}) }
      });
      if (resp.ok) {
        setData(await resp.json());
      } else {
        setData([]);
      }
    } catch (e) {
      console.error(e);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCatalog]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;
    
    const payload: any = { name: newItemName };
    if (selectedCatalog === 'priorities') {
      payload.color = '#000000';
      payload.horas_objetivo = 24;
      payload.orden = 1;
    }
    
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/${selectedCatalog}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}) },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        setNewItemName('');
        fetchData();
      } else {
        alert("Error al crear registro");
      }
    } catch (e) {
      alert("Error de red");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar (soft delete) este registro?")) return;
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/${selectedCatalog}/${id}`, {
        method: 'DELETE',
        headers: { ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}) }
      });
      if (resp.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <h1 className="page-title">BackOffice de Administración</h1>
      
      <div style={{ display: 'flex', gap: '32px', marginTop: '24px', alignItems: 'flex-start' }}>
        
        <div className="glass-panel" style={{ width: '250px', flexShrink: 0, padding: '16px' }}>
          <h2 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-secondary)' }}>Catálogos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {CATALOGS.map(c => (
              <button 
                key={c.id} 
                onClick={() => setSelectedCatalog(c.id)}
                style={{ 
                  textAlign: 'left', 
                  padding: '8px 12px', 
                  borderRadius: '6px',
                  background: selectedCatalog === c.id ? 'var(--brand-primary)' : 'transparent',
                  color: selectedCatalog === c.id ? '#fff' : 'var(--text-primary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: selectedCatalog === c.id ? 600 : 400
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ flexGrow: 1 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>{CATALOGS.find(c => c.id === selectedCatalog)?.name}</h2>
          
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <input 
              required 
              value={newItemName} 
              onChange={e => setNewItemName(e.target.value)} 
              className="input-field" 
              type="text" 
              placeholder="Nuevo nombre..." 
              style={{ flexGrow: 1 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 24px' }}>Agregar</button>
          </form>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>ID</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Nombre</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Estado</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px' }}>{item.id}</td>
                  <td style={{ padding: '12px 8px' }}>{item.name}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      background: item.is_active ? 'rgba(0,255,128,0.1)' : 'rgba(255,0,0,0.1)',
                      color: item.is_active ? '#00FF80' : '#FF4D4D'
                    }}>
                      {item.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    {item.is_active && (
                      <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer' }}>
                        Desactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No hay registros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
      </div>
    </>
  );
}
