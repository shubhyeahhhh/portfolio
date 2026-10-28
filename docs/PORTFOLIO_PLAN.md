# Portfolio v2 — "The Final Cut"

A plan for turning the current one-page scroll site into a premium, highly
animated portfolio where **the motion itself tells the story**: a filmmaker who
codes, a founder who tells stories.

> Status: plan only — nothing in this document is built yet.
> Owner: Shubham Yadav · Domain: `yadavshubham.com.np` · Last updated: 2026-10-28

---

## 0. TL;DR

- **Concept:** the website is a film being edited live. Every section is a
  *scene*, every transition is an *edit* (cut, dissolve, whip-pan, iris), and at
  the tech-lead beat the footage "unrenders" into code. Your tagline
  *"Built with code, sold with stories"* becomes the site's mechanic, not just
  its copy.
- **Keep:** the existing GSAP + ScrollTrigger + Lenis engine, the charcoal /
  electric-cyan identity, the scroll-scrubbed camera moves, preloader, cursor,
  grain.
- **Add:** one shared WebGL layer (shader transitions + video-as-texture),
  real case-study pages with a Podium-style *thumbnail → hero* handoff, a
  per-pillar visual language, sound design, and a Lab page.
- **Fix first:** the repo has two diverging copies of the site, committed build
  output, CDN scripts, no OG/SEO on the live copy, and no mobile tuning.
- **Ship in 6 phases** (§10); each phase is deployable on its own.
- **Decisions locked (§11):** the film (*Existential Evolution*) leads the
  reel · the site exists to **win clients** · all footage is **real** · every
  piece of content (copy, projects, media, order) is **swappable without
  touching code** (§7.1).

---

## 1. Where the site is today (audit)

### 1.1 What already works — keep it

| Feature | Where | Notes |
|---|---|---|
| Lenis smooth scroll wired to GSAP ticker | `js/main.js:41-47` | Correct setup (`lagSmoothing(0)`). |
| `MediaSlot` scroll-scrubbed video with procedural placeholder | `js/main.js:92-325` | Strong idea; placeholder painters are a nice dev affordance. |
| 4 pinned scenes (hero orbit, pillars, work, finale) | `js/main.js:345-485` | The "camera you control by scrolling" concept is the core of v2. |
| Preloader counter + wipe → hero intro handoff | `js/main.js:507-544` | Becomes the "slate" in v2. |
| Magnetic cursor, quickTo hover preview | `js/main.js:447-460, 547-588` | Reuse with new cursor states. |
| Reduced-motion fallback | `js/main.js:16`, `css/style.css:472` | Keep and extend. |
| Brand tokens (ink / paper / cyan / cobalt, Anton + Space Grotesk + Instrument Serif) | `css/style.css:6-19` | Solid foundation; formalise into a design-token file. |
| Asset brief with AI prompts and encoding rules | `videos/README.md` | Excellent; extend for v2 shots (§9). |

### 1.2 Gaps vs. award-level references

| Gap | Impact |
|---|---|
| All 4 video slots are still placeholders (no `.mp4` in `videos/`). | The concept depends on footage; today the hero is a wireframe diagram. |
| "Selected Work" is a text list; hover preview shows **initials**, no media; rows don't link anywhere. | The most important content (your work) is the least expressive part of the site. |
| No case-study pages, no routing, no page transitions. | Every reference (Podium, Giulio, Vitasović) leans on continuity between pages. |
| The 3 pillars share one look (fade up/down). | Filmmaker / Founder / Tech Lead should each *feel* different. |
| No WebGL — all effects are Canvas 2D / CSS. | Limits transitions, distortion, video texture effects. |
| No sound. | ZERO and Igloo-style sites use audio as half the "premium" feel. |
| Seeking `video.currentTime` per frame. | Seeks are async and decoder-bound → visible stepping on scrub, worse on mobile/Safari. |

### 1.3 Technical debt (fix in Phase 0)

1. **Two diverging codebases.** Root (`index.html`, `js/`, `css/`, deployed by
   Netlify via `scripts/build.mjs`) vs. `portfolio/` (older Vite project with a
   Vercel README). `portfolio/` has things the live root lacks: OG/meta tags,
   skip-link, 404, `robots.txt`, `sitemap.xml`, mobile scrub quantisation
   (36 steps, DPR 1), dirty-flag rendering. The live site is missing all of them.
2. **Build output committed.** `dist/`, `portfolio/dist/` and `.vite/` are in
   git; Netlify rebuilds anyway, so committed `dist/` is stale noise. No
   `.gitignore`.
