'use client';
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';

export default function MiPerfil() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  // Editable fields allowed
  const [formData, setFormData] = useState({
    name: '',
    apellidos: '',
    cargo: '',
    area: '',
    email: '',
    phone: '',
    celular: '',
    fecha_nacimiento: '',
    idioma: '',
    medio_preferido: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.getCustomerMe();
      setProfile(data);
      setFormData({
        name: data.name || '',
        apellidos: data.apellidos || '',
        cargo: data.cargo || '',
        area: data.area || '',
        email: data.email || '',
        phone: data.phone || '',
        celular: data.celular || '',
        fecha_nacimiento: data.fecha_nacimiento || '',
        idioma: data.idioma || 'es',
        medio_preferido: data.medio_preferido || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    try {
      const payload: any = { ...formData };
      if (!payload.fecha_nacimiento) {
        payload.fecha_nacimiento = null;
      }
      
      await api.updateCustomerMe(payload);
      setSuccess('Perfil actualizado exitosamente.');
      
      // Update local storage name if it was changed so the top bar updates too
      if (typeof window !== 'undefined') {
         localStorage.setItem('userName', `${formData.name} ${formData.apellidos}`.trim());
      }
    } catch (err: any) {
      console.error(err);
      alert('Hubo un error al actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 24 }}>Cargando perfil...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Mi Perfil</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Gestiona tu información personal y preferencias de contacto.</p>

      {success && (
        <div style={{ padding: 12, backgroundColor: '#dcfce3', color: '#166534', borderRadius: 8, marginBottom: 24 }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSave} style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: 12, marginBottom: 20 }}>Información Personal</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Nombre *</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Apellidos</label>
            <input type="text" value={formData.apellidos} onChange={e => setFormData({...formData, apellidos: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Cargo</label>
            <input type="text" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Área</label>
            <input type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Fecha de Cumpleaños</label>
            <input type="date" value={formData.fecha_nacimiento} onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})} style={inputStyle} />
          </div>
        </div>

        <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: 12, marginBottom: 20 }}>Información de Contacto</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Correo Electrónico *</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Teléfono Fijo</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Celular</label>
            <input type="text" value={formData.celular} onChange={e => setFormData({...formData, celular: e.target.value})} style={inputStyle} />
          </div>
        </div>

        <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: 12, marginBottom: 20 }}>Preferencias</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Idioma</label>
            <select value={formData.idioma} onChange={e => setFormData({...formData, idioma: e.target.value})} style={inputStyle}>
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Medio de Contacto Preferido</label>
            <select value={formData.medio_preferido} onChange={e => setFormData({...formData, medio_preferido: e.target.value})} style={inputStyle}>
              <option value="">Seleccione...</option>
              <option value="Correo">Correo Electrónico</option>
              <option value="Teléfono">Llamada Telefónica</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
          <button type="submit" disabled={saving} style={{
            padding: '10px 24px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1
          }}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid var(--surface-border)',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box' as const
};
