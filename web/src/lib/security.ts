/**
 * Security utilities for input validation and sanitization
 */

// XSS Prevention
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeForDisplay(input: string): string {
  // Remove potentially dangerous characters but preserve formatting
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// Path Traversal Prevention
export function sanitizePath(input: string): string {
  // Remove dangerous path components
  return input
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/^\//, '')   // Remove leading slashes
    .replace(/\/$/, '')   // Remove trailing slashes
    .replace(/[<>:"|?*]/g, '') // Remove invalid characters
    .trim();
}

export function validatePath(path: string, allowedPaths: string[] = []): boolean {
  const sanitized = sanitizePath(path);
  
  // Check for path traversal attempts
  if (path.includes('..') || path.includes('~') || path.startsWith('/')) {
    return false;
  }
  
  // Check against allowed paths if provided
  if (allowedPaths.length > 0) {
    return allowedPaths.some(allowed => sanitized.startsWith(allowed));
  }
  
  // Additional checks
  const dangerousPatterns = [
    /\/etc\//,
    /\/proc\//,
    /\/sys\//,
    /\/dev\//,
    /\.env/,
    /config\./,
    /\.key$/,
    /\.pem$/,
    /\.crt$/,
    /\.p12$/,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(sanitized));
}

// Command Injection Prevention
export function sanitizeCommand(input: string): string {
  // Remove or escape dangerous shell characters
  return input
    .replace(/[;&|`$(){}[\]]/g, '') // Remove shell metacharacters
    .replace(/--/g, '') // Remove comment indicators
    .replace(/\/\*.*?\*\//g, '') // Remove block comments
    .replace(/--.*$/gm, '') // Remove line comments
    .trim();
}

export function validateCommand(input: string, allowedCommands: string[] = []): boolean {
  const sanitized = sanitizeCommand(input);
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    /rm\s+-rf/i,
    /sudo/i,
    /su\s/i,
    /chmod\s+777/i,
    /wget|curl/i,
    /nc\s|netcat/i,
    /ssh/i,
    /scp/i,
    /rsync/i,
    /dd\s+if=/i,
    /mkfs/i,
    /fdisk/i,
    /mount/i,
    /umount/i,
    /passwd/i,
    /shadow/i,
    /crontab/i,
    /systemctl/i,
    /service\s/i,
  ];
  
  if (dangerousPatterns.some(pattern => pattern.test(sanitized))) {
    return false;
  }
  
  // Check against allowed commands if provided
  if (allowedCommands.length > 0) {
    const command = sanitized.split(' ')[0];
    return allowedCommands.includes(command);
  }
  
  return true;
}

// Rate Limiting
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  
  constructor(private maxRequests: number, private windowMs: number) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(identifier);
    
    if (!entry || now > entry.resetTime) {
      // New entry or expired
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }
    
    if (entry.count >= this.maxRequests) {
      return false; // Rate limit exceeded
    }
    
    entry.count++;
    return true;
  }
  
  getRemainingRequests(identifier: string): number {
    const entry = this.limits.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }
  
  getResetTime(identifier: string): number {
    const entry = this.limits.get(identifier);
    return entry ? entry.resetTime : Date.now();
  }
}

// Create rate limiters for different operations
export const commandRateLimiter = new RateLimiter(10, 60000); // 10 commands per minute
export const fileOperationRateLimiter = new RateLimiter(30, 60000); // 30 file ops per minute
export const authRateLimiter = new RateLimiter(5, 300000); // 5 auth attempts per 5 minutes

// Content Security Policy
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: https://ui-avatars.com",
    "connect-src 'self' https://mcp-signal.workers.dev https://*.firebaseio.com https://*.googleapis.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  connectionCode: /^[A-Z0-9]{6}$/,
  fileName: /^[a-zA-Z0-9._-]+$/,
  projectName: /^[a-zA-Z0-9\s_-]+$/,
};

export function validateInput(type: keyof typeof VALIDATION_PATTERNS, input: string): boolean {
  const pattern = VALIDATION_PATTERNS[type];
  return pattern ? pattern.test(input) : false;
}

// Secure random token generation
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Session security
export interface SessionData {
  userId: string;
  token: string;
  expires: number;
  lastActivity: number;
}

class SessionManager {
  private sessions = new Map<string, SessionData>();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  
  createSession(userId: string): SessionData {
    const token = generateSecureToken();
    const now = Date.now();
    
    const session: SessionData = {
      userId,
      token,
      expires: now + this.SESSION_TIMEOUT,
      lastActivity: now,
    };
    
    this.sessions.set(token, session);
    return session;
  }
  
  validateSession(token: string): SessionData | null {
    const session = this.sessions.get(token);
    if (!session) return null;
    
    const now = Date.now();
    if (now > session.expires) {
      this.sessions.delete(token);
      return null;
    }
    
    // Update last activity and extend expiration
    session.lastActivity = now;
    session.expires = now + this.SESSION_TIMEOUT;
    
    return session;
  }
  
  destroySession(token: string): void {
    this.sessions.delete(token);
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [token, session] of this.sessions.entries()) {
      if (now > session.expires) {
        this.sessions.delete(token);
      }
    }
  }
}

export const sessionManager = new SessionManager();

// Auto-cleanup sessions every 5 minutes
setInterval(() => {
  sessionManager.cleanup();
}, 5 * 60 * 1000);