3. **Libraries from CDNs** (`cdnjs` GSAP 3.12.5, `unpkg` Lenis 1.1.18) with no
   bundling, no version lock, render-blocking `<script>` tags.
4. **Single 600-line script** with globals (`window.__slots`, `window.__lenis`)
   — fine for v1, will not scale to a WebGL layer + routing.
5. **"Book a Call" is a `mailto:`** (`index.html:258`) — swap for Cal.com.
6. **Netlify vs. Vercel** — both are documented; pick one (§6.6).

---

## 2. Creative direction

### 2.1 Core metaphor — "The Final Cut"

The visitor is sitting in your edit suite. Scrolling is scrubbing the
timeline; the site is the film being cut in front of them.

Everything in the interface comes from that world:

| Film language | Site element |
|---|---|
| Slate / clapperboard | Preloader |
| Timecode `00:00:12:08` | Scroll progress HUD (replaces `0°` readout + hairline) |
| Scenes | Sections |
| Cuts, dissolves, whip-pans, iris, match-cuts | Section and page transitions |
| Letterbox bars, frame lines, focus pull | Framing and emphasis |
| Rushes / dailies | The Lab page |
| End credits | Footer + contact |
| Render → wireframe | The "tech lead" beat: footage decomposes into code |

### 2.2 Narrative arc (the home page as a short film)

```
COLD OPEN ─► TITLE ─► ACT I ─► ACT II ─► ACT III ─► MONTAGE ─► THE REEL ─► CREDITS
 orbit       manifesto  film     founder   tech       proof      work        contact
```

Each act gets its own visual grammar (§3, Scene 3) so the three identities
read as three genres inside one film.

### 2.3 Tone guardrails

- **Premium through precision, not volume.** One showpiece per scene; everything
  else is calm (Chems.Studio lesson).
- **Snappy timing.** Default UI motion 200–350 ms; long eases reserved for
  camera moves (ZERO: a 200 ms snap-back read stronger than 400 ms).
- **Always legible.** Copy never sits on moving footage without a scrim.
- **Cyan is light, not paint.** Use the accent as rim light, timecode, cursor
  and focus — never as large fills.

### 2.4 Positioning — built to win clients

The film is the spectacle; the goal is a booked call. Every scene answers a
buyer's question:

| Buyer's question | Answered by |
|---|---|
| "Is this person good?" | Cold open + the reel, led by *Existential Evolution* |
| "What can they make for **me**?" | Scene 5.5 · Services (new) |
| "Have they done it for others?" | Case studies framed as *brief → cut → result*, client logos, testimonials |
| "Can they handle the tech too?" | Act III + Sahara case study — the differentiator vs. other filmmakers |
| "How do I start?" | Persistent `BOOK A CALL` chip in the nav after the hero + credits-roll CTA |

Rules that follow from this:

- **CTA everywhere it's earned:** nav chip (appears after Scene 1), end of
  each case study ("Want a film like this?"), credits finale. One booking
  link (Cal.com), one email fallback.
- **Outcomes over adjectives:** every project shows 2–3 real numbers (views,
  signups, reach, hires) in its Results block.
- **Speed for busy visitors:** a "Skip to the reel" chip after the hero, and
  the reel is reachable in one click from the nav.

---

## 3. Home page storyboard — scene by scene

Durations are in **viewport heights of scroll** (`vh`) for pinned scenes.

### Scene 0 · Slate (preloader) — replaces current preloader

- Black frame. A minimal clapperboard in thin paper-coloured lines:
  `SCENE 01 · TAKE 01 · SHUBHAM YADAV · DIR/DEV`.
- Real asset-loading progress (hero frames + fonts) drives the count as a
  **timecode** (`00:00:00:00 → 00:00:01:00`), not a fake 0→100 tween.
- On ready: the clapper arm snaps shut (180 ms, `power4.in`) + optional
  "clack" sfx → hard **cut** to white for 2 frames → hero.
- Respects `sessionStorage` — repeat visits get a 400 ms short slate.

### Scene 1 · Cold open (hero) — evolves current orbit · ~300 vh

- Keep the 360° orbit scrub (`hero-orbit`), but drive it from an **image
  frame sequence** (see §6.4) for buttery scrubbing.
- Name reveal stays (letter stagger), re-built with GSAP **SplitText**
  (free since GSAP 3.13) with a masked, slight-rotate rise.
- New: **letterbox bars** start at 2.39:1 and open to full-bleed as the orbit
  begins — "the film starts".
- New: **timecode HUD** bottom-left, **REC / focus marks** in corners; the
  `°` readout becomes `ORBIT 128° · TC 00:00:03:12`.
- Exit: **whip-pan** shader transition (directional motion blur) into Scene 2.

