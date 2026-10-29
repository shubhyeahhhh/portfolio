// Page transitions use the browser's native cross-document View Transitions
// (see `@view-transition` in styles/transitions.css): no JS on the critical path,
// navigation is never delayed, and unsupported browsers simply navigate instantly.
//
// This module only adds the match-cut: when a project is opened, its media gets
// the shared name `project-hero`, so it morphs into the case-study hero.
export function initTransitions() {
  if (!('onpagereveal' in window)) return; // no cross-document view transitions

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !/\/work\/[^/]+\/(index\.html)?$/.test(url.pathname)) return;

    // Card or featured project: its own media. List row: the preview beside the list.
    const media =
      link.querySelector('.media') ||
      (link.classList.contains('row') && document.querySelector('[data-preview-media]'));
    if (!media) return;
    document.querySelectorAll('[style*="view-transition-name"]').forEach((el) => (el.style.viewTransitionName = ''));
    media.style.viewTransitionName = 'project-hero';
  });

  // Returning via back/forward cache: clear the name so the next transition starts clean.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) document.querySelectorAll('[style*="view-transition-name"]').forEach((el) => (el.style.viewTransitionName = ''));
  });
}
