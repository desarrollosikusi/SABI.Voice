'use client';
import React from 'react';
import { useUser } from '@/context/UserContext';
import AvatarUploader from '@/components/users/AvatarUploader';
import UserProfileForm from '@/components/users/UserProfileForm';
import PasswordForm from '@/components/users/PasswordForm';
import PreferenceSection from '@/components/users/PreferenceSection';

export default function ProfilePage() {
  const { user, loading } = useUser();

  if (loading) return <div>Cargando perfil...</div>;
  if (!user) return <div>No autenticado</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
        borderRadius: 'var(--radius-lg)', padding: '40px', color: '#fff',
        display: 'flex', flexDirection: 'column', gap: '8px'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>Mi Perfil</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>Administra tu información personal y preferencias de seguridad.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        <AvatarUploader />
        <UserProfileForm user={user} mode="readonly" />
        <PasswordForm />
        <PreferenceSection />
      </div>

    </div>
  );
}
