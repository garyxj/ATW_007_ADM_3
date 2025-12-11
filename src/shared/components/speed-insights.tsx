'use client';

import { SpeedInsights } from '@vercel/speed-insights/next';

/**
 * Speed Insights Component
 * Initializes Vercel Speed Insights for web performance monitoring
 * Must be rendered as a client component
 */
export function SpeedInsightsComponent() {
  return <SpeedInsights />;
}
