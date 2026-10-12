import test from 'node:test'
import assert from 'node:assert/strict'
import {DatabaseSync} from 'node:sqlite'
import fs from 'node:fs'
const {frostgale,frostgaleSignal}=await import(process.env.FROSTGALE_TEST_MODULE||'../worker/frostgale.ts')
const player={id:1,username:'Lumi',role:'player'},dm={id:5,username:'Architect',role:'architect'}
function database(){const sql=new DatabaseSync(':memory:');sql.exec(fs.readFileSync(new URL('../worker/frostgale-schema.sql',import.meta.url),'utf8'));return {sql,prepare(query){const stmt=sql.prepare(query);let args=[];return {bind(...a){args=a;return this},async first(){return stmt.get(...args)},async run(){return {meta:{changes:stmt.run(...args).changes}}}}}}}
const req=(body,origin='https://prime.test')=>new Request('https://prime.test/api/frostgale',body?{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({phase:0,...body})}:{})
const body=async r=>r.json()
const start=async db=>frostgale(req({action:'release',phase:0,requestId:'request-start-00001'}),db,dm)
test('sessie, autorisatie, herkomst en afscherming serveroplossingen',async()=>{
 const db=database();assert.equal((await frostgale(req(),db,null)).status,401)
 await start(db);const p=await body(await frostgale(req(),db,player));assert.equal(p.player,'lumi');assert.equal(p.overview,null);assert.equal('solution' in p.puzzle.config,false);assert.equal(p.puzzle.phase,0)
 const admin=await body(await frostgale(req(),db,dm));assert.equal(admin.overview.length,4)
 assert.equal((await frostgale(req({action:'pause',requestId:'request-pause-0001'}),db,player)).status,400)
 assert.equal((await frostgale(req({action:'initialize',requestId:'request-init-0001'}),db,dm)).status,400)
 assert.equal((await frostgale(req({action:'rotate',cell:0,requestId:'request-cross-0001'},'https://evil.test'),db,player)).status,403)
 assert.equal((await frostgale(req({action:'rotate',cell:0,requestId:'request-locked-0001'}),db,player)).status,400)
})
test('alleen eigen subsystem, vrijschakelen, dubbele verzoeken en gelijktijdige acties',async()=>{
 const db=database();await start(db);const initial=await body(await frostgale(req(),db,player))
 assert.equal((await frostgale(req({action:'toggle',circuit:'heat',on:false,requestId:'request-unlock-0001'}),db,player)).status,200)
 const action={action:'rotate',cell:0,player:'venn',phase:0,completed:true,requestId:'request-rotate-0001'}
 const first=await body(await frostgale(req(action),db,player));assert.equal(first.player,'lumi');assert.equal(first.puzzle.completed,false);assert.equal(first.puzzle.rotations[0],(initial.puzzle.rotations[0]+1)%4)
 const duplicate=await body(await frostgale(req(action),db,player));assert.equal(duplicate.puzzle.rotations[0],first.puzzle.rotations[0])
 const results=await Promise.all([frostgale(req({...action,requestId:'request-race-000001'}),db,player),frostgale(req({...action,requestId:'request-race-000002'}),db,player),frostgale(req(),db,dm)])
 assert.ok(results.every(r=>r.status===200))
 const end=await body(await frostgale(req(),db,player));assert.equal(end.puzzle.rotations[0],(first.puzzle.rotations[0]+2)%4)
 assert.equal((await frostgale(req(),db,{...player,id:99})).status,403)
 const other=await body(await frostgale(req(),db,{id:4,username:'Venn',role:'player'}));assert.equal(other.player,'venn');assert.equal(other.puzzle.completed,false)
 assert.equal((await frostgale(req({action:'complete',requestId:'request-invalid-done'}),db,player)).status,400)
 assert.equal((await frostgale(req({action:'rotate',cell:0,phase:2,requestId:'request-wrongphase-01'}),db,player)).status,400)
})
test('oude voortgang blijft staan tot expliciete Architect-upgrade; herhaling wist niets',async()=>{
 const db=database(),old={paused:false,online:true,onlineAt:123,requests:[],puzzles:Object.fromEntries(['lumi','clav','dakka','venn'].map((p,k)=>[p,{userId:k+1,completed:true}]))}
 db.sql.prepare('INSERT INTO frostgale_relay VALUES(1,0,?)').run(JSON.stringify(old))
 const warning=await body(await frostgale(req(),db,player));assert.equal(warning.needsUpgrade,true)
 assert.deepEqual(JSON.parse(db.sql.prepare('SELECT state FROM frostgale_relay').get().state),old)
 const action={action:'upgrade',requestId:'request-upgrade-0001'}
 assert.equal((await frostgale(req(action),db,player)).status,403)
 const upgraded=await body(await frostgale(req(action),db,dm));assert.equal(upgraded.needsUpgrade,false);assert.equal(upgraded.readiness,0);assert.equal(upgraded.online,false)
 let saved=JSON.parse(db.sql.prepare('SELECT state FROM frostgale_relay').get().state);assert.deepEqual(saved.previousVersion,old);assert.equal(saved.puzzles.lumi.userId,1)
 await start(db);await frostgale(req({action:'toggle',circuit:'heat',on:false,requestId:'request-after-upgrade'}),db,player)
 await frostgale(req(action),db,dm);saved=JSON.parse(db.sql.prepare('SELECT state FROM frostgale_relay').get().state);assert.equal(saved.puzzles.lumi.circuits[0],false)
})

test('spelers-API onthult vóór de sessiestart geen matrix en weigert mutaties',async()=>{
 const db=database(),p=await body(await frostgale(req(),db,player))
 assert.equal(p.started,false);assert.equal(p.puzzle,null);assert.equal(p.overview,null)
 assert.equal((await frostgale(req({action:'release',phase:0,requestId:'request-player-start'}),db,player)).status,400)
 assert.equal((await frostgale(req({action:'toggle',circuit:'heat',on:false,requestId:'request-before-start'}),db,player)).status,400)
 await start(db);const started=await body(await frostgale(req(),db,player));assert.equal(started.started,true);assert.ok(started.puzzle.config.cells.length===30)
})

test('publieke signaalstatus lekt alleen de vlag; Architect kan niet voortijdig herstellen',async()=>{
 const db=database();await start(db)
 const initial=await body(await frostgaleSignal(req(),db));assert.deepEqual(initial,{signalLost:null})
 assert.equal((await frostgale(req({action:'archives',lost:false,requestId:'request-premature-arc'}),db,dm)).status,400)
 assert.equal((await frostgale(req({action:'archives',lost:true,requestId:'request-player-arc'}),db,player)).status,400)
 assert.equal((await frostgale(req({action:'archives',lost:true,requestId:'request-close-archive'}),db,dm)).status,200)
 const persisted=await body(await frostgaleSignal(req(),db));assert.deepEqual(persisted,{signalLost:true})
 assert.deepEqual(Object.keys(persisted),['signalLost'])
 assert.equal((await frostgaleSignal(req({action:'anything',requestId:'request-post-signal'}),db)).status,405)
})
