/**
 * Shoraluxe Virtual Firewall (vWAF)
 * Provides frontend-level threat detection and rate limiting simulations.
 */

const THREAT_SIGNATURES = [
  '<script>',
  'UNION SELECT',
  'OR 1=1',
  'drop table',
  '--',
  'javascript:',
];

export const firewall = {
  // Simple check for injected scripts or SQL patterns in inputs
  isMalicious: (input) => {
    if (typeof input !== 'string') return false;
    const lowerInput = input.toLowerCase();
    return THREAT_SIGNATURES.some(sig => lowerInput.includes(sig.toLowerCase()));
  },

  // Record a security event in localStorage
  LogSecurityEvent: (type, details) => {
    const logs = JSON.parse(localStorage.getItem('shoraluxe_security_logs') || '[]');
    logs.push({
      timestamp: new Date().toISOString(),
      type,
      details,
      userAgent: navigator.userAgent
    });
    // Keep only last 50 events
    localStorage.setItem('shoraluxe_security_logs', JSON.stringify(logs.slice(-50)));
  },

  // Check if the current client is rate-limited (simulation)
  checkRateLimit: (action) => {
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem(`rate_limit_${action}`) || '[]');
    
    // Filter attempts in the last 60 seconds
    const recentAttempts = attempts.filter(t => now - t < 60000);
    
    if (recentAttempts.length > 5) {
      return { limited: true, retryAfter: Math.ceil((60000 - (now - recentAttempts[0])) / 1000) };
    }
    
    recentAttempts.push(now);
    localStorage.setItem(`rate_limit_${action}`, JSON.stringify(recentAttempts));
    return { limited: false };
  }
};
