/**
 * Measure & collect issues from clients
 */
import * as Sentry from "@sentry/react";
// import { BrowserTracing } from "@sentry/tracing";
import { ENV_NAME } from '@env';

export function initMonitoring() {
  Sentry.init({
    dsn: "https://9d06f20801f04ba9b5bf9b0d69ac180f@o1143758.ingest.sentry.io/6243049",

    environment: ENV_NAME,
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.7,
  });
}