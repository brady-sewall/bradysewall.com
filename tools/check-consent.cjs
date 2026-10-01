const fs = require('fs'), vm = require('vm'), assert = require('assert');
const source = fs.readFileSync(require('path').join(__dirname, '../docs/consent.js'), 'utf8');
function visit({stored=null,blocked=false,host='bradysewall.com',gpc=false,dnt=null}={}) {
  const selectors=['.consent-panel','.consent-status','.privacy-settings','[data-consent="accepted"]','[data-consent="declined"]','.consent-close','main'];
  const elements=Object.fromEntries(selectors.map(k=>[k,{hidden:true,textContent:'',handlers:{},addEventListener(n,f){this.handlers[n]=f},focus(){this.focused=true}}]));
  const scripts=[],cookies=[],storage=new Map(stored===null?[]:[['brady-analytics-consent-v1',stored]]);let reloads=0;
  const document={querySelector:s=>elements[s],head:{appendChild:s=>scripts.push(s)},createElement:()=>({}),get cookie(){return '_ga=old; _clck=old; essential=keep'},set cookie(v){cookies.push(v)}};
  const context={document,navigator:{globalPrivacyControl:gpc,doNotTrack:dnt},location:{hostname:host,pathname:'/',reload:()=>reloads++},localStorage:{getItem:k=>{if(blocked)throw Error();return storage.get(k)||null},setItem:(k,v)=>{if(blocked)throw Error();storage.set(k,v)}},Date};context.window=context;vm.createContext(context);vm.runInContext(source,context);
  return {context,elements,scripts,cookies,storage,reloads:()=>reloads,click:s=>elements[s].handlers.click()};
}
const record=(choice,age=0)=>JSON.stringify({choice,at:Date.now()-age});
for(const options of [{},{stored:record('declined')},{stored:'broken'},{blocked:true},{stored:record('accepted',181*86400000)}]) {const s=visit(options);assert.equal(s.scripts.length,0);assert(s.context['ga-disable-G-5J759DPK0N']);assert.equal(s.context.dataLayer[0][2].analytics_storage,'denied');}
const accepted=visit();accepted.click('[data-consent="accepted"]');assert.equal(accepted.scripts.length,2);assert(accepted.scripts[0].src.includes('GTM-564FG55'));assert(accepted.scripts[1].src.includes('yr25mpk0ii'));assert.equal(accepted.context.dataLayer[1][2].analytics_storage,'granted');assert.equal(accepted.context.dataLayer[1][2].ad_storage,'denied');assert.equal(accepted.context.dataLayer[2].event,'gtm.js');assert.equal(accepted.context.clarity.q[0][1].analytics_Storage,'granted');assert.equal(accepted.context.clarity.q[0][1].ad_Storage,'denied');accepted.click('[data-consent="accepted"]');assert.equal(accepted.scripts.length,2);
accepted.click('.privacy-settings');accepted.click('[data-consent="declined"]');assert.equal(accepted.reloads(),1);assert(accepted.context['ga-disable-G-5J759DPK0N']);assert.equal(accepted.context.dataLayer.at(-1)[2].analytics_storage,'denied');assert(accepted.cookies.some(c=>c.startsWith('_ga=')));assert(!accepted.cookies.some(c=>c.startsWith('essential=')));assert.equal(JSON.parse(accepted.storage.get('brady-analytics-consent-v1')).choice,'declined');
for(const options of [{gpc:true},{dnt:'1'},{dnt:'yes'}]) {const s=visit({...options,stored:record('accepted')});assert.equal(s.scripts.length,0);assert(s.elements['[data-consent="accepted"]'].disabled);s.click('[data-consent="accepted"]');assert.equal(s.scripts.length,0);}
assert.equal(visit({stored:record('accepted')}).scripts.length,2);
assert.equal(visit({stored:record('accepted'),host:'127.0.0.1'}).scripts.length,0);
const rejected=visit();rejected.click('[data-consent="declined"]');assert.equal(rejected.scripts.length,0);assert.equal(rejected.reloads(),0);
console.log('Consent checks passed: defaults, decline, accept/order, persistence/expiry, duplicate prevention, revocation/cookies, GPC/DNT, blocked storage, local-preview exclusion.');
