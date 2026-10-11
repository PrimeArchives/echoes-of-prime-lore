import test from 'node:test'
import assert from 'node:assert/strict'
import {webcrypto} from 'node:crypto'
import {DatabaseSync} from 'node:sqlite'
import fs from 'node:fs'
const {frostgale}=await import(process.env.FROSTGALE_TEST_MODULE||'../worker/frostgale.ts')
const {interactiveAfterDOMLoaded}=await import(process.env.FROSTGALE_UI_MODULE||'../quartz/components/Prime/interactive/Interactive.tsx')
test('interfacebediening en echte API volgen de kolomvergrendeling',async()=>{
const sql=new DatabaseSync(':memory:');sql.exec(fs.readFileSync(new URL('../worker/frostgale-schema.sql',import.meta.url),'utf8'))
const db={prepare(query){let args=[];const s=sql.prepare(query);return{bind(...a){args=a;return this},async first(){return s.get(...args)},async run(){return {meta:{changes:s.run(...args).changes}}}}}}
await frostgale(new Request('https://prime.test/api/frostgale',{method:'POST',headers:{Origin:'https://prime.test','Content-Type':'application/json'},body:JSON.stringify({action:'release',phase:0,requestId:'request-ui-start-01'})}),db,{id:5,username:'architect',role:'architect'})
const nodes=new Map();const node=s=>{if(!nodes.has(s))nodes.set(s,{textContent:'',innerHTML:'',hidden:false,dataset:{},querySelectorAll:()=>[]});return nodes.get(s)}
let click,fetchCount=0
const root={dataset:{},isConnected:true,querySelector:node,contains:()=>true,addEventListener:(name,handler)=>{if(name==='click')click=handler},removeEventListener:()=>{}}
const document={hidden:false,body:{},querySelectorAll:()=>[root],addEventListener:()=>{},removeEventListener:()=>{}}
const window={addCleanup:()=>{}}
const fetch=async(url,opts={})=>{fetchCount++;return frostgale(new Request('https://prime.test'+url,{...opts,headers:{...opts.headers,...(opts.method==='POST'?{Origin:'https://prime.test'}:{})}}),db,{id:1,username:'lumi',role:'player'})}
const tick=()=>new Promise(r=>setImmediate(r))
new Function('window','document','MutationObserver','setInterval','clearInterval','fetch','crypto','confirm',interactiveAfterDOMLoaded)(window,document,class{observe(){}disconnect(){}},()=>1,()=>{},fetch,webcrypto,()=>true)
await tick();assert.equal((node('[data-fr-grid]').innerHTML.match(/data-cell=/g)||[]).length,30)
assert.equal(node('[data-fr-upgrade]').hidden,true)
const clickButton=dataset=>{const b={dataset,hasAttribute:()=>false};click({target:{closest:()=>b}})}
const before=JSON.parse(sql.prepare('SELECT state FROM frostgale_relay').get().state).puzzles.lumi.rotations[0]
const requests=fetchCount;clickButton({cell:'0'});await tick();assert.equal(fetchCount,requests);assert.match(node('[data-fr-error]').textContent,/onder spanning/)
clickButton({circuit:'heat'});await tick();await tick();assert.equal(JSON.parse(sql.prepare('SELECT state FROM frostgale_relay').get().state).puzzles.lumi.circuits[0],false)
clickButton({cell:'0'});await tick();await tick();assert.equal(JSON.parse(sql.prepare('SELECT state FROM frostgale_relay').get().state).puzzles.lumi.rotations[0],(before+1)%4)
assert.match(node('[data-fr-error]').textContent,/Tegel gedraaid/)
console.log('UI/API interaction OK: locked click blocked; column switch unlocks; actual server rotation confirmed; 30 cells rendered.')

})
