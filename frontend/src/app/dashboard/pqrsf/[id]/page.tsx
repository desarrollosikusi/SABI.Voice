'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function PqrsfDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [communications, setCommunications] = useState<any[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  
  const [activeTab, setActiveTab] = useState('info'); // info, conversacion, historia, documentos
  
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Catalogs state
  const [catalogs, setCatalogs] = useState<any>({
    states: [], areas: [], types: [], priorities: [], architectures: [], sentiments: [], causes: []
  });

  const fetchCatalogs = async () => {
    try {
      const endpoints = ['states', 'areas', 'types', 'priorities', 'architectures', 'sentiments', 'causes'];
      const results: any = {};
      
      for (const ep of endpoints) {
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/${ep}`, {
          headers: { ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}) }
        });
        if (resp.ok) results[ep] = await resp.json();
      }
      setCatalogs(results);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (id) {
      fetchData();
      fetchCatalogs();
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'conversacion') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [communications, activeTab]);

  const fetchData = async () => {
    try {
      const [res, comms] = await Promise.all([
        api.getPqrsfById(id as string),
        api.getCommunications(id as string)
      ]);
      setData(res);
      setCommunications(comms);
      setEditForm({
        estado_id: res.estado_id || '',
        area_responsable_id: res.area_responsable_id || '',
        responsable_id: res.responsable_id || '',
        tipo_id: res.tipo_id || '',
        prioridad_id: res.prioridad_id || '',
        arquitectura_id: res.arquitectura_id || '',
        sentimiento_id: res.sentimiento_id || '',
        causa_probable_id: res.causa_probable_id || '',
        riesgo: res.riesgo || '',
        impacto: res.impacto || '',
        resumen: res.resumen || '',
        recomendacion: res.recomendacion || ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveChanges = async () => {
    const motivo = prompt("Por favor, ingrese el motivo del cambio (Requerido para auditoría y aprendizaje supervisado):");
    if (!motivo) return;
    
    try {
      const payload: any = { ...editForm, motivo_cambio: motivo };
      const fields = ['estado_id', 'tipo_id', 'area_id', 'arquitectura_id', 'prioridad_id', 'sentimiento_id', 'causa_probable_id', 'categoria_causa_id', 'area_responsable_id', 'responsable_id'];
      fields.forEach(f => {
        if (payload[f] === '') payload[f] = null;
        else if (payload[f] !== null && payload[f] !== undefined) payload[f] = parseInt(payload[f], 10);
      });
      await api.updatePqrsf(id as string, payload);
      setIsEditing(false);
      fetchData();
    } catch (err: any) {
      alert("Error guardando cambios: " + (err.response?.data?.detail || err.message || err));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    try {
      await api.createCommunication(id as string, {
        tipo: "Operación",
        message_type: "Respuesta",
        direccion: "Saliente",
        canal: "Portal",
        mensaje: message,
        visible_cliente: true
      });
      setMessage('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error al enviar mensaje");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!data) return <div style={{ padding: 24, textAlign: 'center' }}>Cargando datos del caso...</div>;

  return (
    <div>
      <PageHeader 
        title={`Caso ${data.consecutivo}`}
        description={data.asunto}
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Gestión de Casos', href: '/dashboard/pqrsf' }, { label: `Caso ${data.consecutivo}` }]}
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            <Badge variant={data.estado_sla?.toLowerCase() === 'vencido' ? 'danger' : 'success'}>
              SLA: {data.estado_sla || 'Al Día'}
            </Badge>
            <Badge variant="neutral">
              Estado: {data.estado?.name || 'Recibido'}
            </Badge>
          </div>
        }
      />

      <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-border)', marginBottom: 24, gap: 24 }}>
        {['info', 'conversacion', 'historia', 'documentos'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              background: 'none', border: 'none', 
              padding: '12px 0', 
              fontSize: 16, 
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--accent-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--accent-color)' : '2px solid transparent',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab === 'info' ? 'Información General' : tab === 'historia' ? 'Auditoría e Historia' : tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        
        {/* Main Content Area based on Tabs */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {activeTab === 'info' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, margin: 0 }}>Detalles del Caso</h2>
                <button 
                  className={isEditing ? "btn-primary" : "btn-secondary"} 
                  onClick={() => isEditing ? saveChanges() : setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Guardar Cambios' : 'Editar Información'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 32px' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Descripción Original</label>
                  <p style={{ margin: 0, fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.5, background: 'var(--surface-border)', padding: 16, borderRadius: 8 }}>
                    {data.descripcion}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Tipo de Solicitud</label>
                    {isEditing ? (
                      <select name="tipo_id" value={editForm.tipo_id} onChange={handleEditChange} className="input-field" style={{ padding: 8 }}>
                        <option value="">Seleccione...</option>
                        {catalogs.types.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    ) : (
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>{data.tipo?.name || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Estado Actual</label>
                    {isEditing ? (
                      <select name="estado_id" value={editForm.estado_id} onChange={handleEditChange} className="input-field" style={{ padding: 8 }}>
                        <option value="">Seleccione...</option>
                        {catalogs.states.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    ) : (
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>{data.estado?.name || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Prioridad</label>
                    {isEditing ? (
                      <select name="prioridad_id" value={editForm.prioridad_id} onChange={handleEditChange} className="input-field" style={{ padding: 8 }}>
                        <option value="">Seleccione...</option>
                        {catalogs.priorities.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: data.prioridad?.color || '#ccc' }}></div>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>{data.prioridad?.name || 'N/A'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Área Responsable</label>
                    {isEditing ? (
                      <select name="area_responsable_id" value={editForm.area_responsable_id} onChange={handleEditChange} className="input-field" style={{ padding: 8 }}>
                        <option value="">Seleccione...</option>
                        {catalogs.areas.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    ) : (
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>{data.area_responsable?.name || 'N/A'}</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'conversacion' && (
            <Card style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '600px' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--surface-border)' }}>
                <h2 style={{ fontSize: 18, margin: 0 }}>Historial de Conversación</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: 13 }}>Toda la comunicación con el cliente y notas internas relacionadas a este caso.</p>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Primer mensaje es la descripcion original */}
                <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, marginLeft: 8 }}>
                    Cliente - {new Date(data.fecha_creacion).toLocaleString()}
                  </div>
                  <div style={{ padding: '16px', borderRadius: '20px', borderTopLeftRadius: '4px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--surface-border)' }}>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: 14 }}>{data.descripcion}</p>
                  </div>
                </div>

                {communications.map(comm => {
                  const isIncoming = comm.direccion === 'Entrante';
                  return (
                    <div key={comm.id} style={{ alignSelf: isIncoming ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, marginLeft: isIncoming ? 8 : 0, marginRight: isIncoming ? 0 : 8, textAlign: isIncoming ? 'left' : 'right' }}>
                        {isIncoming ? 'Cliente' : (comm.autor_usuario?.name || 'Soporte')} - {new Date(comm.fecha).toLocaleString()}
                        {!comm.visible_cliente && <span style={{ color: 'var(--status-danger)', marginLeft: 8 }}>(Nota Interna)</span>}
                      </div>
                      <div style={{ 
                        padding: '16px', 
                        borderRadius: '20px', 
                        borderTopLeftRadius: isIncoming ? '4px' : '20px',
                        borderTopRightRadius: isIncoming ? '20px' : '4px',
                        backgroundColor: isIncoming ? 'var(--surface-color)' : 'rgba(59, 130, 246, 0.1)',
                        border: isIncoming ? '1px solid var(--surface-border)' : '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: 14 }}>{comm.mensaje}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: '24px', borderTop: '1px solid var(--surface-border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 12 }}>
                  <textarea 
                    className="input-field"
                    style={{ flex: 1, minHeight: 60, resize: 'none' }}
                    placeholder="Escribe una respuesta al cliente..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                  <button type="submit" className="btn-primary" disabled={!message.trim() || isSubmitting}>
                    {isSubmitting ? 'Enviando...' : 'Responder'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'historia' && (
            <Card>
              <h2 style={{ fontSize: 18, marginBottom: 24 }}>Auditoría Completa</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {data.history && data.history.map((h: any) => (
                  <div key={h.id} style={{ borderLeft: '3px solid var(--surface-border)', paddingLeft: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(h.fecha).toLocaleString()}</p>
                      {h.usuario_id && <span className="badge status-estandar" style={{ fontSize: 11 }}>Usuario ID: {h.usuario_id}</span>}
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{h.accion}</p>
                    {h.field_modified ? (
                      <div style={{ fontSize: 13, marginTop: 8, background: 'var(--surface-color)', padding: 12, borderRadius: 8, border: '1px solid var(--surface-border)' }}>
                        <p style={{ marginBottom: 8 }}><strong>Campo:</strong> {h.field_modified}</p>
                        <p style={{ color: 'var(--status-danger)', margin: 0 }}>- {h.old_value}</p>
                        <p style={{ color: 'var(--status-aldia)', margin: 0 }}>+ {h.new_value}</p>
                      </div>
                    ) : (
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{h.descripcion}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documentos' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, margin: 0 }}>Documentos Adjuntos</h2>
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                  Subir Nuevo Documento
                </button>
              </div>
              
              {data.adjuntos && data.adjuntos.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.adjuntos.map((att: any, i: number) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'var(--surface-color)', borderRadius: 8, border: '1px solid var(--surface-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                          📄
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{att.file_name}</p>
                          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{Math.round(att.size / 1024)} KB</p>
                        </div>
                      </div>
                      <button style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}>Descargar</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ textAlign: 'center', padding: 48, backgroundColor: 'var(--surface-color)', borderRadius: 8, border: '1px dashed var(--surface-border)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>No hay documentos adjuntos en este caso.</p>
                </div>
              )}
            </div>
            </Card>
          )}

        </div>

        {/* Right Sidebar (Copiloto SABI Placeholder) */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <Card style={{ position: 'sticky', top: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>S</div>
              <h2 style={{ fontSize: 16, margin: 0 }}>Copiloto SABI (Sprint 2)</h2>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
              El análisis generativo del caso y las recomendaciones operativas se mostrarán aquí.
            </p>
            <div style={{ height: 200, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: 12, color: '#999' }}>IA no disponible</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
