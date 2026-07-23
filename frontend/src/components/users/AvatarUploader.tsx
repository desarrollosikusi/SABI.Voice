import React, { useState, useRef } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useUser } from '@/context/UserContext';
import { userService } from '@/services/userService';
import { securityConfig } from '@/config/security';

export default function AvatarUploader() {
  const { user, refreshCurrentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const { allowedFormats, maxSizeBytes, minResolution } = securityConfig.avatar;

    if (!allowedFormats.includes(file.type)) {
      setError(`Formato no permitido. Solo: ${allowedFormats.join(', ')}`);
      return;
    }

    if (file.size > maxSizeBytes) {
      setError(`El archivo es demasiado grande (Máximo ${maxSizeBytes / 1024 / 1024}MB)`);
      return;
    }

    // Process image: crop to 1:1 and validate resolution
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        if (img.width < minResolution.width || img.height < minResolution.height) {
          setError(`La resolución debe ser de al menos ${minResolution.width}x${minResolution.height}px`);
          return;
        }

        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, x, y, size, size, 0, 0, size, size);
        
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const croppedFile = new File([blob], file.name, { type: file.type });
          
          setLoading(true);
          try {
            await userService.uploadAvatar(croppedFile);
            await refreshCurrentUser(); // Sincronizar contexto y demás componentes
          } catch (err: any) {
            setError(err.message || 'Error al subir la imagen');
          } finally {
            setLoading(false);
          }
        }, file.type);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const getInitial = () => user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px' }}>
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%',
          backgroundColor: 'var(--primary)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', fontSize: '3rem', flexShrink: 0,
          backgroundImage: user?.avatarUrl ? `url(${user.avatarUrl})` : 'none',
          backgroundSize: 'cover', backgroundPosition: 'center',
          border: '4px solid var(--surface-color)',
          boxShadow: 'var(--shadow-md)'
        }}>
          {!user?.avatarUrl && getInitial()}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0' }}>Fotografía de Perfil</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Se aceptan formatos JPG, PNG y WEBP. Máximo 5MB. Se recortará automáticamente a formato cuadrado.
            </p>
          </div>
          
          {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '16px' }}>
            <input 
              type="file" 
              accept={securityConfig.avatar.allowedFormats.join(',')}
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button variant="primary" onClick={() => fileInputRef.current?.click()} disabled={loading}>
              {loading ? 'Subiendo...' : 'Subir nueva foto'}
            </Button>
            {user?.avatarUrl && (
              <Button variant="secondary" onClick={() => {/* Future: Delete avatar logic */}}>
                Eliminar
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
