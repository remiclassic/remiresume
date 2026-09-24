const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const context={window:{}};
vm.createContext(context);
for(const name of ['portfolio-data.js','portfolio-ux-data.js']) vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),context);
const {portfolioProjects:projects,portfolioUX:studies}=context.window;
test('every walkthrough points to an existing original artifact',()=>{
  assert.equal(Object.keys(studies).length,projects.length);
  for(const project of projects){
    const study=studies[project.id];
    assert.equal(study.nodes.length,4);
    assert.ok(study.basis&&study.question&&study.measure);
    for(const node of study.nodes){
      const frame=project.frames[node.frame];
      assert.ok(frame,`${project.id}: invalid reference`);
      assert.ok(fs.existsSync(path.join(root,'portfolio-imgs',frame.poster||frame.src)));
    }
  }
});
test('all prototype actions resolve and every state is reachable',()=>{
  for(const study of Object.values(studies)){
    const demo=study.prototype;if(!demo)continue;
    assert.ok(fs.existsSync(path.join(root,'portfolio-imgs',demo.art)));
    if(demo.renderer === 'vanguard-react') continue; // Covered by vanguard-react.test.cjs.
    const seen=new Set();const queue=[demo.start,...demo.scenarios.map(s=>s[0])];
    while(queue.length){
      const key=queue.shift();if(seen.has(key))continue;
      const state=demo.states[key];assert.ok(state,`${demo.name}: missing ${key}`);seen.add(key);
      assert.ok(state.actions.length>0,`${key} is a dead end`);
      for(const [label,target] of state.actions){assert.ok(label);queue.push(target);}
    }
    assert.equal(seen.size,Object.keys(demo.states).length);
  }
});
const advance=(states,key,label)=>{const action=states[key].actions.find(a=>a[0]===label);assert.ok(action,`${key}: ${label}`);return action[1];};
test('repair requires review and confirmation; shortfall offers affordable recovery',()=>{
  const s=studies.mechwarrior.prototype.states;
  assert.equal(advance(s,'inspect','Review repair'),'review');
  assert.equal(advance(s,'review','Confirm repair'),'complete');
  assert.equal(advance(s,'review','Cancel — keep selection'),'cancelled');
  assert.ok(s.cancelled.facts.some(f=>f[1]==='0 CR'));
  assert.equal(advance(s,'shortfall','Review essential repair'),'essential');
  assert.ok(s.essential.facts.some(f=>f[1]==='2,000 CR'));
});
test('disconnect cannot silently restore readiness and cancel retains squad',()=>{
  const s=studies.multiplayer.prototype.states;
  assert.equal(advance(s,'queue','Cancel search'),'ready');
  assert.equal(advance(s,'disconnect','Stay with the squad'),'offline');
  assert.ok(s.offline.facts.some(f=>f[1]==='3 / 4 members'));
  assert.equal(advance(s,'offline','Simulate reconnect'),'rejoined');
  assert.equal(advance(s,'rejoined','Reconfirm squad'),'ready');
  assert.equal(advance(s,'ready','Start matchmaking'),'queue');
});
test('invalid deck preserves edits, validation and save are separate decisions',()=>{
  const s=studies.cards.prototype.states;
  assert.equal(advance(s,'building','Try saving now'),'incomplete');
  assert.ok(s.incomplete.facts.some(f=>f[1]==='Preserved'));
  assert.equal(advance(s,'duplicate','Choose Woodland Guardian'),'valid');
  assert.ok(s.valid.facts.some(f=>f[1]==='Unsaved changes'));
  assert.equal(advance(s,'valid','Save deck'),'saved');
  assert.equal(advance(s,'saved','Return to collection'),'returned');
});
