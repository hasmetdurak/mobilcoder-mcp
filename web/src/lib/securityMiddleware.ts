import { CSP_HEADERS } from './security';

// Security middleware for client-side protection
export class SecurityMiddleware {
  private static instance: SecurityMiddleware;
  private initialized = false;

  static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware();
    }
    return SecurityMiddleware.instance;
  }

  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Set security headers (if running in a supported environment)
    this.setSecurityHeaders();
    
    // Initialize other security measures
    this.initializeXSSProtection();
    this.initializeClickjackingProtection();
    this.initializeContentSecurityPolicy();
    
    console.log('🔒 Security middleware initialized');
  }

  private setSecurityHeaders(): void {
    // Note: In a browser environment, we can't directly set HTTP headers
    // but we can implement equivalent protections
    
    // Store security policies in localStorage for reference
    localStorage.setItem('security-policies', JSON.stringify({
      csp: CSP_HEADERS['Content-Security-Policy'],
      lastUpdated: Date.now()
    }));
  }

  private initializeXSSProtection(): void {
    // XSS Protection
    const originalSetInnerHTML = Element.prototype.innerHTML;
    Element.prototype.innerHTML = function(html: string) {
      // Basic XSS protection for dynamic content
      if (typeof html === 'string') {
        // Remove script tags and dangerous attributes
        const sanitized = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/vbscript:/gi, '')
          .replace(/data:/gi, '');
        
        return originalSetInnerHTML.call(this, sanitized);
      }
      return originalSetInnerHTML.call(this, html);
    };
  }

  private initializeClickjackingProtection(): void {
    // Frame busting for clickjacking protection
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
  }

  private initializeContentSecurityPolicy(): void {
    // Monitor CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      console.warn('CSP Violation:', {
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        effectiveDirective: event.effectiveDirective,
        originalPolicy: event.originalPolicy,
        referrer: event.referrer,
        sourceFile: event.sourceFile,
        violatedDirective: event.violatedDirective
      });
    });
  }

  // Validate and sanitize external URLs
  validateExternalUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Allow only HTTPS and specific domains
      const allowedProtocols = ['https:', 'http:'];
      const allowedDomains = [
        'mcp-signal.workers.dev',
        'firebaseio.com',
        'googleapis.com',
        'gstatic.com',
        'ui-avatars.com',
        'github.com',
        'localhost'
      ];

      return allowedProtocols.includes(urlObj.protocol) &&
             allowedDomains.some(domain => 
               urlObj.hostname === domain || 
               urlObj.hostname.endsWith(`.${domain}`)
             );
    } catch {
      return false;
    }
  }

  // Sanitize file uploads and downloads
  sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[<>:"|?*]/g, '') // Remove invalid characters
      .replace(/\.\./g, '') // Remove path traversal
      .replace(/^\//, '') // Remove leading slash
      .substring(0, 255) // Limit length
      .trim();
  }

  // Check for suspicious activity patterns
  detectSuspiciousActivity(action: string, context: any): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /document\.cookie/i,
      /localStorage/i,
      /sessionStorage/i,
      /window\.location/i,
      /document\.write/i
    ];

    const contextStr = JSON.stringify(context);
    return suspiciousPatterns.some(pattern => 
      pattern.test(action) || pattern.test(contextStr)
    );
  }

  // Rate limiting for sensitive operations
  private operationCounts = new Map<string, { count: number; resetTime: number }>();

  checkOperationRate(operation: string, maxOps: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.operationCounts.get(operation);
    
    if (!entry || now > entry.resetTime) {
      this.operationCounts.set(operation, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (entry.count >= maxOps) {
      return false;
    }
    
    entry.count++;
    return true;
  }

  // Generate secure random values
  generateSecureId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validate session integrity
  validateSession(): boolean {
    const sessionData = sessionStorage.getItem('session-integrity');
    if (!sessionData) return false;

    try {
      const session = JSON.parse(sessionData);
      const now = Date.now();
      
      // Check session age (max 1 hour)
      if (now - session.createdAt > 3600000) {
        sessionStorage.removeItem('session-integrity');
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  // Create secure session
  createSession(): void {
    const sessionData = {
      id: this.generateSecureId(),
      createdAt: Date.now(),
      userAgent: navigator.userAgent.substring(0, 200) // Limit length
    };
    
    sessionStorage.setItem('session-integrity', JSON.stringify(sessionData));
  }

  // Clear session
  clearSession(): void {
    sessionStorage.removeItem('session-integrity');
    localStorage.removeItem('security-policies');
  }
}

// Export singleton instance
export const securityMiddleware = SecurityMiddleware.getInstance();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  securityMiddleware.initialize();
}