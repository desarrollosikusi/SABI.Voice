import React from 'react';
import * as Icons from 'lucide-react';

export type BadgeVariant = 'solid' | 'subtle' | 'outline';

export type BadgeProps = {
  children: React.ReactNode;
  color?: string;
  icon?: string;
  variant?: BadgeVariant;
  className?: string;
};

export default function Badge({ 
  children, 
  color = 'var(--color-primary)', 
  icon, 
  variant = 'subtle',
  className = ''
}: BadgeProps) {
  
  // Resolve Icon component if provided
  let IconComponent = null;
  if (icon && (Icons as any)[icon]) {
    IconComponent = (Icons as any)[icon];
  }

  // Define styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'solid':
        return {
          backgroundColor: color,
          color: '#ffffff',
          border: `1px solid ${color}`
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: color,
          border: `1px solid ${color}`
        };
      case 'subtle':
      default:
        // Attempt to create a translucent background for subtle variant
        // Since color could be a CSS variable or hex, we'll try to append opacity if it's hex,
        // or just rely on a default fallback if complex. For hex colors (e.g. #10b981), + '20' works in modern browsers.
        // If it's a CSS variable, we can't easily append opacity without color-mix.
        // We'll use color-mix for modern support.
        return {
          backgroundColor: color.startsWith('#') ? `${color}20` : `color-mix(in srgb, ${color} 15%, transparent)`,
          color: color,
          border: `1px solid ${color.startsWith('#') ? `${color}40` : `color-mix(in srgb, ${color} 30%, transparent)`}`
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <span 
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: 'var(--radius-xl)',
        fontSize: 'var(--font-secondary)',
        fontWeight: 600,
        lineHeight: 1.2,
        ...variantStyles
      }}
    >
      {IconComponent && <IconComponent size={14} color={variant === 'solid' ? '#ffffff' : color} />}
      {children}
    </span>
  );
}
