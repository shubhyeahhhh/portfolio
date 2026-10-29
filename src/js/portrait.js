// Portrait "focus pull": on hover the frame drops to soft monochrome, a sharp
// full-colour lens opens like an iris and follows the pointer, the rim light
// tracks it, the frame tilts, the brackets snap in and a REC timecode runs.
// Mouse/pen only — touch keeps the plain colour portrait.
export function initPortrait(root) {
  if (!root) return;
  const frame = root.querySelector('[data-portrait-frame]');
  const tcEl = root.querySelector('[data-timecode]');
  const coordsEl = root.querySelector('[data-coords]');
  const hintEl = root.querySelector('[data-portrait-hint]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let raf = 0;
  let frames = 12 * 24 + 8;
  let lastTick = 0;
  const pad = (n) => String(n).padStart(2, '0');

  const tick = (t) => {
    if (t - lastTick >= 1000 / 24) {
      frames++;
      lastTick = t;
      tcEl.textContent = `00:${pad(Math.floor(frames / 1440) % 60)}:${pad(Math.floor(frames / 24) % 60)}:${pad(frames % 24)}`;
    }
    raf = requestAnimationFrame(tick);
  };

  const set = (x, y) => {
    frame.style.setProperty('--x', `${(x * 100).toFixed(2)}%`);
    frame.style.setProperty('--y', `${(y * 100).toFixed(2)}%`);
    if (!reduced) {
      frame.style.setProperty('--ry', `${((x - 0.5) * 8).toFixed(2)}deg`);
      frame.style.setProperty('--rx', `${(-(y - 0.5) * 8).toFixed(2)}deg`);
      frame.style.setProperty('--shift-x', `${((0.5 - x) * 16).toFixed(1)}px`);
      frame.style.setProperty('--shift-y', `${((0.5 - y) * 16).toFixed(1)}px`);
    }
    coordsEl.textContent = `X ${x.toFixed(2)} Y ${y.toFixed(2)}`;
  };

  const point = (e) => {
    const r = frame.getBoundingClientRect();
    set(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
  };

  frame.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'touch') return;
    root.classList.add('is-active');
    hintEl.textContent = '● Recording';
    point(e);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  });
  frame.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'touch') point(e);
  });
  frame.addEventListener('pointerleave', () => {
    root.classList.remove('is-active');
    hintEl.textContent = 'Hover to pull focus';
    cancelAnimationFrame(raf);
    ['--rx', '--ry', '--shift-x', '--shift-y', '--x', '--y'].forEach((p) => frame.style.removeProperty(p));
  });
}
