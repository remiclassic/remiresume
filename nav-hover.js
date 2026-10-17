(() => {
  'use strict';
  const canHover = matchMedia('(hover:hover)').matches;

  document.querySelectorAll('.site-nav .nav-links, #primary-nav').forEach(track => {
    const links = [...track.querySelectorAll(':scope > a:not(.nav-contact)')];
    links.forEach(link => {
      const label = link.textContent;
      link.classList.add('nav-hover-link');
      link.innerHTML = '';
      const roll = document.createElement('span');
      roll.className = 'nav-roll';
      const a = document.createElement('span');
      const b = document.createElement('span');
      a.textContent = label;
      b.textContent = label;
      b.setAttribute('aria-hidden', 'true');
      roll.append(a, b);
      link.append(roll);
    });
    track.querySelectorAll(':scope > .nav-contact, :scope > button').forEach(el => el.classList.add('nav-sweep'));
    if (!canHover || !links.length) return;

    track.classList.add('nav-hover-track');
    const glide = document.createElement('span');
    glide.className = 'nav-glide';
    glide.setAttribute('aria-hidden', 'true');
    track.prepend(glide);

    const moveTo = link => {
      const fresh = !glide.classList.contains('is-on');
      glide.classList.toggle('no-anim', fresh);
      glide.style.width = link.offsetWidth + 'px';
      glide.style.height = link.offsetHeight + 'px';
      glide.style.transform = `translate(${link.offsetLeft}px, ${link.offsetTop}px)`;
      if (fresh) glide.offsetWidth;
      glide.classList.remove('no-anim');
      glide.classList.add('is-on');
    };
    links.forEach(link => {
      link.addEventListener('pointerenter', () => moveTo(link));
      link.addEventListener('focus', () => moveTo(link));
    });
    track.querySelectorAll(':scope > .nav-sweep').forEach(el => el.addEventListener('pointerenter', () => glide.classList.remove('is-on')));
    track.addEventListener('pointerleave', () => glide.classList.remove('is-on'));
    track.addEventListener('focusout', e => { if (!track.contains(e.relatedTarget)) glide.classList.remove('is-on'); });
  });

  document.querySelectorAll('.site-nav > .nav-contact').forEach(el => el.classList.add('nav-sweep'));
})();
