import os
import re

file_path = "/app/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# ADD NEW IMPORTS AND STYLES
if "import { api }" in content and "ModalOverlay" not in content:
    # Add a small inline CSS for modal if needed, but we can just use inline styles
    pass

# INSERT STATES AFTER activeTab
state_insertion = """  const [activeTab, setActiveTab] = useState('general');
  // Stakeholder Modal States
  const [stakeholderFilter, setStakeholderFilter] = useState('Activos');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contactForm, setContactForm] = useState<any>({});
  const [deactivateForm, setDeactivateForm] = useState({ reporter: '', support: '' });
"""
content = content.replace("  const [activeTab, setActiveTab] = useState('general');", state_insertion)

# INSERT HELPER FUNCTIONS BEFORE return
helper_functions = """
  // Contact Handlers
  const handleOpenContactModal = (contact: any = null) => {
    if (contact) {
      setContactForm({ ...contact });
    } else {
      setContactForm({
        name: '', apellidos: '', cargo: '', area: '', email: '', phone: '', celular: '',
        idioma: 'es', recibir_comunicaciones: true, medio_preferido: '', notas_relacionamiento: '',
        es_principal: false, es_tecnico: false, es_administrativo: false, es_comercial: false,
        is_active: true
      });
    }
    setSelectedContact(contact);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async () => {
    try {
      const data = { ...contactForm, customer_id: cliente.id };
      if (selectedContact) {
        await api.updateContact(selectedContact.id, data);
      } else {
        await api.createContact(data);
      }
      setIsContactModalOpen(false);
      // Refresh data
      const updatedContacts = await api.getInternalUsers(); // Wait, page.tsx doesn't have a fetch contacts function separated! It's in fetchData.
      fetchData(); // We will call fetchData
    } catch (err: any) {
      alert(err.message || 'Error guardando contacto');
    }
  };

  const handleOpenDeactivate = (contact: any) => {
    if (contact.is_active) {
      setSelectedContact(contact);
      setDeactivateForm({ reporter: '', support: '' });
      setIsDeactivateModalOpen(true);
    } else {
      // Reactivate directly
      if (confirm('¿Desea reactivar este contacto?')) {
        api.reactivateContact(contact.id).then(() => fetchData()).catch((e:any) => alert(e.message));
      }
    }
  };

  const handleDeactivate = async () => {
    try {
      if (!deactivateForm.reporter || !deactivateForm.support) {
        return alert("Debe llenar todos los campos de soporte.");
      }
      await api.deactivateContact(selectedContact.id, deactivateForm.reporter, deactivateForm.support);
      setIsDeactivateModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error inactivando contacto');
    }
  };

  const filteredContacts = contacts.filter(c => {
    if (stakeholderFilter === 'Activos') return c.is_active;
    if (stakeholderFilter === 'Inactivos') return !c.is_active;
    return true; // Todos
  });
"""
content = content.replace("  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '-';", helper_functions + "\n  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '-';")

# REPLACE contactColumns to add Actions
new_columns = """  const contactColumns = [
    { key: 'full_name', label: 'Nombre', render: (row: any) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{`${row.name || ''} ${row.apellidos || ''}`.trim()}</span>
        {!row.is_active && <span style={{ fontSize: '0.7rem', backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: 4, fontWeight: 500 }}>Inactivo</span>}
      </div>
    )},
    { key: 'role_name', label: 'Cargo / Rol', render: (row: any) => row.cargo || 'N/A' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Teléfono', render: (row: any) => row.phone || row.celular || 'N/A' },
    { key: 'actions', label: 'Acciones', render: (row: any) => (
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => handleOpenContactModal(row)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>Editar</button>
        <button onClick={() => handleOpenDeactivate(row)} style={{ background: 'none', border: 'none', color: row.is_active ? 'var(--danger, #ef4444)' : 'var(--success, #22c55e)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>
          {row.is_active ? 'Inactivar' : 'Reactivar'}
        </button>
      </div>
    ) }
  ];"""
content = re.sub(r"  const contactColumns = \[.*?\];", new_columns, content, flags=re.DOTALL)

