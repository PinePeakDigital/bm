// Cross-cutting helpers for treating navigation as moving between pages rather
// than toggling in-place state. Inspired by
// https://blog.jim-nielsen.com/2026/small-html-pages/ — real links, real
// history, enhanced with the View Transitions API where the browser supports
// it and degrading silently where it doesn't.

type DocumentWithViewTransitions = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => unknown;
};

// Run a DOM-updating callback (typically a router navigation) inside a view
// transition when the browser supports one, otherwise just run it. The callback
// may return a promise; the transition waits for it before snapshotting the new
// state, so an async router navigation animates correctly.
export function startViewTransition(update: () => void | Promise<void>): void {
  const doc = document as DocumentWithViewTransitions;
  if (typeof doc.startViewTransition !== "function") {
    void update();
    return;
  }
  doc.startViewTransition(update);
}

// True for a plain left click — the only case where we hijack an anchor for
// client-side navigation. Modified clicks (new tab, download, etc.) and
// non-primary buttons are left to the browser, so real links keep behaving like
// real links (middle-click, cmd-click, "copy link address").
export function isPlainLeftClick(e: MouseEvent): boolean {
  return (
    e.button === 0 &&
    !e.metaKey &&
    !e.ctrlKey &&
    !e.shiftKey &&
    !e.altKey
  );
}

// Whether we've performed at least one in-app navigation this page load. Used to
// decide whether a "back" affordance can safely pop history (returning the user
// to their scroll position on the dashboard) or must fall back to navigating to
// a known route — the SPA equivalent of the post's document.referrer check, since
// document.referrer doesn't update on client-side navigation.
let internalNavigationHappened = false;

export function markInternalNavigation(): void {
  internalNavigationHappened = true;
}

export function hasInternalHistory(): boolean {
  return internalNavigationHappened;
}
