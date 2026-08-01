/**
 * Consent state, persisted across reloads and shared across tabs.
 *
 * Three states, and the distinction matters: `granted` and `denied` are
 * decisions the visitor made, `unset` means they have not been asked yet or
 * dismissed without choosing. Only `granted` permits any capture — an unset
 * visitor is treated exactly like a denied one, so the default is silence
 * rather than "silence until we get round to asking".
 *
 * Modelled as an external store rather than React state on purpose. The
 * authoritative value lives in localStorage, which React does not own: another
 * tab can change it, and reading it during render on the server is impossible.
 * `useSyncExternalStore` is the supported way to subscribe to exactly that,
 * and it removes the read-then-setState-in-an-effect dance entirely.
 */
export type ConsentState = "granted" | "denied" | "unset";

const STORAGE_KEY = "yuvoy.analytics-consent";

const listeners = new Set<() => void>();
/** Cached so getSnapshot is referentially stable between notifications. */
let snapshot: ConsentState | null = null;

function read(): ConsentState {
  if (typeof window === "undefined") return "unset";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "granted" || stored === "denied" ? stored : "unset";
  } catch {
    // Private mode, disabled storage, quota — treat as never asked, which
    // fails closed to silence.
    return "unset";
  }
}

function notify() {
  snapshot = null;
  for (const listener of listeners) listener();
}

export function subscribeConsent(onChange: () => void): () => void {
  listeners.add(onChange);
  // Another tab changing the decision must be honoured here too.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function getConsentSnapshot(): ConsentState {
  snapshot ??= read();
  return snapshot;
}

/** The server has no storage; consent is always unset until hydration. */
export function getConsentServerSnapshot(): ConsentState {
  return "unset";
}

export function setConsent(state: Exclude<ConsentState, "unset">): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, state);
  } catch {
    // If we cannot persist the choice we still honour it for this session:
    // the cached snapshot below is what the UI reads.
  }
  snapshot = state;
  for (const listener of listeners) listener();
}

export function clearConsent(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do.
  }
  notify();
}
