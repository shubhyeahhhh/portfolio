// Page change = a tally-red wipe, left → right. Same-origin page links only;
// new tabs, downloads, anchors and modified clicks behave normally.
import { gsap } from 'gsap';
import { motionEnabled } from './motion.js';

// sessionStorage can throw (private mode, sandboxed frames) — never let that break navigation.
const store = {
  get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } },
  del: (k) => { try { sessionStorage.removeItem(k); } catch { /* ignore */ } },
};

export function initTransitions() {
  const wipe = document.querySelector('[data-wipe]');
  if (!wipe || !motionEnabled()) return;

  // Arriving: uncover the new page.
  const reveal = () => gsap.fromTo(wipe, { scaleX: 1, transformOrigin: 'right' }, { scaleX: 0, duration: 0.45, ease: 'expo.inOut', delay: 0.05 });
  if (store.get('wipe') === '1') {
    store.del('wipe');
    reveal();
  }
  // Back/forward cache restores the page mid-wipe; reset it.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) gsap.set(wipe, { scaleX: 0 });
  });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;
    if (/\.(jpe?g|png|webp|pdf|mp4|zip)$/i.test(url.pathname)) return;

    e.preventDefault();
    store.set('wipe', '1');
    gsap.fromTo(
      wipe,
      { scaleX: 0, transformOrigin: 'left' },
      { scaleX: 1, duration: 0.4, ease: 'expo.inOut', onComplete: () => (location.href = url.href) }
    );
  });
}
