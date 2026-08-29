/**
 * MessMates — Observability Service
 * Sentry (error tracking) + PostHog (product analytics)
 *
 * Entry point: initObservability() — called from main.jsx on app startup.
 *
 * SECURITY RULES:
 * - Never send: password, OTP, auth tokens, API keys, private keys
 * - Never send: raw Firebase error objects
 * - Analytics failure must NEVER break authentication
 */

// ─────────────────────────────────────────────────────────────────────────────
// SENTRY
// ─────────────────────────────────────────────────────────────────────────────

let sentryInitialized = false;
let SentryInstance = null;

export async function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.info('[Observability] Sentry DSN not configured — skipping init.');
    return;
  }

  try {
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE || 'production',
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      tracesSampleRate: 0.1,
      // Scrub sensitive fields before sending to Sentry
      beforeSend(event) {
        // Strip request body to prevent OTP/password leakage
        if (event.request) {
          delete event.request.data;
          delete event.request.cookies;
        }
        return event;
      },
      ignoreErrors: [
        // Ignore benign Firebase network blips
        'auth/network-request-failed',
        // Ignore ResizeObserver loop errors (browser quirk)
        'ResizeObserver loop limit exceeded',
      ]
    });
    SentryInstance = Sentry;
    sentryInitialized = true;
    console.info('[Observability] Sentry initialized.');
  } catch (e) {
    console.warn('[Observability] Sentry init failed (non-fatal):', e.message);
  }
}

/**
 * Capture an auth error to Sentry with safe scrubbing.
 * Never logs password, OTP, tokens, or API keys.
 */
export function captureAuthError(error, context = {}) {
  if (!sentryInitialized || !SentryInstance) return;
  try {
    // Strip sensitive keys from context
    const safeContext = { ...context };
    delete safeContext.password;
    delete safeContext.otp;
    delete safeContext.token;
    delete safeContext.apiKey;
    delete safeContext.sessionToken;
    delete safeContext.verificationProofToken;

    SentryInstance.withScope((scope) => {
      if (safeContext.requestId) scope.setTag('request_id', safeContext.requestId);
      if (safeContext.event) scope.setTag('auth_event', safeContext.event);
      scope.setExtras(safeContext);
      SentryInstance.captureException(
        error instanceof Error ? error : new Error(String(error))
      );
    });
  } catch (e) {
    // Never let observability failures reach the user
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POSTHOG
// ─────────────────────────────────────────────────────────────────────────────

let posthogInitialized = false;
let posthogInstance = null;

export async function initPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

  if (!key) {
    console.info('[Observability] PostHog key not configured — skipping init.');
    return;
  }

  try {
    const posthog = (await import('posthog-js')).default;
    posthog.init(key, {
      api_host: host,
      capture_pageview: false,     // Manual control
      capture_pageleave: false,
      autocapture: false,          // No automatic capture — privacy-first
      persistence: 'memory',       // Don't persist user tracking across sessions
      disable_session_recording: true,
    });
    posthogInstance = posthog;
    posthogInitialized = true;
    console.info('[Observability] PostHog initialized.');
  } catch (e) {
    console.warn('[Observability] PostHog init failed (non-fatal):', e.message);
  }
}

/**
 * Track a safe auth event to PostHog.
 * Never sends: password, OTP, auth tokens, secrets.
 */
export function trackAuthEvent(event, properties = {}) {
  if (!posthogInitialized || !posthogInstance) return;

  try {
    // Whitelist safe properties only
    const SAFE_KEYS = [
      'requestId', 'role', 'method', 'errorCode', 'success',
      'hostelBlock', 'gender', 'attemptNumber', 'source'
    ];

    const safeProps = {};
    for (const key of SAFE_KEYS) {
      if (properties[key] !== undefined) {
        safeProps[key] = properties[key];
      }
    }

    posthogInstance.capture(event, safeProps);
  } catch (e) {
    // Never let observability failures reach the user
  }
}

/**
 * Identify a user in PostHog (safe — no PII beyond role).
 * Only called after successful login with non-sensitive identifiers.
 */
export function identifyUser(uid, role) {
  if (!posthogInitialized || !posthogInstance) return;
  try {
    posthogInstance.identify(uid, { role });
  } catch (e) {}
}

/**
 * Reset PostHog session on logout.
 */
export function resetAnalyticsSession() {
  if (!posthogInitialized || !posthogInstance) return;
  try {
    posthogInstance.reset();
  } catch (e) {}
}

// ─────────────────────────────────────────────────────────────────────────────
// CORRELATION ID
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a short safe correlation ID for request tracing.
 * Format: MM-<8 hex chars>
 */
export function generateRequestId() {
  try {
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    return 'MM-' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  } catch (e) {
    return 'MM-' + Math.random().toString(36).slice(2, 10).toUpperCase();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED INIT (called from main.jsx)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize all observability services.
 * Called once on app startup. Failures are non-fatal.
 */
export function initObservability() {
  // Use async init but do not block app startup
  Promise.all([initSentry(), initPostHog()]).catch(() => {
    // Observability failures must never break the app
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKWARD-COMPATIBLE ALIASES
// (storage.js and other callers use the old function names)
// ─────────────────────────────────────────────────────────────────────────────

/** Alias for captureAuthError — generic error capture */
export const captureException = (error, context) => captureAuthError(error, context);

/** Alias for trackAuthEvent — generic event tracking */
export const trackEvent = (event, properties) => trackAuthEvent(event, properties);
