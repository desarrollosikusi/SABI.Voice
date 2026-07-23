'use client';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import UserProfileForm from '@/components/users/UserProfileForm';
import { userService } from '@/services/userService';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (data: any) => {
    if (!editingUser) return;
    await userService.updateUserAdmin(editingUser.id, data);
    setIsModalOpen(false);
    setEditingUser(null);
    fetchUsers(); // Refresh list
  };

  const userColumns = [
    { key: 'full_name', label: 'Nombre Completo', render: (u: any) => u.name || u.full_name },
    { key: 'email', label: 'Correo' },
    { 
      key: 'role', 
      label: 'Rol',
      render: (u: any) => (
        <Badge variant={u.role === 'Administrador' ? 'danger' : 'info'}>{u.role}</Badge>
      )
    },
    { key: 'is_active', label: 'Estado', render: (u: any) => (
      <Badge variant={u.is_active ? 'success' : 'neutral'}>
        {u.is_active ? 'Activo' : 'Inactivo'}
      </Badge>
    )},
    { key: 'actions', label: 'Acciones', render: (u: any) => (
      <Button variant="secondary" onClick={() => handleEditUser(u)}>Editar</Button>
    )}
  ];

  return (
    <div>
      <PageHeader 
        title="Administración del Sistema"
        description="Gestiona usuarios, roles, SLAs, catálogos y configuración general de SABI Voice."
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Administración' }]}
      />

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <div style={{ width: '250px', flexShrink: 0 }}>
          <Card noPadding>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { id: 'users', label: 'Usuarios y Roles' },
                { id: 'slas', label: 'Políticas SLA' },
                { id: 'catalogs', label: 'Catálogos' },
                { id: 'integrations', label: 'Integraciones' },
                { id: 'settings', label: 'Configuración General' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    background: activeTab === tab.id ? 'var(--surface-hover)' : 'transparent',
                    border: 'none',
                    borderLeft: `4px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`,
                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.95rem'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ flexGrow: 1 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
                {activeTab === 'users' ? 'Gestión de Usuarios' : 'Módulo en construcción'}
              </h2>
              {activeTab === 'users' && (
                <Button variant="primary">Nuevo Usuario</Button>
              )}
            </div>

            {activeTab === 'users' ? (
              loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando usuarios...</div>
              ) : (
                <DataTable columns={userColumns} data={users} />
              )
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚧</div>
                <p>Este módulo de administración estará disponible próximamente.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        title="Editar Usuario"
      >
        {editingUser && (
          <UserProfileForm 
            user={editingUser} 
            mode="editable" 
            onSave={handleSaveUser}
            onCancel={() => { setIsModalOpen(false); setEditingUser(null); }}
          />
        )}
      </Modal>
    </div>
  );
}
