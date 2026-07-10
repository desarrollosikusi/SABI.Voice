'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import Image from 'next/image';
import CustomerPortalLayout from '@/app/portal-cliente/layout';
import DashboardLayout from '@/app/dashboard/layout';

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

  const [isClassifying, setIsClassifying] = useState(false);
  const [hasClassified, setHasClassified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [isInternalUser, setIsInternalUser] = useState(false);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { toastSuccess, toastError, warning } = useToast();

  useEffect(() => {
    document.body.classList.add('light-theme');
    return () => {
      document.body.classList.remove('light-theme');
    };
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch catalogs
        const endpoints = ['areas', 'types', 'priorities', 'architectures', 'sentiments', 'causes'];
        const results: any = {};
        for (const ep of endpoints) {
          const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/${ep}`);
          if (resp.ok) results[ep] = await resp.json();
        }
        setCatalogs(results);

        // Fetch User Info
        const meData = await api.getCustomerMe();
        if (meData.type === 'internal') {
          setIsInternalUser(true);
        } else {
          setIsInternalUser(false);
          setMe(meData);
          if (meData.customer) {
            setSelectedCustomer({ id: meData.customer.id, name: meData.customer.name });
            setSelectedContact({ id: meData.id, email: meData.email });
          }
        }
      } catch (e) { 
        console.error("Error loading initial data", e); 
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
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

  // Customer search debounce (Only for internal)
  useEffect(() => {
    if (!isInternalUser) return;
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
  }, [customerSearch, isInternalUser]);

  // Load contacts when customer selected (Only for internal)
  useEffect(() => {
    if (!isInternalUser) return;
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
  }, [selectedCustomer, isInternalUser]);

  // AI Classification Debounce
  useEffect(() => {
    if (!formData.descripcion || formData.descripcion.length < 10) {
      setHasClassified(false);
      return;
    }
    
    const handler = setTimeout(async () => {
      setIsClassifying(true);
      try {
        const result = await api.classifyPqrsf(formData.asunto, formData.descripcion);
        setAiData(result);
        setHasClassified(true);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedContact) {
      return warning("Debes seleccionar un Cliente y un Contacto válido.");
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
      toastSuccess(`Solicitud creada exitosamente con número de radicado: ${res.consecutivo}`);
      
      // Simulate file upload (Since API does not accept files during creation yet)
      // If we had an endpoint for attachments, we would do it here.

      setFormData({ asunto: '', descripcion: '' });
      setAiData({ tipo_id: '', area_id: '', arquitectura_id: '', prioridad_id: '', sentimiento_id: '', causa_probable_id: '', riesgo: '', impacto: '', accion_recomendada: '', resumen: '', area_responsable_id: '' });
      setFiles([]);
      
      if (isInternalUser) {
        setSelectedCustomer(null);
        setSelectedContact(null);
        setCustomerSearch('');
      } else {
        // Redirigir al dashboard cliente para que vea su caso
        window.location.href = "/portal-cliente";
      }

    } catch (err: any) {
      toastError(err.message || "Hubo un error al registrar la solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <p style={{ marginTop: 16, color: '#666' }}>Cargando...</p>
    </div>
  );

  const content = (
    <div style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
      
      {/* HERO */}
      <div className="saas-card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', padding: '32px 40px', gap: '48px', marginBottom: '40px', borderLeft: '4px solid var(--primary)', justifyContent: 'center' }}>
        {/* Lado Izquierdo: Titulo (~45%) */}
        <div style={{ flex: '4.5 1 280px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: '0 0 16px 0', lineHeight: 1.2 }}>Nueva Solicitud</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.6 }}>
            Cuéntanos qué ocurrió y nosotros nos encargaremos del resto. SABI Voice analizará automáticamente tu solicitud y ayudará a direccionarla al equipo indicado.
          </p>
          {!isInternalUser && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#047857', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 500, alignSelf: 'flex-start' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              Tus datos de empresa y contacto ya fueron identificados automáticamente.
            </div>
          )}
        </div>

        {/* Lado Central: SABI (~20%) */}
        <div style={{ flex: '2 1 260px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px', height: '300px', animation: 'float 6s ease-in-out infinite', mixBlendMode: 'darken' }}>
            <Image src="/sabi-hero.png" alt="SABI Asistente" fill style={{ objectFit: 'contain' }} priority sizes="300px" />
          </div>
        </div>

        {/* Lado Derecho: Tarjeta Resumen (~35%) */}
        <div style={{ flex: '3.5 1 280px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '320px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏢</div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Empresa</p>
                <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{selectedCustomer ? selectedCustomer.name : 'Sin asignar'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#f3f4f6', color: '#4b5563', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✉️</div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Correo</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{selectedContact ? selectedContact.email : 'Sin asignar'}</p>
              </div>
            </div>
            {!isInternalUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.8rem', fontWeight: 500, marginTop: '8px' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                Información desde tu perfil
              </div>
            )}
          </div>
        </div>
      </div>

        {/* LAYOUT PRINCIPAL DEL FORMULARIO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px', alignItems: 'start' }}>
          
          {/* Columna Izquierda: Formulario de Solicitud */}
          <div className="saas-card" style={{ padding: '40px' }}>
            <h2 style={{ marginBottom: 32, fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.8rem' }}>💬</span> ¿Qué necesitas?
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              
              {isInternalUser && (
                <div style={{ padding: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div ref={wrapperRef} style={{ position: 'relative' }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Seleccionar Cliente *</label>
                    {selectedCustomer ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="input-field" style={{ flex: 1, backgroundColor: '#ffffff', display: 'flex', alignItems: 'center' }}>
                          {selectedCustomer.name}
                        </div>
                        <button type="button" onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }} className="btn-primary" style={{ padding: '8px', background: 'var(--status-danger)' }}>Cambiar</button>
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
                          placeholder="Buscar cliente..." 
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
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Seleccionar Contacto Autorizado *</label>
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
                      <option value="" disabled>Seleccione un contacto</option>
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Asunto</label>
                <input required name="asunto" value={formData.asunto} onChange={handleChange} className="input-field" type="text" placeholder="Resume tu necesidad en una frase..." style={{ padding: '16px', fontSize: '1.1rem' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Descripción Detallada</label>
                <textarea required name="descripcion" value={formData.descripcion} onChange={handleChange} className="input-field" rows={10} placeholder="Describe con el mayor nivel de detalle posible lo que necesitas..." style={{ padding: '16px', fontSize: '1.05rem', resize: 'vertical' }}></textarea>
              </div>
              
              {/* Drag and Drop Zone */}
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Archivos Adjuntos (Opcional)</label>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    border: `2px dashed ${isDragging ? 'var(--primary)' : '#cbd5e1'}`, 
                    padding: '32px', 
                    borderRadius: '12px', 
                    textAlign: 'center', 
                    backgroundColor: isDragging ? '#f0f9ff' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input type="file" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px', color: '#94a3b8' }}>📄</div>
                  <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 500, fontSize: '1.1rem' }}>Arrastra archivos aquí</p>
                  <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>o haz clic para seleccionarlos (Máximo 20 MB)</p>
                </div>
                
                {/* File List */}
                {files.length > 0 && (
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {files.map((file, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                          <span style={{ color: '#10b981', flexShrink: 0 }}>✔</span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{file.name}</span>
                        </div>
                        <button type="button" onClick={() => removeFile(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem', flexShrink: 0 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: 'fit-content', padding: '14px 28px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '8px' }}>
                  {isSubmitting ? 'Enviando...' : (
                    <>
                      Enviar Solicitud
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Columna Derecha: Panel de IA */}
          <div className="saas-card" style={{ padding: '40px', borderTop: '4px solid var(--primary)', backgroundColor: '#ffffff' }}>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: 8 }}>Sugerencias de IA</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '0.95rem', lineHeight: 1.5 }}>
              A medida que describes tu solicitud, SABI analizará automáticamente la información y propondrá una clasificación inteligente.
            </p>

            {/* Indicadores de Conversación IA */}
            <div style={{ marginBottom: 32, minHeight: '40px' }}>
              {isClassifying && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#3b82f6', fontSize: '1rem', fontWeight: 500, padding: '12px 16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                  <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>🤖</div>
                  Analizando tu solicitud...
                </div>
              )}
              {!isClassifying && hasClassified && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', fontSize: '1rem', fontWeight: 500, padding: '12px 16px', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
                  <div>✅</div>
                  SABI ha preparado una clasificación preliminar.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, opacity: hasClassified ? 1 : 0.5, pointerEvents: hasClassified ? 'auto' : 'none', transition: 'all 0.3s ease' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Tipo</label>
                  <select name="tipo_id" value={aiData.tipo_id?.toString() || ''} onChange={handleAiChange} className="input-field" style={{ padding: '12px', fontSize: '0.95rem' }}>
                    <option value="">Seleccione...</option>
                    {catalogs.types.map((t: any) => <option key={t.id} value={t.id.toString()}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Prioridad</label>
                  <select name="prioridad_id" value={aiData.prioridad_id?.toString() || ''} onChange={handleAiChange} className="input-field" style={{ padding: '12px', fontSize: '0.95rem' }}>
                    <option value="">Seleccione...</option>
                    {catalogs.priorities.map((p: any) => <option key={p.id} value={p.id.toString()}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Área</label>
                  <select name="area_id" value={aiData.area_id?.toString() || ''} onChange={handleAiChange} className="input-field" style={{ padding: '12px', fontSize: '0.95rem' }}>
                    <option value="">Seleccione...</option>
                    {catalogs.areas.map((a: any) => <option key={a.id} value={a.id.toString()}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Arquitectura</label>
                  <select name="arquitectura_id" value={aiData.arquitectura_id?.toString() || ''} onChange={handleAiChange} className="input-field" style={{ padding: '12px', fontSize: '0.95rem' }}>
                    <option value="">Seleccione...</option>
                    {catalogs.architectures.map((a: any) => <option key={a.id} value={a.id.toString()}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Área Responsable</label>
                  <select name="area_responsable_id" value={aiData.area_responsable_id?.toString() || ''} onChange={handleAiChange} className="input-field" style={{ padding: '12px', fontSize: '0.95rem' }}>
                    <option value="">Seleccione...</option>
                    {catalogs.areas.map((a: any) => <option key={a.id} value={a.id.toString()}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Sentimiento</label>
                  <select name="sentimiento_id" value={aiData.sentimiento_id?.toString() || ''} onChange={handleAiChange} className="input-field" style={{ padding: '12px', fontSize: '0.95rem' }}>
                    <option value="">Seleccione...</option>
                    {catalogs.sentiments.map((s: any) => <option key={s.id} value={s.id.toString()}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Causa Probable</label>
                  <select name="causa_probable_id" value={aiData.causa_probable_id?.toString() || ''} onChange={handleAiChange} className="input-field" style={{ padding: '12px', fontSize: '0.95rem' }}>
                    <option value="">Seleccione...</option>
                    {catalogs.causes.map((c: any) => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Riesgo</label>
                  <input name="riesgo" value={aiData.riesgo || ''} onChange={handleAiChange} className="input-field" style={{ padding: '12px', fontSize: '0.95rem' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Impacto</label>
                <input name="impacto" value={aiData.impacto || ''} onChange={handleAiChange} className="input-field" style={{ padding: '12px', fontSize: '0.95rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Acción Recomendada</label>
                <textarea name="accion_recomendada" value={aiData.accion_recomendada || ''} onChange={handleAiChange} className="input-field" rows={3} style={{ padding: '12px', fontSize: '0.95rem', resize: 'vertical' }}></textarea>
              </div>
              
            </div>
          </div>
        </div>
      </div>
  );

  if (isInternalUser) {
    return <DashboardLayout>{content}</DashboardLayout>;
  } else {
    return <CustomerPortalLayout>{content}</CustomerPortalLayout>;
  }
}
