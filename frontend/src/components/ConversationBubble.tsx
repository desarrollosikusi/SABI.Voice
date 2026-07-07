import React from 'react';
import Card from './Card';

type ConversationBubbleProps = {
  isIkusi: boolean;
  senderName: string;
  date: string;
  message: string;
  icon?: React.ReactNode;
};

export default function ConversationBubble({ isIkusi, senderName, date, message, icon }: ConversationBubbleProps) {
  return (
    <div style={{ display: 'flex', gap: 24, position: 'relative', zIndex: 1 }}>
      <div style={{ 
        width: 48, 
        height: 48, 
        borderRadius: '50%', 
        backgroundColor: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        border: `2px solid ${isIkusi ? '#10b981' : '#3b82f6'}`, 
        flexShrink: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <span style={{ fontSize: '1.2rem' }}>{icon || (isIkusi ? '🎧' : '👤')}</span>
      </div>
      <Card 
        style={{ 
          flexGrow: 1, 
          padding: 20, 
          borderColor: isIkusi ? '#a7f3d0' : '#bfdbfe',
          backgroundColor: isIkusi ? '#f0fdf4' : '#eff6ff'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <strong style={{ color: isIkusi ? '#059669' : '#1d4ed8', fontSize: '0.95rem' }}>
            {senderName}
          </strong>
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
            {date}
          </span>
        </div>
        <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>
          {message}
        </div>
      </Card>
    </div>
  );
}
