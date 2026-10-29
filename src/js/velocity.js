// Scroll-velocity motion: the roles ticker runs faster (and reverses) with scroll
// speed, and [data-velocity] blocks lean slightly while you scroll, then settle.
import { gsap } from 'gsap';

export function initVelocity(lenis) {
  if (!lenis) return;

  const track = document.querySelector('[data-marquee-track]');
  let loop = null;
  if (track) {
    // Duplicate the content once so the loop is seamless at -50%.
    track.append(...[...track.children].map((n) => n.cloneNode(true)));
    loop = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
    // Start deep into the repeats so a negative timeScale (scrolling up) can run backwards.
    loop.totalTime(loop.duration() * 1000);
  }

  const leaners = gsap.utils.toArray('[data-velocity]');
  const lean = { v: 0 };
  let dir = 1;

  lenis.on('scroll', ({ velocity }) => {
    const v = velocity || 0;
    if (Math.abs(v) > 0.5) dir = Math.sign(v);
    // Lean follows speed (clamped to ±1.5°) and eases back when scrolling stops.
    gsap.to(lean, {
      v: gsap.utils.clamp(-1.5, 1.5, v * 0.08),
      duration: 0.5,
      ease: 'power3.out',
      overwrite: true,
      onUpdate: () => leaners.forEach((el) => el.style.setProperty('--lean', `${lean.v.toFixed(3)}deg`)),
    });
    if (loop) {
      gsap.to(loop, { timeScale: dir * (1 + Math.min(Math.abs(v) * 0.35, 6)), duration: 0.4, overwrite: true });
    }
  });

  // When scrolling stops, settle back to a calm drift in the last direction.
  if (loop) {
    let idle;
    lenis.on('scroll', () => {
      clearTimeout(idle);
      idle = setTimeout(() => gsap.to(loop, { timeScale: dir, duration: 1.2, ease: 'power2.out', overwrite: true }), 140);
    });
  }
}
