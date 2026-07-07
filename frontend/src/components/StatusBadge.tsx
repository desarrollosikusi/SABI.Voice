import React from 'react';

type StatusBadgeProps = {
  status: string;
  type?: 'estado' | 'sla' | 'responsable';
};

export default function StatusBadge({ status, type = 'estado' }: StatusBadgeProps) {
  let bgColor = '#f1f5f9';
  let textColor = '#64748b';
  let borderColor = '#e2e8f0';

  if (type === 'estado') {
    if (status === 'Cerrado') {
      bgColor = '#ecfdf5';
      textColor = '#10b981';
      borderColor = '#a7f3d0';
    } else {
      bgColor = '#eff6ff';
      textColor = '#3b82f6';
      borderColor = '#bfdbfe';
    }
  }

  if (type === 'sla') {
    if (status === 'Vencido') {
      bgColor = '#fef2f2';
      textColor = '#ef4444';
      borderColor = '#fecaca';
    } else {
      bgColor = '#f0fdf4';
      textColor = '#22c55e';
      borderColor = '#bbf7d0';
    }
  }

  if (type === 'responsable') {
    if (status === 'IKUSI') {
      bgColor = '#eff6ff';
      textColor = '#3b82f6';
      borderColor = '#bfdbfe';
    } else {
      bgColor = '#fffbeb';
      textColor = '#f59e0b';
      borderColor = '#fde68a';
    }
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderRadius: '9999px',
      fontSize: '0.85rem',
      fontWeight: 600,
      backgroundColor: bgColor,
      color: textColor,
      border: `1px solid ${borderColor}`,
      whiteSpace: 'nowrap'
    }}>
      {status}
    </span>
  );
}
