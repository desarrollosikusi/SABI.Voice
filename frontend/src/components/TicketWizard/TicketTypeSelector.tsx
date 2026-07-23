import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface Category {
  id: number;
  code: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  form_schema?: {
    ui_features?: string[];
    ui_footer?: string;
    ui_badge?: string;
    ui_button_text?: string;
  };
}

interface Props {
  categories: Category[];
  onSelect: (code: string, id: number) => void;
  onClose?: () => void;
}

const renderIcon = (iconName: string, size: number = 24, color: string = 'currentColor') => {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.FileText;
  return <Icon size={size} color={color} />;
};

export default function TicketTypeSelector({ categories, onSelect, onClose }: Props) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Helper to adjust color opacity for borders/backgrounds (assuming hex color)
  const getOpacifiedColor = (color: string, opacity: string) => {
    if (color.startsWith('#') && color.length === 7) {
      return `${color}${opacity}`;
    }
    return color; // Fallback
  };

  return (
    <div style={{ padding: '40px', maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            padding: 8
          }}
          aria-label="Cerrar"
        >
          <LucideIcons.X size={24} />
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
        <LucideIcons.Sparkles size={24} color="var(--primary)" style={{ opacity: 0.6 }} />
        <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0 }}>
          ¿Qué <span style={{ color: 'var(--primary)' }}>tipo de ticket</span> deseas crear?
        </h2>
        <LucideIcons.Sparkles size={24} color="var(--primary)" style={{ opacity: 0.6 }} />
      </div>

      <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 48 }}>
        Selecciona el tipo de solicitud que deseas registrar. Dependiendo de la opción elegida, el sistema mostrará el formulario correspondiente.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        {categories.map((cat) => {
          const isHovered = hoveredCard === cat.id;
          const bgOpacity = getOpacifiedColor(cat.color, '15');
          const borderOpacity = getOpacifiedColor(cat.color, '40');

          return (
            <div 
              key={cat.id}
              onClick={() => onSelect(cat.code, cat.id)}
              onMouseEnter={() => setHoveredCard(cat.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ 
                backgroundColor: '#ffffff', 
                border: `2px solid ${isHovered ? cat.color : '#e2e8f0'}`, 
                borderRadius: '16px', 
                padding: '40px 32px 32px', 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isHovered ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              {cat.form_schema?.ui_badge && (
                <div style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  backgroundColor: getOpacifiedColor(cat.color, '20'),
                  color: cat.color,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}>
                  {cat.form_schema.ui_badge}
                </div>
              )}

              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                backgroundColor: bgOpacity !== cat.color ? bgOpacity : '#f1f5f9',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 24,
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  inset: -6, 
                  border: `1px dashed ${borderOpacity !== cat.color ? borderOpacity : '#cbd5e1'}`, 
                  borderRadius: '50%',
                  animation: isHovered ? 'spin 10s linear infinite' : 'none'
                }} />
                {renderIcon(cat.icon || 'FileText', 40, cat.color)}
              </div>

              <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: 12, marginTop: 0 }}>{cat.name}</h3>
              <div style={{ width: 40, height: 4, backgroundColor: cat.color, borderRadius: 2, marginBottom: 20 }} />

              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 24, flexGrow: 1 }}>
                {cat.description}
              </p>

              {cat.form_schema?.ui_features && cat.form_schema.ui_features.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', width: '100%', textAlign: 'left' }}>
                  {cat.form_schema.ui_features.map((feature, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                      <LucideIcons.Check size={18} color={cat.color} style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ lineHeight: 1.4 }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              <button 
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '8px', 
                  backgroundColor: isHovered ? cat.color : 'transparent', 
                  color: isHovered ? '#fff' : cat.color, 
                  border: `2px solid ${cat.color}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: cat.form_schema?.ui_footer ? 16 : 0
                }}
              >
                {cat.form_schema?.ui_button_text || 'Continuar'}
              </button>

              {cat.form_schema?.ui_footer && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <LucideIcons.ShieldCheck size={14} />
                  <span>{cat.form_schema.ui_footer}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ 
        marginTop: 48, 
        backgroundColor: '#f8fafc', 
        borderRadius: 12, 
        padding: '20px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #e2e8f0',
        textAlign: 'left',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
          <div style={{ backgroundColor: '#fef08a', padding: 8, borderRadius: '50%', display: 'flex' }}>
            <LucideIcons.Lightbulb size={20} color="#ca8a04" />
          </div>
          <span style={{ fontSize: '0.95rem' }}>¿No estás seguro? Elige la opción que mejor se adapte a tu necesidad.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
          <LucideIcons.Headphones size={20} />
          <span style={{ fontSize: '0.95rem' }}>¿Necesitas ayuda? Ver guía rápida</span>
        </div>
      </div>
      
      <style>
        {`
          @keyframes spin {
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}
