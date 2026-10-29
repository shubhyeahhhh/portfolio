# Shubham Yadav — portfolio ("Story, engineered.")

Static multi-page site built with Vite, GSAP (ScrollTrigger + SplitText) and Lenis. Deployed on Netlify.

```bash
npm install
npm run dev       # http://localhost:5175
npm run build     # → dist/
npm run preview
```

## Edit content without touching code

| To change… | Edit |
|---|---|
| Email, booking link, availability, location, reply time, rates, socials, stats | `src/content/site.json` |
| Projects (order, featured, titles, roles, years, one-liners, media, case-study sections & metrics) | `src/content/projects.json` |
| Client quotes (section appears automatically once the list isn't empty) | `site.json → testimonials: [{ "quote", "name", "role" }]` |

Project media: put files in `public/media/<slug>/` and set `media.poster` / `media.loop` in `projects.json`
(e.g. `"/media/existential-evolution/loop.mp4"`). Until then each project shows a designed title card.

Booking link: set `site.json → bookingUrl` to your Cal.com/Calendly URL; it defaults to `/contact/`.

## Structure

```
index.html, work/, services/, about/, contact/, 404.html   pages (real HTML for SEO)
src/partials/        shared head, header, footer
src/content/         site.json, projects.json
src/js/              motion (Lenis, reveals), portrait focus-pull, work filters, contact form, page wipe
src/styles/          tokens, base, components, pages
plugins/html-partials.js   build-time includes + JSON rendering
public/              images, favicon, OG image, robots, sitemap
```

The contact form uses Netlify Forms (`data-netlify="true"`); submissions appear in the Netlify dashboard.
All motion respects `prefers-reduced-motion`.

## Motion & interaction

- **Page transitions**: native cross-document View Transitions (`src/styles/transitions.css`) — old page recedes, new page rises; a clicked project's media morphs into the case-study hero. Unsupported browsers navigate instantly.
- **Opening slate**: home page, first visit per session (`src/js/intro.js`).
- **Custom cursor + magnetic buttons**: mouse/pen only; label comes from `data-cursor="…"` (`src/js/cursor.js`).
- **Scroll velocity**: roles ticker speed/direction and a slight lean on `[data-velocity]` blocks (`src/js/velocity.js`).
- **Text scramble**: mono `.eyebrow` labels decode on entry (`src/js/motion.js`).
- **WebGL hover**: ripple + RGB split on project media, one shared canvas (`src/js/hoverfx.js`).
- **Portrait focus-pull** on the home hero (`src/js/portrait.js`).

Everything is disabled under `prefers-reduced-motion`.
