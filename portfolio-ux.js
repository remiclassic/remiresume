(() => {
  'use strict';
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  };
  const button = (text, action, cls) => {
    const node = el('button', cls, text); node.type = 'button'; node.addEventListener('click', action); return node;
  };
  const imagePath = src => `portfolio-imgs/${src}`;

  window.renderUXStudy = ({host, project, mode, source, prototype, updateNotes}) => {
    if (project.id === 'vanguard' && mode === 'prototype') {
      window.renderVanguard({host,source,updateNotes});
      return;
    }
    const study = window.portfolioUX[project.id];
    host.replaceChildren();
    if (mode === 'prototype') {
      const demo = study.prototype;
      let state = demo.start;
      let history = [];
      const shell = el('div', `ux-prototype ux-prototype--${project.id}`);
      shell.style.backgroundImage = `linear-gradient(90deg,rgba(9,17,19,.95),rgba(9,17,19,.78) 45%,rgba(9,17,19,.1)),url('${imagePath(demo.art)}')`;
      const provenance = el('div','prototype-provenance','2026 CONCEPT EXTENSION · AI-GENERATED ENVIRONMENT');
      const top = el('div','prototype-top');
      top.append(el('span','',demo.name),button('Reset demo',()=>{state=demo.start;history=[];paint(true);},'prototype-reset'));
      const scenarios = el('div','prototype-scenarios');
      scenarios.setAttribute('aria-label','Choose a prototype scenario');
      demo.scenarios.forEach(([target,label])=>scenarios.append(button(label,()=>{state=target;history=[];paint(true);}))); 
      const body = el('div','prototype-body');
      const log = el('details','prototype-log');
      log.append(el('summary','','Interaction history'),el('ol'));
      const bottom = el('p','prototype-disclosure','Illustrative rules and sample values. This is a new portfolio prototype; no account data or credits are changed.');
      shell.append(provenance,top,scenarios,body,log,bottom); host.append(shell);

      function paint(focus=false) {
        const item = demo.states[state];
        body.replaceChildren();
        const heading = el('h3','',item.title); heading.tabIndex=-1;
        const facts = el('dl','prototype-facts');
        item.facts.forEach(([label,value])=>{const row=el('div');row.append(el('dt','',label),el('dd','',value));facts.append(row);});
        const status = el('p','prototype-status',item.status);status.setAttribute('role','status');
        const actions=el('div','prototype-actions');
        item.actions.forEach(([label,target],index)=>actions.append(button(label,()=>{
          history.push(label); state=target;paint(true);
        },index===0?'prototype-primary':'prototype-secondary')));
        body.append(el('p','prototype-step',item.eyebrow),heading,el('p','prototype-copy',item.body),facts,status,actions);
        const list=log.querySelector('ol');list.replaceChildren(...history.map(label=>el('li','',label)));
        if(!history.length)list.append(el('li','','No actions yet. Choose a scenario or start the walkthrough.'));
        updateNotes('Try the decision, not just the screen.',study.question,'New interactive concept · illustrative rules and AI-generated supporting artwork.');
        if(focus)heading.focus({preventScroll:true});
      }
      paint();
      return;
    }

    let selected=0;
    const board=el('div','ux-flow-board');
    const intro=el('header','ux-flow-intro');
    intro.append(el('span','ux-kicker',project.frames.every(frame=>frame.generated) ? '2026 UX WALKTHROUGH / CONCEPT STUDY' : '2026 UX WALKTHROUGH / RETROSPECTIVE STUDY'),el('h3','',study.title),el('p','ux-goal',study.goal));
    const provenance=el('details','ux-basis');
    provenance.append(el('summary','','About this study'),el('p','',study.basis));
    intro.append(provenance);
    const route=el('div','ux-route');route.setAttribute('aria-label','Explore flow steps');
    const detail=el('section','ux-step-detail');detail.setAttribute('aria-label','Selected flow step');
    const stepButtons=study.nodes.map((node,index)=>{
      const btn=button('',()=>{selected=index;paintStep();if(matchMedia('(max-width:720px)').matches)detail.scrollIntoView({block:'start',behavior:'instant'});},'ux-node');
      btn.append(el('span','ux-node-number',String(index+1).padStart(2,'0')),el('strong','',node.title),el('small','',node.proposed?'Proposed extension':'Original screen reference'));
      btn.setAttribute('aria-label',`Step ${index+1}: ${node.title}`);
      route.append(btn);return btn;
    });
    const branches=el('section','ux-branches');branches.append(el('h4','','Happy path & recovery'));
    study.paths.forEach(path=>{const row=el('div','ux-path');row.append(el('strong','',path.label),el('p','',path.steps));branches.append(row);});
    const research=el('details','ux-research');research.append(el('summary','','What I would validate next'),el('p','',study.question),el('p','',study.measure));
    board.append(intro,route,detail,branches,research);host.append(board);

    function paintStep() {
      const node=study.nodes[selected];const frame=project.frames[node.frame];
      stepButtons.forEach((btn,index)=>btn.setAttribute('aria-pressed',String(index===selected)));
      detail.replaceChildren();
      const reference=el('div','ux-reference');
      const image=el('img');image.src=imagePath(frame.poster||frame.src);image.alt=`${frame.generated ? "2026 companion concept" : "Original screen reference"}: ${frame.label}`;
      reference.append(image,el('p','ux-source-date',frame.generated ? (project.conceptLabel || (project.id === 'squad' ? '2026 · Companion concept' : '2026 · AI-assisted companion concept')) : project.originalPeriod ? `${project.originalPeriod} · ${project.dateKind || 'Studio period'}` : 'Original design year unconfirmed'),button(`Open ${frame.generated ? "concept" : "original"}: ${frame.label} ↗`,()=>source(node.frame),'ux-source-button'));
      const copy=el('div','ux-step-copy');
      copy.append(el('span','ux-kicker',node.proposed?'PROPOSED EXTENSION':'READING THE ORIGINAL SCREEN'),el('h4','',node.task));
      [[project.category === 'Product UI' ? 'User decision' : 'Player decision',node.decision],['Feedback',node.feedback],['Watch for',node.risk]].forEach(([label,value])=>{
        const block=el('div','ux-observation');block.append(el('strong','',label),el('p','',value));copy.append(block);
      });
      copy.append(el('p','ux-next',`Then → ${node.next}`));
      if(study.prototype)copy.append(button('Try the interactive concept ↗',prototype,'ux-demo-link'));
      detail.append(reference,copy);
      updateNotes(node.title,`${node.decision} ${node.feedback}`,'2026 UX walkthrough · original references and proposed extensions are identified.');
    }
    paintStep();
  };
})();
