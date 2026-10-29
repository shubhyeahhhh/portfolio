// /work: type filters, list ↔ grid view, and the hover preview beside the list.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mountMotifs } from './motifs.js';

export function initWork(root) {
  if (!root) return;
  const rows = root.querySelector('[data-rows]');
  const previewMedia = root.querySelector('[data-preview-media]');
  const previewText = root.querySelector('[data-preview-text]');
  const empty = root.querySelector('[data-empty]');
  const panels = root.querySelectorAll('[data-view-panel]');
  const projects = root.querySelectorAll('[data-project]');
  const press = (group, btn) => group.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));

  const showPreview = (row) => {
    if (!row || !previewMedia) return;
    rows.querySelectorAll('.row').forEach((r) => r.classList.toggle('is-current', r === row));
    const tpl = row.querySelector('template.row__preview').content.cloneNode(true);
    const text = tpl.querySelector('p');
    previewText.replaceChildren(text);
    previewMedia.replaceChildren(tpl);
    previewMedia.querySelector('video')?.play().catch(() => {});
    mountMotifs(previewMedia);
  };

  const firstVisible = () => [...rows.querySelectorAll('.row')].find((r) => !r.hidden);

  rows?.addEventListener('pointerover', (e) => {
    const row = e.target.closest('.row');
    if (row && !row.classList.contains('is-current')) showPreview(row);
  });
  rows?.addEventListener('focusin', (e) => showPreview(e.target.closest('.row')));
  rows?.addEventListener('pointerenter', () => rows.classList.add('has-hover'));
  rows?.addEventListener('pointerleave', () => rows.classList.remove('has-hover'));
  showPreview(firstVisible());

  const filters = [...root.querySelectorAll('[data-filter]')];
  filters.forEach((btn) =>
    btn.addEventListener('click', () => {
      press(filters, btn);
      const type = btn.dataset.filter;
      let shown = 0;
      projects.forEach((p) => {
        const match = type === 'All' || p.dataset.type === type;
        p.hidden = !match;
        if (match && p.classList.contains('row')) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      showPreview(firstVisible());
      ScrollTrigger.refresh();
    })
  );

  const views = [...root.querySelectorAll('[data-view]')];
  views.forEach((btn) =>
    btn.addEventListener('click', () => {
      press(views, btn);
      panels.forEach((p) => (p.hidden = p.dataset.viewPanel !== btn.dataset.view));
      ScrollTrigger.refresh();
    })
  );
}
