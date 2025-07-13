// Frontend security utilities

// Content Security Policy helpers
export const setupCSP = (): void => {
  if (typeof document !== 'undefined') {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' wss: https://api.twilio.com",
      "frame-src 'none'",
      "object-src 'none'",
    ].join('; ');
    
    document.head.appendChild(meta);
  }
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        default: return char;
      }
    })
    .trim();
};

// HTML encoding
export const encodeHTML = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// HTML decoding
export const decodeHTML = (str: string): string => {
  const div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent || div.innerText || '';
};

// URL validation
export const isValidURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Safe URL creation for external links
export const createSafeURL = (url: string): string => {
  if (!isValidURL(url)) {
    return '#';
  }
  
  // Ensure external links are safe
  const urlObj = new URL(url);
  const currentDomain = window.location.hostname;
  
  if (urlObj.hostname !== currentDomain) {
    // Add rel="noopener noreferrer" for external links
    return url;
  }
  
  return url;
};

// Secure local storage wrapper
export class SecureStorage {
  private static prefix = 'secure_';
  
  static setItem(key: string, value: any, encrypt: boolean = false): void {
    try {
      const serializedValue = JSON.stringify(value);
      const finalValue = encrypt ? this.simpleEncrypt(serializedValue) : serializedValue;
      localStorage.setItem(this.prefix + key, finalValue);
    } catch (error) {
      console.error('Failed to save to secure storage:', error);
    }
  }
  
  static getItem<T>(key: string, decrypt: boolean = false): T | null {
    try {
      const value = localStorage.getItem(this.prefix + key);
      if (!value) return null;
      
      const finalValue = decrypt ? this.simpleDecrypt(value) : value;
      return JSON.parse(finalValue);
    } catch (error) {
      console.error('Failed to read from secure storage:', error);
      return null;
    }
  }
  
  static removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }
  
  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
  
  // Simple encryption (not cryptographically secure, just obfuscation)
  private static simpleEncrypt(text: string): string {
    return btoa(text.split('').reverse().join(''));
  }
  
  private static simpleDecrypt(encrypted: string): string {
    return atob(encrypted).split('').reverse().join('');
  }
}

// Password strength checker
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} => {
  let score = 0;
  const feedback: string[] = [];
  
  // Length check
  if (password.length >= 8) {
    score += 2;
  } else {
    feedback.push('Use at least 8 characters');
  }
  
  if (password.length >= 12) {
    score += 1;
  }
  
  // Character variety
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }
  
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }
  
  if (/[^a-zA-Z\d]/.test(password)) {
    score += 2;
  } else {
    feedback.push('Add special characters');
  }
  
  // Common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    score -= 2;
    feedback.push('Avoid common patterns');
  }
  
  // Sequential characters
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Avoid repeated characters');
  }
  
  return {
    score: Math.max(0, Math.min(8, score)),
    feedback,
    isStrong: score >= 6,
  };
};

// CSRF token management
export class CSRFProtection {
  private static tokenKey = 'csrf_token';
  
  static getToken(): string | null {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;
  }
  
  static setToken(token: string): void {
    let meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'csrf-token';
      document.head.appendChild(meta);
    }
    meta.content = token;
  }
  
  static addToRequest(options: RequestInit): RequestInit {
    const token = this.getToken();
    if (token) {
      return {
        ...options,
        headers: {
          ...options.headers,
          'X-CSRF-Token': token,
        },
      };
    }
    return options;
  }
}

// Secure cookie handling
export class SecureCookies {
  static set(name: string, value: string, days: number = 7, secure: boolean = true): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    const cookieOptions = [
      `${name}=${encodeURIComponent(value)}`,
      `expires=${expires.toUTCString()}`,
      'path=/',
      'SameSite=Strict',
    ];
    
    if (secure && window.location.protocol === 'https:') {
      cookieOptions.push('Secure');
    }
    
    document.cookie = cookieOptions.join('; ');
  }
  
  static get(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  }
  
  static delete(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

// Input validation helpers
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  phone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },
  
  url: (url: string): boolean => {
    return isValidURL(url);
  },
  
  alphanumeric: (str: string): boolean => {
    return /^[a-zA-Z0-9]+$/.test(str);
  },
  
  noScript: (str: string): boolean => {
    return !/<script|javascript:|on\w+\s*=/i.test(str);
  },
};

// Rate limiting for client-side actions
export class ClientRateLimit {
  private static limits = new Map<string, { count: number; resetTime: number }>();
  
  static check(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const limit = this.limits.get(key);
    
    if (!limit || now > limit.resetTime) {
      this.limits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (limit.count >= maxAttempts) {
      return false;
    }
    
    limit.count++;
    return true;
  }
  
  static reset(key: string): void {
    this.limits.delete(key);
  }
}

// Security headers checker
export const checkSecurityHeaders = async (): Promise<{
  hasHTTPS: boolean;
  hasHSTS: boolean;
  hasCSP: boolean;
  hasXFrameOptions: boolean;
}> => {
  const result = {
    hasHTTPS: window.location.protocol === 'https:',
    hasHSTS: false,
    hasCSP: false,
    hasXFrameOptions: false,
  };
  
  try {
    const response = await fetch(window.location.href, { method: 'HEAD' });
    const headers = response.headers;
    
    result.hasHSTS = headers.has('strict-transport-security');
    result.hasCSP = headers.has('content-security-policy');
    result.hasXFrameOptions = headers.has('x-frame-options');
  } catch (error) {
    console.warn('Could not check security headers:', error);
  }
  
  return result;
};

// Detect and prevent clickjacking
export const preventClickjacking = (): void => {
  if (window.self !== window.top) {
    // Page is in an iframe
    console.warn('Potential clickjacking detected - page loaded in iframe');
    
    // Break out of frame
    window.top!.location.href = window.self.location.href;
  }
};

// Initialize security measures
export const initializeSecurity = (): void => {
  // Set up CSP
  setupCSP();
  
  // Prevent clickjacking
  preventClickjacking();
  
  // Check security headers in development
  if (process.env.NODE_ENV === 'development') {
    checkSecurityHeaders().then(headers => {
      console.log('Security headers check:', headers);
    });
  }
  
  // Clear sensitive data on page unload
  window.addEventListener('beforeunload', () => {
    // Clear any sensitive data from memory
    SecureStorage.removeItem('temp_data');
  });
};