# MODAL COMPONENTS JSX
modal_jsx = """
      {/* Contact Modal */}
      {isContactModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: 12, width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>{selectedContact ? 'Editar Stakeholder' : 'Nuevo Stakeholder'}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <section>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>Información General</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Nombre</label><input className="input-field" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} /></div>
                  <div><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Apellidos</label><input className="input-field" value={contactForm.apellidos || ''} onChange={e => setContactForm({...contactForm, apellidos: e.target.value})} /></div>
                  <div><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Cargo</label><input className="input-field" value={contactForm.cargo || ''} onChange={e => setContactForm({...contactForm, cargo: e.target.value})} /></div>
                  <div><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Área</label><input className="input-field" value={contactForm.area || ''} onChange={e => setContactForm({...contactForm, area: e.target.value})} /></div>
                  <div><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Fecha de Cumpleaños</label><input type="date" className="input-field" value={contactForm.fecha_nacimiento || ''} onChange={e => setContactForm({...contactForm, fecha_nacimiento: e.target.value})} /></div>
                </div>
              </section>

              <section>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>Información de Contacto</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Email</label><input type="email" className="input-field" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} /></div>
                  <div><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Teléfono</label><input className="input-field" value={contactForm.phone || ''} onChange={e => setContactForm({...contactForm, phone: e.target.value})} /></div>
                  <div><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Celular</label><input className="input-field" value={contactForm.celular || ''} onChange={e => setContactForm({...contactForm, celular: e.target.value})} /></div>
                </div>
              </section>

              <section>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>Preferencias</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Idioma</label>
                    <select className="input-field" value={contactForm.idioma} onChange={e => setContactForm({...contactForm, idioma: e.target.value})}><option value="es">Español</option><option value="en">Inglés</option><option value="pt">Portugués</option></select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Medio preferido</label>
                    <input className="input-field" placeholder="Ej: Correo, WhatsApp" value={contactForm.medio_preferido || ''} onChange={e => setContactForm({...contactForm, medio_preferido: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={contactForm.recibir_comunicaciones} onChange={e => setContactForm({...contactForm, recibir_comunicaciones: e.target.checked})} />
                    <label style={{ fontSize: '0.85rem' }}>Desea recibir comunicaciones y encuestas</label>
                  </div>
                </div>
              </section>

              <section>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>Roles del Cliente</h4>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={contactForm.es_principal} onChange={e => setContactForm({...contactForm, es_principal: e.target.checked})} /><span style={{ fontSize: '0.85rem' }}>Principal</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={contactForm.es_tecnico} onChange={e => setContactForm({...contactForm, es_tecnico: e.target.checked})} /><span style={{ fontSize: '0.85rem' }}>Técnico</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={contactForm.es_administrativo} onChange={e => setContactForm({...contactForm, es_administrativo: e.target.checked})} /><span style={{ fontSize: '0.85rem' }}>Administrativo</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={contactForm.es_comercial} onChange={e => setContactForm({...contactForm, es_comercial: e.target.checked})} /><span style={{ fontSize: '0.85rem' }}>Comercial</span></div>
                </div>
              </section>
              
              <section>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>Observaciones</h4>
                <textarea className="input-field" rows={2} value={contactForm.notas_relacionamiento || ''} onChange={e => setContactForm({...contactForm, notas_relacionamiento: e.target.value})}></textarea>
              </section>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button onClick={() => setIsContactModalOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSaveContact} style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Guardar</button>
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
"""
content = content.replace("    </div>\n  );\n}", modal_jsx + "    </div>\n  );\n}")

# REPLACE Stakeholders Tab rendering
old_stakeholders_tab = """      {activeTab === 'stakeholders' && (
        <Card noPadding>
          {contacts.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No hay contactos registrados.</div>
          ) : (
            <DataTable columns={contactColumns} data={contacts} />
          )}
        </Card>
      )}"""
new_stakeholders_tab = """      {activeTab === 'stakeholders' && (
        <Card noPadding>
          <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Filtro:</label>
              <select className="input-field" style={{ width: '150px', padding: '6px 12px' }} value={stakeholderFilter} onChange={e => setStakeholderFilter(e.target.value)}>
                <option value="Todos">Todos</option>
                <option value="Activos">Activos</option>
                <option value="Inactivos">Inactivos</option>
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
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No hay contactos encontrados con el filtro actual.</div>
          ) : (
            <DataTable columns={contactColumns} data={filteredContacts} />
          )}
        </Card>
      )}"""
content = content.replace(old_stakeholders_tab, new_stakeholders_tab)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Injected UI code successfully!")
