/**
 * Normaliza un documento eliminando caracteres no deseados.
 * Si es NIT, deja solo números.
 * Si es otro documento, deja alfanuméricos y en mayúsculas.
 */
export const normalizeDocument = (value: string | number | null | undefined, type: string = 'NIT'): string => {
  if (value === null || value === undefined || value === '') return '';
  const strValue = String(value);
  if (type === 'NIT') {
    return strValue.replace(/\D/g, '');
  }
  return strValue.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

/**
 * Formatea un documento para su visualización.
 * Si es NIT y tiene al menos 1 dígito, intenta aplicar el formato xxx.xxx.xxx-x
 * Solo formatea si es NIT.
 */
export const formatDocument = (value: string | number | null | undefined, type: string = 'NIT'): string => {
  if (value === null || value === undefined || value === '') return '';
  const strValue = String(value);
  
  if (type === 'NIT') {
    const digits = strValue.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length < 2) return digits;
    
    const dv = digits.slice(-1);
    const body = digits.slice(0, -1);
    
    let formattedBody = '';
    let count = 0;
    for (let i = body.length - 1; i >= 0; i--) {
      formattedBody = body[i] + formattedBody;
      count++;
      if (count % 3 === 0 && i !== 0) {
        formattedBody = '.' + formattedBody;
      }
    }
    
    return `${formattedBody}-${dv}`;
  }
  
  return normalizeDocument(value, type);
};
