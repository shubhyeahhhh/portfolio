// WebGL hover on project media: a ripple that radiates from the pointer plus a
// soft RGB split. One shared canvas/context is moved into whichever card is
// hovered, so there is never more than one WebGL context on the page.
// Sources: the card's <img>/<video> if present, otherwise its title card is
// redrawn into a 2D canvas (same gradient, same type) and used as the texture.
import { gsap } from 'gsap';
import { finePointer } from './util.js';

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes, uTexRes, uMouse;
uniform float uHover, uTime;

vec2 cover(vec2 uv) {
  float r = uRes.x / uRes.y, t = uTexRes.x / uTexRes.y;
  vec2 s = r > t ? vec2(1.0, t / r) : vec2(r / t, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
  vec2 d = (vUv - uMouse) * aspect;
  float dist = length(d);
  vec2 dir = dist > 0.0001 ? normalize(d) / aspect : vec2(0.0);
  float wave = sin(dist * 26.0 - uTime * 4.0) * exp(-dist * 4.5);
  vec2 uv = vUv + dir * wave * 0.010 * uHover;
  uv = (uv - 0.5) * (1.0 - 0.035 * uHover) + 0.5;           // gentle push-in
  float split = uHover * (0.0025 + 0.006 * exp(-dist * 3.0));
  float r = texture2D(uTex, cover(uv + dir * split)).r;
  float g = texture2D(uTex, cover(uv)).g;
  float b = texture2D(uTex, cover(uv - dir * split)).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}`;

// Title-card palettes (mirror .titlecard--* in components.css).
const TONES = {
  ember: { a: '#3b2614', b: '#191b21', c: '#0f2a33', glow: 'rgba(255,106,31,0.33)', gx: 0.85, gy: 0 },
  steel: { a: '#1d1f2b', b: '#14161e', c: '#0c0e12', glow: 'rgba(109,126,168,0.30)', gx: 0.8, gy: 0.1 },
  amber: { a: '#2a2018', b: '#1c1814', c: '#0f1115', glow: 'rgba(255,176,92,0.25)', gx: 0.8, gy: 0.1 },
  night: { a: '#1b2633', b: '#151b24', c: '#0e1116', glow: 'rgba(79,123,214,0.25)', gx: 0.8, gy: 0.1 },
  teal: { a: '#15282a', b: '#111b1d', c: '#0d1013', glow: 'rgba(63,193,176,0.25)', gx: 0.8, gy: 0.1 },
};

function drawTitleCard(media, card) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const box = media.getBoundingClientRect();
  const w = Math.round(box.width * dpr), h = Math.round(box.height * dpr);
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  const tone = TONES[(card.className.match(/titlecard--(\w+)/) || [])[1]] || TONES.night;

  const lin = ctx.createLinearGradient(0, 0, w, h);
  lin.addColorStop(0, tone.a); lin.addColorStop(0.55, tone.b); lin.addColorStop(1, tone.c);
  ctx.fillStyle = lin; ctx.fillRect(0, 0, w, h);
  const rad = ctx.createRadialGradient(w * tone.gx, h * tone.gy, 0, w * tone.gx, h * tone.gy, Math.max(w, h) * 0.75);
  rad.addColorStop(0, tone.glow); rad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rad; ctx.fillRect(0, 0, w, h);

  // Re-set the card's text exactly where the DOM put it.
  const drawText = (el, color) => {
    if (!el) return;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const size = parseFloat(cs.fontSize) * dpr;
    const lh = (parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.1) * dpr;
    ctx.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${(parseFloat(cs.letterSpacing) || 0) * dpr}px`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    const maxW = r.width * dpr + 2;
    const lines = [];
    let line = '';
    for (const word of el.textContent.trim().split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(test).width > maxW) { lines.push(line); line = word; } else line = test;
    }
    lines.push(line);
    const x = (r.left - box.left) * dpr;
    const y0 = (r.top - box.top) * dpr;
    lines.forEach((l, i) => ctx.fillText(l, x, y0 + lh * (i + 0.5)));
  };
  drawText(card.querySelector('.titlecard__meta'), 'rgba(255,255,255,0.7)');
  drawText(card.querySelector('.titlecard__title'), '#ffffff');
  return cv;
}

export function initHoverFx() {
  if (!finePointer() || !document.documentElement.classList.contains('motion')) return;
  const targets = document.querySelectorAll('a .media, a.featured .media');
  if (!targets.length) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'fx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false });
  if (!gl) return;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = Object.fromEntries(['uRes', 'uTexRes', 'uMouse', 'uHover', 'uTime', 'uTex'].map((n) => [n, gl.getUniformLocation(prog, n)]));
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.uniform1i(u.uTex, 0);

  const state = { hover: 0, mx: 0.5, my: 0.5, tx: 0.5, ty: 0.5 };
  let active = null; // the .media element the canvas currently lives in
  let source = null; // image/video/canvas used as the texture
  let raf = 0;
  const cache = new WeakMap();

  const upload = () => {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  };

  const render = (t) => {
    state.mx += (state.tx - state.mx) * 0.12;
    state.my += (state.ty - state.my) * 0.12;
    if (source instanceof HTMLVideoElement && source.readyState >= 2) upload();
    gl.uniform2f(u.uMouse, state.mx, 1 - state.my);
    gl.uniform1f(u.uHover, state.hover);
    gl.uniform1f(u.uTime, t / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(render);
  };

  const attach = (media) => {
    const img = media.querySelector('img, video');
    const card = media.querySelector('.titlecard');
    if (img && img.tagName === 'IMG' && !img.complete) return false;
    if (!cache.has(media) || img?.tagName === 'VIDEO') cache.set(media, img || (card && drawTitleCard(media, card)));
    source = cache.get(media);
    if (!source) return false;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = media.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    const sw = source.videoWidth || source.naturalWidth || source.width;
    const sh = source.videoHeight || source.naturalHeight || source.height;
    gl.uniform2f(u.uTexRes, sw || 1, sh || 1);
    upload();
    media.append(canvas);
    active = media;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(render);
    return true;
  };

  const detach = () => {
    cancelAnimationFrame(raf);
    canvas.remove();
    active = null;
  };

  targets.forEach((media) => {
    media.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = media.getBoundingClientRect();
      state.tx = state.mx = (e.clientX - r.left) / r.width;
      state.ty = state.my = (e.clientY - r.top) / r.height;
      if (active !== media) {
        if (active) detach();
        state.hover = 0;
        if (!attach(media)) return;
      }
      gsap.to(state, { hover: 1, duration: 0.7, ease: 'power3.out', overwrite: true });
    });
    media.addEventListener('pointermove', (e) => {
      if (active !== media) return;
      const r = media.getBoundingClientRect();
      state.tx = (e.clientX - r.left) / r.width;
      state.ty = (e.clientY - r.top) / r.height;
    });
    media.addEventListener('pointerleave', () => {
      if (active !== media) return;
      gsap.to(state, { hover: 0, duration: 0.6, ease: 'power2.out', overwrite: true, onComplete: () => active === media && detach() });
    });
  });

  // Text metrics change if fonts load late or the window resizes: redraw next time.
  window.addEventListener('resize', () => targets.forEach((m) => cache.delete(m)), { passive: true });
}
