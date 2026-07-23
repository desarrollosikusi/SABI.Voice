export const securityConfig = {
  password: {
    minLength: 8,
    maxLength: 32,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  avatar: {
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    minResolution: { width: 200, height: 200 }
  }
};
