
export interface ValidationResult {
  [key: string]: string;
}

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} é obrigatório.`;
  }
  return null;
};

export const validateNumber = (value: string, fieldName: string): string | null => {
  if (value && isNaN(Number(value))) {
    return `${fieldName} deve ser um número.`;
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return 'Email inválido.';
  }
  return null;
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (value && value.length < minLength) {
    return `${fieldName} deve ter pelo menos ${minLength} caracteres.`;
  }
  return null;
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value && value.length > maxLength) {
    return `${fieldName} deve ter no máximo ${maxLength} caracteres.`;
  }
  return null;
};

export const validateArrayNotEmpty = (array: any[], fieldName: string): string | null => {
  if (!array || array.length === 0) {
    return `${fieldName} deve ter pelo menos um item.`;
  }
  return null;
};

export const combineValidations = (...validations: (string | null)[]): string | null => {
  for (const validation of validations) {
    if (validation) {
      return validation;
    }
  }
  return null;
};

export const validateFormFields = (
  data: Record<string, any>,
  rules: Record<string, (value: any) => string | null>
): ValidationResult => {
  const errors: ValidationResult = {};
  
  for (const [field, validator] of Object.entries(rules)) {
    const error = validator(data[field]);
    if (error) {
      errors[field] = error;
    }
  }
  
  return errors;
};
