// Paper fold: each block tips away from the reader like a sheet of paper as it
// scrolls out the top, and stands up from the bottom as it arrives.
// Plain 3D transforms, so it runs in every modern browser (no experimental flags).
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const roots = [...document.querySelectorAll('.page > header, .page > div, .page > section, .content > section, .site-footer')];
  if (!roots.length) return;

  const OUT = 0.42, IN = 0.38;           // share of the viewport used for each fold
  const MAX_OUT = 52, MAX_IN = 40;        // degrees
  const ease = t => t * t * (3 - 2 * t);
  let blocks = [], queued = false;

  // Tall sections fold piece by piece: a 3000px sheet tilting on one hinge
  // swings most of itself out of view and leaves a gap.
  const collect = () => {
    blocks.forEach(el => { el.removeAttribute('data-fold'); el.style.transform = el.style.filter = el.style.transformOrigin = ''; });
    blocks = [];
    const cap = innerHeight * 0.8;
    const walk = el => {
      const kids = [...el.children].filter(k => k.offsetHeight > 0);
      if (el.offsetHeight > cap && kids.length) kids.forEach(walk);
      else blocks.push(el);
    };
    roots.forEach(walk);
    blocks.forEach(el => el.setAttribute('data-fold', ''));
  };

  const render = () => {
    queued = false;
    const vh = innerHeight;
    for (const el of blocks) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40) {
        if (el.style.transform) { el.style.transform = el.style.filter = el.style.transformOrigin = ''; }
        continue;
      }
      // Leaving at the top: hinge on the bottom edge, top recedes.
      const out = ease(Math.min(1, Math.max(0, 1 - r.bottom / (vh * OUT))));
      // Arriving at the bottom: hinge on the top edge, bottom recedes.
      const inn = out ? 0 : ease(Math.min(1, Math.max(0, (r.top - vh * (1 - IN)) / (vh * IN))));
      const p = out || inn;
      if (!p) {
        if (el.style.transform) { el.style.transform = el.style.filter = el.style.transformOrigin = ''; }
        continue;
      }
      el.style.transformOrigin = out ? '50% 100%' : '50% 0';
      el.style.transform = `perspective(1400px) rotateX(${out ? p * MAX_OUT : -p * MAX_IN}deg)`;
      el.style.filter = `brightness(${1 - p * 0.22})`;
    }
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(render); } };
  let resizeTimer;
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { collect(); render(); }, 150); });
  addEventListener('beforeprint', () => blocks.forEach(el => { el.style.transform = el.style.filter = ''; }));
  addEventListener('load', () => { collect(); render(); });   // heights settle once images load
  collect();
  render();
})();
