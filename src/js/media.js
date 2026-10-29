// Project loops (when added in projects.json) play only while on screen.
export function initMedia() {
  const videos = document.querySelectorAll('video[data-autoplay]');
  if (!videos.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach(({ target, isIntersecting }) => (isIntersecting ? target.play().catch(() => {}) : target.pause())),
    { rootMargin: '120px' }
  );
  videos.forEach((v) => io.observe(v));
}
