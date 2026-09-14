"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

interface PostHogUserIdentityProps {
  user: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
  } | null;
}

export function PostHogUserIdentity({
  user,
}: Readonly<PostHogUserIdentityProps>) {
  useEffect(() => {
    if (!user) return;

    posthog.identify(user.id, {
      email: user.email,
      name: user.name,
      role: user.role,
    });
  }, [user]);

  return null;
}
