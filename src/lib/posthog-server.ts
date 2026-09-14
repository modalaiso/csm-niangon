import { PostHog } from "posthog-node";

type EventProperties = Record<string, string | number | boolean | null>;
type PersonProperties = Record<string, string | number | boolean | null>;

export function getPostHogClient(): PostHog | null {
  const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!projectToken || !host) {
    if (process.env.NODE_ENV === "development") {
      const missingVariable = projectToken
        ? "NEXT_PUBLIC_POSTHOG_HOST"
        : "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN";
      throw new Error(
        `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
      );
    }
    return null;
  }

  return new PostHog(projectToken, {
    host,
    flushAt: 1,
    flushInterval: 0,
    enableExceptionAutocapture: true,
  });
}

export async function captureServerEvent(input: {
  distinctId: string;
  event: string;
  properties?: EventProperties;
  personProperties?: PersonProperties;
}) {
  const posthog = getPostHogClient();
  if (!posthog) return;

  try {
    if (input.personProperties) {
      posthog.identify({
        distinctId: input.distinctId,
        properties: input.personProperties,
      });
    }
    posthog.capture({
      distinctId: input.distinctId,
      event: input.event,
      properties: input.properties,
    });
  } catch (error) {
    console.error("PostHog event capture failed:", error);
  } finally {
    await posthog.shutdown().catch((error) => {
      console.error("PostHog shutdown failed:", error);
    });
  }
}

export async function captureServerException(
  error: unknown,
  distinctId: string,
) {
  const posthog = getPostHogClient();
  if (!posthog) return;

  try {
    posthog.captureException(error, distinctId);
  } catch (captureError) {
    console.error("PostHog exception capture failed:", captureError);
  } finally {
    await posthog.shutdown().catch((shutdownError) => {
      console.error("PostHog shutdown failed:", shutdownError);
    });
  }
}
