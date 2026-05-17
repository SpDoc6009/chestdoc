"use client";

import { useEffect } from "react";

type ViewTrackerProps = {
  contentType: "article" | "report" | "teaching" | "pdf";
  contentId: string;
  title: string;
  path: string;
};

export function ViewTracker({ contentType, contentId, title, path }: ViewTrackerProps) {
  useEffect(() => {
    const storageKey = `viewed:${contentType}:${contentId}`;
    const now = Date.now();

    try {
      const lastViewed = Number(window.sessionStorage.getItem(storageKey) ?? 0);
      if (now - lastViewed < 30 * 60 * 1000) return;
      window.sessionStorage.setItem(storageKey, String(now));
    } catch {
      // Safari can block storage in some privacy contexts; tracking should never break the page.
    }

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType, contentId, title, path }),
      keepalive: true
    }).catch(() => {
      try {
        window.sessionStorage.removeItem(storageKey);
      } catch {
        // Ignore storage cleanup failures for the same reason as above.
      }
    });
  }, [contentType, contentId, title, path]);

  return null;
}
