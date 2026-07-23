import React from 'react';
import Image from 'next/image';

interface Props {
  title: string;
  description: string;
  customerName?: string;
  contactEmail?: string;
  hideCustomerBox?: boolean;
  children: React.ReactNode;
}

export default function TicketFormBase({ title, description, customerName, contactEmail, hideCustomerBox, children }: Props) {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
      
      {/* HERO */}
      <div className="saas-card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', padding: '32px 40px', gap: '48px', marginBottom: '40px', borderLeft: '4px solid var(--primary)', justifyContent: 'center' }}>
        <div style={{ flex: '4.5 1 280px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: '0 0 16px 0', lineHeight: 1.2 }}>{title}</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.6 }}>
            {description}
          </p>
        </div>

        <div style={{ flex: '2 1 260px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px', height: '300px', animation: 'float 6s ease-in-out infinite', mixBlendMode: 'darken' }}>
            <Image src="/sabi-hero.png" alt="SABI Asistente" fill style={{ objectFit: 'contain' }} priority sizes="300px" />
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
