"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    const posthogKey =
      process.env.NEXT_PUBLIC_POSTHOG_KEY ??
      process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

    if (!posthogKey || posthog.__loaded) {
      return;
    }

    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      disable_session_recording: false,
    });
  }, []);

  return <>{children}</>;
}