### Scene 2 · Title card / manifesto — evolves current About

- Portrait on the left as a **film still** with a 35 mm frame border, sprocket
  holes, and the caption as an edge-code strip.
- Statement line reveals word by word; the italic serif words (*filmmaker*,
  *code*, *founder*, *stories*) arrive with a soft **focus pull** (blur 8px → 0).
- Hover on portrait: subtle **RGB split + chromatic aberration** via the WebGL
  layer (Vitasović-style shader overlay).

### Scene 3 · The three acts — replaces the uniform pillars · ~3 × 120 vh

Each act is its own pinned sub-scene with a distinct grammar:

| Act | Grammar | Showpiece | Backdrop |
|---|---|---|---|
| **I — The Filmmaker** | Film gate, 2.39:1 letterbox, grain up, warm-to-cyan grade, Instrument Serif. | Stills from *Existential Evolution* scroll through a **film strip** that bends (WebGL curve) as scroll velocity rises. | `craft.mp4` push-in |
| **II — The Entrepreneur** | Editorial grid, clean Space Grotesk, numbers. | A **growth line** draws itself across the screen; company names (Praatik Hires 2024, GrowthGates 2025) pin to the curve as milestones. | `studio.mp4` dolly |
| **III — The Tech Lead** | Monospace, terminal, grid. | The footage **unrenders**: a dither / ASCII / wireframe shader eats the video from the edges in, revealing code and a Sahara Prosthetics system diagram. Scroll back and it re-renders. | Same clip as Act I or II, decomposed — the "code meets story" moment. |

Transitions between acts: **cut** (I → II, hard, with a 1-frame flash) and
**data-mosh dissolve** (II → III).

### Scene 4 · Montage — the proof — evolves current stats

- Numbers presented as an **edit counter / NLE timeline**: tracks labelled
  `V1 VIDEOS 250+`, `V2 COMPANIES 4+`, `A1 YEARS 6+`. Clips slide onto the
  tracks and the counters tick as each clip "lands" (snap ease, 220 ms).
- Marquee bands stay but become **film-edge code** strips (scroll-velocity
  skew already implemented in direction logic — add `skewX` by velocity).

### Scene 5 · The reel — selected work — replaces text list

- A **WebGL media grid** (DOM-synced planes): each project is a looping muted
  clip used as a texture.
- Hover: plane gets a **ripple / barrel distortion** + RGB shift; cursor turns
  into `PLAY ▸`; title rises with SplitText.
- Toggle view: **List ↔ Grid** (1/2/3 columns, Dondre Green pattern).
- Scroll velocity bends the grid slightly (Codrops scroll-distortion pattern).
- **Click → match-cut:** the clicked plane becomes the transition object and
  expands into the case-study hero while the route changes underneath
  (Podium). Back navigation reverses it.

- **Order:** *Existential Evolution* is the **featured first card** — double
  width, plays its trailer loop on entry, and is the default expanded state on
  mobile. Remaining order comes from the content file (§7.1), so it can change
  any time.

### Scene 5.5 · Services — "What I can make for you" (new, client-facing)

- Three cards, styled as **call sheets**, mapped to the three acts:
  1. **Brand films & video essays** (Filmmaker)
  2. **Content strategy & growth** (Entrepreneur)
  3. **Product & web builds** — sites like this one (Tech Lead)
- Each card: one-line promise, 3 deliverables, a "see example" link into the
  matching case study, and the Book-a-Call button.
- Motion: cards slate in with a clapper snap (`dur.snap`); hover lifts the card
  and shows a 2 s loop from the linked project.

### Scene 6 · Rushes (Lab teaser)

- Horizontal strip of 6–8 experiments / BTS clips (video essays, motion
  tests, code toys) with a "dailies" contact-sheet look. Links to `/lab`.

### Scene 7 · End credits — evolves current finale + footer

- Keep `walk.mp4` walk-in scrub; headline words rise as now.
- Then the page becomes an **end-credits roll**: `DIRECTED BY`, `WRITTEN &
  CODED BY`, `PRODUCED AT` (companies), `SPECIAL THANKS`, socials — rolling
  at scroll speed, with "Book a Call" as the final card.
- Last frame: `FIN.` + timecode freeze + a "Replay" button that scrolls to
  top with a **rewind** effect (scrub backwards at 4× with VHS lines).

---

## 4. Other pages

### 4.1 `/work/<slug>` — case studies (5 at launch)

Projects: *Existential Evolution*, *Praatik Hires*, *GrowthGates*,
*Sahara Prosthetics*, *Baakhapaa App*.

Template (every case study follows the same "film" structure):

1. **Hero** — the clip that was expanded from the grid; title, role, year,
   timecode-style meta.
