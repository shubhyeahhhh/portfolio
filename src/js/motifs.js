// Live motion-graphic thumbnails: one generative motif per project, drawn on a
// 2D canvas behind the title card's type. Only canvases on screen animate (one
// shared rAF loop); with reduced motion each draws a single still frame.
// Motifs sit top-right so the title stays readable bottom-left.

const PALETTES = {
  ember: { accent: '255,138,76', line: '255,226,208' },
  steel: { accent: '150,176,236', line: '226,234,255' },
  amber: { accent: '255,180,96', line: '255,238,214' },
  night: { accent: '122,162,255', line: '222,232,255' },
  teal: { accent: '95,224,204', line: '214,255,248' },
  plum: { accent: '255,120,150', line: '255,228,236' },
};

// Small deterministic PRNG so a motif looks the same on every load.
const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rgba = (rgb, a) => `rgba(${rgb},${a.toFixed(3)})`;

const MOTIFS = {
  // Existential Evolution — a phyllotaxis spiral that slowly turns and breathes.
  evolution: {
    draw(ctx, w, h, t, c) {
      const cx = w * 0.66, cy = h * 0.4, m = Math.min(w, h);
      const n = 420, golden = 2.39996323, k = m * 0.021;
      for (let i = 1; i < n; i++) {
        const f = i / n;
        const a = i * golden + t * 0.07;
        const r = k * Math.sqrt(i) * (1 + 0.035 * Math.sin(t * 0.9 - i * 0.025));
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.94;
        const s = (1 + 2.6 * (1 - f)) * (0.65 + 0.35 * Math.sin(t * 1.4 + i * 0.31)) * (m / 360);
        ctx.fillStyle = i < n * 0.3 ? rgba(c.accent, 0.95 - f) : rgba(c.line, 0.75 * (1 - f) + 0.08);
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
      // a slow "division" ring expanding from the centre
      const p = (t * 0.12) % 1;
      ctx.strokeStyle = rgba(c.accent, 0.35 * (1 - p));
      ctx.lineWidth = Math.max(1, m / 400);
      ctx.beginPath();
      ctx.arc(cx, cy, k * Math.sqrt(n) * (0.15 + p), 0, Math.PI * 2);
      ctx.stroke();
    },
  },

  // Sahara Prosthetics — a rotating engineering wireframe with a measuring ring.
  mechanism: {
    draw(ctx, w, h, t, c) {
      const cx = w * 0.68, cy = h * 0.4, R = Math.min(w, h) * 0.3;
      const ry = t * 0.35, rx = 0.45 + 0.08 * Math.sin(t * 0.4);
      const cosY = Math.cos(ry), sinY = Math.sin(ry), cosX = Math.cos(rx), sinX = Math.sin(rx);
      const project = (x, y, z) => {
        const x1 = x * cosY + z * sinY, z1 = -x * sinY + z * cosY;
        const y1 = y * cosX - z1 * sinX, z2 = y * sinX + z1 * cosX;
        return [cx + x1 * R, cy + y1 * R, z2];
      };
      ctx.lineWidth = Math.max(1, R / 160);
      const seg = 48;
      // Depth-shaded segments, batched into 6 alpha buckets (one stroke each).
      const buckets = Array.from({ length: 6 }, () => []);
      const stroke = (pts) => {
        for (let i = 1; i < pts.length; i++) {
          const z = (pts[i - 1][2] + pts[i][2]) / 4 + 0.5;
          buckets[Math.min(5, Math.max(0, Math.floor(z * 6)))].push(pts[i - 1], pts[i]);
        }
      };
      for (let la = -3; la <= 3; la++) { // latitudes
        const phi = (la / 4) * (Math.PI / 2), pts = [];
        for (let i = 0; i <= seg; i++) { const th = (i / seg) * Math.PI * 2; pts.push(project(Math.cos(phi) * Math.cos(th), Math.sin(phi), Math.cos(phi) * Math.sin(th))); }
        stroke(pts);
      }
      for (let lo = 0; lo < 10; lo++) { // meridians
        const th = (lo / 10) * Math.PI, pts = [];
        for (let i = 0; i <= seg; i++) { const phi = (i / seg) * Math.PI * 2; pts.push(project(Math.cos(phi) * Math.cos(th), Math.sin(phi), Math.cos(phi) * Math.sin(th))); }
        stroke(pts);
      }
      buckets.forEach((segs, b) => {
        if (!segs.length) return;
        ctx.strokeStyle = rgba(c.line, 0.12 + 0.5 * ((b + 0.5) / 6));
        ctx.beginPath();
        for (let i = 0; i < segs.length; i += 2) { ctx.moveTo(segs[i][0], segs[i][1]); ctx.lineTo(segs[i + 1][0], segs[i + 1][1]); }
        ctx.stroke();
      });
      // measuring ring with ticks, counter-rotating
      const ring = R * 1.28;
      ctx.strokeStyle = rgba(c.accent, 0.55);
      ctx.beginPath(); ctx.arc(cx, cy, ring, -t * 0.2, -t * 0.2 + Math.PI * 1.5); ctx.stroke();
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2 - t * 0.2, len = i % 6 === 0 ? R * 0.09 : R * 0.04;
        ctx.strokeStyle = rgba(c.line, i % 6 === 0 ? 0.55 : 0.22);
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * ring, cy + Math.sin(a) * ring); ctx.lineTo(cx + Math.cos(a) * (ring + len), cy + Math.sin(a) * (ring + len)); ctx.stroke();
      }
      // joint marker orbiting the sphere
      const ja = t * 0.8, jx = cx + Math.cos(ja) * ring, jy = cy + Math.sin(ja) * ring;
      ctx.fillStyle = rgba(c.accent, 1);
      ctx.beginPath(); ctx.arc(jx, jy, R * 0.035, 0, Math.PI * 2); ctx.fill();
    },
  },

  // Baakhapaa — an edit timeline: clips scroll past a playhead over a live waveform.
  timeline: {
    init(w, h, r) {
      const tracks = [0, 1, 2, 3].map((i) => {
        const clips = []; let x = 0;
        while (x < w * 2.2) { const len = w * (0.08 + r() * 0.22); clips.push({ x, len, hot: r() < 0.22 }); x += len + w * (0.01 + r() * 0.05); }
        return { clips, span: x, speed: (0.025 + r() * 0.035) * w * (i % 2 ? 1 : 0.7) };
      });
      return { tracks };
    },
    draw(ctx, w, h, t, c, s) {
      const top = h * 0.12, th = h * 0.085, gap = h * 0.03, left = w * 0.28, right = w * 0.98;
      ctx.save(); ctx.beginPath(); ctx.rect(left, 0, right - left, h); ctx.clip();
      // ruler
      ctx.strokeStyle = rgba(c.line, 0.25); ctx.lineWidth = 1;
      const step = w * 0.04, off = (t * w * 0.03) % step;
      for (let x = left - off; x < right; x += step) { ctx.beginPath(); ctx.moveTo(x, top - h * 0.05); ctx.lineTo(x, top - h * 0.025); ctx.stroke(); }
      s.tracks.forEach((tr, i) => {
        const y = top + i * (th + gap), shift = (t * tr.speed) % tr.span;
        tr.clips.forEach((cl) => {
          for (const base of [0, tr.span]) {
            const x = left + cl.x + base - shift;
            if (x > right || x + cl.len < left) continue;
            ctx.fillStyle = cl.hot ? rgba(c.accent, 0.75) : rgba(c.line, 0.14 + (i === 0 ? 0.08 : 0));
            ctx.beginPath(); ctx.roundRect(x, y, cl.len, th, th * 0.18); ctx.fill();
          }
        });
      });
      // waveform
      const wy = top + 4 * (th + gap) + th * 0.6, bars = 64, bw = (right - left) / bars;
      for (let b = 0; b < bars; b++) {
        const v = Math.abs(Math.sin(b * 0.45 + t * 2.1) * Math.sin(b * 0.13 - t * 0.9)) * 0.85 + 0.08;
        ctx.fillStyle = rgba(c.line, 0.35);
        ctx.fillRect(left + b * bw + bw * 0.2, wy - v * th, bw * 0.6, v * th * 2);
      }
      ctx.restore();
      // playhead
      const px = w * 0.62;
      ctx.strokeStyle = rgba(c.accent, 1); ctx.lineWidth = Math.max(1.5, w / 500);
      ctx.beginPath(); ctx.moveTo(px, top - h * 0.06); ctx.lineTo(px, wy + th * 1.4); ctx.stroke();
      ctx.fillStyle = rgba(c.accent, 1);
      ctx.beginPath(); ctx.moveTo(px - w * 0.012, top - h * 0.08); ctx.lineTo(px + w * 0.012, top - h * 0.08); ctx.lineTo(px, top - h * 0.05); ctx.fill();
    },
  },

  // Praatik Hires — people drifting into a network; a few "hires" pulse.
  network: {
    init(w, h, r) {
      return {
        nodes: Array.from({ length: 34 }, (_, i) => ({
          x: 0.3 + r() * 0.68, y: 0.06 + r() * 0.62, px: r() * 6.28, py: r() * 6.28, sp: 0.2 + r() * 0.35, hot: i % 9 === 0,
        })),
      };
    },
    draw(ctx, w, h, t, c, s) {
      const m = Math.min(w, h), reach = m * 0.24;
      const pts = s.nodes.map((n) => [w * n.x + Math.sin(t * n.sp + n.px) * m * 0.04, h * n.y + Math.cos(t * n.sp * 0.8 + n.py) * m * 0.04, n.hot]);
      ctx.lineWidth = Math.max(1, m / 500);
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], d = Math.hypot(dx, dy);
          if (d > reach) continue;
          ctx.strokeStyle = rgba(pts[i][2] || pts[j][2] ? c.accent : c.line, 0.42 * (1 - d / reach));
          ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke();
        }
      pts.forEach(([x, y, hot], i) => {
        ctx.fillStyle = hot ? rgba(c.accent, 1) : rgba(c.line, 0.8);
        ctx.beginPath(); ctx.arc(x, y, (hot ? 3.2 : 1.8) * (m / 420), 0, Math.PI * 2); ctx.fill();
        if (hot) {
          const p = (t * 0.5 + i * 0.13) % 1;
          ctx.strokeStyle = rgba(c.accent, 0.6 * (1 - p));
          ctx.beginPath(); ctx.arc(x, y, (4 + p * 26) * (m / 420), 0, Math.PI * 2); ctx.stroke();
        }
      });
    },
  },

  // Maybe I Never Confess — two people drifting close and apart, linked by a
  // hesitant dashed line; an unsaid "…" by the quieter one; five episodes play in turn.
  confess: {
    draw(ctx, w, h, t, c, s) {
      const m = Math.min(w, h), u = m / 420;
      // episode strip (EP1–EP5), the current episode lit
      const eps = 5, left = w * 0.42, right = w * 0.94, top = h * 0.1, eh = h * 0.1, gap = w * 0.012;
      const ew = (right - left - gap * (eps - 1)) / eps, cur = Math.floor(t / 4) % eps, prog = (t / 4) % 1;
      ctx.font = `500 ${Math.round(10 * u)}px "IBM Plex Mono", monospace`;
      ctx.textBaseline = 'top';
      for (let i = 0; i < eps; i++) {
        const x = left + i * (ew + gap);
        ctx.fillStyle = rgba(c.line, i === cur ? 0.16 : 0.07);
        ctx.beginPath(); ctx.roundRect(x, top, ew, eh, 4 * u); ctx.fill();
        if (i < cur || i === cur) {
          ctx.fillStyle = rgba(c.accent, i === cur ? 0.9 : 0.35);
          ctx.fillRect(x, top + eh - 3 * u, ew * (i === cur ? prog : 1), 3 * u);
        }
        ctx.fillStyle = rgba(c.line, i === cur ? 0.9 : 0.4);
        ctx.fillText(`EP${i + 1}`, x + 6 * u, top + 6 * u);
      }
      // the two of them
      const cx = w * 0.68, cy = h * 0.5;
      const d = m * (0.1 + 0.07 * (0.5 + 0.5 * Math.sin(t * 0.45)));
      const a = t * 0.18;
      const ax = cx - Math.cos(a) * d, ay = cy - Math.sin(a) * d * 0.5 + Math.sin(t * 0.9) * 4 * u; // introvert
      const bx = cx + Math.cos(a) * d, by = cy + Math.sin(a) * d * 0.5 + Math.cos(t * 0.7) * 5 * u; // best friend
      const near = 1 - Math.min(1, (Math.hypot(bx - ax, by - ay) - m * 0.2) / (m * 0.14));
      ctx.setLineDash([5 * u, 7 * u]);
      ctx.lineDashOffset = -t * 12 * u;
      ctx.strokeStyle = rgba(c.accent, 0.12 + 0.45 * Math.max(0, near));
      ctx.lineWidth = Math.max(1, 1.2 * u);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.setLineDash([]);
      // Glows are pre-rendered once into small sprites (gradients per frame are costly).
      s.sprites ??= {};
      const sprite = (rgb, r, al) => {
        const key = `${rgb}|${Math.round(r)}|${al}`;
        if (!s.sprites[key]) {
          const size = Math.ceil(r * 8), cv = document.createElement('canvas');
          cv.width = cv.height = size;
          const g2 = cv.getContext('2d'), mid = size / 2, gr = g2.createRadialGradient(mid, mid, 0, mid, mid, mid);
          gr.addColorStop(0, rgba(rgb, al * 0.5)); gr.addColorStop(1, rgba(rgb, 0));
          g2.fillStyle = gr; g2.fillRect(0, 0, size, size);
          g2.fillStyle = rgba(rgb, al); g2.beginPath(); g2.arc(mid, mid, r, 0, Math.PI * 2); g2.fill();
          s.sprites[key] = cv;
        }
        return s.sprites[key];
      };
      const glow = (x, y, r, rgb, al) => { const sp = sprite(rgb, r, al); ctx.drawImage(sp, x - sp.width / 2, y - sp.height / 2); };
      glow(ax, ay, 5 * u, c.line, 0.75);
      glow(bx, by, 7 * u, c.accent, 1);
      // the unsaid "…": three dots that pulse but never resolve
      for (let i = 0; i < 3; i++) {
        const p = 0.5 + 0.5 * Math.sin(t * 3 - i * 0.7);
        ctx.fillStyle = rgba(c.line, 0.2 + 0.6 * p);
        ctx.beginPath(); ctx.arc(ax - 10 * u + i * 9 * u, ay - 22 * u - p * 2 * u, 2.2 * u, 0, Math.PI * 2); ctx.fill();
      }
    },
  },

  // GrowthGates — particles rising through a series of gates (arches).
  growth: {
    init(w, h, r) {
      return { parts: Array.from({ length: 90 }, () => ({ x: (r() - 0.5) * 0.5, o: r(), sp: 0.05 + r() * 0.09, s: 0.6 + r() * 1.6, hot: r() < 0.15 })) };
    },
    draw(ctx, w, h, t, c, s) {
      const cx = w * 0.68, base = h * 0.8, m = Math.min(w, h);
      ctx.lineWidth = Math.max(1, m / 380);
      const gates = 6, pulse = (t * 0.35) % 1;
      for (let g = 0; g < gates; g++) {
        const rad = m * (0.1 + g * 0.075), lit = Math.max(0, 1 - Math.abs(g / (gates - 1) - pulse) * 4);
        ctx.strokeStyle = lit > 0 ? rgba(c.accent, 0.25 + 0.65 * lit) : rgba(c.line, 0.18);
        ctx.beginPath(); ctx.arc(cx, base, rad, Math.PI, 0); ctx.stroke();
      }
      s.parts.forEach((p) => {
        const life = (t * p.sp + p.o) % 1, y = base - life * h * 0.85, x = cx + p.x * w * (0.4 + life * 0.6);
        const a = Math.sin(life * Math.PI);
        ctx.fillStyle = p.hot ? rgba(c.accent, a) : rgba(c.line, a * 0.7);
        const sz = p.s * (m / 420);
        ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz * (p.hot ? 3 : 1));
      });
    },
  },
};

