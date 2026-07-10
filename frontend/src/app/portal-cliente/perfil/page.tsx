'use client';
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import Image from 'next/image';

const CheckCircle2 = ({ size = 24, style }: any) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

const Save = ({ size = 24, style }: any) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8M7 3v5h8" />
  </svg>
);

const Building2 = ({ size = 24, style }: any) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12H4a2 2 0 00-2 2v8h20v-8a2 2 0 00-2-2h-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 12h4" />
  </svg>
);

const Briefcase = ({ size = 24, style }: any) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={style}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
  </svg>
);

const Mail = ({ size = 24, style }: any) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default function MiPerfil() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    try {
      const payload: any = { ...formData };
      if (!payload.fecha_nacimiento) {
        payload.fecha_nacimiento = null;
      }
      
      await api.updateCustomerMe(payload);
      toastSuccess('Perfil actualizado exitosamente.');
      
      // Update local storage name if it was changed so the top bar updates too
      if (typeof window !== 'undefined') {
         localStorage.setItem('userName', `${formData.name} ${formData.apellidos}`.trim());
      }
    } catch (err: any) {
      console.error(err);
      toastError(err.message || 'Hubo un error al actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 24 }}>Cargando perfil...</div>;
  }

  const fullName = `${profile?.name || formData.name} ${profile?.apellidos || formData.apellidos}`.trim();

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Hero Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '45% 20% 35%', 
        alignItems: 'center',
        gap: '24px',
        background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.05) 0%, rgba(var(--primary-rgb), 0.1) 100%)',
        borderRadius: '16px',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Columna Izquierda: Texto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
            Mi Perfil
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, maxWidth: '90%' }}>
            Mantén tu información actualizada para que podamos brindarte una mejor atención y mantener una comunicación oportuna contigo.
          </p>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: '#ECFDF5', 
            color: '#059669', 
            padding: '8px 16px', 
            borderRadius: '100px',
            fontWeight: 500,
            fontSize: '0.9rem',
            width: 'fit-content'
          }}>
            <CheckCircle2 size={18} />
            Tu información se almacena de forma segura
          </div>
        </div>

        {/* Columna Central: SABI */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: '220px', zIndex: 2 }}>
          <Image 
            src="/sabi-perfil.png" 
            alt="SABI" 
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        {/* Columna Derecha: Tarjeta Resumen */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', zIndex: 1 }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            width: '100%',
            maxWidth: '380px',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {fullName}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <Building2 size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{profile?.company?.name || 'Empresa no asignada'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <Briefcase size={16} style={{ color: 'var(--primary)' }} />
                <span>{formData.cargo || 'Cargo no definido'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <Mail size={16} style={{ color: 'var(--primary)' }} />
                <span>{formData.email}</span>
              </div>
            </div>

            <div style={{ 
              marginTop: '20px',
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: '#059669', 
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: '#ECFDF5',
              padding: '6px 12px',
              borderRadius: '6px',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={16} />
              Perfil sincronizado correctamente
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor del Formulario al 70-75% */}
      <div style={{ width: '75%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: Información Personal */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Información Personal</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Apellidos</label>
                <input type="text" value={formData.apellidos} onChange={e => setFormData({...formData, apellidos: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Cargo</label>
                <input type="text" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Área</label>
                <input type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Fecha de Cumpleaños</label>
                <input type="date" value={formData.fecha_nacimiento} onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Card 2: Información de Contacto */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Información de Contacto</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Correo Electrónico *</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Celular</label>
                <input type="text" value={formData.celular} onChange={e => setFormData({...formData, celular: e.target.value})} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Card 3: Preferencias */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Preferencias</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Idioma</label>
                <select value={formData.idioma} onChange={e => setFormData({...formData, idioma: e.target.value})} style={inputStyle}>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Medio de Contacto Preferido</label>
                <select value={formData.medio_preferido} onChange={e => setFormData({...formData, medio_preferido: e.target.value})} style={inputStyle}>
                  <option value="">Seleccione...</option>
                  <option value="Correo">Correo Electrónico</option>
                  <option value="Teléfono">Llamada Telefónica</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botón Guardar Cambios */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 600,
              width: 'fit-content'
            }}>
              <Save size={20} />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const cardStyle = {
  background: 'white', 
  padding: '32px', 
  borderRadius: '12px', 
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  border: '1px solid var(--surface-border)'
};

const cardTitleStyle = {
  fontSize: '1.2rem',
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '1px solid var(--surface-border)'
};

const labelStyle = {
  display: 'block', 
  marginBottom: '8px', 
  fontSize: '0.9rem', 
  fontWeight: 600,
  color: 'var(--text-secondary)'
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '1px solid var(--surface-border)',
  borderRadius: '8px',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box' as const,
  backgroundColor: '#F9FAFB',
  color: 'var(--text-primary)',
  transition: 'border-color 0.2s ease'
};
