import React from 'react';
import Image from 'next/image';

type SabiCompanionProps = {
  message: string;
  subMessage?: string;
  layout?: 'login' | 'dashboard' | 'detail' | 'empty';
  variant?: 'neutral' | 'success' | 'warning' | 'error';
  title?: string;
  customerName?: string;
  contactName?: string;
  logoUrl?: string;
};

export default function SabiCompanion({ 
  message, 
  subMessage, 
  layout = 'dashboard', 
  variant = 'neutral',
  title = 'SABI te acompaña',
  customerName,
  contactName,
  logoUrl
}: SabiCompanionProps) {
  
  // URL base para assets del backend (si logoUrl es relativo)
  const getFullLogoUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${baseUrl}${url}`;
  };

  // Layout para el LOGIN (Pantalla dividida, SABI grande)
  if (layout === 'login') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 600 }}>
        <div style={{ position: 'relative', width: 450, height: 450, marginBottom: 24 }}>
          <Image src="/sabi.png" alt="SABI Asistente" fill style={{ objectFit: 'contain', transform: 'scale(1.15)' }} priority sizes="450px" />
        </div>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: 16 }}>
          Hola, soy <span style={{ color: 'var(--primary)' }}>SABI.</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
          {message}
        </p>
      </div>
    );
  }

  // Layout para el DASHBOARD (Tarjeta horizontal superior 40/60)
  if (layout === 'dashboard') {
    return (
      <div className="saas-card" style={{ display: 'flex', alignItems: 'center', padding: '24px 32px', gap: 32, marginBottom: 32, borderLeft: '4px solid var(--primary)', justifyContent: 'space-between' }}>
        
        {/* Columna Izquierda (Mensaje y Contexto) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: '1 1 auto' }}>
          <div style={{ position: 'relative', width: 280, height: 280, flexShrink: 0 }}>
            <Image src="/sabi.png" alt="SABI Asistente" fill style={{ objectFit: 'contain', transform: 'scale(1.15)' }} priority sizes="280px" />
          </div>
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: 'var(--primary)' }}>
              {contactName ? `Hola, ${contactName} 👋` : title}
            </h2>
            <p style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)' }}>{message}</p>
            
            {customerName && (
              <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                Empresa: <strong style={{ color: 'var(--text-primary)' }}>{customerName}</strong>
              </p>
            )}
            
            {subMessage && (
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{subMessage}</p>
            )}
          </div>
        </div>

        {/* Columna Derecha (Identidad Corporativa) */}
        {(customerName || logoUrl) && (
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'flex-end', paddingLeft: 32, borderLeft: '1px solid #e2e8f0', minWidth: 280 }}>
            {logoUrl ? (
              <div style={{ position: 'relative', width: 280, height: 140 }}>
                 {/* Usamos img estándar para evitar problemas con next/image y dominios externos en un MVP */}
                 <img src={getFullLogoUrl(logoUrl)} alt={`Logo de ${customerName}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                width: 280, height: 140, backgroundColor: '#f8fafc', borderRadius: 8, color: '#64748b',
                border: '1px dashed #cbd5e1'
              }}>
                <span style={{ fontSize: '1.5rem', marginBottom: 4 }}>🏢</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.1, padding: '0 4px' }}>
                  {customerName?.substring(0, 15)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Layout para el DETALLE DE CASO (Tarjeta lateral)
  if (layout === 'detail') {
    return (
      <div className="saas-card" style={{ padding: 24, textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary)', fontSize: '1.1rem' }}>{title}</h3>
        <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 16px auto' }}>
          <Image src="/sabi.png" alt="SABI Asistente" fill style={{ objectFit: 'contain' }} sizes="100px" />
        </div>
        <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
          {message}
        </p>
        {subMessage && (
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {subMessage}
          </p>
        )}
      </div>
    );
  }

  // Layout para ESTADOS VACÍOS (Centrado en contenedores)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 40 }}>
      <div style={{ position: 'relative', width: 150, height: 150, marginBottom: 24, opacity: 0.9 }}>
        <Image src="/sabi.png" alt="SABI Asistente" fill style={{ objectFit: 'contain' }} sizes="150px" />
      </div>
      <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
        {message}
      </p>
      {subMessage && (
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {subMessage}
        </p>
      )}
    </div>
  );
}
