(() => {
  'use strict';
  const slides=window.uxWalkthrough;
  const routes={full:slides.map(s=>s.id),short:['intro','approach','stardust-flow','mw5-context','vanguard-loadout','vanguard-deploy','greybox','conversation'],education:['greybox','review']};
  const select=document.querySelector('#route'), host=document.querySelector('#slide'), viewer=document.querySelector('#image-viewer');
  let route=new URLSearchParams(location.search).get('route')||'full',current=0,visible;
  if(!routes[route])route='full';select.value=route;
  const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
  const setRoute=()=>{visible=routes[route].map(id=>slides.find(s=>s.id===id));};
  function panel(id,button,show){const p=document.getElementById(id);p.hidden=show===undefined?!p.hidden:!show;document.getElementById(button).setAttribute('aria-expanded',String(!p.hidden));}
  function openImage(src,alt){document.querySelector('#expanded-image').src=src;document.querySelector('#expanded-image').alt=alt;document.querySelector('#expanded-caption').textContent=alt;viewer.showModal();}
  function content(s,print=false){
    const w=el('div',null,`deck-slide slide-${s.type}`);w.append(el('p',s.section,'kicker'));
    const h=el('h1',s.title);if(!print)h.id='slide-title';w.append(h);
    if(s.subtitle)w.append(el('p',s.subtitle,'subtitle'));if(s.body)w.append(el('p',s.body,'lead'));
    const row=el('div',null,s.type==='image'?'slide-content':'text-content');
    if(s.type==='image'){
      const f=el('figure',null,'evidence'),b=el('button',null,'image-button'),img=el('img');b.type='button';b.setAttribute('aria-label',`Expand image: ${s.alt}`);img.src=s.image;img.alt=s.alt;
      b.append(img);b.addEventListener('click',()=>openImage(s.image,s.alt));f.append(b,el('figcaption','Select the image to inspect the original at a larger size.'));row.append(f);
    }
    if(s.type==='comparison'){
      const f=el('figure',null,'comparison'),stage=el('div',null,'compare-stage'),grey=el('img'),art=el('img',null,'compare-art');grey.src=s.image;grey.alt=s.alt;art.src=s.compareImage;art.alt=s.compareAlt;stage.append(grey,art,el('span',null,'compare-rule'));
      const controls=el('div',null,'compare-controls'),label=el('label','Art direction reveal'),range=el('input');range.type='range';range.min='0';range.max='100';range.value='50';range.id=print?'print-comparison-range':'comparison-range';label.htmlFor=range.id;
      const update=value=>{range.value=value;stage.style.setProperty('--reveal',`${value}%`);range.setAttribute('aria-valuetext',`${value} percent art direction, ${100-value} percent greybox`);};update(50);
      range.addEventListener('input',()=>update(Number(range.value)));
      const gb=el('button','Greybox'),ab=el('button','Art direction');gb.type=ab.type='button';gb.addEventListener('click',()=>update(0));ab.addEventListener('click',()=>update(100));controls.append(label,range,gb,ab);
      f.append(stage,controls,el('figcaption','Supplied visual comparison. The broad layout carries across, while visible details and emphasis change. Interaction equivalence has not been established.','compare-caption'));w.append(f);
    }
    const copy=el('div');if(s.points){const list=el('ul',null,'slide-points');s.points.forEach(p=>list.append(el('li',p)));copy.append(list);}
    if(s.link){const a=el('a',`${s.link[0]} ↗`,'slide-link');a.href=s.link[1];a.target='_blank';a.rel='noopener';copy.append(a);}row.append(copy);if(s.type!=='comparison')w.append(row);
    if(s.slots){const blanks=el('div',null,'gap-slots');s.slots.forEach(label=>{const slot=el('section',null,'gap-slot'),blank=el('div',null,'blank-space');blank.setAttribute('role','img');blank.setAttribute('aria-label',`${label}: intentionally blank`);slot.append(el('h2',label),blank);blanks.append(slot);});w.append(blanks);const hint=el('button','Intentionally blank · show suggestions in Notes','gap-hint');hint.addEventListener('click',()=>panel('presenter-notes','notes-toggle',true));w.append(hint);}
    return w;
  }
  function render(sync=true){
    const s=visible[current],w=content(s);host.className=w.className;host.replaceChildren(...w.childNodes);
    document.querySelector('#section').textContent=s.section;document.querySelector('#progress').textContent=`${current+1} / ${visible.length}`;
    document.querySelector('#previous').disabled=current===0;document.querySelector('#next').disabled=current===visible.length-1;
    document.querySelector('#notes-text').textContent=s.notes;document.querySelector('#source').textContent=`Source: ${s.source}`;
    const suggestions=document.querySelector('#suggestions');suggestions.replaceChildren();if(s.suggestions){suggestions.append(el('strong','Suggestions for the missing evidence'));const list=el('ul');s.suggestions.forEach(t=>list.append(el('li',t)));suggestions.append(list);}
    const outline=document.querySelector('#outline-links');outline.replaceChildren();visible.forEach((entry,i)=>{const a=el('a',`${String(i+1).padStart(2,'0')}  ${entry.title}`);a.href=`#${entry.id}`;if(i===current)a.setAttribute('aria-current','step');a.addEventListener('click',()=>panel('outline','outline-toggle',false));outline.append(a);});
    document.title=`${s.title} · Remi Couture UX walkthrough`;if(sync){const url=new URL(location.href);url.searchParams.set('route',route);url.hash=s.id;history.replaceState(null,'',url);}
  }
  const move=amount=>{current=Math.max(0,Math.min(visible.length-1,current+amount));render();};
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{document.querySelector('#fullscreen').textContent='Full screen unavailable';}}
  select.addEventListener('change',()=>{const id=visible[current].id;route=select.value;setRoute();current=Math.max(0,visible.findIndex(s=>s.id===id));render();});
  document.querySelector('#previous').addEventListener('click',()=>move(-1));document.querySelector('#next').addEventListener('click',()=>move(1));
  document.querySelector('#outline-toggle').addEventListener('click',()=>panel('outline','outline-toggle'));document.querySelector('#notes-toggle').addEventListener('click',()=>panel('presenter-notes','notes-toggle'));
  document.querySelector('#fullscreen').addEventListener('click',fullscreen);document.querySelector('#close-image').addEventListener('click',()=>viewer.close());document.querySelector('#print').addEventListener('click',()=>window.print());
  window.addEventListener('keydown',e=>{if(viewer.open||e.ctrlKey||e.altKey||e.metaKey||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||(e.key===' '&&/BUTTON|A/.test(e.target.tagName)))return;
    if(['ArrowRight','PageDown','ArrowLeft','PageUp','Home','End',' '].includes(e.key)){e.preventDefault();if(e.key==='Home'){current=0;render();}else if(e.key==='End'){current=visible.length-1;render();}else move(['ArrowLeft','PageUp'].includes(e.key)?-1:1);}
    if(e.key.toLowerCase()==='n')panel('presenter-notes','notes-toggle');if(e.key.toLowerCase()==='f')fullscreen();});
  window.addEventListener('hashchange',()=>{const i=visible.findIndex(s=>`#${s.id}`===location.hash);if(i>=0){current=i;render(false);}});
  window.addEventListener('beforeprint',()=>{document.querySelector('#print-slides')?.remove();const all=el('div');all.id='print-slides';visible.forEach(s=>all.append(content(s,true)));document.body.append(all);document.body.classList.add('printing');});
  window.addEventListener('afterprint',()=>{document.querySelector('#print-slides')?.remove();document.body.classList.remove('printing');});
  setRoute();current=Math.max(0,visible.findIndex(s=>`#${s.id}`===location.hash));render();
})();
