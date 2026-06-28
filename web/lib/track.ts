// Lightweight, dependency-free analytics shim.
// Pushes to a dataLayer if present (GTM/Plausible/PostHog can subscribe),
// and beacons to an optional first-party endpoint. No-ops safely otherwise.
type Props = Record<string, string | number | boolean | undefined>;

const ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;

declare global {
  interface Window {
    dataLayer?: unknown[];
    plausible?: (event: string, opts?: { props?: Props }) => void;
  }
}

export function track(event: string, props: Props = {}) {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event, ...props });
    window.plausible?.(event, { props });
    if (ENDPOINT && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, JSON.stringify({ event, props, ts: Date.now() }));
    }
    if (process.env.NODE_ENV === "development") {
      console.debug("[track]", event, props);
    }
  } catch {
    /* analytics must never throw */
  }
}
