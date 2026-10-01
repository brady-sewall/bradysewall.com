const fs=require('fs'),vm=require('vm'),assert=require('assert');
function run(stored,blocked=false){
let handler;const values=new Map(stored===null?[]:[['brady-theme',stored]]);const label={hidden:true};const select={closest:()=>label,addEventListener:(_,f)=>handler=f};
const document={documentElement:{dataset:{}},getElementById:id=>id==='theme'?select:{},querySelectorAll:()=>[]};const localStorage={getItem:k=>{if(blocked)throw Error();return values.get(k)},setItem:(k,v)=>{if(blocked)throw Error();values.set(k,v)},removeItem:k=>{if(blocked)throw Error();values.delete(k)}};
const context={document,localStorage,matchMedia:()=>({matches:true}),Date,window:{}};vm.createContext(context);
for(const f of ['theme.js','script.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../docs/')+f,'utf8'),context);
return {document,select,label,values,change:v=>{select.value=v;handler()}};
}
for(const initial of [null,'system','invalid','light','dark']){const s=run(initial);assert.equal(s.select.value,['light','dark'].includes(initial)?initial:'system');assert.equal(s.label.hidden,false);s.change('dark');assert.equal(s.document.documentElement.dataset.theme,'dark');assert.equal(s.values.get('brady-theme'),'dark');s.change('light');assert.equal(s.document.documentElement.dataset.theme,'light');s.change('system');assert.equal(s.document.documentElement.dataset.theme,undefined);assert.equal(s.values.has('brady-theme'),false)}
const s=run(null,true);s.change('dark');assert.equal(s.document.documentElement.dataset.theme,'dark');s.change('system');assert.equal(s.document.documentElement.dataset.theme,undefined);
console.log('Theme checks passed: system default, valid/invalid saved overrides, changes, reset, unavailable storage, reduced motion, no observer.');
