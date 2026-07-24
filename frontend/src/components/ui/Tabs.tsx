import React from 'react';
import * as Icons from 'lucide-react';

export type TabItem = {
  id: string;
  label: string;
  count?: number;
  icon?: string;
  color?: string; // Optional color for the text/icon when active
};

export type TabsProps = {
  tabs?: TabItem[];
  activeTab?: string;
  
  // Legacy support for internal portal
  options?: { value: string; label: string }[];
  value?: string;
  
  onChange: (tabId: string) => void;
};

export default function Tabs({ tabs, activeTab, options, value, onChange }: TabsProps) {
  const finalTabs: TabItem[] = tabs || (options ? options.map(o => ({ id: o.value, label: o.label })) : []);
  const finalActiveTab = activeTab || value || '';
  return (
    <div style={{ 
      display: 'flex', 
      gap: '8px', 
      padding: '0 24px 16px 24px', 
      overflowX: 'auto',
      borderBottom: '1px solid var(--surface-border)',
      backgroundColor: 'var(--surface-color)',
      paddingTop: '16px'
    }}>
      {finalTabs.map(tab => {
        const isActive = finalActiveTab === tab.id;
        
        let IconComponent = null;
        if (tab.icon && (Icons as any)[tab.icon]) {
          IconComponent = (Icons as any)[tab.icon];
        }

        const activeColor = tab.color || 'var(--color-primary)';
        const bgColor = isActive ? `${activeColor}15` : 'transparent';
        const textColor = isActive ? activeColor : 'var(--text-secondary)';

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: bgColor,
              color: textColor,
              fontWeight: isActive ? 600 : 500,
              borderRadius: 'var(--radius-xl)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'var(--surface-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            {IconComponent && <IconComponent size={16} />}
            {tab.label}
            {tab.count !== undefined && (
              <span style={{ 
                backgroundColor: isActive ? `${activeColor}30` : 'var(--surface-border)',
                color: isActive ? activeColor : 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginLeft: '4px'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
