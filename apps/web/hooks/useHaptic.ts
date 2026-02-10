"use client";

import { useCallback } from "react";

type HapticType = "success" | "warning" | "light" | "medium" | "heavy";

export function useHaptic() {
  const triggerHaptic = useCallback((type: HapticType = "light") => {
    if (typeof navigator === "undefined" || !navigator.vibrate) return;

    switch (type) {
      case "light":
        navigator.vibrate(10); // Standard light tap (checkboxes)
        break;
      case "medium":
        navigator.vibrate(20); // Slightly stronger
        break;
      case "heavy":
        navigator.vibrate(40); // Heavy impact
        break;
      case "success":
        navigator.vibrate([10, 30, 10]); // Quick double tap
        break;
      case "warning":
        navigator.vibrate([50, 100, 50]); // Long double buzz
        break;
      default:
        navigator.vibrate(10);
    }
  }, []);

  return { triggerHaptic };
}
