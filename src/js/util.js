// sessionStorage can throw (private mode, sandboxed frames) — never let that break the page.
export const store = {
  get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } },
};

// Precise mouse/pen pointer (no hover effects on touch).
export const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
