const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const model=import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync(path.join(root,'src/vanguard-state.js'),'utf8')).toString('base64'));
test('React loadout previews cancel cleanly and only explicit equip changes selection',async()=>{
 const {initialState,reducer:r}=await model;
 let s=r(initialState,{type:'LOADOUT'});
 s=r(s,{type:'PREVIEW',id:'poleaxe'});
 assert.equal(s.preview,'poleaxe');assert.equal(s.equipped.vanguard,'halberd');
 s=r(s,{type:'CANCEL_PREVIEW'});assert.equal(s.preview,null);assert.equal(s.equipped.vanguard,'halberd');
 s=r(r(s,{type:'PREVIEW',id:'poleaxe'}),{type:'EQUIP'});
 assert.equal(s.screen,'deploy');assert.equal(s.equipped.vanguard,'poleaxe');assert.equal(s.notice,'Loadout updated');
 s=r(s,{type:'BACK'});assert.equal(s.screen,'loadout');assert.equal(s.equipped.vanguard,'poleaxe');
});
test('locked and class-incompatible items cannot be equipped',async()=>{
 const {initialState,reducer:r}=await model;
 let s=r(r(initialState,{type:'LOADOUT'}),{type:'PREVIEW',id:'glaive'});
 assert.equal(r(s,{type:'EQUIP'}),s);
 assert.equal(r(s,{type:'PREVIEW',id:'longbow'}),s);
 assert.equal(s.equipped.vanguard,'halberd');
});
test('each class retains its loadout when changing class or team',async()=>{
 const {initialState,reducer:r,classes}=await model;
 let s=r(r(initialState,{type:'PREVIEW',id:'poleaxe'}),{type:'EQUIP'});
 for(const id of Object.keys(classes)){s=r(s,{type:'CLASS',id});assert.equal(s.classId,id);assert.equal(s.equipped[id],id==='vanguard'?'poleaxe':classes[id].primary);}
 s=r(s,{type:'TEAM',team:'Blue Company'});assert.equal(s.team,'Blue Company');assert.equal(s.equipped.vanguard,'poleaxe');
});
test('join blocks duplicate submission and failure/retry preserve actual equipment',async()=>{
 const {initialState,reducer:r}=await model;
 assert.equal(r(initialState,{type:'DEPLOY'}),initialState);
 let s=r(r(r(initialState,{type:'PREVIEW',id:'poleaxe'}),{type:'EQUIP'}),{type:'FAIL_NEXT'});
 s=r(s,{type:'DEPLOY'});assert.equal(s.join,'joining');assert.equal(r(s,{type:'DEPLOY'}),s);
 s=r(s,{type:'JOIN_RESULT'});assert.equal(s.join,'failed');assert.equal(s.equipped.vanguard,'poleaxe');
 s=r(r(s,{type:'DEPLOY'}),{type:'JOIN_RESULT'});assert.equal(s.join,'joined');assert.equal(s.equipped.vanguard,'poleaxe');
 s=r(s,{type:'RETURN_REVIEW'});assert.equal(s.join,'idle');assert.equal(s.screen,'deploy');
});
test('the full 1672 by 941 canvas fits desktop, portrait, and short landscape without stretching',async()=>{
 const {SIZE,fitCanvas}=await model;
 for(const [w,h] of [[1920,1080],[1440,900],[900,350],[390,844],[844,390],[320,180]]){
  const s=fitCanvas(w,h),width=SIZE.width*s,height=SIZE.height*s;
  assert.ok(width<=w+.01 && height<=h+.01);assert.ok(Math.abs(width/height-1672/941)<1e-8);
 }
});
test('every class, weapon and screen uses an existing separate asset',async()=>{
 const {classes,items,initialState,sceneFor}=await model;
 const names=new Set(['class-scene','armoury-scene','deployment-scene','banner','castle-map','panel-texture',...Object.values(classes).map(c=>c.scene),...Object.values(items).map(i=>i.art)]);
 for(const [classId,c] of Object.entries(classes))for(const weapon of c.weapons.filter(id=>items[id].rank<=initialState.rank))for(const screen of ['class','loadout','deploy'])names.add(sceneFor({...initialState,classId,screen,equipped:{...initialState.equipped,[classId]:weapon}}));
 for(const name of names){
  const data=fs.readFileSync(path.join(root,'portfolio-imgs/vanguard/assets',name+'.png'));
  assert.equal(data.toString('hex',0,8),'89504e470d0a1a0a',name);
  assert.ok(data.readUInt32BE(16)>0&&data.readUInt32BE(20)>0);
 }
});
test('equipped weapon changes character art on both class and deployment screens',async()=>{
 const {initialState,reducer:r,sceneFor}=await model;
 let s=r(r(initialState,{type:'PREVIEW',id:'poleaxe'}),{type:'EQUIP'});
 assert.equal(sceneFor(s),'deployment-scene');
 s=r(s,{type:'CLASS',id:'vanguard'});assert.equal(sceneFor(s),'class-poleaxe');
 s=r(r(r(s,{type:'CLASS',id:'footman'}),{type:'PREVIEW',id:'halberd'}),{type:'EQUIP'});assert.equal(sceneFor(s),'footman-halberd');
 s=r(r(r(s,{type:'CLASS',id:'knight'}),{type:'PREVIEW',id:'poleaxe'}),{type:'EQUIP'});assert.equal(sceneFor(s),'knight-poleaxe');
});

