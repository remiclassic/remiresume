import React, {useEffect,useLayoutEffect,useReducer,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {SIZE,fitCanvas,sceneFor,items,classes,initialState,reducer} from './vanguard-state.js';
const path='portfolio-imgs/vanguard/assets/';
const image=(name)=>path+name+'.png';
let session=initialState;
function Art({name,className='',alt=''}){return <img data-asset={name} className={'vg-art '+className} src={image(name)} alt={alt} draggable="false"/>;}
function Icon({type='diamond'}){
 const paths={reach:'M20 2v35m-8-25 8-10 8 10M12 28l8 9 8-9',mobility:'m8 30 8-12 8 5 10-11M17 11l5-7 6 7M7 20l8-4',protection:'M8 5 20 1 32 5v16L20 37 8 21Z',sword:'m8 32 22-26 5-3-1 7-23 25M5 25l12 10',eye:'M2 20s7-12 18-12 18 12 18 12-7 12-18 12S2 20 2 20Zm18-6a6 6 0 1 0 0 12 6 6 0 1 0 0-12',check:'m5 20 10 10L35 8',lock:'M11 18V10a9 9 0 0 1 18 0v8M7 18h26v20H7Z',diamond:'m20 2 18 18-18 18L2 20Z'};
 return <svg viewBox="0 0 40 40" aria-hidden="true"><path d={paths[type]||paths.diamond} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Frame({children,className='',...props}){return <section className={'vg-frame '+className} {...props}><i aria-hidden="true" className="vg-corner tl"/><i aria-hidden="true" className="vg-corner tr"/><i aria-hidden="true" className="vg-corner bl"/><i aria-hidden="true" className="vg-corner br"/>{children}</section>;}
function Button({children,primary=false,className='',...props}){return <button className={'vg-button '+(primary?'vg-primary ':'')+className} {...props}>{className.includes('vg-main-action')&&<svg className="vg-action-frame" viewBox="0 0 450 82" preserveAspectRatio="none" aria-hidden="true"><path d="M37 2H413L448 41 413 80H37L2 41Z" fill="#581713" stroke="#e2b76c" strokeWidth="2"/><path d="M40 7H410L440 41 410 75H40L10 41Z" fill="none" stroke="#a67535" strokeWidth="2"/><path d="M45 12H405L432 41 405 70H45L18 41Z" fill="none" stroke="#ffe0a0"/><path d="m17 41 7-7 7 7-7 7Zm402 0 7-7 7 7-7 7ZM225 0l7 7-7 7-7-7Zm0 68 7 7-7 7-7-7Z" fill="#6b321a" stroke="#e4bc78"/></svg>}<span>{children}</span></button>;}
function Badge({children,preview=false}){return <span className={'vg-badge '+(preview?'is-preview':'')}>{children}</span>;}
function App({host,onExit,updateNotes}){
 const [state,dispatch]=useReducer(reducer,session);
 const viewport=useRef(null), canvas=useRef(null), modal=useRef(null), beforeModal=useRef(null);
 const [scale,setScale]=useState(1);
 const previousScreen=useRef(state.screen);
 const previousPreview=useRef(state.preview);
 const hadModal=useRef(false);
 const chosenClass=classes[state.classId], equipped=state.equipped[state.classId];
 const selected=state.preview||equipped, weapon=items[selected], locked=weapon.rank>state.rank;
 const modalName=state.modal||(state.join!=='idle'?state.join:null);
 const send=(type,extra={})=>dispatch({type,...extra});
 useLayoutEffect(()=>{
  const measure=()=>{const r=host.getBoundingClientRect();setScale(fitCanvas(r.width,r.height));};
  const observer=new ResizeObserver(measure);observer.observe(host);measure();return()=>observer.disconnect();
 },[host]);
 useEffect(()=>{session=state;},[state]);
 useEffect(()=>{const reset=()=>send('RESET');const fail=()=>{send('REVIEW');send('FAIL_NEXT');send('DEPLOY');};window.addEventListener('vanguard-reset',reset);window.addEventListener('vanguard-fail-next',fail);return()=>{window.removeEventListener('vanguard-reset',reset);window.removeEventListener('vanguard-fail-next',fail);};},[]);
 useEffect(()=>{if(previousScreen.current!==state.screen){const heading=canvas.current.querySelector('h1,h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}previousScreen.current=state.screen;}},[state.screen]);
 useEffect(()=>{if(previousPreview.current&&!state.preview&&state.screen==='loadout')canvas.current.querySelector('[data-choice="'+equipped+'"]')?.focus({preventScroll:true});previousPreview.current=state.preview;},[state.preview,state.screen,equipped]);
 useEffect(()=>{
  if(state.join!=='joining')return;
  const timer=setTimeout(()=>send('JOIN_RESULT'),1400);return()=>clearTimeout(timer);
 },[state.join]);
 useEffect(()=>{
  const notes={
   class:['Choose your role.','Select a class, inspect its traits, and review the named equipment.','Live React interface · original canvas proportions preserved.'],
   loadout:['Compare before you equip.','Select a weapon to preview it. Cancel keeps the current loadout; equipping updates the deployment review.','Equipped, preview, and locked states are driven by shared application state.'],
   deploy:['Review, then deploy.','Verify your team and loadout, edit a selection, or enter the simulated match.','Interactive portfolio demo · no live game server is connected.']
  };updateNotes?.(...notes[state.screen]);
 },[state.screen,updateNotes]);
 useEffect(()=>{
  if(modalName){
   if(!hadModal.current)beforeModal.current=document.activeElement;
   const first=modal.current?.querySelector('button')||modal.current?.querySelector('h2');if(first){first.tabIndex=first.tagName==='BUTTON'?0:-1;first.focus({preventScroll:true});}
  }else if(hadModal.current&&beforeModal.current?.isConnected)beforeModal.current.focus({preventScroll:true});
  hadModal.current=!!modalName;
 },[modalName]);
 const close=()=>state.join!=='idle'?send('RETURN_REVIEW'):send('CLOSE');
 function keydown(e){
  if(e.key==='Escape'){e.stopPropagation();e.preventDefault();if(modalName&&state.join!=='joining')close();else if(!modalName&&state.screen!=='class')send('BACK');}
  if(modalName&&e.key==='Tab'){
   const buttons=[...modal.current.querySelectorAll('button:not(:disabled),a[href]')];
   const first=buttons[0],last=buttons.at(-1);
   if(!buttons.length){e.preventDefault();return;}
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
 }
 const arrows=(e,list,current,select)=>{
  if(!['ArrowLeft','ArrowRight'].includes(e.key))return;
  e.preventDefault();e.stopPropagation();
  const next=list[(list.indexOf(current)+(e.key==='ArrowRight'?1:list.length-1))%list.length];
  select(next);e.currentTarget.parentElement.querySelector('[data-choice="'+next+'"]')?.focus();
 };
 const review=()=>send('REVIEW');
 const back=()=>state.screen==='class'?send('MODAL',{name:'exit'}):send('BACK');
 return <div className="vg-viewport" ref={viewport} onKeyDown={keydown}>
 <div className="vg-fit" style={{width:SIZE.width*scale,height:SIZE.height*scale}}>
 <div className={'vg-canvas vg-screen-'+state.screen+(state.team==='Blue Company'?' vg-team-blue':'')} ref={canvas} style={{transform:'scale('+scale+')'}} data-screen={state.screen}>
 <Art name={sceneFor(state)} className="vg-scene"/>
 <div className="vg-main" inert={modalName?true:undefined}>
 <header className="vg-header">
  <div className="vg-breadcrumb"><button onClick={()=>send('BACK')} disabled={state.screen==='class'}>PREPARE</button><span>/</span><strong>{state.screen==='class'?'CLASS':state.screen==='loadout'?'LOADOUT':'DEPLOY'}</strong>{state.screen==='deploy'&&<small>Step 3 of 3</small>}</div>
  {state.screen==='class'&&<nav className="vg-class-tabs" aria-label="Select class">{Object.entries(classes).map(([id,c])=><button data-choice={id} key={id} aria-pressed={id===state.classId} onClick={()=>send('CLASS',{id})} onKeyDown={e=>arrows(e,Object.keys(classes),state.classId,id=>send('CLASS',{id}))}>{c.name}</button>)}</nav>}
  {state.screen==='loadout'&&<button className="vg-current-class" onClick={()=>send('BACK')}><Art name="banner"/>{chosenClass.name}</button>}
 </header>
 {state.screen==='class'&&<>
  <div className="vg-class-title"><button className="vg-banner-button" aria-label="Change team" onClick={()=>send('MODAL',{name:'team'})}><Art name="banner"/></button><div><h1>{chosenClass.name}</h1><h2>{chosenClass.role}</h2><p>{chosenClass.description}</p></div></div>
  <div className="vg-traits">{chosenClass.traits.map((value,i)=><div className={'vg-trait vg-trait-'+i} key={i}><span className="vg-diamond-icon"><Icon type={['reach','mobility','protection'][i]}/></span><div><span>{['Reach','Mobility','Protection'][i]}</span><div className="vg-bar"><i style={{width:{High:'73%',Medium:'51%',Low:'22%'}[value]}}/></div></div><strong>{value}</strong></div>)}<em>Relative class traits</em></div>
  <Frame className="vg-tradeoff"><Icon type="sword"/><div><h3>Role trade-off</h3><p>{chosenClass.tradeoff}</p></div></Frame>
  <Frame className="vg-current-loadout"><h3>Current loadout</h3><div className="vg-divider" aria-hidden="true"/>{[equipped,'hatchet','war-horn'].map((id,i)=><button className="vg-equipped-row" key={id} onClick={()=>i===0?send('LOADOUT'):send('MODAL',{name:id})}><span className="vg-item-tile"><Art name={items[id].art}/></span><span><strong>{items[id].name}</strong><Badge>Equipped</Badge></span></button>)}</Frame>
 </>}
 {state.screen==='loadout'&&<>
  <section className="vg-collection"><h2>Primary weapon</h2><div className="vg-gold-rule"/><div className="vg-weapon-grid">{chosenClass.weapons.map(id=>{
   const item=items[id],isLocked=item.rank>state.rank;
   return <button key={id} data-choice={id} className={'vg-weapon-card '+(id===selected?'is-selected ':'')+(isLocked?'is-locked':'')} aria-pressed={id===selected} aria-label={item.name+(isLocked?', locked, requires class rank '+item.rank:id===equipped?', equipped':', preview')} onClick={()=>send('PREVIEW',{id})} onKeyDown={e=>arrows(e,chosenClass.weapons,selected,id=>send('PREVIEW',{id}))}>
   <Art name={item.art}/>{isLocked&&<span className="vg-lock"><Icon type="lock"/></span>}<strong>{item.name}</strong>{isLocked?<span className="vg-rank">Requires<br/>class rank {item.rank}</span>:<Badge preview={id!==equipped&&id===selected}>{id===equipped?'Equipped':id===selected?'Preview':'Available'}</Badge>}</button>;
  })}</div></section>
  <Art name={weapon.art} className="vg-weapon-hero"/>
  <Frame className="vg-comparison"><h1>{weapon.name}</h1><em>{locked?'Locked weapon':selected===equipped?'Currently equipped':'Preview only'}</em><div className="vg-divider" aria-hidden="true"/><h3>{items[equipped].name}{selected!==equipped&&<> → {weapon.name}</>}</h3><table aria-label="Weapon comparison"><tbody>{['Reach','Speed','Impact'].map((name,i)=><tr key={name}><th>{name}:</th><td>{items[equipped].traits[i]}</td>{selected!==equipped&&<><td aria-hidden="true">→</td><td className="vg-new-value">{weapon.traits[i]}</td></>}</tr>)}</tbody></table><p className="vg-illustrative">Illustrative weapon traits</p>
  <p className="vg-comparison-message">{locked?'Requires class rank '+weapon.rank+'. Your current rank is '+state.rank+'.':selected===equipped?state.notice||'This weapon is in your current loadout.':'Your '+items[equipped].name.toLowerCase()+' stays equipped until you apply.'}</p>
  <div className="vg-comparison-actions">{state.preview&&selected!==equipped?<><Button onClick={()=>send('CANCEL_PREVIEW')}>Cancel preview</Button><Button primary disabled={locked} onClick={()=>send('EQUIP')}>{locked?'Locked':'Equip '+weapon.name}</Button></>:<Button primary onClick={review}>Review loadout</Button>}</div></Frame>
 </>}
 {state.screen==='deploy'&&<>
  <section className="vg-review"><h1>Ready for battle</h1><h2>Review your selection</h2><div className="vg-review-list">
   <button onClick={()=>send('MODAL',{name:'team'})}><Art name="banner"/><span><small>Team</small><strong>{state.team}</strong></span><i>◇</i></button>
   <button onClick={()=>send('CLASS',{id:state.classId})}><Icon type="protection"/><span><small>Class</small><strong>{chosenClass.name}</strong></span><i>◇</i></button>
   {[equipped,'hatchet','war-horn'].map((id,i)=><button key={id} onClick={()=>i===0?send('LOADOUT'):send('MODAL',{name:id})}><Art name={items[id].art}/><span><small>{['Primary','Secondary','Support'][i]}</small><strong>{items[id].name}</strong></span><i>◇</i></button>)}
  </div><div className="vg-saved"><Icon type="check"/>{state.notice==='Loadout updated'?'Loadout updated':'Loadout ready'}</div><Button className="vg-edit" onClick={()=>send('LOADOUT')}>Edit loadout</Button></section>
  <Frame className="vg-mission"><h1>Castle siege</h1><h2>Team objective</h2><div className="vg-divider" aria-hidden="true"/><Art name="castle-map" className="vg-map"/><p>Join your team at the castle gates.</p><div className="vg-divider" aria-hidden="true"/><small>Joining begins when you deploy.</small></Frame>
 </>}
 <footer className="vg-footer"><button className="vg-back" onClick={back}><span>❮</span>{state.screen==='loadout'?'Back to class':'Back'}</button>
  {state.screen!=='loadout'&&<Button primary className="vg-main-action" onClick={()=>state.screen==='class'?send('LOADOUT'):send('DEPLOY')}>{state.screen==='class'?'Review loadout':'Deploy'}</Button>}
  {state.screen==='deploy'?<button className="vg-spectate" onClick={()=>send('MODAL',{name:'spectate'})}><Icon type="eye"/>Spectate</button>:<small className="vg-step">Step {state.screen==='class'?1:2} of 3</small>}
 </footer>
 </div>
 {modalName&&<div className="vg-modal-backdrop"><Frame className="vg-modal" role="dialog" aria-modal="true" aria-labelledby="vg-modal-title"><div ref={modal}>
 {modalName==='team'?<><h2 id="vg-modal-title">Choose your team</h2><p>Your class and equipment will be kept.</p><div className="vg-team-options">{['Red Company','Blue Company'].map(team=><Button key={team} primary={state.team===team} onClick={()=>send('TEAM',{team})}>{team}</Button>)}</div><Button onClick={close}>Cancel</Button></>:
 modalName==='exit'?<><h2 id="vg-modal-title">Leave preparation?</h2><p>Your selections stay here while you explore the portfolio.</p><div className="vg-modal-actions"><Button onClick={close}>Stay here</Button><Button primary onClick={onExit}>Back to screens</Button></div></>:
 modalName==='hatchet'||modalName==='war-horn'?<><Art name={modalName} className="vg-detail-art"/><h2 id="vg-modal-title">{items[modalName].name}</h2><Badge>Equipped</Badge><p>{modalName==='hatchet'?'A compact secondary weapon for close encounters.':'A support item to rally your team.'}</p><Button primary onClick={close}>Back to loadout</Button></>:
 modalName==='joining'?<><div className="vg-spinner"/><h2 id="vg-modal-title">Joining the battle</h2><p>{state.team} · {chosenClass.name} · {items[equipped].name}</p><small>Connecting to the demo match…</small></>:
 modalName==='failed'?<><h2 id="vg-modal-title">Could not join</h2><p>Your {items[equipped].name.toLowerCase()}, class, and team are still selected.</p><div className="vg-modal-actions"><Button onClick={close}>Return to review</Button><Button primary onClick={()=>send('DEPLOY')}>Retry join</Button></div></>:
 modalName==='joined'?<><Icon type="check"/><h2 id="vg-modal-title">Ready at the gates</h2><p>{state.team} · {chosenClass.name}<br/>{items[equipped].name} · Hatchet · War horn</p><p className="vg-demo-label">Demo complete. No live game server is connected.</p><Button primary onClick={close}>Return to preparation</Button></>:
 <><Icon type="eye"/><h2 id="vg-modal-title">Spectator mode</h2><p>Castle Siege · {state.team}</p><p className="vg-demo-label">Spectator preview. Your equipment remains unchanged.</p><Button primary onClick={close}>Return to preparation</Button></>}
 </div></Frame></div>}
 <div className="vg-sr" role="status" aria-live="polite">{chosenClass.name}. {items[equipped].name} equipped. {state.preview?weapon.name+(locked?' locked.':' previewed.'):''} {state.notice} {state.join!=='idle'?state.join:''}</div>
 </div></div>
 </div>;
}
window.renderVanguard=({host,source,updateNotes})=>{
 host.classList.add('artwork--vanguard');
 const root=createRoot(host);
 root.render(<App host={host} onExit={()=>source?.(1)} updateNotes={updateNotes}/>);
 host.disposeVanguard=()=>{root.unmount();host.classList.remove('artwork--vanguard');delete host.disposeVanguard;};
};
window.vanguardControls={
 reset:()=>{session={...initialState,equipped:{...initialState.equipped}};window.dispatchEvent(new Event('vanguard-reset'));},
 failNext:()=>window.dispatchEvent(new Event('vanguard-fail-next')),
 getState:()=>session
};

