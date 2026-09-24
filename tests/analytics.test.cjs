const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync(require('node:path').join(__dirname,'../analytics.js'),'utf8');
function setup(saved=null){
  class Element{
    constructor(tag){this.tag=tag;this.children=[];this.style={};this.attrs={};this.events={};this.hidden=false;}
    append(...items){this.children.push(...items);}
    replaceChildren(){this.children=[];}
    setAttribute(k,v){this.attrs[k]=v;}
    addEventListener(k,fn){this.events[k]=fn;}
    querySelector(){return this.children.find(x=>x.tag==='button');}
    focus(){this.focused=true;}
    click(){this.events.click();}
  }
  const body=new Element('body'),head=new Element('head'),host=new Element('footer');
  const document={body,head,cookie:'',createElement:t=>new Element(t),querySelector:()=>host};
  const events={};
  const window={addEventListener:(k,fn)=>events[k]=fn};
  const storage={value:saved,getItem(){return this.value;},setItem(k,v){this.value=v;}};
  vm.runInNewContext(code,{document,window,localStorage:storage,location:{hostname:'remiclassic.github.io',pathname:'/remiresume/portfolio.html',origin:'https://remiclassic.github.io'}});
  const panel=body.children[0],settings=host.children[0];
  return {panel,settings,storage,window,head,events,click:label=>{const b=panel.children.find(x=>x.textContent===label);assert.ok(b,label);b.click();}};
}
for(const [label,value] of [['Accept analytics','accepted'],['Reject','rejected']]){
  test(label+' dismisses the panel and preserves a way to change consent',()=>{
    const ui=setup();
    assert.equal(ui.panel.hidden,false);
    assert.equal(ui.head.children.filter(x=>x.tag==='script').length,0);
    ui.click(label);
    assert.equal(ui.storage.value,value);
    assert.equal(ui.panel.hidden,true);
    assert.equal(ui.panel.children.length,0);
    assert.equal(ui.settings.attrs['aria-expanded'],'false');
    assert.equal(ui.head.children.filter(x=>x.tag==='script').length,value==='accepted'?1:0);
    ui.settings.click();
    assert.equal(ui.panel.hidden,false);
    assert.equal(ui.panel.querySelector('button').focused,true);
    ui.click('Close');
    assert.equal(ui.panel.hidden,true);
    assert.equal(ui.storage.value,value);
    assert.equal(setup(value).panel.hidden,true);
  });
}
test('a saved acceptance can be revoked without leaving the banner onscreen',()=>{
  const ui=setup('accepted');
  ui.settings.click();ui.click('Reject');
  assert.equal(ui.window['ga-disable-G-91MKXS9X59'],true);
  assert.equal(ui.panel.hidden,true);
  assert.equal(ui.storage.value,'rejected');
});

