import test from 'node:test'
import assert from 'node:assert/strict'
import {DatabaseSync} from 'node:sqlite'
import fs from 'node:fs'
const {frostgale,frostgaleSignal}=await import(process.env.FROSTGALE_TEST_MODULE||'../worker/frostgale.ts')
const {config}=await import(process.env.FROSTGALE_ENGINE_MODULE||'../worker/frostgale-engine.ts')
const dm={id:5,username:'architect',role:'architect'},player={id:1,username:'lumi',role:'player'}
function database(){const sql=new DatabaseSync(':memory:');sql.exec(fs.readFileSync(new URL('../worker/frostgale-schema.sql',import.meta.url),'utf8'));return {sql,prepare(query){const s=sql.prepare(query);let args=[];return{bind(...a){args=a;return this},async first(){return s.get(...args)},async run(){return{meta:{changes:s.run(...args).changes}}}}}}}
let sequence=0
const req=(p='lumi',body)=>new Request('https://prime.test/api/frostgale/test?player='+p,body?{method:'POST',headers:{Origin:'https://prime.test','Content-Type':'application/json'},body:JSON.stringify({requestId:'test-request-'+(++sequence),phase:0,...body})}:{})
const state=db=>db.sql.prepare('SELECT * FROM frostgale_relay').get()
const call=async(db,p,b,user=dm)=>{const r=await frostgale(req(p,b),db,user,true);return{status:r.status,...await r.json()}}
test('Architect-only toegang en volledig aparte opslag, ook zonder live migratie',async()=>{
 const db=database();db.sql.exec('DROP TABLE frostgale_relay')
 assert.equal((await call(db,'lumi',null,player)).status,403)
 assert.equal((await call(db,'lumi',null,null)).status,401)
 assert.equal((await call(db,'unknown')).status,400)
 const result=await call(db,'lumi');assert.equal(result.status,200);assert.equal(result.testMode,true);assert.equal(result.dm,false);assert.equal(result.player,'lumi');assert.equal(result.puzzle.config.cells.length,30)
 assert.equal(db.sql.prepare("SELECT name FROM sqlite_master WHERE name='frostgale_relay'").get(),undefined)
 assert.equal((await frostgale(req(),db,dm)).status,503)
})
test('alle testacties laten live startslot en Archives exact intact',async()=>{
 const db=database();await frostgale(req(),db,player);const before=state(db)
 for(const p of ['lumi','clav','dakka','venn']){
  for(let phase=0;phase<3;phase++){
   const loaded=await call(db,p,{action:'testPhase',targetPhase:phase});assert.equal(loaded.status,200);assert.equal(loaded.puzzle.phase,phase)
   assert.equal((await call(db,p,{action:'rotate',phase,cell:0})).status,400)
   assert.equal((await call(db,p,{action:'toggle',phase,circuit:'heat',on:false})).status,200)
   const changed=await call(db,p,{action:'rotate',phase,cell:0});assert.equal(changed.status,200);assert.equal(changed.puzzle.rotations[0],(loaded.puzzle.rotations[0]+1)%4)
  }
 }
 assert.equal((await call(db,'lumi',{action:'pause'})).paused,true)
 assert.equal((await call(db,'lumi',{action:'resume'})).paused,false)
 for(const action of ['archives','release','reset','resetAll','upgrade','initialize'])assert.equal((await call(db,'lumi',{action,lost:false})).status,400)
 assert.deepEqual(state(db),before)
 assert.deepEqual(await (await frostgaleSignal(req(),db)).json(),{signalLost:null})
 const live=await (await frostgale(req(),db,player)).json();assert.equal(live.started,false);assert.equal(live.puzzle,null)
})
test('testvoortgang blijft staan per speler en per Architect; fase-reset raakt alleen keuze',async()=>{
 const db=database();await call(db,'lumi',{action:'toggle',circuit:'heat',on:false});const changed=await call(db,'lumi',{action:'rotate',cell:0})
 await call(db,'venn',{action:'testPhase',targetPhase:2})
 const back=await call(db,'lumi');assert.deepEqual(back.puzzle.rotations,changed.puzzle.rotations)
 const second=await call(db,'lumi',null,{...dm,id:6});assert.equal(second.puzzle.circuits[0],true)
 const reset=await call(db,'lumi',{action:'testPhase',targetPhase:1});assert.equal(reset.puzzle.conditions[0],100);assert.equal(reset.puzzle.circuits[0],true)
 assert.equal((await call(db,'venn')).puzzle.phase,2)
 assert.equal((await call(db,'lumi',{action:'testPhase',targetPhase:3})).status,400)
})
test('echte kalibratieregels blijven geldig; geslaagde testfase opent volgende zonder live vrijgave',async()=>{
 const db=database();await call(db,'lumi')
 const row=db.sql.prepare('SELECT state FROM frostgale_test WHERE id=5').get();const s=JSON.parse(row.state);s.puzzles.lumi.rotations=config('lumi',0).solution;db.sql.prepare('UPDATE frostgale_test SET state=? WHERE id=5').run(JSON.stringify(s))
 const advanced=await call(db,'lumi',{action:'advance'});assert.equal(advanced.status,200);assert.equal(advanced.puzzle.phase,1);assert.equal(advanced.puzzle.waiting,false)
 assert.equal((await call(db,'lumi',{action:'rotate',phase:0,cell:0})).status,400)
})
