(() => {
  'use strict';
  // Decorative companions only on the brand and primary navigation.
  const targets = document.querySelectorAll('.site-nav .wordmark, .site-nav .nav-links > a, .site-header .brand, #primary-nav > a, .site-header .nav-toggle');
  targets.forEach(target => {
    target.classList.add('sloth-hover');
    const sloth = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sloth.setAttribute('viewBox', '0 0 64 64');
    sloth.setAttribute('aria-hidden', 'true');
    sloth.setAttribute('focusable', 'false');
    sloth.classList.add('nav-sloth');
    sloth.innerHTML = `<g stroke="#49372d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path fill="#a77952" d="M13 48c-6-7-4-18 2-24C18 12 29 9 39 13c12 4 17 16 12 28l-3 12H18z"/>
      <path fill="#efdab5" d="M16 29c2-9 12-14 18-9 7-5 16 0 17 9 2 12-6 21-17 21S14 41 16 29z"/>
      <path fill="#77503b" stroke="none" d="M18 31c1-5 8-7 12-3l-6 11c-6 1-9-3-6-8zm31 0c-1-5-8-7-12-3l6 11c6 1 9-3 6-8z"/>
      <path fill="none" d="M22 32q3-3 6 0m12 0q3-3 6 0"/>
      <path fill="#49372d" d="M30 34q4-3 8 0l-4 4z"/>
      <path fill="none" d="M27 40q7 7 14 0"/>
      <g class="sloth-wave"><path fill="#a77952" d="M47 46q9-1 8-13l-1-8q-1-5-5-3t-3 6l1 7-7 8"/><path fill="none" stroke="#efdab5" d="m49 24 1 5m3-5 1 5"/></g>
      <path fill="#a77952" d="M16 43q-8-2-9 4t10 8l10-2q4-3 0-6z"/>
      <path fill="none" stroke="#efdab5" d="m10 47 4 2m-4 2 4 2"/>
    </g>`;
    target.append(sloth);
  });
})();