2. **Logline** — one sentence, large serif.
3. **The brief / the problem.**
4. **The process** — alternating full-bleed media and short text; sticky
   "scene markers" on the side.
5. **The cut** — embedded film / product walkthrough (lazy-loaded player).
6. **Results** — 2–4 numbers, animated like Scene 4.
7. **Credits** — team, tools, stack.
8. **Next project** — a pinned teaser whose media grows as you scroll; at
   100 % it becomes the next case-study hero (infinite loop through work).

Content lives in `content/work/<slug>.json` (see §7.1) so new projects need
no code. *Existential Evolution* is the first case study built and sets the
template for the rest.

### 4.2 `/lab` — rushes & experiments

Contact-sheet grid of short loops: shader tests, edits, code toys, video
essays. Filterable by tag (`film`, `code`, `motion`, `brand`). Each item opens
in a lightbox with a short note — this is where the creative-technologist
side gets proof (Felix Turner / Valentin Gassend "lab" pattern).

### 4.3 `/about` (optional, Phase 5)

Extended bio, timeline, press, tools. The home Scene 2 stays short.

### 4.4 404

"Scene missing." — a damaged-film shader (burns, scratches) with a
"Back to the reel" button. Reuse `portfolio/public/404.html` copy as a base.

---

## 5. Motion system

### 5.1 Tokens (`src/motion/tokens.js`)

| Token | Value | Use |
|---|---|---|
| `dur.snap` | 0.20 s | Cuts, clapper, cursor state |
| `dur.ui` | 0.35 s | Hover, buttons, menu |
| `dur.reveal` | 0.80 s | Text / element reveals |
| `dur.scene` | 1.10 s | Page and scene transitions |
| `ease.cut` | `power4.inOut` | Transitions |
| `ease.out` | `expo.out` | Reveals |
| `ease.camera` | `none` (scrubbed) | Anything tied to scroll |
| `ease.magnet` | `elastic.out(1, 0.4)` | Magnetic release (existing) |
| `stagger.letter` | 0.035 s | SplitText chars |
| `stagger.word` | 0.06 s | SplitText words |

### 5.2 Transition library (`src/webgl/transitions/`)

One full-screen shader pass with a `uType` switch so every scene and route
change picks from the same set:

| Name | Effect | Where |
|---|---|---|
| `cut` | Hard swap + 1–2 frame flash | Act I → II, slate → hero |
| `dissolve` | Noise-based cross-fade | Default page change |
| `whip` | Directional motion blur + slide | Hero → manifesto |
| `iris` | Circular mask from cursor point | Lab lightbox |
| `mosh` | Data-mosh / pixel-sort | Act II → III |
| `match` | Plane scales from DOM rect to full screen | Work grid → case study |
| `rewind` | Reverse scrub + VHS scanlines | "Replay" |

### 5.3 Cursor states (extend existing `customCursor`)

`default` (dot + ring) · `play` (ring grows, `PLAY ▸`) · `drag` (`◂ DRAG ▸` on
horizontal strips) · `view` (portrait) · `text` (thin I-beam on long copy) ·
`hidden` (inside video players). Driven by `data-cursor="…"` attributes, which
the current code already reads.

### 5.4 Typography motion

- GSAP **SplitText** with `mask: "lines"` for all headings (replaces hand-split
  `.ltr` / `.fw` spans in `index.html`, which also fixes screen-reader output).
- Serif italic words always arrive with the focus-pull treatment — they're the
  brand's "story" voice.

### 5.5 Sound (opt-in)

- Howler.js, **muted by default**, toggle in nav (`SOUND OFF / ON`), choice
  stored in `localStorage`.
- Cues: projector hum bed (−28 dB), clapper clack, cut tick, whoosh on whip,
  rewind. All < 40 KB each, `.webm` + `.mp3` fallback.

---

## 6. Technical architecture

### 6.1 Decision: one codebase, Vite multi-page + Barba.js

- Consolidate root and `portfolio/` into **one Vite project at the repo root**.
  Port the best of both (root's newer sections + `portfolio/`'s SEO, skip-link,
  404, mobile quantisation, dirty-flag drawing).
- **Barba.js** for page transitions on a multi-page site — matches the
  Feb 2026 Codrops "GSAP + Three.js + Astro + Barba" stack, keeps pages as
  plain HTML (good for SEO), and lets the WebGL canvas persist across routes.
- Not adopting React/Next or R3F: the site is content-light, the existing code
  is vanilla, and the May 2026 Codrops case study shows raw/light WebGL + GSAP
  is enough and lighter.
