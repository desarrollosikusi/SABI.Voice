'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/services/api';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
import DataTable from '@/components/ui/DataTable';
import { formatDocument } from '@/utils/formatters';
import ContractsTab from './components/ContractsTab';

export default function ClienteDetail() {
  const params = useParams();
  const router = useRouter();
  const [cliente, setCliente] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  // Stakeholder Modal States
  const [stakeholderFilter, setStakeholderFilter] = useState('Activos');
  const [roleFilter, setRoleFilter] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactModalTab, setContactModalTab] = useState('general');
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contactForm, setContactForm] = useState<any>({});
  const [deactivateForm, setDeactivateForm] = useState({ reporter: '', support: '' });

  const [saveMessage, setSaveMessage] = useState('');
  
  const [formData, setFormData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.id) {
      loadData(params.id as string);
    }
  }, [params.id]);

  const loadData = async (id: string) => {
    setLoading(true);
    try {
      const [clienteData, contactsData, sectorsData, usersData] = await Promise.all([
        api.getAdminCustomerById(id),
        api.getCustomerContacts(Number(id)),
        api.getEconomicSectors().catch(() => []),
        api.getInternalUsers().catch(() => [])
      ]);
      setCliente(clienteData);
      setContacts(contactsData);
      setSectors(sectorsData);
      setUsers([...usersData].sort((a: any, b: any) => a.name.localeCompare(b.name)));
      
      setFormData({
        name: clienteData.name || '',
        razon_social: clienteData.razon_social || '',
        nit: clienteData.nit || '',
        estado: clienteData.estado || 'Activo',
        ciudad: clienteData.ciudad || '',
        pais: clienteData.pais || '',
        direccion_principal: clienteData.direccion_principal || '',
        pagina_web: clienteData.pagina_web || '',
        telefono_principal: clienteData.telefono_principal || '',
        fecha_alta_comercial: clienteData.fecha_alta_comercial || '',
        economic_sector_id: clienteData.economic_sector_id || '',
        pm_id: clienteData.pm_id || '',
        sdm_id: clienteData.sdm_id || '',
        ejecutivo_cuenta_id: clienteData.ejecutivo_cuenta_id || '',
        notas_relacionamiento: clienteData.notas_relacionamiento || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert("El nombre del cliente es obligatorio.");
      return;
    }
    setIsSaving(true);
    setSaveMessage('');
    try {
      const payload = { ...formData };
      ['economic_sector_id', 'pm_id', 'sdm_id', 'ejecutivo_cuenta_id'].forEach(key => {
        if (!payload[key]) payload[key] = null;
        else payload[key] = Number(payload[key]);
      });
      if (!payload.fecha_alta_comercial) payload.fecha_alta_comercial = null;

      const updated = await api.updateCustomerAdmin(cliente.id, payload);
      setCliente(updated);
      setSaveMessage('Cambios guardados correctamente.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (e: any) {
      alert("Error al guardar: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const resp = await api.uploadCustomerLogo(cliente.id, file);
        setCliente({ ...cliente, logo_path: resp.logo_path });
        setSaveMessage('Logo actualizado exitosamente.');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (err: any) {
        alert("Error al subir logo: " + err.message);
      }
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Cargando detalles del cliente...</div>;
  }

  if (!cliente) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Cliente no encontrado</div>;
  }


  // Contact Handlers
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
      loadData(params.id as string); // Refresh data
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
        api.reactivateContact(contact.id).then(() => loadData(params.id as string)).catch((e:any) => alert(e.message));
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
      loadData(params.id as string);
    } catch (err: any) {
      alert(err.message || 'Error inactivando contacto');
    }
  };

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

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '-';

  const tabOptions = [
    { value: 'general', label: 'Información General' },
    { value: 'tecnica', label: 'Información Técnica' },
    { value: 'stakeholders', label: `Stakeholders (${contacts.length})` },
    { value: 'contratos', label: 'Contratos en Curso' },
    { value: 'administracion', label: 'Administración' }
  ];

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
    { key: 'ultima_interaccion', label: 'Última Interacción', render: () => '-' },
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

  return (
    <div>
      <PageHeader 
        title={cliente.name}
        description={cliente.economic_sector?.name || cliente.sector || 'Sin sector'}
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Clientes IKUSI', href: '/dashboard/clientes' }, { label: cliente.name }]}
      />

      <Card style={{ marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 600 }}>{cliente.name}</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>NIT: {formatDocument(cliente.nit) || 'No registrado'}</p>
        </div>
        
        {cliente.logo_path ? (
          <img src={`http://localhost:8000${cliente.logo_path}`} alt={cliente.name} style={{ width: 140, height: 60, borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
        ) : (
          <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 'bold', color: 'var(--text-secondary)' }}>
            {cliente.name.substring(0, 2).toUpperCase()}
          </div>
        )}
      </Card>

      <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--surface-border)' }}>
        <Tabs value={activeTab} onChange={setActiveTab} options={tabOptions} />
      </div>

      {activeTab === 'general' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <Card>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Datos Comerciales</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Actividad Económica</div><div style={{ fontWeight: 500 }}>{cliente.economic_sector?.name || cliente.sector || '-'}</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ciudad / País</div><div style={{ fontWeight: 500 }}>{cliente.ciudad ? `${cliente.ciudad}, ${cliente.pais}` : '-'}</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fecha Alta Comercial</div><div style={{ fontWeight: 500 }}>{formatDate(cliente.fecha_alta_comercial)}</div></div>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Equipo Asignado</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Account Manager (AM)</div><div style={{ fontWeight: 500 }}>{cliente.ejecutivo_cuenta?.name || '-'}</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Project Manager (PM)</div><div style={{ fontWeight: 500 }}>{cliente.pm?.name || '-'}</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Service Delivery Manager (SDM)</div><div style={{ fontWeight: 500 }}>{cliente.sdm?.name || '-'}</div></div>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Métricas de Relacionamiento</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nivel de Cercanía Global</div><div style={{ fontWeight: 500, color: 'var(--primary)' }}>{cliente.relationship_score || 0}%</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Casos Activos</div><div style={{ fontWeight: 500, color: 'var(--warning)' }}>{cliente.open_cases || 0} Casos</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Stakeholders Identificados</div><div style={{ fontWeight: 500 }}>{contacts.length} Contactos</div></div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'stakeholders' && (
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
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No hay contactos encontrados con el filtro actual.</div>
          ) : (
            <DataTable columns={contactColumns} data={filteredContacts} />
          )}
        </Card>
      )}
      {activeTab === 'tecnica' && (
        <Card>
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Información Técnica</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: 500, marginInline: 'auto' }}>
              En futuras iteraciones, esta pestaña mostrará los detalles de infraestructura, servicios contratados, versiones de software, topologías y configuraciones específicas de la red de {cliente.name}.
            </p>
          </div>
        </Card>
      )}

      {activeTab === 'contratos' && (
        <ContractsTab customerId={Number(cliente.id)} />
      )}

      {activeTab === 'administracion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {saveMessage && (
            <div style={{ padding: 16, backgroundColor: '#dcfce7', color: '#166534', borderRadius: 8, fontWeight: 500 }}>
              {saveMessage}
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <Card>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Información General</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Nombre Comercial</label>
                  <input className="input-field" name="name" value={formData.name || ''} onChange={handleInputChange} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Razón Social</label>
                  <input className="input-field" name="razon_social" value={formData.razon_social || ''} onChange={handleInputChange} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>NIT</label>
                    <input className="input-field" name="nit" value={formatDocument(formData.nit) || ''} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Estado</label>
                    <select className="input-field" name="estado" value={formData.estado || ''} onChange={handleInputChange}>
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Ciudad</label>
                    <input className="input-field" name="ciudad" value={formData.ciudad || ''} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>País</label>
                    <input className="input-field" name="pais" value={formData.pais || ''} onChange={handleInputChange} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Dirección Principal</label>
                  <input className="input-field" name="direccion_principal" value={formData.direccion_principal || ''} onChange={handleInputChange} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Página Web</label>
                    <input className="input-field" name="pagina_web" value={formData.pagina_web || ''} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Teléfono Principal</label>
                    <input className="input-field" name="telefono_principal" value={formData.telefono_principal || ''} onChange={handleInputChange} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Fecha Alta Comercial</label>
                    <input type="date" className="input-field" name="fecha_alta_comercial" value={formData.fecha_alta_comercial || ''} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Actividad Económica</label>
                    <select className="input-field" name="economic_sector_id" value={formData.economic_sector_id || ''} onChange={handleInputChange}>
                      <option value="">Seleccione sector...</option>
                      {sectors.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Card>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Equipo Responsable IKUSI</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Project Manager (PM)</label>
                    <select className="input-field" name="pm_id" value={formData.pm_id || ''} onChange={handleInputChange}>
                      <option value="">No asignado</option>
                      {users.filter((u:any) => u.job_title === 'PM').map((u:any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Service Delivery Manager (SDM)</label>
                    <select className="input-field" name="sdm_id" value={formData.sdm_id || ''} onChange={handleInputChange}>
                      <option value="">No asignado</option>
                      {users.filter((u:any) => u.job_title === 'SDM').map((u:any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Account Manager (AM)</label>
                    <select className="input-field" name="ejecutivo_cuenta_id" value={formData.ejecutivo_cuenta_id || ''} onChange={handleInputChange}>
                      <option value="">No asignado</option>
                      {users.filter((u:any) => u.job_title === 'AM').map((u:any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                </div>
              </Card>
              
              <Card>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Logo del Cliente</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 80, height: 80, backgroundColor: 'var(--surface-hover)', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cliente.logo_path ? (
                      <img src={`http://localhost:8000${cliente.logo_path}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Logo" />
                    ) : <span style={{ color: 'var(--text-secondary)' }}>Sin logo</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/jpeg,image/png,image/svg+xml" onChange={handleLogoUpload} />
                    <button className="btn-primary" type="button" onClick={() => fileInputRef.current?.click()} style={{ marginBottom: 8 }}>Subir nuevo logo</button>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Formatos: JPG, PNG, SVG. Máx 5MB.</div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Notas de Relacionamiento</h3>
                <textarea 
                  className="input-field" 
                  name="notas_relacionamiento" 
                  value={formData.notas_relacionamiento || ''} 
                  onChange={handleInputChange} 
                  rows={4}
                  placeholder="Horarios preferidos, restricciones, contactos habituales..."
                  style={{ resize: 'vertical' }}
                />
              </Card>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--surface-border)' }}>
            <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      )}

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
                    <div><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Teléfono Fijo</label><input className="input-field" value={contactForm.phone || ''} onChange={e => setContactForm({...contactForm, phone: e.target.value})} /></div>
                    <div><label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Celular</label><input className="input-field" value={contactForm.celular || ''} onChange={e => setContactForm({...contactForm, celular: e.target.value})} /></div>
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
