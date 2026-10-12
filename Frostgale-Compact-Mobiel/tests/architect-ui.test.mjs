import test from 'node:test'
import assert from 'node:assert/strict'
import {webcrypto} from 'node:crypto'
import {DatabaseSync} from 'node:sqlite'
import fs from 'node:fs'
const {frostgale}=await import(process.env.FROSTGALE_TEST_MODULE||'../worker/frostgale.ts')
const {interactiveAfterDOMLoaded}=await import(process.env.FROSTGALE_UI_MODULE||'../quartz/components/Prime/interactive/Interactive.tsx')
test('Architect wisselt testspeler en fase en keert veilig terug naar relaybeheer',async()=>{
const sql=new DatabaseSync(':memory:');sql.exec(fs.readFileSync(new URL('../worker/frostgale-schema.sql',import.meta.url),'utf8'))
const db={prepare(query){let args=[];const s=sql.prepare(query);return{bind(...a){args=a;return this},async first(){return s.get(...args)},async run(){return {meta:{changes:s.run(...args).changes}}}}}}
const nodes=new Map();const node=s=>{if(!nodes.has(s))nodes.set(s,{textContent:'',innerHTML:'',hidden:false,dataset:{},querySelectorAll:()=>[]});return nodes.get(s)}
let click,change,fetchCount=0
const root={dataset:{},isConnected:true,querySelector:node,contains:()=>true,addEventListener:(name,handler)=>{if(name==='click')click=handler;if(name==='change')change=handler},removeEventListener:()=>{}}
const document={hidden:false,body:{},querySelectorAll:()=>[root],addEventListener:()=>{},removeEventListener:()=>{}}
const window={addCleanup:()=>{}}
const fetch=async(url,opts={})=>{fetchCount++;return frostgale(new Request('https://prime.test'+url,{...opts,headers:{...opts.headers,...(opts.method==='POST'?{Origin:'https://prime.test'}:{})}}),db,{id:5,username:'architect',role:'architect'},url.startsWith('/api/frostgale/test'))}
const tick=()=>new Promise(r=>setImmediate(r))
new Function('window','document','MutationObserver','setInterval','clearInterval','fetch','crypto','confirm',interactiveAfterDOMLoaded)(window,document,class{observe(){}disconnect(){}},()=>1,()=>{},fetch,webcrypto,()=>true)
await tick();assert.equal(node('[data-fr-test-controls]').hidden,false);assert.equal(node('[data-fr-player]').hidden,true)
const clickAttr=attr=>{const b={dataset:{},hasAttribute:x=>x===attr};click({target:{closest:()=>b}})}
clickAttr('data-fr-test-open');await tick();await tick();assert.equal(node('[data-fr-test-banner]').hidden,false);assert.match(node('[data-fr-name]').textContent,/Lumi/);assert.equal(node('[data-fr-dm]').hidden,true)
change({target:{value:'venn',hasAttribute:x=>x==='data-fr-test-player'}});await tick();await tick();assert.match(node('[data-fr-name]').textContent,/Venn/)
node('[data-fr-test-phase]').value='2';change({target:{value:'2',hasAttribute:x=>x==='data-fr-test-phase'}});clickAttr('data-fr-test-load');await tick();await tick();assert.match(node('[data-fr-name]').textContent,/FASE 3/)
clickAttr('data-fr-test-pause');await tick();await tick();assert.match(node('[data-fr-pause]').textContent,/GEPAUZEERD/)
clickAttr('data-fr-test-open');await tick();await tick();assert.equal(node('[data-fr-test-banner]').hidden,true);assert.equal(node('[data-fr-dm]').hidden,false);assert.equal(node('[data-fr-player]').hidden,true)
const live=JSON.parse(sql.prepare('SELECT state FROM frostgale_relay').get().state);assert.equal(live.openedPhase,-1);assert.equal(live.paused,false);assert.equal(live.puzzles.venn.phase,0)
})