- *Alternative if content grows:* Astro (content collections + view
  transitions). Revisit only if the case-study count passes ~15.

### 6.2 Dependencies (npm, version-locked, bundled)

| Package | Purpose |
|---|---|
| `gsap` (3.13+) | Core, ScrollTrigger, SplitText, CustomEase, Flip — all free now |
| `lenis` | Smooth scroll (already used) |
| `@barba/core` | Page transitions |
| `ogl` | Minimal WebGL (~30 KB) for planes, video textures and post passes. Switch to `three` only if Lab needs real 3D. |
| `howler` | Sound |

Remove the CDN `<script>` tags in `index.html:276-279`.

### 6.3 Proposed structure

```
/
├─ index.html                 home
├─ work/<slug>/index.html     generated from content (or hand-written ×5)
├─ lab/index.html
├─ 404.html
├─ content/                   site.json, work/*.json, lab.json (§7.1 — all editable copy & media refs)
├─ public/                    media/<slug>/, videos/, frames/, audio/, og-image.jpg, robots, sitemap
├─ src/
│  ├─ main.js                 boot: lenis, gsap, barba, webgl, cursor, sound
│  ├─ core/                   scroll.js, router.js, loader.js, sound.js, device.js
│  ├─ motion/                 tokens.js, split.js, reveals.js
│  ├─ scenes/                 slate.js, hero.js, manifesto.js, acts.js, montage.js, reel.js, credits.js
│  ├─ webgl/
│  │  ├─ renderer.js          one fixed full-screen canvas, DOM-synced planes
│  │  ├─ MediaPlane.js        image/video texture plane tracking a DOM rect
│  │  ├─ FrameSequence.js     replaces MediaSlot video seeking
│  │  ├─ post/                grain, rgbShift, unrender (dither/ascii)
│  │  └─ transitions/         cut, dissolve, whip, iris, mosh, match, rewind
│  ├─ components/             cursor.js, nav.js, workGrid.js, lightbox.js, timecodeHud.js
│  └─ styles/                 tokens.css, base.css, scenes/*.css
├─ docs/PORTFOLIO_PLAN.md
└─ vite.config.mjs            multi-page inputs
```

`MediaSlot`'s placeholder painters move to `FrameSequence` as the dev fallback
so the "works without assets" property is kept.

### 6.4 Video scrubbing strategy

| Use | Technique | Why |
|---|---|---|
| Hero orbit (most scrubbed) | **Image frame sequence**: 120–180 AVIF/WebP frames at 1600 px (desktop) and 900 px (mobile), drawn to the WebGL plane. Preload first 20 frames during the slate, stream the rest. | Instant, frame-accurate scrubbing in every browser. |
| `craft`, `studio`, `walk` backdrops | `<video>` as WebGL texture, **all-intra encode** (`-g 1`) for seeking, plus current `-g 10` version for mobile fallback. | Smaller than frame sequences; acceptable for slower scrubs. |
| Work grid / Lab loops | Autoplay muted loops (not scrubbed), 4–6 s, 720p, ≤ 1.5 MB each, played only when in view. | |

Extend `videos/README.md` with frame-export commands, e.g.
`ffmpeg -i hero-orbit.mp4 -vf "fps=24,scale=1600:-2" public/frames/hero/%04d.webp`.

### 6.5 Rendering rules

- **One** WebGL canvas, fixed, behind DOM (`pointer-events: none`); DOM stays
  the source of truth for layout and accessibility.
- Render loop on `gsap.ticker`; render only when dirty (port from
  `portfolio/js/main.js:194-225`).
- DPR cap: 1.5 desktop, 1 mobile (existing behaviour).
- Pause WebGL and videos when the tab is hidden or the plane is off-screen.

### 6.6 Hosting

Stay on **Netlify** (already configured in `netlify.toml`). Update build to
`vite build`, add `_headers` for long-cache on `/assets/*`, `/frames/*`,
`/videos/*`, and `_redirects` for `/work/*` if pages are generated. Delete the
Vercel section from the old README.

---

## 7. Content plan

| Item | Status | Needed |
|---|---|---|
| Hero orbit footage | Missing | Shoot or generate (prompts in `videos/README.md`) |
| `craft` / `studio` / `walk` | Missing | Same |
| Portrait | ✅ `portrait.jpg` | — |
| *Existential Evolution* | Title only | Trailer cut (60–90 s), 6–10 stills, logline, festival/credits info |
| Praatik Hires / GrowthGates | One-liners | Logo, 2–3 screens or photos, problem → result story, 2–3 metrics |
| Sahara Prosthetics | One-liner | System diagram, product photos, your role, stack, outcome |
| Baakhapaa App | One-liner | Video essay samples (3), graphics, reach numbers |
| Lab items | None | 6–8 short loops (BTS, motion tests, code toys) |
| Testimonials | None | 2–3 short quotes (optional, credits roll) |
| Booking link | `mailto:` | Cal.com / Calendly URL |
| OG image | Planned in `portfolio/index.html:23` | 1200×630 still from the hero |
| Sound cues | None | 6 short sfx + 1 ambient bed (royalty-free) |

