(() => {
  'use strict';
  const id = 'G-91MKXS9X59';
  const key = 'remiresume.analytics-consent.v1';
  const pages = new Set(['/remiresume/', '/remiresume/index.html', '/remiresume/portfolio.html', '/remiresume/portfolio-showcase.html', '/remiresume/portfolio-archive.html']);
  if (location.hostname !== 'remiclassic.github.io' || !pages.has(location.pathname)) return;
  let choice = null;
  try { choice = localStorage.getItem(key); } catch (_) {}
  let started = false;
  const panel = document.createElement('aside');
  panel.id = 'analytics-preferences';
  panel.setAttribute('aria-label', 'Analytics privacy preferences');
  panel.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;max-width:480px;z-index:10000;padding:16px;background:#fff;color:#18212f;border:1px solid #cbd5e1;border-radius:12px;box-shadow:0 4px 24px #0002;font:14px/1.5 system-ui,sans-serif';
  const printStyle = document.createElement('style');
  printStyle.textContent = '@media print { aside[aria-label="Analytics privacy preferences"] { display:none !important; } }';
  document.head.append(printStyle);
  const settings = document.createElement('button');
  settings.type = 'button';
  settings.textContent = 'Cookie settings';
  settings.setAttribute('aria-controls', panel.id);
  settings.setAttribute('aria-expanded', 'false');
  settings.style.cssText = 'cursor:pointer;background:none;border:0;color:inherit;font:inherit;text-decoration:underline;padding:8px';
  settings.addEventListener('click', () => {
    render(true);
    panel.querySelector('button').focus();
  });
  const settingsHost = document.querySelector('.footer-bottom, .hub-footer, .portfolio-footer, .portfolio-nav nav') || document.body;
  settingsHost.append(settings);
  function start() {
    window['ga-disable-' + id] = false;
    if (started) return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {analytics_storage:'granted', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
    window.gtag('js', new Date());
    window.gtag('config', id, {send_page_view:false, allow_google_signals:false, allow_ad_personalization_signals:false, cookie_domain:location.hostname, cookie_path:'/remiresume/', cookie_flags:'SameSite=Lax;Secure', page_location:location.origin + location.pathname, page_referrer:'', page_title:location.pathname.includes('portfolio') ? 'Remi Couture — Portfolio' : 'Remi Couture — Resume'});
    window.gtag('event', 'page_view', {send_to:id, page_location:location.origin + location.pathname, page_referrer:'', page_title:location.pathname.includes('portfolio') ? 'Remi Couture — Portfolio' : 'Remi Couture — Resume'});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.append(script);
  }
  function save(value) {
    choice = value;
    try { localStorage.setItem(key, value); } catch (_) {}
    if (value === 'accepted') start();
    else {
      window['ga-disable-' + id] = true;
      document.cookie.split(';').forEach(entry => {
        const name = entry.split('=')[0].trim();
        if (name === '_ga' || name === '_ga_91MKXS9X59') {
          document.cookie = name + '=; Max-Age=0; Path=/remiresume/; Secure; SameSite=Lax';
          document.cookie = name + '=; Max-Age=0; Path=/remiresume/; Domain=' + location.hostname + '; Secure; SameSite=Lax';
        }
      });
    }
    render(false);
    settings.focus({preventScroll:true});
  }
  function button(label, action) {
    const item = document.createElement('button');
    item.type = 'button';
    item.textContent = label;
    item.style.cssText = 'cursor:pointer;padding:8px 12px;margin:6px 8px 0 0;border:1px solid #64748b;border-radius:6px;background:#f8fafc;color:#18212f;font:inherit';
    item.addEventListener('click', action);
    panel.append(item);
  }
  function render(expanded) {
    panel.replaceChildren();
    const saved = choice === 'accepted' || choice === 'rejected';
    panel.hidden = !expanded && saved;
    settings.setAttribute('aria-expanded', String(!panel.hidden));
    if (panel.hidden) return;
    const text = document.createElement('p');
    text.textContent = 'Optional analytics: allow Google Analytics to measure visits to this résumé and portfolio? No contact details or URL query strings are sent. Your choice is saved in this browser and can be changed using Cookie settings anytime.';
    text.style.margin = '0 0 6px';
    panel.append(text);
    button('Reject', () => save('rejected'));
    button('Accept analytics', () => save('accepted'));
    if (saved) button('Close', () => { render(false); settings.focus({preventScroll:true}); });
  }
  document.body.append(panel);
  render(false);
  if (choice === 'accepted') start();
  window.addEventListener('storage', event => {
    if (event.key === key) { choice = event.newValue; if (choice === 'accepted') start(); else window['ga-disable-' + id] = true; render(false); }
  });
})();
