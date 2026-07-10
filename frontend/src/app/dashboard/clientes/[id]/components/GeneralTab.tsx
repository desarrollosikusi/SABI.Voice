import React, { useState, useRef } from 'react';
import Card from '@/components/ui/Card';
import { api } from '@/services/api';
import { formatDocument } from '@/utils/formatters';
import { useToast } from '@/contexts/ToastContext';

interface GeneralTabProps {
  cliente: any;
  sectors: any[];
  users: any[];
  onUpdate: (updatedCliente: any) => void;
}

export default function GeneralTab({ cliente, sectors, users, onUpdate }: GeneralTabProps) {
  const { success, error: toastError, warning } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: cliente.name || '',
    razon_social: cliente.razon_social || '',
    nit: cliente.nit || '',
    estado: cliente.estado || 'Activo',
    ciudad: cliente.ciudad || '',
    pais: cliente.pais || '',
    direccion_principal: cliente.direccion_principal || '',
    pagina_web: cliente.pagina_web || '',
    telefono_principal: cliente.telefono_principal || '',
    fecha_alta_comercial: cliente.fecha_alta_comercial || '',
    economic_sector_id: cliente.economic_sector_id || '',
    pm_id: cliente.pm_id || '',
    sdm_id: cliente.sdm_id || '',
    ejecutivo_cuenta_id: cliente.ejecutivo_cuenta_id || '',
    notas_relacionamiento: cliente.notas_relacionamiento || ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '-';

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name) {
      return warning("El nombre del cliente es obligatorio.");
    }
    setIsSaving(true);
    try {
      const payload = { ...formData };
      ['economic_sector_id', 'pm_id', 'sdm_id', 'ejecutivo_cuenta_id'].forEach(key => {
        if (!payload[key as keyof typeof payload]) (payload as any)[key] = null;
        else (payload as any)[key] = Number((payload as any)[key]);
      });
      if (!payload.fecha_alta_comercial) payload.fecha_alta_comercial = null as any;

      let updated = await api.updateCustomerAdmin(cliente.id, payload);
      
      if (logoFile) {
        try {
          const resp = await api.uploadCustomerLogo(cliente.id, logoFile);
          updated = { ...updated, logo_path: resp.logo_path };
        } catch (err: any) {
          toastError(err.message || "Error al subir logo");
        }
      }

      onUpdate(updated);
      success('Cambios guardados correctamente.');
      setIsEditing(false);
      setLogoFile(null);
      setLogoPreview(null);
    } catch (e: any) {
      toastError(e.message || "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      if (!isEditing) setIsEditing(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {!isEditing ? (
          <button 
            className="btn-primary" 
            onClick={() => setIsEditing(true)}
            style={{ width: 'fit-content', padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            ✎ Editar información
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => {
                setIsEditing(false);
                setLogoFile(null);
                setLogoPreview(null);
                setFormData({
                  name: cliente.name || '',
                  razon_social: cliente.razon_social || '',
                  nit: cliente.nit || '',
                  estado: cliente.estado || 'Activo',
                  ciudad: cliente.ciudad || '',
                  pais: cliente.pais || '',
                  direccion_principal: cliente.direccion_principal || '',
                  pagina_web: cliente.pagina_web || '',
                  telefono_principal: cliente.telefono_principal || '',
                  fecha_alta_comercial: cliente.fecha_alta_comercial || '',
                  economic_sector_id: cliente.economic_sector_id || '',
                  pm_id: cliente.pm_id || '',
                  sdm_id: cliente.sdm_id || '',
                  ejecutivo_cuenta_id: cliente.ejecutivo_cuenta_id || '',
                  notas_relacionamiento: cliente.notas_relacionamiento || ''
                });
              }} 
              style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Cancelar
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSave} 
              disabled={isSaving}
              style={{ width: 'fit-content', padding: '8px 16px', fontSize: '0.85rem' }}
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <Card>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Datos Comerciales</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Actividad Económica</div><div style={{ fontWeight: 500 }}>{cliente.economic_sector?.name || cliente.sector || '-'}</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ciudad / País</div><div style={{ fontWeight: 500 }}>{cliente.ciudad ? `${cliente.ciudad}, ${cliente.pais}` : '-'}</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fecha Alta Comercial</div><div style={{ fontWeight: 500 }}>{formatDate(cliente.fecha_alta_comercial)}</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Página Web</div><div style={{ fontWeight: 500 }}>{cliente.pagina_web || '-'}</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Notas de Relacionamiento</div><div style={{ fontWeight: 500 }}>{cliente.notas_relacionamiento || '-'}</div></div>
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
        </div>
      ) : (
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
                  {logoPreview ? (
                    <img src={logoPreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Logo Preview" />
                  ) : cliente.logo_path ? (
                    <img src={`http://localhost:8000${cliente.logo_path}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Logo" />
                  ) : <span style={{ color: 'var(--text-secondary)' }}>Sin logo</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/jpeg,image/png,image/svg+xml" onChange={handleLogoUpload} />
                  <button className="btn-primary" type="button" onClick={() => fileInputRef.current?.click()} style={{ marginBottom: 8 }}>
                    {logoPreview || cliente.logo_path ? 'Cambiar logo' : 'Subir nuevo logo'}
                  </button>
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
      )}
    </div>
  );
}