**Copy rule:** every case study gets a one-line logline written like a film
logline — this is the "sold with stories" half of the brand.

All footage is **real** (decision §11). The existing shot list and look rules
in `videos/README.md` become the shoot brief; the AI prompts there stay only as
a reference for framing and lighting.

### 7.1 Everything swappable — no code changes to update content

Today only the 4 video slots auto-detect replacements. v2 extends that idea to
**all** content:

```
content/
├─ site.json          name, tagline, hero copy, manifesto, stats, services,
│                     nav, socials, booking URL, SEO/OG text
├─ work/
│  ├─ existential-evolution.json   { order: 1, featured: true, title, logline,
│  ├─ praatik-hires.json             role, year, client, results[], credits[],
│  ├─ growthgates.json               media: { hero, loop, poster, gallery[] },
│  ├─ sahara-prosthetics.json        sections[] }
│  └─ baakhapaa-app.json
└─ lab.json           [{ title, tag, loop, poster, note }]

public/media/<slug>/  hero.mp4 · loop.mp4 · poster.jpg · 01.jpg …
public/videos/        hero-orbit.mp4 · craft.mp4 · studio.mp4 · walk.mp4
public/frames/hero/   generated from hero-orbit.mp4 by a script
```

How changes work:

| To change… | Do this |
|---|---|
| A headline, stat, service or link | Edit `content/site.json` |
| Which project leads the reel / the order | Change `order` / `featured` in the project JSON |
| Add or remove a project | Add or delete one JSON file + its `public/media/<slug>/` folder |
| Any video or image | Drop a new file with the **same name** into its folder |
| The hero orbit | Replace `public/videos/hero-orbit.mp4`; `npm run frames` regenerates the frame sequence (also runs on Netlify build) |
| Hide a project temporarily | `"draft": true` |

Guarantees built into the code:

- **Every media slot has a fallback** (poster → procedural placeholder, as
  `MediaSlot` does today), so a missing or renamed file never breaks a page.
- **A content check runs at build** (`npm run check:content`): validates JSON
  shape, flags missing media and over-budget file sizes, and fails the deploy
  on broken content instead of shipping it.
- **Pages are generated** from the JSON at build time (Vite plugin), so
  `/work/<slug>` and the sitemap update automatically.

**Optional (Phase 5): edit from the browser.** Add **Decap CMS** at `/admin`
(free, Git-based, works natively with Netlify Identity). It edits the same
JSON files and uploads media, then commits to the repo — Netlify redeploys.
No database, and the files above stay the source of truth.

---

## 8. Quality bars

### 8.1 Performance budgets

| Metric | Budget |
|---|---|
| JS (gzipped, initial) | ≤ 120 KB |
| LCP (4G, mid Android) | ≤ 2.5 s — LCP is the hero's first frame/poster, not a video |
| CLS | ≤ 0.05 |
| INP | ≤ 200 ms |
| Scroll FPS | 60 desktop, ≥ 50 mid-range mobile (ZERO hit 60 on budget Android) |
| Initial media before interaction | ≤ 3 MB (first 20 hero frames + poster) |

### 8.2 Mobile strategy

- Same story, lighter grammar: pinned distances × 0.6, frame sequence at
  900 px, scrub quantised (existing 36-step idea), no cursor, no hover
  distortion; tap → match-cut still works.
- Grid becomes a vertical, snap-scrolling reel of full-width cards.
- `navigator.connection.saveData` or < 4 GB memory → skip WebGL, use CSS
  transitions + posters.

### 8.3 Accessibility

- `prefers-reduced-motion`: no pinning, no scrub, no shader transitions (CSS
  fades only), static frames at meaningful points (existing approach).
- Skip-link, visible `:focus-visible`, full keyboard path through grid and
  case studies; transitions never trap focus.
- SplitText with `aria` preserved; decorative HUD and marquees `aria-hidden`.
- Sound off by default; captions for any narrative video.
- AA contrast for all copy on footage (scrims).

### 8.4 SEO / sharing

Title + description per page, canonical, OG/Twitter cards, `sitemap.xml`
including `/work/*` and `/lab`, JSON-LD `Person` + `CreativeWork` per project.
Port the meta block from `portfolio/index.html:9-34`.

