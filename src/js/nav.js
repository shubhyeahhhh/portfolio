// Sticky header that tucks away on scroll down, plus the mobile menu.
export function initNav() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const toggle = header.querySelector('[data-menu-toggle]');

  const setOpen = (open) => {
    header.classList.toggle('is-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
  };
  toggle?.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-open')) {
      setOpen(false);
      toggle?.focus();
    }
  });
  header.querySelectorAll('.site-nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));

  let last = window.scrollY;
  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const hide = y > 160 && y > last && !header.classList.contains('is-open') && !header.contains(document.activeElement);
        header.classList.toggle('is-hidden', hide);
        last = y;
        ticking = false;
      });
    },
    { passive: true }
  );
}
