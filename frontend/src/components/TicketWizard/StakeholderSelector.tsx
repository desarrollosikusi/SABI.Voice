import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';

interface StakeholderInfo {
  id: number;
  name: string;
  email: string;
}

interface Props {
  customerId: number | undefined;
  onSelect: (stakeholder: StakeholderInfo | null) => void;
  selectedStakeholder: StakeholderInfo | null;
  label?: string;
}

export default function StakeholderSelector({ customerId, onSelect, selectedStakeholder, label = "Stakeholder que reporta *" }: Props) {
  const [contacts, setContacts] = useState<StakeholderInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerId) {
      setLoading(true);
      api.getCustomerContacts(customerId).then(res => {
        setContacts(res);
      }).catch(e => {
        console.error("Error fetching contacts", e);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setContacts([]);
      onSelect(null);
    }
  }, [customerId]);

  return (
    <div style={{ width: '100%' }}>
      <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>{label}</label>
      <select 
        required 
        className="input-field" 
        style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', outline: 'none', backgroundColor: !customerId ? '#f1f5f9' : '#fff' }}
        value={selectedStakeholder?.id || ''} 
        onChange={(e) => {
          const contact = contacts.find(c => c.id.toString() === e.target.value);
          onSelect(contact || null);
        }}
        disabled={!customerId || loading}
      >
        <option value="" disabled>
          {!customerId ? 'Seleccione primero un cliente' : loading ? 'Cargando contactos...' : 'Seleccione un contacto'}
        </option>
        {contacts.map((c) => (
          <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
        ))}
      </select>
    </div>
  );
}
