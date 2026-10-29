// Scroll motion: Lenis smooth scroll + GSAP reveals. Everything here is skipped
// under prefers-reduced-motion (the <head> script never adds `.motion`).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const motionEnabled = () => document.documentElement.classList.contains('motion');

let lenis = null;
export const getLenis = () => lenis;

function initSmoothScroll() {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // In-page anchors glide instead of jumping (header is sticky, so offset it).
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -88 });
    history.replaceState(null, '', a.getAttribute('href'));
  });
}

// Headlines rise line by line from a mask.
function initSplits() {
  gsap.utils.toArray('[data-split]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line', aria: 'auto' });
    gsap.set(el, { visibility: 'visible' });
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.07,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

function initReveals() {
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    once: true,
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });
}

// Media opens from the centre as it enters the viewport.
function initUnclip() {
  gsap.utils.toArray('[data-unclip]').forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(6% 4% 6% 4% round 12px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 12px)',
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 45%', scrub: 0.6 },
      }
    );
  });
}

function initCounters() {
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const state = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () =>
        gsap.to(state, {
          v: end,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => (el.textContent = Math.round(state.v)),
        }),
    });
  });
}

export function initMotion() {
  if (!motionEnabled()) return;
  initSmoothScroll();
  // Wait for web fonts so line splits match the final layout.
  const ready = document.fonts?.ready ?? Promise.resolve();
  ready.then(() => {
    initSplits();
    initReveals();
    initUnclip();
    initCounters();
    window.__motionReady = true;
    ScrollTrigger.refresh();
  });
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
