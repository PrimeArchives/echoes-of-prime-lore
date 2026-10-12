import test from 'node:test'
import assert from 'node:assert/strict'
import {PLAYERS,CIRCUITS,PATHS,VERSION,config,fresh as initial,upgrade,act,settle,analyze,readiness} from '../worker/frostgale-engine.ts'
function fresh(now){const s=initial(now);act(s,null,true,{action:'release',phase:0},now);return s}
const command=(s,player,b,now=0)=>act(s,player,false,{phase:s.puzzles[player].phase,...b},now)
function solve(s,player,now=0){const p=s.puzzles[player],cfg=config(player,p.phase);for(let col=0;col<5;col++){command(s,player,{action:'toggle',circuit:CIRCUITS[col].id,on:false},now);for(let i=col;i<30;i+=5)if(!cfg.cells[i].damaged)while(p.rotations[i]!==cfg.solution[i])command(s,player,{action:'rotate',cell:i},now);command(s,player,{action:'toggle',circuit:CIRCUITS[col].id,on:true},now)}return cfg}
function release(s,phase,now=0){for(const player of PLAYERS)if(!s.puzzles[player].waiting){solve(s,player,now);command(s,player,{action:'advance'},now)}act(s,null,true,{action:'release',phase:phase+1},now)}
for(const player of PLAYERS)for(let phase=0;phase<3;phase++)test(player+' fase '+(phase+1)+': bereikbare route, kolomvoeding, controlepunten en relevante breuken',()=>{
 const s=fresh(0),p=s.puzzles[player];p.phase=phase;s.openedPhase=phase;p.rotations=config(player,phase).cells.map(c=>c.initial)
 const cfg=config(player,phase),a=analyze(cfg,p.rotations);assert.equal(a.valid,false);assert.equal(cfg.cells.length,30);assert.equal(cfg.checkpoints.length,phase+1)
 cfg.cells.forEach((c,i)=>assert.equal(c.motor,CIRCUITS[i%5].id))
 assert.throws(()=>command(s,player,{action:'rotate',cell:0}),/UIT/)
 solve(s,player);assert.equal(analyze(cfg,p.rotations).valid,true)
 assert.ok(analyze(cfg,p.rotations).active.length>=22)
 if(phase>0){const reversed={...cfg,checkpoints:[...cfg.checkpoints].reverse()};assert.equal(analyze(reversed,p.rotations).valid,false)}
 const noCheckpoint={...cfg,checkpoints:[cfg.cells.findIndex(c=>c.damaged)]};assert.equal(analyze(noCheckpoint,p.rotations).valid,false)
 const broken=cfg.cells.findIndex(c=>c.damaged);command(s,player,{action:'toggle',circuit:CIRCUITS[broken%5].id,on:false});assert.throws(()=>command(s,player,{action:'rotate',cell:broken}),/breuk/)
 let relevant=false
 for(const i of PATHS[PLAYERS.indexOf(player)*3+phase]){const original=p.rotations[i];for(let r=0;r<4;r++){p.rotations[i]=r;if(analyze(cfg,p.rotations).faults.length)relevant=true}p.rotations[i]=original}
 assert.equal(relevant,true)
})
test('onderhoudslimiet, vrijschakelen en herstel blijven mogelijk bij 0%',()=>{
 const s=fresh(0)
 command(s,'lumi',{action:'toggle',circuit:'heat',on:false});command(s,'lumi',{action:'toggle',circuit:'food',on:false});assert.throws(()=>command(s,'lumi',{action:'toggle',circuit:'medical',on:false}),/maximaal twee/)
 settle(s,300000);assert.equal(s.puzzles.lumi.conditions[0],0)
 assert.doesNotThrow(()=>command(s,'lumi',{action:'rotate',cell:0},300000))
 command(s,'lumi',{action:'toggle',circuit:'heat',on:true},300000);settle(s,375000);assert.equal(s.puzzles.lumi.conditions[0],100)
 assert.throws(()=>command(s,'lumi',{action:'rotate',cell:0},375000),/UIT/)
})
test('condities, hervatten, browserrefresh en incidentdeduplicatie',()=>{
 const s=fresh(0),p=s.puzzles.lumi,half=CIRCUITS[0].decay*500,quarterRecovery=CIRCUITS[0].recovery*250,t=half+quarterRecovery
 command(s,'lumi',{action:'toggle',circuit:'heat',on:false});settle(s,half);assert.equal(p.conditions[0],50)
 command(s,'lumi',{action:'toggle',circuit:'heat',on:true},half);settle(s,t);assert.equal(p.conditions[0],75)
 command(s,'lumi',{action:'toggle',circuit:'heat',on:false},t)
 act(s,null,true,{action:'pause'},t);settle(s,500000);assert.equal(p.conditions[0],75)
 act(s,null,true,{action:'resume'},500000);settle(s,500000+CIRCUITS[0].decay*750);assert.equal(p.conditions[0],0);assert.equal(p.incidents.length,1)
 settle(s,690000);assert.equal(p.incidents.length,1)
 const restored=JSON.parse(JSON.stringify(s));settle(restored,790000);assert.equal(restored.puzzles.lumi.incidents.length,1)
})
test('kalibratie vereist herstel; geen fases overslaan of oude acties herhalen',()=>{
 const s=fresh(0);solve(s,'lumi');const p=s.puzzles.lumi,empty=CIRCUITS[0].decay*1000,ready=empty+CIRCUITS[0].recovery*600
 command(s,'lumi',{action:'toggle',circuit:'heat',on:false});assert.throws(()=>command(s,'lumi',{action:'advance'}),/Herstel/)
 settle(s,empty);command(s,'lumi',{action:'toggle',circuit:'heat',on:true},empty);assert.throws(()=>command(s,'lumi',{action:'advance'},empty),/60%/)
 settle(s,ready);assert.equal(p.conditions[0],60);command(s,'lumi',{action:'advance'},ready)
 assert.equal(p.phase,0);assert.equal(p.waiting,true);assert.equal(p.history.length,1);release(s,0,ready);assert.equal(p.phase,1);assert.equal(p.waiting,false);assert.equal(analyze(config('lumi',1),p.rotations).valid,false)
 assert.throws(()=>command(s,'lumi',{action:'rotate',cell:0,phase:0},ready),/fase is gewijzigd/)
 assert.throws(()=>command(s,'lumi',{action:'complete'},ready))
})
for(const player of PLAYERS)test(player+': drie fases via werkelijke actieregels, eindreserve en wachtstand',()=>{
 const s=fresh(0),p=s.puzzles[player]
 for(let phase=0;phase<3;phase++){
  solve(s,player)
  if(phase<2){command(s,player,{action:'advance'});release(s,phase)}
  else{
   assert.throws(()=>command(s,player,{action:'complete'}),/3 PU/)
   command(s,player,{action:'toggle',circuit:'7g',on:false});command(s,player,{action:'toggle',circuit:'food',on:false});command(s,player,{action:'complete'})
  }
 }
 assert.equal(p.history.length,3);assert.equal(p.completed,true);assert.equal(readiness(s),1)
 const before=[...p.conditions];settle(s,1000000);assert.deepEqual(p.conditions,before)
 assert.throws(()=>command(s,player,{action:'rotate',cell:0},1000000),/vergrendeld/)
})
test('gezamenlijke hoofdrelay en DM-autorisatie',()=>{
 let s=fresh(0);assert.throws(()=>act(s,null,true,{action:'initialize'},0));assert.throws(()=>act(s,null,true,{action:'archives',lost:false},0),/hoofdrelay/);assert.throws(()=>command(s,'lumi',{action:'pause'}))
 for(let phase=0;phase<3;phase++){
  for(const player of PLAYERS){solve(s,player);if(phase<2)command(s,player,{action:'advance'});else{command(s,player,{action:'toggle',circuit:'7g',on:false});command(s,player,{action:'toggle',circuit:'food',on:false});command(s,player,{action:'complete'})}}
  if(phase<2)act(s,null,true,{action:'release',phase:phase+1},0)
 }
 assert.equal(readiness(s),4);assert.throws(()=>command(s,'lumi',{action:'initialize'}));act(s,null,true,{action:'initialize'},0);assert.equal(s.online,true)
 assert.throws(()=>command(s,'lumi',{action:'archives',lost:false}),/Architect/)
 act(s,null,true,{action:'archives',lost:false},0);assert.equal(s.archiveSignalLost,false)
 act(s,null,true,{action:'archives',lost:true},0);assert.equal(s.archiveSignalLost,true)
 act(s,null,true,{action:'archives',lost:false},0)
 act(s,null,true,{action:'reset',player:'venn'},1);assert.equal(s.online,false);assert.equal(s.archiveSignalLost,true);assert.equal(readiness(s),3);assert.equal(s.puzzles.venn.phase,0)
 s=act(s,null,true,{action:'resetAll'},2);assert.equal(readiness(s),0)
})
test('twaalf verschillende routes; expliciete upgrade bewaart oude toestand en accountkoppelingen',()=>{
 assert.equal(new Set(PATHS.map(p=>JSON.stringify(p))).size,12)
 const old={online:true,puzzles:{lumi:{userId:42,completed:true}}},s=upgrade(old,10)
 assert.equal(s.version,VERSION);assert.equal(s.puzzles.lumi.userId,42);assert.equal(s.online,false);assert.equal(s.previousVersion,old);assert.equal(s.puzzles.lumi.completed,false)
})

