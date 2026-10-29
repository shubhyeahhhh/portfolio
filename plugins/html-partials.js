// Build-time HTML composition for a static multi-page site.
//
//   <!-- @include partials/header.html active=work -->   inline a partial (marks the active nav link)
//   <!-- @projects featured|grid|list|cards -->          render projects from src/content/projects.json
//   <!-- @case existential-evolution -->                 render a case-study body from the same file
//   <!-- @stats -->  <!-- @testimonials -->  <!-- @socials -->
//   {{site.email}}                                       text token from src/content/site.json
//
// Content lives in src/content/*.json, so copy and projects change without touching markup.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

export default function htmlPartials({ root }) {
  const srcDir = resolve(root, 'src');
  const read = (p) => readFileSync(resolve(srcDir, p), 'utf8');
  const json = (p) => JSON.parse(read(p));

  const metaLine = (p) => [p.type, p.year].filter(Boolean).join(' · ');

  // A project's visual: real media when provided, otherwise a designed title card.
  function media(p, { eager = false } = {}) {
    const loading = eager ? 'eager' : 'lazy';
    if (p.media?.loop) {
      return `<video class="media__video" muted loop playsinline preload="none" data-autoplay
        ${p.media.poster ? `poster="${esc(p.media.poster)}"` : ''} src="${esc(p.media.loop)}" aria-hidden="true"></video>`;
    }
    if (p.media?.poster) {
      return `<img class="media__img" src="${esc(p.media.poster)}" alt="" loading="${loading}" decoding="async">`;
    }
    // Live motion graphic per project (src/js/motifs.js) until real media exists.
    return `<div class="titlecard titlecard--${esc(p.tone || 'night')}" aria-hidden="true">
      ${p.motif ? `<canvas class="titlecard__fx" data-motif="${esc(p.motif)}" data-tone="${esc(p.tone || 'night')}"></canvas>` : ''}
      <span class="titlecard__meta">${esc(metaLine(p))}</span>
      <span class="titlecard__title">${esc(p.title)}</span>
    </div>`;
  }

  // Video: { provider: youtube|vimeo|instagram|file, id | src, ratio? } — played by src/js/player.js.
  const hasVideo = (v) => !!(v && (v.id || v.src));
  const playAttr = (v, title) => ` data-play="${esc(JSON.stringify(v))}" data-play-title="${esc(title)}"`;
  const isExternal = (href) => /^https?:/.test(href || '');

  // Projects without a case study yet render as non-links: no dead ends.
  // A project with a video but no case study opens the player instead.
  const wrap = (p, cls, inner, extra = '') =>
    hasVideo(p.video) && (!p.href || isExternal(p.href))
      ? `<a class="${cls}" href="${esc(p.href || '#')}" data-cursor="Play"${playAttr(p.video, p.title)}${extra}>${inner}</a>`
      : p.href
      ? `<a class="${cls}" href="${esc(p.href)}" data-cursor="${/^https?:/.test(p.href) ? 'Watch' : 'View'}"${/^https?:/.test(p.href) ? ' target="_blank" rel="noopener"' : ''}${extra}>${inner}</a>`
      : `<article class="${cls}"${extra}>${inner}</article>`;

  const renderers = {
    featured(projects) {
      const p = projects.find((x) => x.featured) || projects[0];
      return wrap(
        p,
        'featured',
        `<div class="featured__media media media--frame" data-unclip>
          ${media(p, { eager: true })}
          <span class="badge badge--light">Featured ${esc(p.type.toLowerCase())}</span>
        </div>
        <div class="featured__body">
          <div class="stack-s">
            <span class="eyebrow">${esc([p.type, p.role, p.year].filter(Boolean).join(' · '))}</span>
            <h3 class="h-card h-card--xl">${esc(p.title)}</h3>
            <p class="lede-s">${esc(p.summary || p.line)}</p>
          </div>
          ${p.href ? '<span class="link-arrow">See how it was made</span>' : ''}
        </div>`
      );
    },
    grid(projects) {
      return projects
        .filter((p) => !p.featured)
        .slice(0, 4) // home shows four; /work shows everything
        .map((p) =>
          wrap(
            p,
            'card',
            `<div class="card__media media media--frame">${media(p)}</div>
            <span class="eyebrow">${esc([p.role, p.year].filter(Boolean).join(' · '))}</span>
            <h3 class="h-card">${esc(p.title)}</h3>
            <p class="card__line">${esc(p.line)}</p>`
          )
        )
        .join('\n');
    },
    list(projects) {
      return projects
        .map((p, i) =>
          wrap(
            p,
            'row',
            `<span class="row__no">${String(i + 1).padStart(2, '0')}</span>
            <span class="row__main">
              <span class="row__title">${esc(p.title)}</span>
              <span class="row__role">${esc(p.role)}</span>
            </span>
            <span class="row__meta">${esc(metaLine(p))}</span>
            <template class="row__preview">${media(p)}<p>${esc(p.line)}</p></template>`,
            ` data-type="${esc(p.type)}" data-project`
          )
        )
        .join('\n');
    },
    cards(projects) {
      return projects
        .map((p, i) =>
          wrap(
            p,
            'card',
            `<div class="card__media media media--frame">${media(p)}</div>
            <span class="eyebrow">${String(i + 1).padStart(2, '0')} · ${esc(metaLine(p))}</span>
            <h3 class="h-card">${esc(p.title)}</h3>
            <p class="card__line">${esc(p.line)}</p>`,
            ` data-type="${esc(p.type)}" data-project`
          )
        )
        .join('\n');
    },
  };

  // What each credited role covered — describes the job, not invented project facts.
  const ROLE_NOTES = {
    Writer: 'The script, the structure and the question at the centre of it.',
    Director: 'Performance, camera and the look of every frame.',
    Editor: 'Rhythm, colour and sound — the film is finally written in the cut.',
    'Co-founder': 'Strategy, brand and the story the company tells about itself.',
    CTO: 'Architecture, the engineering team and shipping the product.',
    'Content lead': 'The calendar, the formats and every edit that goes out.',
  };
  function craft(p) {
    const roles = (p.role || '').split('·').map((r) => r.trim()).filter((r) => ROLE_NOTES[r]);
    if (!roles.length) return '';
    return `<div class="stack-m"><div class="stack-s"><span class="eyebrow eyebrow--accent">The craft</span>
      <h2 class="h-section h-section--s" data-split>${roles.length > 1 ? `${roles.length} jobs, one person.` : 'What I did.'}</h2></div>
      <div class="grid-3">${roles
        .map((r, n) => `<div class="story__item" data-reveal><span class="eyebrow">0${n + 1}</span><h3 class="h-card">${esc(r)}</h3><p class="card__line">${esc(ROLE_NOTES[r])}</p></div>`)
        .join('')}</div></div>`;
  }

  // Series: one card per episode. Plays in the player when a video is set,
  // otherwise links out to the channel.
  function episodes(p) {
    const cards = p.episodes
      .map((ep, n) => {
        const no = String(n + 1).padStart(2, '0');
        const body = `<span class="episode__no">EP${no}</span>
          <span class="episode__title">${esc(ep.title || `Episode ${n + 1}`)}</span>
          <span class="episode__cta">${hasVideo(ep.video) ? '▶ Play episode' : `Watch on ${esc(p.channelName || 'the channel')} ↗`}</span>`;
        return hasVideo(ep.video)
          ? `<a class="episode episode--${esc(p.tone || 'night')}" href="#" data-cursor="Play"${playAttr(ep.video, `${p.title} — EP${no}`)} data-reveal>${body}</a>`
          : `<a class="episode episode--${esc(p.tone || 'night')}" href="${esc(p.channel || '#')}" target="_blank" rel="noopener" data-cursor="Watch" data-reveal>${body}</a>`;
      })
      .join('');
    return `<section class="wrap section stack-l">
      <div class="section-head"><div class="stack-s"><span class="eyebrow eyebrow--accent">The episodes</span>
        <h2 class="h-section" data-split>${p.episodes.length} episodes. One thing left unsaid.</h2></div>
        ${p.channel ? `<a class="link-arrow" href="${esc(p.channel)}" target="_blank" rel="noopener">${esc(p.channelName || 'Channel')}</a>` : ''}</div>
      <div class="episodes">${cards}</div>
    </section>`;
  }

  function renderCase(slug, projects, site) {
    const i = projects.findIndex((p) => p.slug === slug);
    if (i < 0) throw new Error(`[html-partials] unknown case study "${slug}"`);
    const p = projects[i];
    const next = projects.slice(i + 1).concat(projects.slice(0, i)).find((x) => x.href) || null;
    const facts = [
      ['Role', p.role],
      ['Format', p.type],
      ['Year', p.year],
    ].filter(([, v]) => v);

    const sections = (p.sections || [])
      .map(
        (s, n) => `<div class="story__item" data-reveal>
          <span class="eyebrow">SC.0${n + 1} — ${esc(s.label)}</span>
          <h2 class="h-card h-card--lg">${esc(s.title)}</h2>
          <p class="body-l">${esc(s.text)}</p>
        </div>`
      )
      .join('');

    const metrics = (p.metrics || [])
      .map(
        (m) => `<div class="metric"><dt class="metric__value">${esc(m.value)}</dt><dd class="metric__label">${esc(m.label)}</dd></div>`
      )
      .join('');

    return `
    <section class="wrap case-hero">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/work/">Work</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.title)}</span></nav>
      <h1 class="display" data-split>${esc(p.title)}</h1>
      <p class="lede">${esc(p.summary || p.line)}</p>
      <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    </section>
    <section class="wrap">
      <div class="media media--frame media--wide case-hero__media">
        ${media(p, { eager: true })}
        <span class="rec rec--on-dark"><span class="rec__dot"></span>SC.01</span>
        ${hasVideo(p.video) ? `<button class="play-btn" type="button"${playAttr(p.video, p.title)} data-cursor="Play"><span class="play-btn__icon" aria-hidden="true"></span><span>Watch the ${esc(p.type.toLowerCase())}</span></button>` : ''}
      </div>
    </section>
    ${Array.isArray(p.episodes) ? episodes(p) : ''}
    ${
      sections
        ? `<section class="wrap section story">${sections}</section>`
        : `<section class="wrap section stack-l">
            ${craft(p)}
            <div class="note" data-reveal>
              <span class="eyebrow">The full write-up</span>
              <p class="h-card h-card--lg">The behind-the-scenes story of this ${esc(p.type.toLowerCase())} is being edited.</p>
              <p class="body-l">Want the director's commentary now? Ask on a call — it's my favourite thing to talk about.</p>
            </div>
          </section>`
    }
    ${metrics ? `<section class="wrap section"><span class="eyebrow">What it did</span><dl class="metrics">${metrics}</dl></section>` : ''}
    <section class="band band--ink">
      <div class="wrap section cta">
        <h2 class="h-section">Your brand has a story like this. Let's film it.</h2>
        <a class="btn btn--accent btn--lg" href="${esc(site.bookingUrl)}">Book a 20-min intro call →</a>
      </div>
    </section>
    ${
      next
        ? `<a class="next" href="${esc(next.href)}" data-cursor="Next"><span class="wrap next__inner"><span class="stack-s"><span class="eyebrow">Next project</span><span class="next__title">${esc(next.title)} →</span></span></span></a>`
        : `<a class="next" href="/work/"><span class="wrap next__inner"><span class="stack-s"><span class="eyebrow">Keep watching</span><span class="next__title">All work →</span></span></span></a>`
    }`;
  }

  function render(html, depth = 0) {
    if (depth > 5) throw new Error('[html-partials] include depth exceeded');
    const site = json('content/site.json');
    const projects = json('content/projects.json');

    html = html.replace(/<!--\s*@include\s+([\w./-]+)(?:\s+active=([\w-]+))?\s*-->/g, (_, file, active) => {
      let part = render(read(file), depth + 1);
      if (active) part = part.replace(`data-nav="${active}"`, `data-nav="${active}" aria-current="page"`);
      return part;
    });

    html = html.replace(/<!--\s*@projects\s+(\w+)\s*-->/g, (_, kind) => {
      if (!renderers[kind]) throw new Error(`[html-partials] unknown @projects ${kind}`);
      return renderers[kind](projects);
    });

    html = html.replace(/<!--\s*@case\s+([\w-]+)\s*-->/g, (_, slug) => renderCase(slug, projects, site));

    html = html.replace(/<!--\s*@stats\s*-->/g, () =>
      site.stats
        .map(
          (s) => `<div class="stat"><dt class="stat__value"><span data-count="${s.value}">${s.value}</span><span class="accent">${esc(s.suffix)}</span></dt><dd class="stat__label">${esc(s.label)}</dd></div>`
        )
        .join('')
    );

    html = html.replace(/<!--\s*@testimonials\s*-->/g, () => {
      if (!site.testimonials?.length) return '';
      return `<section class="band band--mist"><div class="wrap section stack-l">
        <div class="stack-s"><span class="eyebrow eyebrow--accent">SC.05 — In their words</span><h2 class="h-section" data-split>Don't take my word for it.</h2></div>
        <div class="grid-2">${site.testimonials
          .map(
            (t) => `<figure class="quote" data-reveal><blockquote>“${esc(t.quote)}”</blockquote><figcaption><strong>${esc(t.name)}</strong><span>${esc(t.role)}</span></figcaption></figure>`
          )
          .join('')}</div></div></section>`;
    });

    html = html.replace(/<!--\s*@socials\s*-->/g, () =>
      site.socials.map((s) => `<a href="${esc(s.url)}" rel="me noopener" target="_blank">${esc(s.label)} ${esc(s.handle)}</a>`).join('')
    );

    html = html.replace(/\{\{\s*year\s*\}\}/g, String(new Date().getFullYear()));
    html = html.replace(/\{\{\s*projectCount\s*\}\}/g, String(projects.length));
    html = html.replace(/\{\{\s*site\.([\w.]+)\s*\}\}/g, (_, path) => {
      const v = get(site, path);
      if (v == null) throw new Error(`[html-partials] missing site.${path} in src/content/site.json`);
      return esc(v);
    });

    return html;
  }

  return {
    name: 'html-partials',
    transformIndexHtml: { order: 'pre', handler: (html) => render(html) },
    handleHotUpdate({ file, server }) {
      if (file.startsWith(srcDir) && /\.(html|json)$/.test(file)) server.ws.send({ type: 'full-reload' });
    },
  };
}
