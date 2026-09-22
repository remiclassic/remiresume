(() => {
  'use strict';
  // Lightweight obfuscation discourages simple address scrapers, not all bots.
  const parts = [[114,99,111,117,116,117,114,101],[103,109,97,105,108],[99,111,109]];
  document.querySelectorAll('[data-reveal-email]').forEach(button => {
    button.addEventListener('click', () => {
      const decode = values => String.fromCharCode(...values);
      const address = `${decode(parts[0])}@${decode(parts[1])}.${decode(parts[2])}`;
      const link = document.createElement('a');
      link.className = button.className;
      link.href = `mailto:${address}`;
      link.textContent = `${address} ↗`;
      link.setAttribute('aria-label', `Email ${address}`);
      button.replaceWith(link);
      link.focus({preventScroll:true});
    }, {once:true});
  });
})();
