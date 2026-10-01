const fs = require('fs'), vm = require('vm'), assert = require('assert');
const source = fs.readFileSync(require('path').join(__dirname, '../docs/consent.js'), 'utf8');
function visit({stored=null,blocked=false,host='bradysewall.com',gpc=false,dnt=null,region='US',failure=false,pending=false,wrongHost=false}={}) {
  const selectors=['.consent-panel','.consent-status','.privacy-settings','[data-consent="accepted"]','[data-consent="declined"]','.consent-close','main'];
  const elements=Object.fromEntries(selectors.map(k=>[k,{hidden:true,textContent:'',handlers:{},addEventListener(n,f){this.handlers[n]=f},focus(options){this.focused=true;this.focusOptions=options},getBoundingClientRect(){return {height:200}}}]));
  const scripts=[],cookies=[],storage=new Map(stored===null?[]:[['brady-analytics-consent-v1',stored]]);let reloads=0,requests=0,resolve;
  const document={documentElement:{style:{setProperty(){}}},querySelector:s=>elements[s],head:{appendChild:s=>scripts.push(s)},createElement:()=>({}),get cookie(){return '_ga=old; _clck=old; essential=keep'},set cookie(v){cookies.push(v)}};
  const response={ok:true,text:async()=>`h=${wrongHost?'other.example':host}\nloc=${region}\nip=NOT_TO_BE_STORED\n`};
  const context={document,navigator:{globalPrivacyControl:gpc,doNotTrack:dnt},location:{hostname:host,pathname:'/',reload:()=>reloads++},localStorage:{getItem:k=>{if(blocked)throw Error();return storage.get(k)||null},setItem:(k,v)=>{if(blocked)throw Error();storage.set(k,v)}},Date,AbortController,setTimeout,clearTimeout,fetch:async(url,options)=>{requests++;assert.equal(url,'/cdn-cgi/trace');assert.equal(options.credentials,'omit');assert.equal(options.cache,'no-store');if(failure)throw Error('network');if(pending)return new Promise(r=>resolve=r);return response}};
  context.addEventListener=()=>{};context.window=context;vm.createContext(context);vm.runInContext(source,context);
  return {context,elements,scripts,cookies,storage,reloads:()=>reloads,requests:()=>requests,resolve:()=>resolve(response),click:s=>elements[s].handlers.click()};
}
const record=(choice,age=0)=>JSON.stringify({choice,at:Date.now()-age});
const settle=()=>new Promise(r=>setImmediate(r));
(async()=>{
  for(const options of [{region:'GB'},{region:'DE'},{region:'XX'},{region:''},{failure:true},{wrongHost:true},{stored:record('declined')},{host:'127.0.0.1'}]) {
    const s=visit(options);await settle();assert.equal(s.scripts.length,0);assert(s.context['ga-disable-G-5J759DPK0N']);assert(s.elements['.consent-panel'].hidden);
  }
  for(const options of [{},{host:'www.bradysewall.com'},{stored:'broken'},{blocked:true},{stored:record('accepted',181*86400000)}]) {
    const s=visit(options);assert.equal(s.scripts.length,0);await settle();assert.equal(s.scripts.length,1);assert(s.scripts[0].src.includes('GTM-564FG55'));assert(s.elements['.consent-panel'].hidden);assert(!s.context.clarity);
    assert.equal(s.context.dataLayer[0][2].analytics_storage,'denied');assert.equal(s.context.dataLayer[1][1].allow_google_signals,false);assert.equal(s.context.dataLayer[1][1].allow_ad_personalization_signals,false);
    assert.equal(s.context.dataLayer[2][2].analytics_storage,'granted');for(const name of ['ad_storage','ad_user_data','ad_personalization'])assert.equal(s.context.dataLayer[2][2][name],'denied');assert.equal(s.context.dataLayer[3].event,'gtm.js');assert.equal(s.storage.size, options.stored?1:0);
  }
  const accepted=visit({region:'GB'});await settle();accepted.click('.privacy-settings');assert(!accepted.elements['.consent-panel'].hidden);assert.equal(accepted.elements['[data-consent="accepted"]'].focusOptions.preventScroll,true);accepted.click('[data-consent="accepted"]');assert.equal(accepted.scripts.length,1);accepted.click('[data-consent="accepted"]');assert.equal(accepted.scripts.length,1);
  accepted.click('[data-consent="declined"]');assert.equal(accepted.reloads(),1);assert.equal(accepted.elements['.privacy-settings'].focusOptions.preventScroll,true);assert(accepted.context['ga-disable-G-5J759DPK0N']);assert.equal(accepted.context.dataLayer.at(-1)[2].analytics_storage,'denied');assert(accepted.cookies.some(c=>c.startsWith('_ga=')));assert(!accepted.cookies.some(c=>c.startsWith('essential=')));assert.equal(JSON.parse(accepted.storage.get('brady-analytics-consent-v1')).choice,'declined');
  for(const options of [{gpc:true},{dnt:'1'},{dnt:'yes'}]) {const s=visit({...options,stored:record('accepted')});await settle();assert.equal(s.scripts.length,0);assert.equal(s.requests(),0);assert(s.elements['[data-consent="accepted"]'].disabled);s.click('[data-consent="accepted"]');assert.equal(s.scripts.length,0);}
  const saved=visit({stored:record('accepted'),region:'GB'});await settle();assert.equal(saved.scripts.length,1);assert.equal(saved.requests(),0);
  const race=visit({pending:true});race.click('[data-consent="declined"]');race.resolve();await settle();assert.equal(race.scripts.length,0);
  const allowRace=visit({pending:true});allowRace.click('[data-consent="accepted"]');allowRace.resolve();await settle();assert.equal(allowRace.scripts.length,1);
  assert(![...allowRace.storage.values()].join('').includes('NOT_TO_BE_STORED'));
  console.log('Analytics checks passed: US/non-US/unknown/network defaults, no automatic popup, regional lookup races, saved choices/expiry, local exclusion, GPC/DNT, ad settings, no Clarity, opt-out/cookies/reload.');
})().catch(e=>{console.error(e);process.exitCode=1});
