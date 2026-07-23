import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import { useToast } from '@/contexts/ToastContext';

interface StakeholdersTabProps {
  customerId: number;
}

export default function StakeholdersTab({ customerId }: StakeholdersTabProps) {
  const { success, error: toastError, warning } = useToast();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [stakeholderFilter, setStakeholderFilter] = useState('Activos');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactModalTab, setContactModalTab] = useState('general');
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contactForm, setContactForm] = useState<any>({});
  const [deactivateForm, setDeactivateForm] = useState({ reporter: '', support: '' });

  useEffect(() => {
    loadContacts();
  }, [customerId]);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCustomerContacts(customerId);
      setContacts(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar los contactos.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenContactModal = (contact: any = null) => {
    setContactModalTab('general');
    if (contact) {
      setContactForm({ ...contact, additional_data: contact.additional_data || {} });
    } else {
      setContactForm({
        name: '', apellidos: '', cargo: '', area: '', email: '', phone: '', celular: '',
        idioma: 'es', recibir_comunicaciones: true, medio_preferido: '', notas_relacionamiento: '',
        es_principal: false, es_tecnico: false, es_administrativo: false, es_comercial: false,
        is_active: true, additional_data: {}
      });
    }
    setSelectedContact(contact);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async () => {
    if (!contactForm.name?.trim()) {
      return warning("El campo 'Nombre' es obligatorio.");
    }
    if (!contactForm.email?.trim()) {
      return warning("El campo 'Correo Electrónico (email)' es obligatorio.");
    }

    try {
      const data = { ...contactForm, customer_id: customerId };
      if (selectedContact) {
        await api.updateContact(selectedContact.id, data);
        success("Contacto actualizado exitosamente.");
      } else {
        await api.createContact(data);
        success("Contacto creado exitosamente.");
      }
      setIsContactModalOpen(false);
      loadContacts();
    } catch (err: any) {
      toastError(err.message || 'Error guardando contacto');
    }
  };

  const handleOpenDeactivate = (contact: any) => {
    if (contact.is_active) {
      setSelectedContact(contact);
      setDeactivateForm({ reporter: '', support: '' });
      setIsDeactivateModalOpen(true);
    } else {
      if (confirm('¿Desea reactivar este contacto?')) {
        api.reactivateContact(contact.id).then(() => {
          success("Contacto reactivado exitosamente.");
          loadContacts();
        }).catch((e:any) => toastError(e.message));
      }
    }
  };

  const handleDeactivate = async () => {
    try {
      if (!deactivateForm.reporter || !deactivateForm.support) {
        return warning("Debe llenar todos los campos de soporte.");
      }
      await api.deactivateContact(selectedContact.id, deactivateForm.reporter, deactivateForm.support);
      success("Contacto inactivado exitosamente.");
      setIsDeactivateModalOpen(false);
      loadContacts();
    } catch (err: any) {
      toastError(err.message || 'Error inactivando contacto');
    }
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '-';

  const filteredContacts = contacts.filter(c => {
    let activeMatch = true;
    if (stakeholderFilter === 'Activos') activeMatch = c.is_active;
    if (stakeholderFilter === 'Inactivos') activeMatch = !c.is_active;
    
    let roleMatch = true;
    if (roleFilter === 'Principal') roleMatch = c.es_principal;
    if (roleFilter === 'Tecnico') roleMatch = c.es_tecnico;
    if (roleFilter === 'Administrativo') roleMatch = c.es_administrativo;
    if (roleFilter === 'Comercial') roleMatch = c.es_comercial;

    return activeMatch && roleMatch;
  });

  const contactColumns = [
    { key: 'full_name', label: 'Nombre', sortable: true, render: (row: any) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{`${row.name || ''} ${row.apellidos || ''}`.trim()}</span>
        {!row.is_active && <span style={{ fontSize: '0.7rem', backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: 4, fontWeight: 500 }}>Inactivo</span>}
      </div>
    )},
    { key: 'role_name', label: 'Cargo / Rol', sortable: true, render: (row: any) => row.cargo || 'N/A' },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Teléfono', render: (row: any) => row.phone || row.celular || 'N/A' },
    { key: 'ultima_interaccion', label: 'Última Interacción', render: (row: any) => row.ultima_interaccion ? formatDate(row.ultima_interaccion) : '-' },
    ...(stakeholderFilter === 'Inactivos' ? [
      { key: 'deactivation_date', label: 'Fecha Inactivación', sortable: true, render: (row: any) => row.deactivation_date ? formatDate(row.deactivation_date) : 'N/A' },
      { key: 'deactivation_reporter', label: 'Reportado por', sortable: true, render: (row: any) => row.deactivation_reporter || 'N/A' }
    ] : []),
    { key: 'actions', label: 'Acciones', render: (row: any) => (
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => handleOpenContactModal(row)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>Editar</button>
        <button onClick={() => handleOpenDeactivate(row)} style={{ background: 'none', border: 'none', color: row.is_active ? 'var(--danger, #ef4444)' : 'var(--success, #22c55e)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>
          {row.is_active ? 'Inactivar' : 'Reactivar'}
        </button>
      </div>
    ) }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <div style={{ height: '30px', width: '200px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
          <div style={{ height: '36px', width: '150px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
        </div>
        <div style={{ height: '300px', backgroundColor: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #f87171' }}>
        <h3 style={{ color: '#991b1b', marginBottom: '8px' }}>Error</h3>
        <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>
        <button onClick={loadContacts} style={{ marginTop: '16px', padding: '8px 16px', background: '#991b1b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <Card noPadding>
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Estado:</label>
            <select className="input-field" style={{ width: '130px', padding: '6px 12px' }} value={stakeholderFilter} onChange={e => setStakeholderFilter(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Activos">Activos</option>
              <option value="Inactivos">Inactivos</option>
            </select>
            
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginLeft: 16 }}>Rol:</label>
            <select className="input-field" style={{ width: '160px', padding: '6px 12px' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">Todos los roles</option>
              <option value="Principal">Principal</option>
              <option value="Tecnico">Técnico</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Comercial">Comercial</option>
            </select>
          </div>
          <button 
            onClick={() => handleOpenContactModal()}
            style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
          >
            + Nuevo Stakeholder
          </button>
        </div>
        
        {filteredContacts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>👥</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#475569' }}>No hay stakeholders</h3>
            <p style={{ color: '#64748b', margin: 0 }}>No se encontraron contactos que coincidan con los filtros aplicados.</p>
          </div>
        ) : (
          <DataTable columns={contactColumns} data={filteredContacts} />
        )}
      </Card>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: 12, width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>{selectedContact ? 'Editar Stakeholder' : 'Nuevo Stakeholder'}</h2>
            
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--surface-border)', marginBottom: '20px' }}>
              {[{id: 'general', label: 'General'}, {id: 'contacto', label: 'Contacto'}, {id: 'preferencias', label: 'Preferencias'}, {id: 'roles', label: 'Roles'}, {id: 'relacion', label: 'Relación Interna'}].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setContactModalTab(tab.id)}
                  style={{
                    padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem',
                    borderBottom: contactModalTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                    color: contactModalTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: contactModalTab === tab.id ? 600 : 400
                  }}
                >{tab.label}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {contactModalTab === 'general' && (
                <section>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Nombre</label><input className="input-field" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} /></div>
                    <div><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Apellidos</label><input className="input-field" value={contactForm.apellidos || ''} onChange={e => setContactForm({...contactForm, apellidos: e.target.value})} /></div>
                    <div><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Cargo</label><input className="input-field" value={contactForm.cargo || ''} onChange={e => setContactForm({...contactForm, cargo: e.target.value})} /></div>
                    <div><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Área</label><input className="input-field" value={contactForm.area || ''} onChange={e => setContactForm({...contactForm, area: e.target.value})} /></div>
                    <div><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Fecha de Cumpleaños</label><input type="date" className="input-field" value={contactForm.fecha_nacimiento || ''} onChange={e => setContactForm({...contactForm, fecha_nacimiento: e.target.value})} /></div>
                  </div>
                </section>
              )}

              {contactModalTab === 'contacto' && (
                <section>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Email</label><input type="email" className="input-field" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} /></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Celular</label><input className="input-field" value={contactForm.celular || ''} onChange={e => setContactForm({...contactForm, celular: e.target.value})} /></div>
                  </div>
                </section>
              )}

              {contactModalTab === 'preferencias' && (
                <section>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Idioma</label>
                      <select className="input-field" value={contactForm.idioma} onChange={e => setContactForm({...contactForm, idioma: e.target.value})}><option value="es">Español</option><option value="en">Inglés</option><option value="pt">Portugués</option></select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Medio preferido</label>
                      <input className="input-field" placeholder="Ej: Correo, WhatsApp, Teléfono" value={contactForm.medio_preferido || ''} onChange={e => setContactForm({...contactForm, medio_preferido: e.target.value})} />
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <input type="checkbox" id="recibir_coms" checked={contactForm.recibir_comunicaciones} onChange={e => setContactForm({...contactForm, recibir_comunicaciones: e.target.checked})} />
                      <label htmlFor="recibir_coms" style={{ fontSize: '0.85rem' }}>Desea recibir comunicaciones comerciales y encuestas</label>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Horarios preferidos de contacto</label>
                      <input className="input-field" placeholder="Ej: Solo en las mañanas de 8 a 10 am" value={contactForm.additional_data?.horarios_contacto || ''} onChange={e => setContactForm({...contactForm, additional_data: {...contactForm.additional_data, horarios_contacto: e.target.value}})} />
                    </div>
                  </div>
                </section>
              )}

              {contactModalTab === 'roles' && (
                <section>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>Selecciona los roles funcionales de este contacto dentro del cliente. (Solo puede haber un Contacto Principal activo).</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', border: '1px solid var(--surface-border)', borderRadius: 8 }}><input type="checkbox" id="es_principal" checked={contactForm.es_principal} onChange={e => setContactForm({...contactForm, es_principal: e.target.checked})} /><label htmlFor="es_principal" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Principal</label></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', border: '1px solid var(--surface-border)', borderRadius: 8 }}><input type="checkbox" id="es_tecnico" checked={contactForm.es_tecnico} onChange={e => setContactForm({...contactForm, es_tecnico: e.target.checked})} /><label htmlFor="es_tecnico" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Técnico / IT</label></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', border: '1px solid var(--surface-border)', borderRadius: 8 }}><input type="checkbox" id="es_administrativo" checked={contactForm.es_administrativo} onChange={e => setContactForm({...contactForm, es_administrativo: e.target.checked})} /><label htmlFor="es_administrativo" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Administrativo / Finanzas</label></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', border: '1px solid var(--surface-border)', borderRadius: 8 }}><input type="checkbox" id="es_comercial" checked={contactForm.es_comercial} onChange={e => setContactForm({...contactForm, es_comercial: e.target.checked})} /><label htmlFor="es_comercial" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Comercial / Compras</label></div>
                  </div>
                </section>
              )}
              
              {contactModalTab === 'relacion' && (
                <section>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Observaciones de Relacionamiento</label>
                      <textarea className="input-field" rows={3} placeholder="Anotaciones sobre el perfil del contacto, nivel de influencia, estilo de comunicación, etc." value={contactForm.notas_relacionamiento || ''} onChange={e => setContactForm({...contactForm, notas_relacionamiento: e.target.value})}></textarea>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Intereses o Preferencias (Soft Skills)</label>
                      <textarea className="input-field" rows={2} placeholder="Deportes, aficiones, temas de interés personal para crear afinidad." value={contactForm.additional_data?.intereses_personales || ''} onChange={e => setContactForm({...contactForm, additional_data: {...contactForm.additional_data, intereses_personales: e.target.value}})}></textarea>
                    </div>
                  </div>
                </section>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--surface-border)' }}>
              {contactForm.functional_id ? <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {contactForm.functional_id}</div> : <div></div>}
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setIsContactModalOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={handleSaveContact} style={{ padding: '8px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>Guardar Cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {isDeactivateModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: 12, width: '450px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 8, color: 'var(--danger, #ef4444)' }}>Inactivar Stakeholder</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Por favor, justifique la inactivación de este contacto. Se mantendrá su historial.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: 4, fontWeight: 500 }}>¿Quién informa la inactivación?</label>
                <input className="input-field" placeholder="Nombre de quien reporta" value={deactivateForm.reporter} onChange={e => setDeactivateForm({...deactivateForm, reporter: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: 4, fontWeight: 500 }}>Soporte (Motivo / Correo)</label>
                <textarea className="input-field" rows={3} placeholder="Detalle la evidencia o motivo..." value={deactivateForm.support} onChange={e => setDeactivateForm({...deactivateForm, support: e.target.value})}></textarea>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button onClick={() => setIsDeactivateModalOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleDeactivate} style={{ padding: '8px 16px', background: 'var(--danger, #ef4444)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Inactivar Contacto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
