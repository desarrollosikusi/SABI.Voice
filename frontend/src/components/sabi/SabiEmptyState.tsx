import React from 'react';
import Image from 'next/image';

type SabiEmptyStateProps = {
  message: string;
  subMessage?: string;
};

export default function SabiEmptyState({ message, subMessage }: SabiEmptyStateProps) {
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
