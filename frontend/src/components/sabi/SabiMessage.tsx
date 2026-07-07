import React from 'react';
import Image from 'next/image';
import Card from '../ui/Card';

type SabiMessageProps = {
  title?: string;
  message: string;
  subMessage?: string;
};

export default function SabiMessage({
  title = 'SABI te acompaña',
  message,
  subMessage
}: SabiMessageProps) {
  return (
    <Card style={{ textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
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
    </Card>
  );
}
