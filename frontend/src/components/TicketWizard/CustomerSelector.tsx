import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';

export interface CustomerInfo {
  id: number;
  name: string;
}

interface Props {
  onSelect: (customer: CustomerInfo | null) => void;
  selectedCustomer: CustomerInfo | null;
}

export default function CustomerSelector({ onSelect, selectedCustomer }: Props) {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        // Strict validation: if blurred and no customer selected, clear input
        if (!selectedCustomer) {
          setSearch('');
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef, selectedCustomer]);

  useEffect(() => {
    if (search.length >= 2) {
      setIsLoading(true);
      setShowDropdown(true);
      const handler = setTimeout(async () => {
        try {
          const res = await api.searchCustomers(search);
          setCustomers(res);
        } catch (e) {
          console.error("Error searching customers", e);
          setCustomers([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
      return () => clearTimeout(handler);
    } else {
      setCustomers([]);
      setShowDropdown(false);
      setIsLoading(false);
    }
  }, [search]);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Cliente *</label>
      {selectedCustomer ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <div className="input-field" style={{ flex: 1, minWidth: 0, width: '100%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedCustomer.name}
          </div>
          <button 
            type="button" 
            onClick={() => { onSelect(null); setSearch(''); }} 
            style={{ padding: '8px 16px', background: 'var(--danger)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', flexShrink: 0, fontWeight: 600, fontSize: '0.9rem' }}
          >
            Cambiar
          </button>
        </div>
      ) : (
        <>
          <input 
            required
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            onFocus={() => { if(search.length >= 2) setShowDropdown(true) }}
            className="input-field" 
            type="text" 
            placeholder="Buscar cliente por nombre o NIT..." 
            style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', outline: 'none' }}
          />
          {showDropdown && search.length >= 2 && (
            <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', marginTop: '4px', padding: 0, listStyle: 'none', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              {isLoading ? (
                <li style={{ padding: '12px 16px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 16, height: 16, border: '2px solid var(--surface-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Buscando clientes...
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </li>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <li key={c.id} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--surface-border)' }} 
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => { onSelect(c); setShowDropdown(false); }}>
                    {c.name}
                  </li>
                ))
              ) : (
                <li style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                  No se encontraron clientes registrados.
                </li>
              )}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
