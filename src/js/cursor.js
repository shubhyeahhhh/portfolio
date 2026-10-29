// Custom cursor: a dot plus a lagging ring that turns into a labelled pill over
// projects ([data-cursor="View"]) and widens over links; buttons are magnetic.
// Mouse/pen only, and never with reduced motion. The native cursor stays visible.
import { gsap } from 'gsap';
import { finePointer } from './util.js';

export function initCursor() {
  if (!finePointer() || !document.documentElement.classList.contains('motion')) return;

  const el = document.createElement('div');
  el.className = 'cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="cursor__ring"><span class="cursor__label"></span></span><span class="cursor__dot"></span>';
  document.body.append(el);
  const ring = el.querySelector('.cursor__ring');
  const dot = el.querySelector('.cursor__dot');
  const label = el.querySelector('.cursor__label');

  const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });
  const dotX = gsap.quickSetter(dot, 'x', 'px');
  const dotY = gsap.quickSetter(dot, 'y', 'px');

  let shown = false;
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      if (!shown) {
        shown = true;
        document.documentElement.classList.add('has-cursor');
        gsap.set(ring, { x: e.clientX, y: e.clientY });
      }
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    },
    { passive: true }
  );
  document.addEventListener('pointerleave', () => el.classList.add('is-hidden'));
  document.addEventListener('pointerenter', () => el.classList.remove('is-hidden'));

  document.addEventListener('pointerover', (e) => {
    const t = e.target;
    const labelled = t.closest('[data-cursor]');
    const portrait = t.closest('[data-portrait-frame]');
    el.classList.toggle('is-label', !!labelled);
    el.classList.toggle('is-link', !labelled && !!t.closest('a, button, summary, label.chip'));
    el.classList.toggle('is-hidden', !!portrait); // the portrait draws its own focus ring
    el.classList.toggle('on-dark', !!t.closest('.band--ink, .site-footer'));
    if (labelled) label.textContent = labelled.dataset.cursor;
  });

  // Magnetic buttons
  document.querySelectorAll('.btn').forEach((btn) => {
    const x = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
    btn.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = btn.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.25);
      y((e.clientY - (r.top + r.height / 2)) * 0.3);
    });
    btn.addEventListener('pointerleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' }));
  });
}