const visible = new Set();
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const t0 = performance.now();
let raf = 0;

function size(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const r = cv.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
  if (cv.width === w && cv.height === h && cv.__m.state) return;
  cv.width = w; cv.height = h;
  const m = cv.__m;
  m.state = m.motif.init ? m.motif.init(w, h, rng(m.seed)) : {};
  if (reduced) paint(cv, 14);
}

function paint(cv, t) {
  const m = cv.__m, { ctx } = m;
  ctx.clearRect(0, 0, cv.width, cv.height);
  m.motif.draw(ctx, cv.width, cv.height, t, m.pal, m.state);
  // Fade the motif out toward the title (bottom-left) so the type stays clean.
  if (!m.fade || m.fadeH !== cv.height) {
    m.fade = ctx.createLinearGradient(0, cv.height * 0.42, 0, cv.height * 0.9);
    m.fade.addColorStop(0, 'rgba(0,0,0,0)');
    m.fade.addColorStop(1, 'rgba(0,0,0,1)');
    m.fadeH = cv.height;
  }
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = m.fade;
  ctx.fillRect(0, cv.height * 0.42, cv.width, cv.height * 0.58);
  ctx.globalCompositeOperation = 'source-over';
}

function loop(now) {
  const t = (now - t0) / 1000;
  visible.forEach((cv) => (cv.isConnected ? paint(cv, t) : visible.delete(cv)));
  raf = visible.size ? requestAnimationFrame(loop) : 0;
}

const io = new IntersectionObserver(
  (entries) =>
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting && !reduced) visible.add(target);
      else visible.delete(target);
      if (visible.size && !raf) raf = requestAnimationFrame(loop);
    }),
  { rootMargin: '80px' }
);
const ro = new ResizeObserver((entries) => entries.forEach(({ target }) => size(target)));

export function mountMotifs(root = document) {
  root.querySelectorAll('canvas[data-motif]').forEach((cv) => {
    if (cv.__m) return;
    const motif = MOTIFS[cv.dataset.motif];
    if (!motif) return;
    const name = cv.dataset.motif;
    cv.__m = {
      ctx: cv.getContext('2d'),
      motif,
      pal: PALETTES[cv.dataset.tone] || PALETTES.night,
      seed: [...name].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7),
      state: null,
    };
    size(cv);
    io.observe(cv);
    ro.observe(cv);
  });
}
