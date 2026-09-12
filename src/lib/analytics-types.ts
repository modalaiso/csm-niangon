export const ANALYTICS_EVENT_NAMES = [
  "page_view",
  "page_engagement",
  "scroll_depth",
  "outbound_click",
  "search",
  "filter",
  "share",
  "like",
  "comment_created",
  "web_vital",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export interface LogAnalyticsEventInput {
  name: AnalyticsEventName;
  path: string;
  sessionId: string;
  properties?: Record<string, string | number | boolean | null>;
}
