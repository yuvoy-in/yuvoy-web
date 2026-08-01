import "@testing-library/jest-dom/vitest";

/*
  jsdom gaps.

  These are shims for browser APIs jsdom does not implement, not stand-ins for
  behaviour under test. Anything that depends on real layout or the top layer —
  Escape-to-close, the focus trap, focus restoration, reduced motion — is
  asserted in a real browser in the Playwright suite instead.
*/

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

if (typeof HTMLDialogElement !== "undefined") {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(
      this: HTMLDialogElement,
    ) {
      this.open = true;
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close(
      this: HTMLDialogElement,
    ) {
      this.open = false;
      this.dispatchEvent(new Event("close"));
    };
  }
}