---

## 9. Asset production checklist (additions to `videos/README.md`)

| # | Asset | Spec |
|---|---|---|
| 1 | Hero orbit → frame sequence | 150 frames, 1600 px + 900 px WebP/AVIF |
| 2 | Act I film-strip stills | 8 stills from *Existential Evolution*, 3:2, 1600 px |
| 3 | Act III "unrender" plate | 1 clean 6 s clip (reuse `craft.mp4`) + code/diagram SVG of the Sahara system |
| 4 | Work loops | 5 × 4–6 s, 720p, ≤ 1.5 MB, seamless loop |
| 5 | Case-study media | Per project: 1 hero loop, 4–8 images, 1 long-form embed |
| 6 | Lab loops | 6–8 × 3–5 s |
| 7 | Clapper slate | SVG line art (draw in Figma) |
| 8 | Audio | hum bed, clack, cut tick, whoosh, rewind, UI click |
| 9 | OG image | 1200×630 |

Keep the existing look rules: one continuous take, charcoal + cyan rim light,
no baked-in text.

---

## 10. Roadmap

Each phase ends deployable. Sizes: **S** ≈ 1–2 days, **M** ≈ 3–5, **L** ≈ 1–2 weeks.

### Phase 0 — Clean the set (S)

- [ ] Choose root as the single source; port SEO/meta, skip-link, 404,
      robots, sitemap, mobile quantisation and dirty-flag drawing from
      `portfolio/`; then delete `portfolio/`.
- [ ] Add `.gitignore` (`dist/`, `.vite/`, `node_modules/`); remove committed
      build output.
- [ ] Move to npm deps + Vite build; update `netlify.toml`.
- [ ] Swap `mailto:` for booking link.
- **Done when:** live site looks the same, Lighthouse SEO/a11y ≥ 95, one codebase.

### Phase 1 — Foundation (M)

- [ ] Split `main.js` into the §6.3 modules (no visual change).
- [ ] Motion tokens + SplitText reveals replace hand-split spans.
- [ ] Barba router with a plain `dissolve` CSS transition; `work/` and `lab/`
      stub pages.
- [ ] Timecode HUD component replaces `°` readout + progress hairline.
- [ ] Move all copy, stats, links and project data into `content/` (§7.1);
      pages render from it; `check:content` runs in the Netlify build.
- [ ] Nav `BOOK A CALL` chip + "Skip to the reel" chip (§2.4).
- **Done when:** navigation between home ↔ stubs is seamless; Lenis and
  ScrollTrigger re-init cleanly per route.

### Phase 2 — WebGL layer (L)

- [ ] `renderer.js` + `MediaPlane` (DOM-synced, image & video textures).
- [ ] `FrameSequence` for the hero, with placeholder fallback.
- [ ] Post passes: grain (replace CSS grain), RGB shift.
- [ ] Transition shader with `cut`, `dissolve`, `whip`, `match`.
- [ ] Device-tier detection + no-WebGL fallback.
- **Done when:** hero scrubs at 60 fps on desktop / ≥ 50 on a mid Android; a
  route change uses a shader transition.

### Phase 3 — The home film (L)

- [ ] Slate preloader with real loading progress.
- [ ] Hero letterbox + whip exit.
- [ ] Manifesto film-still portrait + focus pulls.
- [ ] Acts I–III with distinct grammars, incl. the **unrender** shader.
- [ ] Montage timeline stats; film-edge marquees with velocity skew.
- [ ] End-credits finale + rewind replay.
- **Done when:** full storyboard (§3) plays end to end, reduced-motion path
  verified.

### Phase 4 — The reel & case studies (L)

- [ ] WebGL work grid, hover distortion, list/grid toggle.
- [ ] `match` transition grid → case study and back.
- [ ] Case-study template, built first with *Existential Evolution*, then the
      other projects as their real content arrives (`draft: true` until ready).
- [ ] Services section (Scene 5.5) linking into case studies.
- [ ] "Next project" infinite loop.
- **Done when:** every project is reachable, shareable (OG), and returns to
  the grid at the same scroll position.

### Phase 5 — Lab, sound, polish (M)

- [ ] `/lab` contact sheet + iris lightbox.
- [ ] Howler sound system + toggle.
- [ ] 404 "Scene missing".
- [ ] Optional: Decap CMS at `/admin` for editing content from the browser.
- [ ] Micro-interaction pass: cursor states, magnetic tuning, hover timing to
      §5.1 tokens.

### Phase 6 — QA, launch, submit (S)

- [ ] Device matrix: iPhone (Safari), mid Android (Chrome), iPad, 1080p and
      4K desktop, Firefox.
