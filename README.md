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
