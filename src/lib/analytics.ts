"use client";

import posthog from "posthog-js";

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;
  if (!posthog.__loaded) return;

  posthog.capture(name, properties);
}

export const analytics = {
  headerCtaClicked: (source: string) => trackEvent("header_cta_clicked", { source }),
  meetPepOpened: (source: string) => trackEvent("meet_pep_opened", { source }),
  meetPepStepViewed: (stepId: string) => trackEvent("meet_pep_step_viewed", { stepId }),
  meetPepOptionSelected: (stepId: string, optionId: string) =>
    trackEvent("meet_pep_option_selected", { stepId, optionId }),
  meetPepCompleted: () => trackEvent("meet_pep_completed"),
  meetPepStoreClicked: (store: "appStore" | "googlePlay") =>
    trackEvent("meet_pep_store_clicked", { store }),
};