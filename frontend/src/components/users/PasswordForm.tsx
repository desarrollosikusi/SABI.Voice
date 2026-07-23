import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { userService } from '@/services/userService';
import { securityConfig } from '@/config/security';
import { useUser } from '@/context/UserContext';

export default function PasswordForm() {
  const { logoutUser } = useUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [strength, setStrength] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const evaluateStrength = (pw: string) => {
    let score = 0;
    const errs = [];
    const { minLength, requireUppercase, requireNumbers, requireSpecialChars } = securityConfig.password;
    
    if (pw.length >= minLength) score += 1;
    else errs.push(`Debe tener al menos ${minLength} caracteres`);

    if (requireUppercase) {
      if (/[A-Z]/.test(pw)) score += 1;
      else errs.push('Debe incluir una letra mayúscula');
    }

    if (requireNumbers) {
      if (/[0-9]/.test(pw)) score += 1;
      else errs.push('Debe incluir un número');
    }

    if (requireSpecialChars) {
      if (/[^A-Za-z0-9]/.test(pw)) score += 1;
      else errs.push('Debe incluir un carácter especial');
    }

    if (currentPassword && pw === currentPassword) {
      errs.push('La nueva contraseña no puede ser igual a la actual');
      score = 0;
    }

    setStrength(score);
    setErrors(errs);
  };

  useEffect(() => {
    if (newPassword) evaluateStrength(newPassword);
    else { setStrength(0); setErrors([]); }
  }, [newPassword, currentPassword]);

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.getModifierState('CapsLock')) {
      setCapsLock(true);
    } else {
      setCapsLock(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);

    if (errors.length > 0) {
      setSubmitError('Resuelve los requerimientos de la contraseña antes de guardar.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSubmitError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await userService.updatePassword({ current_password: currentPassword, new_password: newPassword });
      setSuccess(res.message);
      // Wait a moment and redirect to login
      setTimeout(() => {
        logoutUser();
        window.location.href = '/login';
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.message || 'Ocurrió un error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const strengthColor = ['var(--danger)', 'var(--danger)', 'var(--warning)', 'var(--info)', 'var(--success)'][strength] || 'var(--surface-border)';

  return (
    <Card>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0' }}>Cambiar Contraseña</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Asegúrate de que tu cuenta esté usando una contraseña larga y aleatoria para mantenerse segura.
          </p>
        </div>

        {submitError && <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem' }}>{submitError}</div>}
        {success && <div style={{ padding: '12px', background: '#dcfce7', color: '#15803d', borderRadius: '8px', fontSize: '0.85rem' }}>{success}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Contraseña Actual</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              onKeyUp={handleKeyUp}
              className="input-field"
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nueva Contraseña</label>
          <input 
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            onKeyUp={handleKeyUp}
            className="input-field"
            required
          />
          {capsLock && <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 'bold' }}>MAYÚSCULAS ACTIVADAS</span>}
          
          {/* Strength Meter */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            {[1,2,3,4].map(level => (
              <div key={level} style={{ height: '4px', flex: 1, backgroundColor: strength >= level ? strengthColor : 'var(--surface-border)', borderRadius: '2px', transition: 'background-color 0.3s' }} />
            ))}
          </div>
          
          {errors.length > 0 && newPassword.length > 0 && (
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '0.75rem', color: 'var(--danger)' }}>
              {errors.map((e, idx) => <li key={idx}>{e}</li>)}
            </ul>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Confirmar Contraseña</label>
          <input 
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            onKeyUp={handleKeyUp}
            className="input-field"
            required
          />
          {confirmPassword && confirmPassword !== newPassword && (
            <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Las contraseñas no coinciden</span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button variant="primary" type="submit" disabled={loading || errors.length > 0 || !currentPassword || newPassword !== confirmPassword}>
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