- [ ] Performance budgets (§8.1) met; reduced-motion and keyboard audits.
- [ ] Analytics (privacy-friendly, e.g. Plausible) + scroll-depth events.
- [ ] Submit to Awwwards, CSS Design Awards, The FWA; write a Codrops-style
      case study about the build (itself portfolio content).

---

## 11. Risks & open decisions

| # | Risk / decision | Default recommendation |
|---|---|---|
| 1 | **Footage is the critical path** — without the 4 hero clips the concept falls flat. | Produce assets in parallel with Phases 0–2; placeholders keep dev unblocked. |
| 2 | Real shoot needs planning (location, lighting, a gimbal/orbit rig for the 360° move) | ✅ Decided: all real footage. Book one shoot day covering all 4 clips + Lab BTS; keep placeholders live until files land. |
| 3 | Scroll length fatigue (current home is ~10+ screens pinned) | Keep total home pin length ≤ ~1400 vh; add a "Skip to the reel" chip after the hero. |
| 4 | Safari video-texture quirks | Frame sequence for anything scrubbed; test video textures early in Phase 2. |
| 5 | Case-study content may not exist yet for every project | Launch with the 3 strongest (*Existential Evolution*, Sahara, Baakhapaa); others as "coming soon" rows. |
| 6 | Sound can feel gimmicky | Off by default, subtle, one toggle. |

**Decisions (confirmed 2026-10-28):**

1. **Reel lead:** *Existential Evolution* — featured first card and first
   case study built (Scene 5, §4.1).
2. **Goal:** win **clients** — adds Services (Scene 5.5), nav Book-a-Call chip,
   outcome-led case studies (§2.4).
3. **Footage:** real content only (§7, risk 2).
4. **Content must stay changeable** — JSON content + drop-in media + build-time
   checks, optional Decap CMS (§7.1).
5. **Host:** Netlify (already configured) unless you say otherwise.

---

## 12. Reference map — what each reference contributes

| Reference | Borrowed idea | Used in |
|---|---|---|
| [Lando Norris — Awwwards SOTY 2025](https://www.awwwards.com/annual-awards/winners) | Persona as a full motion system | §2, §5 |
| Messenger (abeto) — Awwwards Dev SOTY 2025 | Visitor as participant; one small polished world | Scene 3 Act III, Lab |
| [Ponpon Mania](https://www.utsubo.com/blog/immersive-storytelling-websites-guide) | Physics on flat assets beats unnecessary 3D | Act I film strip |
| [They Call Me Giulio](https://tympanus.net/codrops/all-articles/page/8/) | Site structured as cinematic scenes | §2.2, §3 |
| [Chems.Studio](https://tympanus.net/codrops/tag/portfolio/) | Restraint around moving image | §2.3, case studies |
| [Podium](https://tympanus.net/codrops/2026/06/23/podium-building-a-website-where-running-becomes-storytelling/) | Clicked media becomes the next page's hero | Scene 5, `match` transition |
| [ZERO](https://tympanus.net/codrops/2026/07/17/zero-the-engineering-behind-a-defiant-interactive-narrative/) | 200 ms snaps; 60 fps on budget Android; Howler sound | §2.3, §5.5, §8.1 |
| [More Than a Portfolio](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/) | KTX2 / instancing perf discipline | §6.5 |
| [Arnaud Rocca](https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/) | Motion as a token-driven system | §5.1 |
| [GSAP drives my portfolio (May 2026)](https://tympanus.net/codrops/2026/05/06/from-shader-uniforms-to-clip-path-wipes-how-gsap-drives-my-portfolio/) | GSAP-driven shader uniforms, light WebGL over Three.js, Lenis | §6.1, §6.2 |
| [WebGL gallery with GSAP + Barba](https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/) | Router + persistent canvas stack | §6.1 |
| [Stefan Vitasović](https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/) | Video as WebGL textures, LED/noise shader overlay | Scene 2, Scene 5 |
| [Dondre Green](https://tympanus.net/codrops/2025/01/07/case-study-dondre-green/) | 1/2/3-column grid toggle for films | Scene 5 |
| Giulia Gartner ([HubSpot roundup](https://blog.hubspot.com/website/filmmaker-website-examples)) | Camera metaphor in UI | §2.1 |
| [Felix Turner](https://www.airtight.cc/) / [Valentin Gassend Lab](https://www.awwwards.com/inspiration/lab-valentin-gassend-portfolio-valentin-gassend-portfolio) | Separate lab for experiments | §4.2 |
| [Bruno Simon](https://www.awwwards.com/sites/bruno-simon-portfolio) | Navigation as the experience | Rewind / replay, Lab |
