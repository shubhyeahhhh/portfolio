// Opening slate on the home page (first visit per session, motion only):
// viewfinder brackets close in, the timecode runs one second of frames, then the
// slate lifts away and the hero plays. Resolves when the page is ready to animate.
import { gsap } from 'gsap';
import { store } from './util.js';

export function playIntro() {
  const root = document.documentElement;
  const el = document.querySelector('[data-intro]');
  if (!el || !root.classList.contains('intro-play')) return Promise.resolve();
  store.set('introSeen', '1');

  const tc = el.querySelector('[data-intro-tc]');
  const frames = { f: 0 };
  const pad = (n) => String(n).padStart(2, '0');

  return new Promise((resolve) => {
    gsap
      .timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          root.classList.remove('intro-play');
          gsap.set(el, { clearProps: 'all' });
          resolve();
        },
      })
      .to(el.querySelectorAll('[data-intro-mark] i'), { '--inset': '0px', duration: 0.9, stagger: 0.04 }, 0)
      .to(el.querySelector('[data-intro-mark] b'), { opacity: 1, duration: 0.5 }, 0.35)
      .fromTo(el.querySelector('[data-intro-name]'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, 0.45)
      .to(el.querySelector('[data-intro-progress]'), { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0.1)
      .to(frames, {
        f: 24,
        duration: 1.1,
        ease: 'none',
        onUpdate: () => (tc.textContent = `00:00:${pad(Math.floor(frames.f / 24))}:${pad(Math.floor(frames.f) % 24)}`),
      }, 0.1)
      .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'expo.inOut' }, 1.35);
  });
}
