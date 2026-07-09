'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';

export default function ContractDetail() {
  const params = useParams();
  const router = useRouter();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.contractId) {
      loadContract(params.contractId as string);
    }
  }, [params.contractId]);

  const loadContract = async (id: string) => {
    try {
      const data = await api.getContractDetails(id);
      setContract(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Cargando contrato...</div>;
  }

  if (!contract) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h3>Contrato no encontrado</h3>
        <button onClick={() => router.back()} className="btn-primary" style={{ marginTop: 16 }}>Volver al cliente</button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title={contract.name}
        description={`${contract.contract_type} | Código: ${contract.external_id}`}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Clientes', href: '/dashboard/clientes' },
          { label: 'Perfil Cliente', href: `/dashboard/clientes/${params.id}` },
          { label: contract.external_id }
        ]}
      />

      <Card style={{ textAlign: 'center', padding: '60px 20px', marginTop: 24 }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: 16 }}>Centro de Gestión Contractual</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 600, marginInline: 'auto', lineHeight: 1.6 }}>
          Esta pantalla se encuentra en preparación para la futura integración con el proveedor de contratos.
          Aquí se consolidará toda la información financiera, de riesgos, hitos, recursos y entregables del contrato <strong>{contract.name}</strong>.
        </p>
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 16 }}>
          <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', minWidth: 150 }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 4 }}>Estado</div>
            <div style={{ fontWeight: 'bold' }}>{contract.status}</div>
          </div>
          <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', minWidth: 150 }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 4 }}>Salud</div>
            <div style={{ fontWeight: 'bold' }}>{contract.health}</div>
          </div>
          <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', minWidth: 150 }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 4 }}>Responsable (PM)</div>
            <div style={{ fontWeight: 'bold' }}>{contract.pm || 'No asignado'}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