test('startslot blokkeert acties tot expliciete DM-vrijgave',()=>{
 const s=initial(0)
 assert.equal(s.openedPhase,-1)
 assert.throws(()=>command(s,'lumi',{action:'toggle',circuit:'heat',on:false}),/nog niet vrijgegeven/)
 assert.throws(()=>command(s,'lumi',{action:'release',phase:0}),/Architect/)
 act(s,null,true,{action:'release',phase:0},1000);assert.equal(s.openedPhase,0)
 assert.doesNotThrow(()=>command(s,'lumi',{action:'toggle',circuit:'heat',on:false},1000))
})
test('gezamenlijke eventpoort blijft dicht, wachtenden herstellen, DM geeft vrij',()=>{
 const s=fresh(0),p=s.puzzles.lumi;solve(s,'lumi');p.conditions[0]=60
 command(s,'lumi',{action:'advance'});assert.equal(p.waiting,true);assert.equal(p.phase,0)
 assert.throws(()=>command(s,'lumi',{action:'rotate',cell:0}),/vergrendeld/)
 assert.throws(()=>command(s,'lumi',{action:'toggle',circuit:'heat',on:false}),/vergrendeld/)
 assert.throws(()=>act(s,null,true,{action:'release',phase:1},0),/Alle vier/)
 settle(s,30000);assert.equal(p.conditions[0],100);assert.equal(p.waiting,true)
 const reload=JSON.parse(JSON.stringify(s));assert.equal(reload.puzzles.lumi.waiting,true)
 release(s,0,30000);assert.equal(s.openedPhase,1);assert.equal(s.releases.length,2)
 for(const player of PLAYERS){assert.equal(s.puzzles[player].phase,1);assert.equal(s.puzzles[player].waiting,false);assert.equal(analyze(config(player,1),s.puzzles[player].rotations).valid,false)}
 assert.throws(()=>act(s,null,true,{action:'release',phase:1},30000),/Alle vier/)
})
test('reset van één speler laat inhaalwerk toe zonder eerdere events opnieuw vrij te geven',()=>{
 const s=fresh(0);release(s,0);act(s,null,true,{action:'reset',player:'lumi'},0)
 assert.equal(s.openedPhase,1);assert.equal(s.puzzles.lumi.phase,0)
 solve(s,'lumi');command(s,'lumi',{action:'advance'});assert.equal(s.puzzles.lumi.phase,1);assert.equal(s.puzzles.lumi.waiting,false)
 solve(s,'lumi');command(s,'lumi',{action:'advance'});assert.equal(s.puzzles.lumi.waiting,true)
})
