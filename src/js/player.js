// Full-screen video player. Any element with data-play='{"provider", "id" | "src", "ratio"?}'
// opens it; the embed is created on open and destroyed on close (playback stops,
// nothing loads until someone actually presses play).
//   youtube   → { "provider": "youtube", "id": "VIDEO_ID" }
//   vimeo     → { "provider": "vimeo", "id": "123456789" }
//   instagram → { "provider": "instagram", "id": "REEL_CODE", "ratio": "9:16" }
//   file      → { "provider": "file", "src": "/media/<slug>/film.mp4", "poster"?: "…" }
import { gsap } from 'gsap';
import { getLenis } from './motion.js';

const embedUrl = (v) => {
  const id = encodeURIComponent(v.id || '');
  if (v.provider === 'youtube') return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  if (v.provider === 'vimeo') return `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1&title=0&byline=0`;
  if (v.provider === 'instagram') return `https://www.instagram.com/reel/${id}/embed/`;
  return null;
};

export function initPlayer() {
  let dialog = null;
  let frame, caption, closeBtn, returnFocus;

  const build = () => {
    dialog = document.createElement('div');
    dialog.className = 'player';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.hidden = true;
    dialog.innerHTML = `
      <button class="player__close" type="button" aria-label="Close video"><span aria-hidden="true">×</span> Close</button>
      <div class="player__frame"></div>
      <p class="player__caption"><span class="rec rec--on-dark"><span class="rec__dot"></span><span data-player-title></span></span><span>Esc to close</span></p>`;
    document.body.append(dialog);
    frame = dialog.querySelector('.player__frame');
    caption = dialog.querySelector('[data-player-title]');
    closeBtn = dialog.querySelector('.player__close');
    closeBtn.addEventListener('click', close);
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); } // keep focus inside
    });
  };

  const open = (video, title, trigger) => {
    if (!dialog) build();
    returnFocus = trigger;
    const vertical = video.ratio === '9:16' || video.provider === 'instagram';
    dialog.classList.toggle('player--vertical', vertical);
    dialog.setAttribute('aria-label', title || 'Video');
    caption.textContent = title || '';

    let el;
    if (video.provider === 'file') {
      el = document.createElement('video');
      el.src = video.src;
      if (video.poster) el.poster = video.poster;
      Object.assign(el, { controls: true, autoplay: true, playsInline: true });
    } else {
      const url = embedUrl(video);
      if (!url) return;
      el = document.createElement('iframe');
      el.src = url;
      el.title = title || 'Video';
      el.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
      el.allowFullscreen = true;
    }
    frame.replaceChildren(el);
    dialog.hidden = false;
    document.documentElement.classList.add('player-open');
    getLenis()?.stop();
    gsap.fromTo(dialog, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    gsap.fromTo(frame, { scale: 0.94, y: 20 }, { scale: 1, y: 0, duration: 0.6, ease: 'expo.out' });
    closeBtn.focus();
  };

  function close() {
    if (!dialog || dialog.hidden) return;
    gsap.to(dialog, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        frame.replaceChildren(); // stops playback
        dialog.hidden = true;
        document.documentElement.classList.remove('player-open');
        getLenis()?.start();
        returnFocus?.focus?.();
      },
    });
  }

  // Capture phase so the player wins over link navigation and page transitions.
  document.addEventListener(
    'click',
    (e) => {
      const trigger = e.target.closest('[data-play]');
      if (!trigger || e.metaKey || e.ctrlKey || e.shiftKey) return;
      let video;
      try { video = JSON.parse(trigger.dataset.play); } catch { return; }
      e.preventDefault();
      e.stopPropagation();
      open(video, trigger.dataset.playTitle, trigger);
    },
    true
  );
}
