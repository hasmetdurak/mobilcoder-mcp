import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Security configuration
export const SECURITY_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
  allowedFileExtensions: ['.ts', '.js', '.jsx', '.tsx', '.json', '.md', '.txt', '.yml', '.yaml', '.env.example'],
  blockedPaths: [
    '.git',
    'node_modules',
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
    'dist',
    'build',
    '.next',
    '.nuxt',
    '.cache',
    'tmp',
    'temp'
  ],
  blockedFilePatterns: [
    /\.key$/,
    /\.pem$/,
    /\.crt$/,
    /\.p12$/,
    /private/i,
    /secret/i,
    /password/i,
    /token/i,
    /\.log$/,
    /\.pid$/,
    /\.lock$/,
  ]
};

// Rate limiting
class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number; lastReset: number }>();
  
  constructor(private maxRequests: number, private windowMs: number) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(identifier);
    
    if (!entry) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
        lastReset: now
      });
      return true;
    }
    
    // Reset if window expired
    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + this.windowMs;
      entry.lastReset = now;
      return true;
    }
    
    if (entry.count >= this.maxRequests) {
      return false;
    }
    
    entry.count++;
    return true;
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

export const rateLimiters = {
  perMinute: new RateLimiter(SECURITY_CONFIG.maxRequestsPerMinute, 60 * 1000),
  perHour: new RateLimiter(SECURITY_CONFIG.maxRequestsPerHour, 60 * 60 * 1000),
  fileOperations: new RateLimiter(30, 60 * 1000),
  commands: new RateLimiter(10, 60 * 1000)
};

// Input validation
export function validatePath(filePath: string, cwd: string): { valid: boolean; error?: string } {
  // Normalize path
  const normalizedPath = path.normalize(filePath);
  const fullPath = path.resolve(cwd, normalizedPath);
  
  // Check for path traversal
  if (!fullPath.startsWith(path.resolve(cwd))) {
    return { valid: false, error: 'Path traversal detected' };
  }
  
  // Check for blocked paths
  const pathParts = normalizedPath.split(path.sep);
  for (const part of pathParts) {
    if (SECURITY_CONFIG.blockedPaths.includes(part)) {
      return { valid: false, error: `Access to ${part} is not allowed` };
    }
  }
  
  // Check for blocked file patterns
  for (const pattern of SECURITY_CONFIG.blockedFilePatterns) {
    if (pattern.test(normalizedPath)) {
      return { valid: false, error: 'Access to sensitive files is not allowed' };
    }
  }
  
  return { valid: true };
}

export function validateFile(filePath: string, cwd: string): { valid: boolean; error?: string } {
  const pathValidation = validatePath(filePath, cwd);
  if (!pathValidation.valid) {
    return pathValidation;
  }
  
  // Check file extension
  const ext = path.extname(filePath).toLowerCase();
  if (!SECURITY_CONFIG.allowedFileExtensions.includes(ext)) {
    return { valid: false, error: `File type ${ext} is not allowed` };
  }
  
  // Check file size if exists
  const fullPath = path.resolve(cwd, filePath);
  try {
    const stats = fs.statSync(fullPath);
    if (stats.size > SECURITY_CONFIG.maxFileSize) {
      return { valid: false, error: 'File too large' };
    }
  } catch {
    // File doesn't exist, that's ok
  }
  
  return { valid: true };
}

export function validateCommand(command: string): { valid: boolean; error?: string } {
  // Check for dangerous commands
  const dangerousPatterns = [
    /\brm\s+-rf\b/i,
    /\bsudo\b/i,
    /\bsu\s/i,
    /\bchmod\s+777\b/i,
    /\bwget\b|\bcurl\b/i,
    /\bnc\s|\bnetcat\b/i,
    /\bssh\b/i,
    /\bscp\b/i,
    /\brsync\b/i,
    /\bdd\s+if=/i,
    /\bmkfs\b/i,
    /\bfdisk\b/i,
    /\bmount\b/i,
    /\bumount\b/i,
    /\bpasswd\b/i,
    /\bshadow\b/i,
    /\bcrontab\b/i,
    /\bsystemctl\b/i,
    /\bservice\s/i,
    /\bkill\s+-9\b/i,
    /\bkillall\b/i,
    />\s*\/dev\/null/,
    />\s*\/dev\/(zero|random|urandom)/,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      return { valid: false, error: 'Dangerous command detected' };
    }
  }
  
  return { valid: true };
}

// Sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[\x00-\x1f\x7f]/g, '') // Remove control characters
    .replace(/[\r\n\t]/g, ' ') // Replace newlines and tabs
    .trim()
    .substring(0, 1000); // Limit length
}

export function sanitizePath(input: string): string {
  return input
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/^\//, '') // Remove leading slashes
    .replace(/\/$/, '') // Remove trailing slashes
    .replace(/[<>:"|?*]/g, '') // Remove invalid characters
    .trim();
}

// Security logging
export class SecurityLogger {
  private static instance: SecurityLogger;
  private logFile: string;
  
  private constructor() {
    this.logFile = path.join(process.cwd(), '.security.log');
  }
  
  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }
  
  log(event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium'): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity,
      pid: process.pid,
      user: process.env.USER || 'unknown'
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
      fs.appendFileSync(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write security log:', error);
    }
    
    // Also log to console for immediate visibility
    if (severity === 'high') {
      console.error('🚨 SECURITY ALERT:', logEntry);
    } else if (severity === 'medium') {
      console.warn('⚠️  SECURITY WARNING:', logEntry);
    } else {
      console.log('ℹ️  SECURITY INFO:', logEntry);
    }
  }
  
  logBlockedCommand(command: string, reason: string): void {
    this.log('blocked_command', { command, reason }, 'high');
  }
  
  logPathTraversal(attemptedPath: string, resolvedPath: string): void {
    this.log('path_traversal', { attemptedPath, resolvedPath }, 'high');
  }
  
  logRateLimitExceeded(identifier: string, operation: string): void {
    this.log('rate_limit_exceeded', { identifier, operation }, 'medium');
  }
  
  logSuspiciousActivity(activity: string, details: any): void {
    this.log('suspicious_activity', { activity, details }, 'medium');
  }
}

export const securityLogger = SecurityLogger.getInstance();

// Cleanup old rate limit entries periodically
setInterval(() => {
  rateLimiters.perMinute.cleanup();
  rateLimiters.perHour.cleanup();
  rateLimiters.fileOperations.cleanup();
  rateLimiters.commands.cleanup();
}, 5 * 60 * 1000); // Every 5 minutes

// Generate secure tokens
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Validate session tokens
export function validateSessionToken(token: string): boolean {
  // Basic token validation
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Check length
  if (token.length < 16 || token.length > 128) {
    return false;
  }
  
  // Check format (hex)
  return /^[a-f0-9]+$/.test(token);
}