# Project details — shubham-yadav-portfolio

Single source of truth for **what this website is, how it's built, and what's in it**.
Keep it updated when projects, pages or features change.

> `docs/PORTFOLIO_PLAN.md` is the original v1 "The Final Cut" plan, kept for history.
> The site that's built today is the v2 "Story, engineered." direction described here.

---

## 1. Overview

| | |
|---|---|
| Owner | Shubham Yadav — filmmaker · founder · tech lead |
| Domain | `yadavshubham.com.np` |
| Goal | Win clients for brand films, content systems and websites/products |
| Brand idea | **Story, engineered.** · sign-off: *Built with code. Sold with stories.* |
| Hosting | Netlify (`netlify.toml`, build `npm run build`, publish `dist/`) |
| Stack | Vite 6 (multi-page) · GSAP 3.15 (ScrollTrigger, SplitText, ScrambleText) · Lenis · WebGL (no framework) |
| Contact form | Netlify Forms (`brief` form on `/contact/`) |

## 2. Pages

| URL | File | Purpose |
|---|---|---|
| `/` | `index.html` | Hero (focus-pull portrait), selected work, services, process, about, CTA |
| `/work/` | `work/index.html` | All projects: filters (Film · Series · Content · Product), list ↔ grid, hover preview |
| `/work/existential-evolution/` | `work/existential-evolution/index.html` | Case study (rendered from `projects.json`) |
| `/services/` | `services/index.html` | Three offers, engagement models, FAQ |
| `/about/` | `about/index.html` | Cinematic hero, three chapters, desk band, numbers, timeline, principles |
| `/contact/` | `contact/index.html` | Brief form + direct lines |
| `/contact/thanks/` | `contact/thanks/index.html` | No-JS form confirmation |
| 404 | `404.html` | "This take didn't make the cut." |

Add a page: create the HTML file, then register it in `vite.config.mjs` (`pages`) and `public/sitemap.xml`.

## 3. Projects (portfolio entries)

All project data lives in **`src/content/projects.json`** (order there = order on the site;
the home page shows the featured project + the next four, `/work/` shows all).

| # | Project | Type | Role | Year | Thumbnail motif | Link | Real media |
|---|---|---|---|---|---|---|---|
| 1 | **Existential Evolution** (featured) | Film | Writer · Director · Editor | _to add_ | `evolution` — phyllotaxis spiral | Case study `/work/existential-evolution/` | _to add_ |
| 2 | **Maybe I Never Confess** | Series | Creator · @shubheffects | _to add_ | `confess` — two people, hesitant line, unsaid "…", EP1–EP5 strip | instagram.com/shubheffects (new tab) | _to add_ |
| 3 | **Sahara Prosthetics** | Product | CTO · Product & engineering | 2024–25 | `mechanism` — rotating engineering wireframe | — | _to add_ |
| 4 | **Baakhapaa** | Content | Content lead | 2023–now | `timeline` — edit timeline + waveform | — | _to add_ |
| 5 | **Praatik Hires** | Content | Co-founder · Brand & strategy | 2024 | `network` — people connecting | — | _to add_ |
| 6 | **GrowthGates** | Content | Co-founder · Community | 2025 | `growth` — particles rising through gates | — | _to add_ |

### Maybe I Never Confess — series details
- Five-episode series about an introvert guy and his best friend, published on **@shubheffects**.
- Known: title, format (5 episodes), premise, channel.
- **To fill in** (in `projects.json`): `year`, exact `role` (e.g. writer/director/editor/actor),
  episode links, poster/loop, views or other results. Add a case study by setting `href`
  to `/work/maybe-i-never-confess/` and creating that page (copy the Existential Evolution one).

### Project fields (`projects.json`)

| Field | Required | Notes |
|---|---|---|
| `slug` | yes | URL-safe id, also the media folder name |
| `title`, `type`, `role`, `line` | yes | `type` drives the `/work/` filter chips |
| `year` | no | Hidden when empty |
| `featured` | no | One project only — the large card on the home page |
| `summary` | no | Longer intro used on the case study |
| `tone` | no | Card colour: `ember` · `steel` · `amber` · `night` · `teal` · `plum` |
| `motif` | no | Live motion-graphic thumbnail (see §5); ignored once real media exists |
| `href` | no | `/work/<slug>/` for a case study, or an external URL (opens in a new tab). Empty = not clickable |
| `media.poster` / `media.loop` | no | `/media/<slug>/poster.jpg` · `/media/<slug>/loop.mp4` (4–6 s, muted, ≤ 1.5 MB). Replaces the motif |
| `sections` | no | Case-study story blocks: `[{ "label", "title", "text" }]` |
| `metrics` | no | Results: `[{ "value", "label" }]` — shown only when present |

**Rule:** project media must be real (stills, footage, product photos). No generated "product shots".

## 4. Site-wide content (`src/content/site.json`)

Email, booking link (`bookingUrl`, defaults to `/contact/` — set your Cal.com/Calendly link),
availability line, location, reply time, rates per service, socials, the four stats, testimonials
(the testimonials section appears automatically once the list isn't empty).

## 5. Motion & interaction

| Feature | Where | File |
|---|---|---|
| Native page transitions + project → case-study match-cut | all pages | `src/styles/transitions.css`, `src/js/transitions.js` |
| Opening slate (first home visit per session) | home | `src/js/intro.js` |
| Portrait focus-pull (iris lens, rim light, tilt, REC timecode) | home hero | `src/js/portrait.js` |
| Line reveals, fades, image un-clip, count-ups, text scramble | all | `src/js/motion.js` |
| Smooth scroll, roles ticker + lean driven by scroll speed | all / home | `src/js/motion.js`, `src/js/velocity.js` |
| Custom cursor (View / Watch / Next) + magnetic buttons | fine pointers | `src/js/cursor.js` |
| WebGL ripple + RGB-split hover on project media | project cards | `src/js/hoverfx.js` |
| Live motion-graphic thumbnails (6 motifs, on-screen only) | project cards | `src/js/motifs.js` |

Everything respects `prefers-reduced-motion` (motifs show a still frame; cursor, WebGL and smooth scroll are off).
Performance check (headless Chromium): all six motifs animating at 60 fps; motif draw cost < 1 ms each.

## 6. Images in use (`public/images/`)

| File | Used on | Source |
|---|---|---|
| `portrait-hero.webp` (+ `-600`) | Home hero | First studio portrait |
| `portrait.webp` | Home "About" section | Newer portrait set |
| `avatar.webp` | Contact card | Newer portrait set |
| `wide.webp` (+ `-1200`) | About hero, OG image | Newer portrait set |
| `desk.webp` (+ `-900`) | About "most days" band | Newer portrait set |

Note: the home-hero portrait and the newer set don't look like the same face — consider standardising on one set.

## 7. Open items

- [ ] Real stills / loops for every project (`public/media/<slug>/`)
- [ ] Year + role confirmation for *Existential Evolution* and *Maybe I Never Confess*
- [ ] Case-study write-ups (`sections`, `metrics`)
- [ ] Booking link (`site.json → bookingUrl`)
- [ ] Client testimonials (`site.json → testimonials`)
- [ ] Merge `claude/determined-noether-vc7vgg` → `main` so Netlify deploys v2
