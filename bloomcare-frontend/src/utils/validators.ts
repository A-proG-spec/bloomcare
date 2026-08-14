
export const isEmptyOrWhitespace = (value: string): boolean => {
  return !value || value.trim().length === 0;
};

export const safeTrim = (value: string | null | undefined): string => {
  if (!value) return '';
  return value.trim();
};


export const validateRequired = (
  value: string | null | undefined,
  fieldName: string = 'This field'
): string | null => {
  const trimmed = safeTrim(value);
  if (!trimmed) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate email format
 * @param email - The email to validate
 * @returns Error message or null if valid
 */
export const validateEmail = (email: string): string | null => {
  const trimmed = safeTrim(email);
  
  if (!trimmed) {
    return 'Email is required';
  }

  // Email regex pattern (RFC 5322 compliant)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address';
  }

  // Check for spaces (shouldn't be in email)
  if (/\s/.test(trimmed)) {
    return 'Email cannot contain spaces';
  }

  return null;
};

/**
 * Validate phone number
 * @param phone - The phone number to validate
 * @param countryCode - Optional country code for validation
 * @returns Error message or null if valid
 */
export const validatePhone = (
  phone: string,
  countryCode: string = 'ET'
): string | null => {
  const trimmed = safeTrim(phone);
  
  if (!trimmed) {
    return 'Phone number is required';
  }

  // Remove common separators for validation
  const cleaned = trimmed.replace(/[\s\-()+.]+/g, '');
  
  // Check if it contains only digits after cleaning
  if (!/^\d+$/.test(cleaned)) {
    return 'Phone number can only contain digits, spaces, and +';
  }

  // Length check (adjust based on country)
  if (cleaned.length < 8 || cleaned.length > 15) {
    return 'Please enter a valid phone number (8-15 digits)';
  }

  // Check if it starts with a valid country code pattern for ET
  if (countryCode === 'ET') {
    const etPatterns = ['251', '09', '07', '9', '7'];
    const startsValid = etPatterns.some(pattern => cleaned.startsWith(pattern));
    if (!startsValid && !cleaned.startsWith('+251')) {
      // Not strictly required, but helpful
      return 'For Ethiopia, use format: +251 9XX XXX XXX';
    }
  }

  return null;
};

export const validatePassword = (
  password: string,
  options: {
    minLength?: number;
    requireNumber?: boolean;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireSpecial?: boolean;
  } = {}
): string | null => {
  const {
    minLength = 6,
    requireNumber = true,
    requireUppercase = true,
    requireLowercase = true,
    requireSpecial = false,
  } = options;

  const trimmed = safeTrim(password);

  if (!trimmed) {
    return 'Password is required';
  }

  if (trimmed.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }

  if (/\s/.test(trimmed)) {
    return 'Password cannot contain spaces';
  }

  if (requireNumber && !/\d/.test(trimmed)) {
    return 'Password must contain at least one number';
  }

  if (requireUppercase && !/[A-Z]/.test(trimmed)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (requireLowercase && !/[a-z]/.test(trimmed)) {
    return 'Password must contain at least one lowercase letter';
  }

  if (requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(trimmed)) {
    return 'Password must contain at least one special character';
  }

  return null;
};

/**
 * Validate URL format
 * @param url - The URL to validate
 * @param requireProtocol - Whether to require http/https protocol
 * @returns Error message or null if valid
 */
export const validateUrl = (
  url: string,
  requireProtocol: boolean = true
): string | null => {
  const trimmed = safeTrim(url);

  if (!trimmed) {
    return 'URL is required';
  }

  // If no protocol, add one for validation
  let urlToCheck = trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    if (!requireProtocol) {
      urlToCheck = `https://${trimmed}`;
    } else {
      return 'URL must start with http:// or https://';
    }
  }

  try {
    new URL(urlToCheck);
  } catch {
    return 'Please enter a valid URL';
  }

  // Block javascript: protocol (XSS prevention)
  if (/^javascript:/i.test(trimmed)) {
    return 'Invalid URL protocol';
  }

  // Block data: protocol (XSS prevention)
  if (/^data:/i.test(trimmed)) {
    return 'Invalid URL protocol';
  }

  return null;
};


export const validateCoordinate = (
  value: string | number,
  type: 'latitude' | 'longitude'
): string | null => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return `${type.charAt(0).toUpperCase() + type.slice(1)} must be a valid number`;
  }

  if (type === 'latitude' && (num < -90 || num > 90)) {
    return 'Latitude must be between -90 and 90';
  }

  if (type === 'longitude' && (num < -180 || num > 180)) {
    return 'Longitude must be between -180 and 180';
  }

  return null;
};


export const validateRange = (
  value: number | string,
  min: number,
  max: number,
  fieldName: string = 'Value'
): string | null => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }

  if (num < min || num > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }

  return null;
};


export const validatePattern = (
  value: string,
  pattern: RegExp,
  errorMessage: string = 'Invalid format'
): string | null => {
  const trimmed = safeTrim(value);

  if (!trimmed) {
    return 'This field is required';
  }

  if (!pattern.test(trimmed)) {
    return errorMessage;
  }

  return null;
};


export const getPasswordStrength = (password: string): number => {
  const trimmed = safeTrim(password);
  if (!trimmed) return 0;

  let score = 0;

  // Length
  if (trimmed.length >= 8) score++;
  if (trimmed.length >= 12) score++;

  // Complexity
  if (/[a-z]/.test(trimmed) && /[A-Z]/.test(trimmed)) score++;
  if (/\d/.test(trimmed)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(trimmed)) score++;

  // Cap at 4
  return Math.min(score, 4);
};


export const getPasswordStrengthLabel = (score: number): {
  label: string;
  color: string;
  bgColor: string;
} => {
  const strengthMap = [
    { label: 'Very Weak', color: 'text-red-600', bgColor: 'bg-red-100' },
    { label: 'Weak', color: 'text-orange-500', bgColor: 'bg-orange-100' },
    { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Strong', color: 'text-green-600', bgColor: 'bg-green-100' },
  ];

  const index = Math.min(Math.max(score, 0), 4);
  return strengthMap[index];
};


export const validateMatch = (
  value1: string,
  value2: string,
  fieldName: string = 'Fields'
): string | null => {
  const trimmed1 = safeTrim(value1);
  const trimmed2 = safeTrim(value2);

  if (trimmed1 !== trimmed2) {
    return `${fieldName} do not match`;
  }

  return null;
};


export const sanitizeString = (value: string): string => {
  if (!value) return '';

  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return value.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Collection of validation rules for common fields
 */
export const validators = {
  required: (fieldName?: string) => (value: string) => 
    validateRequired(value, fieldName),
  
  email: () => (value: string) => 
    validateEmail(value),
  
  phone: (countryCode?: string) => (value: string) => 
    validatePhone(value, countryCode),
  
  password: (options?: Parameters<typeof validatePassword>[1]) => (value: string) => 
    validatePassword(value, options),
  
  url: (requireProtocol?: boolean) => (value: string) => 
    validateUrl(value, requireProtocol),
  
  minLength: (min: number, fieldName?: string) => (value: string) => {
    const trimmed = safeTrim(value);
    if (trimmed.length < min) {
      return `${fieldName || 'Field'} must be at least ${min} characters`;
    }
    return null;
  },
  
  maxLength: (max: number, fieldName?: string) => (value: string) => {
    const trimmed = safeTrim(value);
    if (trimmed.length > max) {
      return `${fieldName || 'Field'} must be less than ${max} characters`;
    }
    return null;
  },
};