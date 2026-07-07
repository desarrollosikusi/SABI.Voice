import React from 'react';
import Image from 'next/image';

type SabiWelcomeProps = {
  message: string;
  subMessage?: string;
  title?: string;
  customerName?: string;
  contactName?: string;
  logoUrl?: string;
  isLogin?: boolean;
};

export default function SabiWelcome({
  message,
  subMessage,
  title = 'SABI te acompaña',
  customerName,
  contactName,
  logoUrl,
  isLogin = false
}: SabiWelcomeProps) {
  const getFullLogoUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${baseUrl}${url}`;
  };

  if (isLogin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 600 }}>
        <div style={{ position: 'relative', width: 450, height: 450, marginBottom: 24 }}>
          <Image src="/sabi.png" alt="SABI Asistente" fill style={{ objectFit: 'contain', transform: 'scale(1.15)' }} priority sizes="450px" />
        </div>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: 16 }}>
          Hola, soy <span style={{ color: 'var(--primary)' }}>SABI.</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: 1.6 }}>
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="saas-card" style={{ display: 'flex', alignItems: 'center', padding: '24px 32px', gap: 32, marginBottom: 32, borderLeft: '4px solid var(--primary)', justifyContent: 'space-between' }}>
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
      {(customerName || logoUrl) && (
        <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'flex-end', paddingLeft: 32, borderLeft: '1px solid var(--surface-border)', minWidth: 280 }}>
          {logoUrl ? (
            <div style={{ position: 'relative', width: 280, height: 140 }}>
               <img src={getFullLogoUrl(logoUrl)} alt={`Logo de ${customerName}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 280, height: 140, backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', border: '1px dashed var(--surface-border)' }}>
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
