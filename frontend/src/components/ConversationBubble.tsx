import React from 'react';
import Card from '@/components/ui/Card';

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
          {(() => {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const regex = /\[([^\]]+)\]\(ATTACHMENT:(\d+):(\d+)\)/g;
            const parts = [];
            let lastIndex = 0;
            let match;
            while ((match = regex.exec(message)) !== null) {
              if (match.index > lastIndex) {
                parts.push(message.substring(lastIndex, match.index));
              }
              const url = `${API_URL}/pqrsf/${match[2]}/attachments/${match[3]}/download`;
              parts.push(
                <a key={match.index} href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}>
                  {match[1]}
                </a>
              );
              lastIndex = regex.lastIndex;
            }
            if (lastIndex < message.length) {
              parts.push(message.substring(lastIndex));
            }
            return parts.length > 0 ? parts : message;
          })()}
        </div>
      </Card>
    </div>
  );
}
