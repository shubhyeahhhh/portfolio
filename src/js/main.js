import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/pages.css';
import '../styles/premium.css';
import '../styles/transitions.css';

import { initMotion } from './motion.js';
import { initNav } from './nav.js';
import { initTransitions } from './transitions.js';
import { initPortrait } from './portrait.js';
import { initWork } from './work.js';
import { initContact } from './contact.js';
import { initMedia } from './media.js';
import { initCursor } from './cursor.js';
import { initHoverFx } from './hoverfx.js';
import { mountMotifs } from './motifs.js';
import { initPlayer } from './player.js';

const boot = () => {
  initNav();
  initTransitions();
  initMedia();
  initPlayer();
  mountMotifs();
  initPortrait(document.querySelector('[data-portrait]'));
  initWork(document.querySelector('[data-work]'));
  initContact(document.querySelector('[data-brief]'));
  initMotion();
  initCursor();
  document.fonts?.ready.then(initHoverFx) ?? initHoverFx();
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
