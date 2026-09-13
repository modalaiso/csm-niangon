"use client";

import type { AnalyticsEventName } from "@/lib/analytics-types";

export interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | null;
}

const SESSION_STORAGE_KEY = "csm_visit_sid";
const SESSION_STARTED_AT_KEY = "csm_visit_sid_started_at";
const UTM_STORAGE_KEY = "csm_analytics_utm";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export function getAnalyticsSessionId(): string {
  try {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    const startedAt = Number(
      window.localStorage.getItem(SESSION_STARTED_AT_KEY) ?? 0,
    );
    if (existing && Date.now() - startedAt < SESSION_TIMEOUT_MS) {
      return existing;
    }
    const created = crypto.randomUUID();
    window.localStorage.setItem(SESSION_STORAGE_KEY, created);
    window.localStorage.setItem(SESSION_STARTED_AT_KEY, String(Date.now()));
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

export function captureCampaignParameters() {
  const params = new URLSearchParams(window.location.search);
  const campaign = {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    term: params.get("utm_term"),
    content: params.get("utm_content"),
  };

  if (!Object.values(campaign).some(Boolean)) return;

  try {
    window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(campaign));
  } catch {
    // Le suivi reste fonctionnel sans les paramètres de campagne.
  }
}

function getCampaignParameters(): AnalyticsEventProperties {
  try {
    const value = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    return value ? (JSON.parse(value) as AnalyticsEventProperties) : {};
  } catch {
    return {};
  }
}

export function trackAnalyticsEvent(
  name: AnalyticsEventName,
  properties: AnalyticsEventProperties = {},
  options: { keepalive?: boolean } = {},
) {
  const payload = JSON.stringify({
    name,
    path: window.location.pathname,
    sessionId: getAnalyticsSessionId(),
    properties: {
      ...getCampaignParameters(),
      ...properties,
    },
  });

  if (options.keepalive && typeof navigator.sendBeacon === "function") {
    const queued = navigator.sendBeacon(
      "/api/analytics",
      new Blob([payload], { type: "application/json" }),
    );
    if (queued) return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: options.keepalive,
  }).catch(() => {
    // L'analytics ne doit jamais perturber l'expérience utilisateur.
  });
}
