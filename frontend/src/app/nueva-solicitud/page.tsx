'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function NuevaSolicitudPage() {
  const [formData, setFormData] = useState({
    asunto: '',
    descripcion: ''
  });
  
  const [selectedCustomer, setSelectedCustomer] = useState<{id: number, name: string} | null>(null);
  const [selectedContact, setSelectedContact] = useState<{id: number, email: string} | null>(null);
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomers, setShowCustomers] = useState(false);
  
  const [contacts, setContacts] = useState<any[]>([]);

  const [aiData, setAiData] = useState<any>({
    tipo_id: '', area_id: '', arquitectura_id: '', prioridad_id: '', sentimiento_id: '', 
    causa_probable_id: '', riesgo: '', impacto: '', accion_recomendada: '', resumen: '', area_responsable_id: ''
  });

  // Catalogs state
  const [catalogs, setCatalogs] = useState<any>({
    areas: [], types: [], priorities: [], architectures: [], sentiments: [], causes: []
  });

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const endpoints = ['areas', 'types', 'priorities', 'architectures', 'sentiments', 'causes'];
        const results: any = {};
        for (const ep of endpoints) {
          const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/${ep}`);
          if (resp.ok) results[ep] = await resp.json();
        }
        setCatalogs(results);
      } catch (e) { console.error(e); }
    };
    fetchCatalogs();
  }, []);
  
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isInternalUser, setIsInternalUser] = useState(true);

  useEffect(() => {
    document.body.classList.add('light-theme');
    
    // Check if the user is a customer and auto-fill
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.user_type === 'customer') {
        setIsInternalUser(false);
        setSelectedCustomer({ id: payload.customer_id, name: 'Mi Empresa' });
        setSelectedContact({ id: payload.contact_id, email: payload.sub });
      }
    }

    return () => {
      document.body.classList.remove('light-theme');
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowCustomers(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Customer search debounce
  useEffect(() => {
    if (customerSearch.length >= 3) {
      const handler = setTimeout(async () => {
        try {
          const res = await api.searchCustomers(customerSearch);
          setCustomers(res);
          setShowCustomers(true);
        } catch (e) {
          console.error("Error searching customers", e);
        }
      }, 500);
      return () => clearTimeout(handler);
    } else {
      setCustomers([]);
      setShowCustomers(false);
    }
  }, [customerSearch]);

  // Load contacts when customer selected
  useEffect(() => {
    if (selectedCustomer) {
      api.getCustomerContacts(selectedCustomer.id).then(res => {
        setContacts(res);
      }).catch(e => {
        console.error("Error fetching contacts", e);
      });
    } else {
      setContacts([]);
      setSelectedContact(null);
    }
  }, [selectedCustomer]);

  // AI Classification Debounce
  useEffect(() => {
    if (!formData.descripcion || formData.descripcion.length < 10) return;
    
    const handler = setTimeout(async () => {
      setIsClassifying(true);
      try {
        const result = await api.classifyPqrsf(formData.asunto, formData.descripcion);
        setAiData(result);
      } catch (err) {
        console.error("Failed to classify", err);
      } finally {
        setIsClassifying(false);
      }
    }, 2000);
    
    return () => clearTimeout(handler);
  }, [formData.descripcion, formData.asunto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleAiChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setAiData({ ...aiData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedContact) {
      alert("Debes seleccionar un Cliente y un Contacto válido.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = { 
        ...formData, 
        ...aiData,
        customer_id: selectedCustomer.id,
        contact_id: selectedContact.id,
        cliente_empresa: selectedCustomer.name,
        correo: selectedContact.email
      };
      const res = await api.createPqrsf(payload);
      setSuccess(`Solicitud creada exitosamente con número de radicado: ${res.consecutivo}`);
      setFormData({ asunto: '', descripcion: '' });
      setSelectedCustomer(null);
      setSelectedContact(null);
      setCustomerSearch('');
      setAiData({ tipo_id: '', area_id: '', arquitectura_id: '', prioridad_id: '', sentimiento_id: '', causa_probable_id: '', riesgo: '', impacto: '', accion_recomendada: '', resumen: '', area_responsable_id: '' });
    } catch (err) {
      alert("Hubo un error al registrar la solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="light-theme" style={{ minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        <Link href="/portal-cliente" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--primary)', textDecoration: 'none', marginBottom: 24, fontWeight: 600 }}>
          ← Volver al Dashboard
        </Link>
        <h1 className="page-title" style={{ textAlign: 'center', marginBottom: 8 }}>Nueva Solicitud</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 40 }}>
          SABI Voice analizará automáticamente la información registrada y propondrá una clasificación inteligente basada en Inteligencia Artificial.
        </p>

        {success && (
          <div className="saas-card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--status-closed)', color: 'var(--status-closed)', marginBottom: 24, textAlign: 'center' }}>
            <strong>{success}</strong>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Formulario Principal */}
          <div className="saas-card">
            <h2 style={{ marginBottom: 24, fontSize: 20 }}>Datos de la Solicitud</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {isInternalUser && (
                <>
                  <div ref={wrapperRef} style={{ position: 'relative' }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Cliente / Empresa *</label>
                    {selectedCustomer ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="input-field" style={{ flex: 1, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center' }}>
                          {selectedCustomer.name}
                        </div>
                        <button type="button" onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }} className="btn-primary" style={{ padding: '8px', background: 'var(--status-danger)' }}>X</button>
                      </div>
                    ) : (
                      <>
                        <input 
                          required={isInternalUser} 
                          value={customerSearch} 
                          onChange={(e) => setCustomerSearch(e.target.value)} 
                          onFocus={() => { if(customers.length > 0) setShowCustomers(true) }}
                          className="input-field" 
                          type="text" 
                          placeholder="Empieza a escribir (Mín 3 caracteres)..." 
                        />
                        {showCustomers && customers.length > 0 && (
                          <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', marginTop: '4px', padding: 0, listStyle: 'none', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            {customers.map((c) => (
                              <li key={c.id} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--surface-border)' }} 
                                  onClick={() => { setSelectedCustomer(c); setShowCustomers(false); }}>
                                {c.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Correo Electrónico (Personas Autorizadas) *</label>
                    <select 
                      required={isInternalUser} 
                      className="input-field" 
                      value={selectedContact?.id || ''} 
                      onChange={(e) => {
                        const contact = contacts.find(c => c.id.toString() === e.target.value);
                        setSelectedContact(contact || null);
                      }}
                      disabled={!selectedCustomer}
                    >
                      <option value="" disabled>Seleccione un contacto autorizado</option>
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                      ))}
                    </select>
                    {!selectedCustomer && <p style={{ fontSize: 12, color: 'var(--status-warning)', marginTop: 4 }}>Seleccione un cliente primero</p>}
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Asunto *</label>
                <input required name="asunto" value={formData.asunto} onChange={handleChange} className="input-field" type="text" placeholder="Breve descripción del problema" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Descripción Detallada *</label>
                <textarea required name="descripcion" value={formData.descripcion} onChange={handleChange} className="input-field" rows={8} placeholder="Describe detalladamente el motivo de la solicitud..." style={{ resize: 'vertical' }}></textarea>
              </div>
              
              <div style={{ border: '1px dashed var(--surface-border)', padding: 24, borderRadius: 8, textAlign: 'center', backgroundColor: '#f8fafc' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Arrastra archivos aquí o haz clic para subir (Max 20MB)</p>
                <p style={{ color: 'var(--status-warning)', fontSize: 12, marginTop: 8 }}>* Funcionalidad visual para MVP</p>
              </div>

              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </form>
          </div>

          {/* Panel de IA */}
          <div className="saas-card" style={{ borderTop: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, color: 'var(--text-primary)' }}>Sugerencias IA</h2>
              {isClassifying && <span className="badge status-aldia">Analizando...</span>}
            </div>

            {aiData.clasificacion_ia?.hallazgos && aiData.clasificacion_ia.hallazgos.length > 0 && (
              <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8 }}>
                <h3 style={{ fontSize: 16, color: '#d97706', marginBottom: 12 }}>Hallazgos Organizacionales Sugeridos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {aiData.clasificacion_ia.hallazgos.map((h: any, idx: number) => (
                    <div key={idx} style={{ padding: 12, backgroundColor: '#ffffff', borderRadius: 6, borderLeft: '4px solid #f59e0b', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{h.tipo}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Confianza: {(h.confianza * 100).toFixed(0)}%</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{h.descripcion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Tipo</label>
                  <select name="tipo_id" value={aiData.tipo_id?.toString() || ''} onChange={handleAiChange} className="input-field" style={{ padding: '8px 12px', fontSize: 14 }}>
                    <option value="">Seleccione...</option>
                    {catalogs.types.map((t: any) => <option key={t.id} value={t.id.toString()}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Prioridad</label>
                  <select name="prioridad_id" value={aiData.prioridad_id?.toString() || ''} onChange={handleAiChange} className="input-field" style={{ padding: '8px 12px', fontSize: 14 }}>
                    <option value="">Seleccione...</option>
                    {catalogs.priorities.map((p: any) => <option key={p.id} value={p.id.toString()}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Área</label>
                  <select name="area_id" value={aiData.area_id?.toString() || ''} onChange={handleAiChange} className="input-field" style={{ padding: '8px 12px', fontSize: 14 }}>
                    <option value="">Seleccione...</option>
                    {catalogs.areas.map((a: any) => <option key={a.id} value={a.id.toString()}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Arquitectura</label>
                  <select name="arquitectura_id" value={aiData.arquitectura_id?.toString() || ''} onChange={handleAiChange} className="input-field" style={{ padding: '8px 12px', fontSize: 14 }}>
                    <option value="">Seleccione...</option>
                    {catalogs.architectures.map((a: any) => <option key={a.id} value={a.id.toString()}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Área Responsable (Enrutamiento)</label>
                <select name="area_responsable_id" value={aiData.area_responsable_id?.toString() || ''} onChange={handleAiChange} className="input-field" style={{ padding: '8px 12px', fontSize: 14 }}>
                  <option value="">Seleccione...</option>
                  {catalogs.areas.map((a: any) => <option key={a.id} value={a.id.toString()}>{a.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Sentimiento</label>
                <select name="sentimiento_id" value={aiData.sentimiento_id?.toString() || ''} onChange={handleAiChange} className="input-field" style={{ padding: '8px 12px', fontSize: 14 }}>
                  <option value="">Seleccione...</option>
                  {catalogs.sentiments.map((s: any) => <option key={s.id} value={s.id.toString()}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Causa Probable</label>
                <select name="causa_probable_id" value={aiData.causa_probable_id?.toString() || ''} onChange={handleAiChange} className="input-field" style={{ padding: '8px 12px', fontSize: 14 }}>
                  <option value="">Seleccione...</option>
                  {catalogs.causes.map((c: any) => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Riesgo</label>
                <input name="riesgo" value={aiData.riesgo} onChange={handleAiChange} className="input-field" style={{ padding: '8px 12px', fontSize: 14 }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Impacto</label>
                <input name="impacto" value={aiData.impacto} onChange={handleAiChange} className="input-field" style={{ padding: '8px 12px', fontSize: 14 }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Acción Recomendada</label>
                <textarea name="accion_recomendada" value={aiData.accion_recomendada} onChange={handleAiChange} className="input-field" rows={3} style={{ padding: '8px 12px', fontSize: 14, resize: 'vertical' }}></textarea>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Resumen Ejecutivo</label>
                <textarea name="resumen" value={aiData.resumen} onChange={handleAiChange} className="input-field" rows={2} style={{ padding: '8px 12px', fontSize: 14, resize: 'vertical' }}></textarea>
              </div>
              
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: 8 }}>
                Puedes ajustar estos valores sugeridos por la IA antes de enviar la solicitud.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
