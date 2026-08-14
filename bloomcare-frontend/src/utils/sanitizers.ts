// src/utils/sanitizers.ts

/**
 * XSS Prevention & Input Sanitization Utilities
 */

// ============================================
// 1. HTML ESCAPING
// ============================================
export const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return String(text).replace(/[&<>"'/`=]/g, (s) => map[s] || s);
};

// ============================================
// 2. URL SANITIZATION
// ============================================
export const sanitizeUrl = (url: string | null | undefined, defaultUrl: string = '#'): string => {
  if (!url) return defaultUrl;

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      return defaultUrl;
    }
  }

  // Allow safe protocols
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  const hasProtocol = safeProtocols.some(p => trimmed.startsWith(p));

  if (!hasProtocol) {
    return `https://${url.trim()}`;
  }

  return url.trim();
};

// ============================================
// 3. DISPLAY SANITIZATION
// ============================================
export const sanitizeDisplay = (text: string | null | undefined, maxLength?: number): string => {
  if (!text) return '';

  let sanitized = escapeHtml(text.trim());

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...';
  }

  return sanitized;
};

// ============================================
// 4. RICH TEXT SANITIZATION (NEW)
// ============================================
/**
 * Sanitize rich text content (allows basic HTML tags)
 * Use this for content that should support formatting like:
 * - Medicine descriptions
 * - Pharmacy descriptions
 * - Blog posts
 * - AI chat responses
 */
export const sanitizeRichText = (html: string | null | undefined): string => {
  if (!html) return '';

  // First, escape any dangerous characters
  let sanitized = escapeHtml(html);

  // Then allow safe HTML tags
  // This is a basic implementation - for production, consider using DOMPurify
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'];
  
  // Convert escaped tags back for allowed ones
  // This is a simplified approach - for production, use DOMPurify
  const tagMap: Record<string, string> = {
    '&lt;p&gt;': '<p>',
    '&lt;/p&gt;': '</p>',
    '&lt;br&gt;': '<br>',
    '&lt;br/&gt;': '<br>',
    '&lt;strong&gt;': '<strong>',
    '&lt;/strong&gt;': '</strong>',
    '&lt;em&gt;': '<em>',
    '&lt;/em&gt;': '</em>',
    '&lt;u&gt;': '<u>',
    '&lt;/u&gt;': '</u>',
    '&lt;ul&gt;': '<ul>',
    '&lt;/ul&gt;': '</ul>',
    '&lt;ol&gt;': '<ol>',
    '&lt;/ol&gt;': '</ol>',
    '&lt;li&gt;': '<li>',
    '&lt;/li&gt;': '</li>',
    '&lt;h1&gt;': '<h1>',
    '&lt;/h1&gt;': '</h1>',
    '&lt;h2&gt;': '<h2>',
    '&lt;/h2&gt;': '</h2>',
    '&lt;h3&gt;': '<h3>',
    '&lt;/h3&gt;': '</h3>',
    '&lt;h4&gt;': '<h4>',
    '&lt;/h4&gt;': '</h4>',
    '&lt;h5&gt;': '<h5>',
    '&lt;/h5&gt;': '</h5>',
    '&lt;h6&gt;': '<h6>',
    '&lt;/h6&gt;': '</h6>',
    '&lt;blockquote&gt;': '<blockquote>',
    '&lt;/blockquote&gt;': '</blockquote>',
    '&lt;code&gt;': '<code>',
    '&lt;/code&gt;': '</code>',
    '&lt;pre&gt;': '<pre>',
    '&lt;/pre&gt;': '</pre>',
  };

  // Replace escaped tags with real ones for allowed tags
  for (const [escaped, real] of Object.entries(tagMap)) {
    sanitized = sanitized.replace(new RegExp(escaped, 'g'), real);
  }

  const tagRegex = /<(\/)?([a-zA-Z0-9]+)([^>]*)>/g;
  sanitized = sanitized.replace(tagRegex, (match, closing, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match; // Keep allowed tags
    }
    return ''; // Remove disallowed tags
  });

  return sanitized;
};


export const sanitizeFilename = (filename: string): string => {
  if (!filename) return '';

  const sanitized = filename
    .replace(/[^a-zA-Z0-9_.-]/g, '_')
    .replace(/\.\./g, '')
    .replace(/^\.+/, '');

  return sanitized || 'file';
};

export const sanitizePhone = (phone: string | null | undefined): string | null => {
  if (!phone) return null;

  const sanitized = phone.replace(/[^0-9+]/g, '');

  if (sanitized.length < 8 || sanitized.length > 15) {
    return null;
  }

  return sanitized;
};

export const sanitizeEmail = (email: string | null | undefined): string | null => {
  if (!email) return null;

  const trimmed = email.trim().toLowerCase();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return null;
  }

  return trimmed;
};


export const sanitizeInput = (text: string | null | undefined): string => {
  if (!text) return '';
  
  // Remove any HTML tags
  const stripped = text.replace(/<[^>]*>/g, '');
  
  // Escape remaining characters
  return escapeHtml(stripped.trim());
};

export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = value.trim();
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === 'string' ? item.trim() : item
      );
    } else if (value && typeof value === 'object') {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
};


export const sanitizeJson = <T>(data: T): T => {
  try {
    const jsonString = JSON.stringify(data);
    const sanitized = jsonString.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    return JSON.parse(sanitized);
  } catch {
    return data;
  }
};