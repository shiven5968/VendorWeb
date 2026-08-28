/**
 * Production Observability, Sentry Error Tracking & PostHog Analytics
 * 
 * Provides centralized, privacy-safe observability:
 * - Sentry for exception reporting & error boundaries
 * - PostHog for product lifecycle & usage analytics
 * - Automatic scrubbing of sensitive tokens, passwords, and raw OTPs
 * - Graceful fallback: 100% resilient if services are unconfigured or offline
 */

const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

const SENTRY_DSN = metaEnv.VITE_SENTRY_DSN || '';
const POSTHOG_KEY = metaEnv.VITE_POSTHOG_KEY || '';
const POSTHOG_HOST = metaEnv.VITE_POSTHOG_HOST || 'https://app.posthog.com';

let isSentryInitialized = false;
let isPostHogInitialized = false;

/**
 * Strips sensitive data (passwords, OTPs, private keys, auth tokens)
 */
export const sanitizePayload = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = Array.isArray(obj) ? [] : {};
  const sensitiveKeys = [
    'password', 'confirmPassword', 'otp', 'hashedOtp', 
    'token', 'secret', 'keySecret', 'privateKey', 
    'razorpay_signature', 'serviceAccount'
  ];

  for (const [key, val] of Object.entries(obj)) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizePayload(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
};

/**
 * Initialize Sentry & PostHog if environment configuration is present
 */
export const initObservability = () => {
  // 1. Sentry Initialization
  if (SENTRY_DSN && typeof window !== 'undefined' && !isSentryInitialized) {
    try {
      if (window.Sentry) {
        window.Sentry.init({
          dsn: SENTRY_DSN,
          environment: metaEnv.MODE || 'production',
          beforeSend(event) {
            if (event.request && event.request.data) {
              event.request.data = sanitizePayload(event.request.data);
            }
            return event;
          }
        });
        isSentryInitialized = true;
      }
    } catch (err) {
      console.warn('[Observability Sentry Init Notice]:', err.message);
    }
  }

  // 2. PostHog Initialization
  if (POSTHOG_KEY && typeof window !== 'undefined' && !isPostHogInitialized) {
    try {
      if (window.posthog) {
        window.posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          autocapture: false,
          capture_pageview: true,
          sanitize_properties: (properties) => sanitizePayload(properties)
        });
        isPostHogInitialized = true;
      }
    } catch (err) {
      console.warn('[Observability PostHog Init Notice]:', err.message);
    }
  }
};

/**
 * Safely capture an exception to Sentry
 */
export const captureException = (error, context = {}) => {
  const safeContext = sanitizePayload(context);
  
  if (typeof window !== 'undefined' && window.Sentry && isSentryInitialized) {
    try {
      window.Sentry.captureException(error, { extra: safeContext });
      return;
    } catch (e) {}
  }

  // Safe developer diagnostics in development
  if (metaEnv.DEV) {
    console.error('[Error Captured]:', error, safeContext);
  }
};

/**
 * Track user-safe product analytics event in PostHog
 */
export const trackEvent = (eventName, properties = {}) => {
  const safeProps = sanitizePayload(properties);

  if (typeof window !== 'undefined' && window.posthog && isPostHogInitialized) {
    try {
      window.posthog.capture(eventName, safeProps);
      return;
    } catch (e) {}
  }

  // Developer diagnostics in development
  if (metaEnv.DEV) {
    console.log(`[Analytics: ${eventName}]:`, safeProps);
  }
};

/**
 * Identify authenticated user in PostHog safely (using user UID)
 */
export const identifyUser = (uid, safeTraits = {}) => {
  if (!uid) return;
  const traits = sanitizePayload(safeTraits);

  if (typeof window !== 'undefined' && window.posthog && isPostHogInitialized) {
    try {
      window.posthog.identify(uid, traits);
    } catch (e) {}
  }
};

/**
 * Reset analytics session on logout
 */
export const resetUserSession = () => {
  if (typeof window !== 'undefined' && window.posthog && isPostHogInitialized) {
    try {
      window.posthog.reset();
    } catch (e) {}
  }
};
