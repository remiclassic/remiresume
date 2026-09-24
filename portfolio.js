(() => {
  'use strict';
  const projects = window.portfolioProjects;
  const $ = id => document.getElementById(id);
  const asset = src => src.startsWith('videos/') ? src : `portfolio-imgs/${src}`;
  let projectIndex = 0;
  let frameIndex = 0;
  let filter = 'all';
  let viewMode = 'screens';
  let showRendered = true;
  const displayedAsset = frame => showRendered && frame.renderSrc ? frame.renderSrc : frame.src;
  const originalEra = project => project.originalPeriod ? `${project.originalPeriod} · ${project.dateKind || 'Studio period'}` : 'Original year unconfirmed';
  const currentEra = (project, frame) => viewMode === 'prototype' ? '2026 · Interactive concept' : viewMode === 'flow' ? (project.frames.every(item=>item.generated) ? '2026 · Concept UX walkthrough' : '2026 · Retrospective UX walkthrough') : frame.generated ? (project.conceptLabel || (project.id === 'squad' ? '2026 · Companion concept' : '2026 · AI-assisted companion concept')) : frame.renderSrc && showRendered ? '2026 · AI-assisted color refinement' : originalEra(project);
  const projectDialog = $('projectDialog');
  const imageDialog = $('imageDialog');
  const setText = (id, value) => { $(id).textContent = value; };

  function makeButton(label, callback, className) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    if (className) button.className = className;
    button.addEventListener('click', callback);
    return button;
  }

  projects.forEach((project, index) => {
    const button = makeButton('', () => show(index, 0), 'project-tab');
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    const name = document.createElement('strong');
    name.textContent = project.name;
    button.append(number, name);
    $('projectTabs').append(button);
  });

  function show(nextProject, nextFrame, updateHash = true) {
    $('artwork').disposeVanguard?.();
    const previousVideo = $('artwork').querySelector('video');
    if (previousVideo) previousVideo.pause();
    if (projectIndex !== nextProject) viewMode = 'screens';
    projectIndex = nextProject;
    frameIndex = nextFrame;
    const project = projects[projectIndex];
    const frame = project.frames[frameIndex];
    setText('projectContext', project.context);
    setText('projectNumber', `${String(projectIndex + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`);
    setText('projectTitle', project.title);
    setText('projectEra', `${originalEra(project)}${viewMode !== 'screens' || frame.generated || (frame.renderSrc && showRendered) ? ` / ${currentEra(project,frame)}` : ''}`);
    if (project.frames.every(item=>item.generated)) setText('projectEra', viewMode === 'flow' ? '2026 · Independent concept & UX study' : (project.conceptLabel || '2026 · Independent AI-assisted concept'));
    $('projectEra').title = project.dateBasis;
    setText('projectSummary', project.summary);
    setText('frameTitle', frame.title);
    setText('frameNote', frame.note);
    setText('frameFocus', frame.focus);
    if (frame.renderSrc && showRendered && viewMode === 'screens') {
      setText('frameFocus', 'AI-assisted visual refinement · based on the original layout study. Use “View original” to compare.');
    }
    setText('stageName', `${frame.label} / ${currentEra(project,frame)}`);
    setText('screenCount', `${frameIndex + 1} / ${project.frames.length}`);
    $('projectTags').replaceChildren(...project.tags.map(tag => {
      const span = document.createElement('span'); span.textContent = tag; return span;
    }));
    const study = window.portfolioUX[project.id];
    $('prototypeMode').hidden = !study.prototype;
    if (viewMode === 'prototype' && !study.prototype) viewMode = 'flow';
    ['screens','flow','prototype'].forEach(mode => $(mode+'Mode').setAttribute('aria-pressed', String(mode === viewMode)));
    $('artwork').classList.toggle('artwork--study', viewMode !== 'screens');
    $('variantButton').hidden = viewMode !== 'screens' || !frame.renderSrc;
    $('variantButton').textContent = showRendered ? 'View original' : 'View color render';
    $('screensMode').textContent = study && project.frames.some(item=>item.renderSrc) ? 'Screens & renders' : project.frames.some(item=>item.generated) ? 'Screens & concepts' : 'Original screens';
    $('presentation').classList.toggle('presentation--study', viewMode !== 'screens');
    if (viewMode === 'screens') {
    const media = document.createElement(frame.type === 'video' ? 'video' : 'img');
    media.src = asset(displayedAsset(frame));
    if (frame.type === 'video') {
      media.controls = true;
      media.playsInline = true;
      media.preload = 'metadata';
      media.poster = asset(frame.poster);
      media.setAttribute('aria-label', `${project.name}: ${frame.label}`);
    } else {
      media.alt = `${project.name} — ${frame.label}${frame.generated ? (project.conceptLabel || project.id === 'squad' ? ' — 2026 companion concept' : ' — 2026 AI-assisted companion concept') : frame.renderSrc && showRendered ? ' — AI-assisted color concept' : ' — original'}`;
      media.decoding = 'async';
      media.addEventListener('click', inspect);
    }
    $('artwork').replaceChildren(media);
    $('inspectButton').hidden = frame.type === 'video';
    $('artwork').classList.toggle('artwork--ux', project.category === 'UX process');
    $('screenTabs').replaceChildren(...project.frames.map((item, index) => {
      const button = makeButton(`${String(index + 1).padStart(2, '0')}  ${item.label}`, () => show(projectIndex, index));
      button.setAttribute('aria-pressed', String(index === frameIndex));
      return button;
    }));
    } else {
      $('inspectButton').hidden = true;
      $('artwork').classList.remove('artwork--ux');
      window.renderUXStudy({host:$('artwork'),project,mode:viewMode,
        source: index => {viewMode='screens';showRendered=false;show(projectIndex,index);$('screensMode').focus({preventScroll:true});},
        prototype: () => setMode('prototype'),
        updateNotes: (title,note,focus) => {setText('frameTitle',title);setText('frameNote',note);setText('frameFocus',focus);}
      });
      const sourceButton = makeButton('Back to screens',()=>setMode('screens'));
      $('screenTabs').replaceChildren(sourceButton);
      if(project.id==='vanguard' && viewMode==='prototype') {
        const open=document.createElement('a');open.href='vanguard.html';open.target='_blank';open.rel='noopener';open.textContent='Open full-size ↗';open.style.cssText='font-size:11px;padding:9px 10px;white-space:nowrap';
        $('screenTabs').append(makeButton('Reset demo',()=>window.vanguardControls.reset()),makeButton('Try join recovery',()=>window.vanguardControls.failNext()),open);
      }
      if(study.prototype && viewMode==='flow') $('screenTabs').append(makeButton('Play the concept ↗',()=>setMode('prototype')));
      setText('screenCount',viewMode==='flow' ? '4 flow steps' : 'Interactive concept');
      setText('stageName',`${project.name} / ${currentEra(project,frame)}`);
    }
    [...$('projectTabs').children].forEach((button, index) => {
      button.setAttribute('aria-current', index === projectIndex ? 'true' : 'false');
    });
    for (const [container, selected] of [[$('projectTabs'), projectIndex], [$('screenTabs'), viewMode === 'screens' ? frameIndex : 0]]) {
      const button = container.children[selected];
      const offset = button.getBoundingClientRect().left - container.getBoundingClientRect().left;
      if (offset < 0 || offset + button.offsetWidth > container.clientWidth) {
        container.scrollLeft += offset - container.clientWidth / 2 + button.offsetWidth / 2;
      }
    }
    $('projectStory').scrollTop = 0;
    $('artwork').scrollTop = 0;
    if (updateHash) history.replaceState(null, '', `#${project.id}/${viewMode === 'screens' ? frameIndex + 1 : viewMode}`);
    setText('announcement', viewMode === 'screens' ? `${project.name}. ${frame.label}. Screen ${frameIndex + 1} of ${project.frames.length}.` : `${project.name}. ${viewMode === 'flow' ? 'UX walkthrough' : 'Interactive concept'}.`);
    const next = project.frames[frameIndex + 1];
    if (next && next.type !== 'video') { const preload = new Image(); preload.src = asset(next.src); }
  }

  function setMode(mode) { viewMode=mode; show(projectIndex,frameIndex); }
  $('screensMode').addEventListener('click',()=>setMode('screens'));
  $('variantButton').addEventListener('click',()=>{showRendered=!showRendered;show(projectIndex,frameIndex);});
  $('flowMode').addEventListener('click',()=>setMode('flow'));
  $('prototypeMode').addEventListener('click',()=>setMode('prototype'));

  function move(direction) {
    if(viewMode !== 'screens') { show((projectIndex+direction+projects.length)%projects.length,0);return; }
    let p = projectIndex, f = frameIndex + direction;
    if (f >= projects[p].frames.length) { p = (p + 1) % projects.length; f = 0; }
    if (f < 0) { p = (p - 1 + projects.length) % projects.length; f = projects[p].frames.length - 1; }
    show(p, f);
  }

  function browse() {
    $('browseGrid').replaceChildren(...projects.flatMap((project, index) => {
      if (filter !== 'all' && project.category !== filter && filter !== 'UX process') return [];
      const button = makeButton('', () => {
        projectDialog.close(); show(index, 0); $('projectTitle').focus({preventScroll:true});
      }, 'browse-card');
      const img = document.createElement('img');
      img.src = asset(project.frames[0].poster || project.frames[0].renderSrc || project.frames[0].src);
      img.alt = ''; img.loading = 'lazy';
      const meta = document.createElement('small'); meta.textContent = `${project.category} · UX walkthrough${window.portfolioUX[project.id].prototype ? ' + prototype' : ''}`;
      meta.textContent += ` · ${originalEra(project)}`;
      const title = document.createElement('strong'); title.textContent = project.name;
      const description = document.createElement('span'); description.textContent = project.title;
      button.append(img, meta, title, description);
      return [button];
    }));
  }

  function inspect() {
    const frame = projects[projectIndex].frames[frameIndex];
    if (viewMode !== 'screens' || frame.type === 'video') return;
    setText('imageTitle', `${projects[projectIndex].name} / ${frame.label} / ${currentEra(projects[projectIndex],frame)}`);
    $('fullImage').src = asset(displayedAsset(frame));
    $('fullImage').alt = `${projects[projectIndex].name} — ${frame.label}`;
    $('imageScroll').classList.remove('original-size');
    $('zoomButton').setAttribute('aria-pressed', 'false');
    $('zoomButton').textContent = 'Original size';
    imageDialog.showModal();
    $('imageScroll').scrollTo(0, 0);
  }

  function fromHash() {
    if (location.hash === '#projectTitle') return;
    const [slug, step] = location.hash.slice(1).split('/');
    const p = projects.findIndex(project => project.id === slug);
    const f = Number(step) - 1;
    projectIndex = p < 0 ? 0 : p;
    viewMode = step === 'flow' || step === 'prototype' ? step : 'screens';
    show(p < 0 ? 0 : p, p >= 0 && Number.isInteger(f) && f >= 0 && f < projects[p].frames.length ? f : 0, false);
  }
  $('previousButton').addEventListener('click', () => move(-1));
  const fullscreenButton = $('fullscreenButton');
  if (!document.fullscreenEnabled) fullscreenButton.hidden = true;
  fullscreenButton.addEventListener('click', () => {
    const request = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    request.catch(() => { fullscreenButton.hidden = true; });
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreenButton.setAttribute('aria-label', document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen');
  });
  $('nextButton').addEventListener('click', () => move(1));
  $('browseButton').addEventListener('click', () => {
    $('artwork').querySelector('video')?.pause(); browse(); projectDialog.showModal();
  });
  $('closeBrowse').addEventListener('click', () => projectDialog.close());
  $('inspectButton').addEventListener('click', inspect);
  $('closeImage').addEventListener('click', () => imageDialog.close());
  $('zoomButton').addEventListener('click', () => {
    const original = $('imageScroll').classList.toggle('original-size');
    $('zoomButton').setAttribute('aria-pressed', String(original));
    $('zoomButton').textContent = original ? 'Fit to window' : 'Original size';
  });
  $('detailsButton').addEventListener('click', () => {
    const hidden = document.body.classList.toggle('notes-hidden');
    $('projectStory').inert = hidden;
    $('detailsButton').setAttribute('aria-expanded', String(!hidden));
    $('detailsButton').textContent = hidden ? 'Show notes' : 'Hide notes';
  });
  $('browseFilters').addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    filter = button.dataset.filter;
    $('browseFilters').querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    browse();
  });
  document.addEventListener('keydown', event => {
    if (projectDialog.open || imageDialog.open || event.target.closest('video, input, textarea, select, .ux-flow-board, .ux-prototype, .vg-viewport')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  let touchStart;
  $('artwork').addEventListener('touchstart', event => {
    if (viewMode !== 'screens' || event.target.closest('video')) return;
    touchStart = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];
  }, {passive:true});
  $('artwork').addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart[0];
    const dy = event.changedTouches[0].clientY - touchStart[1];
    touchStart = null;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
  }, {passive:true});
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
