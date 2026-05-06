// PUSPA V5 — Sentry Error Tracking Setup
// @sentry/nextjs is an optional dependency — only enabled when installed and DSN is configured

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null;

try {
  // Dynamic import to avoid build failure when @sentry/nextjs is not installed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Sentry = require("@sentry/nextjs");
} catch {
  // @sentry/nextjs not installed — Sentry will be disabled
}

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (Sentry && SENTRY_DSN && process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '0.2.0',
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    tracesSampleRate: 0.5,
    
    // Capture 100% of the replays for session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Integrate with Next.js
    integrations: [
      Sentry.replayIntegration(),
    ],
    
    beforeSend(event) {
      // Sanitize PII (IC numbers, etc.)
      if (event.message) {
        event.message = event.message.replace(/\d{6}-\d{2}-\d{4}/g, '****XXXX');
      }
      if (event.exception) {
        event.exception.values?.forEach(exception => {
          if (exception.value) {
            exception.value = exception.value.replace(/\d{6}-\d{2}-\d{4}/g, '****XXXX');
          }
        });
      }
      return event;
    },
  });

  console.log('[Sentry] Error tracking initialized');
} else {
  console.log('[Sentry] Disabled (package not installed, no DSN, or not production)');
}

export { Sentry };
