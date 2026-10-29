import * as React from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/**
 * Whether the browser says it is online, kept current by its `online` and
 * `offline` events.
 *
 * `navigator.onLine` false is reliable (no network at all); true only means
 * a network exists, which is why a failed call still has its own sentence.
 * The server snapshot is online, so the first paint never shows a button off
 * that the browser then turns on.
 */
export function useOnline(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}
