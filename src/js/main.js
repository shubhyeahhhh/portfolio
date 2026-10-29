import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/pages.css';

import { initMotion } from './motion.js';
import { initNav } from './nav.js';
import { initTransitions } from './transitions.js';
import { initPortrait } from './portrait.js';
import { initWork } from './work.js';
import { initContact } from './contact.js';
import { initMedia } from './media.js';

const boot = () => {
  initNav();
  initTransitions();
  initMedia();
  initPortrait(document.querySelector('[data-portrait]'));
  initWork(document.querySelector('[data-work]'));
  initContact(document.querySelector('[data-brief]'));
  initMotion();
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
