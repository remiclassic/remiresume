export const SIZE = {width:1672,height:941};
export const fitCanvas=(width,height)=>Math.max(0,Math.min(width/SIZE.width,height/SIZE.height));
export const items = {
 halberd:{name:'Halberd',art:'halberd',traits:['High','Low','Medium'],rank:1},
 poleaxe:{name:'Poleaxe',art:'poleaxe',traits:['Medium','Medium','High'],rank:1},
 glaive:{name:'Glaive',art:'glaive',traits:['High','High','Medium'],rank:4},
 longbow:{name:'Longbow',art:'longbow',traits:['High','Medium','Low'],rank:1},
 spear:{name:'Spear',art:'spear',traits:['High','High','Low'],rank:1},
 longsword:{name:'Longsword',art:'longsword',traits:['Medium','Medium','High'],rank:1},
 hatchet:{name:'Hatchet',art:'hatchet'},'war-horn':{name:'War horn',art:'war-horn'}
};
export const classes = {
 archer:{name:'Archer',role:'Range & precision',description:'Support your team from a distance.',traits:['High','High','Low'],tradeoff:'Long range. Exposed in close combat.',primary:'longbow',weapons:['longbow'],scene:'archer-scene'},
 vanguard:{name:'Vanguard',role:'Reach & pressure',description:'Control space with long-reaching weapons.',traits:['High','Medium','Low'],tradeoff:'Long reach. Vulnerable at close range.',primary:'halberd',weapons:['halberd','poleaxe','glaive'],scene:'class-scene'},
 footman:{name:'Footman',role:'Support & mobility',description:'Hold the line and support your team.',traits:['High','High','Medium'],tradeoff:'Quick to reposition. Lower impact.',primary:'spear',weapons:['spear','halberd'],scene:'footman-scene'},
 knight:{name:'Knight',role:'Armour & impact',description:'Stand your ground in close combat.',traits:['Medium','Low','High'],tradeoff:'Strong protection. Slower movement.',primary:'longsword',weapons:['longsword','poleaxe'],scene:'knight-scene'}
};
export const initialState = {
 screen:'class',classId:'vanguard',equipped:{archer:'longbow',vanguard:'halberd',footman:'spear',knight:'longsword'},
 preview:null,team:'Red Company',modal:null,notice:'',rank:2,join:'idle',failNextJoin:false
};
export function sceneFor(state){
 if(state.screen==='loadout')return 'armoury-scene';
 const weapon=state.equipped[state.classId];
 if(state.classId==='vanguard')return state.screen==='deploy'?(weapon==='halberd'?'deployment-halberd':'deployment-scene'):(weapon==='poleaxe'?'class-poleaxe':'class-scene');
 if(state.classId==='footman'&&weapon==='halberd')return 'footman-halberd';
 if(state.classId==='knight'&&weapon==='poleaxe')return 'knight-poleaxe';
 return classes[state.classId].scene;
}
export function reducer(state, action){
 const current=state.equipped[state.classId];
 switch(action.type){
 case 'CLASS': return classes[action.id]?{...state,classId:action.id,preview:null,notice:'',screen:'class'}:state;
 case 'LOADOUT':return {...state,screen:'loadout',preview:null,notice:'',join:'idle'};
 case 'PREVIEW':return classes[state.classId].weapons.includes(action.id)?{...state,preview:action.id,notice:''}:state;
 case 'CANCEL_PREVIEW':return {...state,preview:null,notice:items[current].name+' remains equipped.'};
 case 'EQUIP':{
  const item=items[state.preview];if(!item || item.rank>state.rank)return state;
  return {...state,equipped:{...state.equipped,[state.classId]:state.preview},preview:null,notice:'Loadout updated',screen:'deploy'};
 }
 case 'REVIEW':return {...state,screen:'deploy',preview:null,join:'idle'};
 case 'BACK':return {...state,screen:state.screen==='deploy'?'loadout':'class',preview:null,notice:'',join:'idle'};
 case 'MODAL':return {...state,modal:action.name};
 case 'CLOSE':return {...state,modal:null};
 case 'TEAM':return {...state,team:action.team,modal:null,notice:'Team changed to '+action.team};
 case 'DEPLOY':return state.screen!=='deploy'||state.join==='joining'?state:{...state,join:'joining',modal:null};
 case 'JOIN_RESULT':return state.join!=='joining'?state:{...state,join:state.failNextJoin?'failed':'joined',failNextJoin:false};
 case 'RETURN_REVIEW':return {...state,join:'idle'};
 case 'FAIL_NEXT':return {...state,failNextJoin:!state.failNextJoin};
 case 'RESET':return {...initialState,equipped:{...initialState.equipped}};
 default:return state;
 }
}

