// Server-only: puzzle routes and solutions never belong in the static Quartz bundle.
export const VERSION = 22
export const PLAYERS = ['lumi', 'clav', 'dakka', 'venn']
export const PHASES = [
 {name:'Aanvoer herstellen',goal:'Verbind de bron via controlepunt A met het aanvoerstation.'},
 {name:'Verdeelnet herstellen',goal:'Verbind de bron via controlepunten A en B met het verdeelstation.'},
 {name:'Zender aansluiten',goal:'Verbind de bron via A, B en C met de zender en reserveer minimaal 3 PU.'},
]
export const CIRCUITS = [
 {id:'heat',name:'Woonverwarming',short:'WARMTE',pu:2,decay:45,recovery:30,warning:'Temperatuur daalt; bewoners zoeken beschutting.'},
 {id:'food',name:'Voedselbewaring',short:'VOEDSEL',pu:1,decay:60,recovery:35,warning:'Koelketen onderbroken; voedselvoorraad loopt risico.'},
 {id:'perimeter',name:'Perimeterbeveiliging',short:'PERIMETER',pu:1,decay:35,recovery:25,warning:'Buitensensoren vallen uit; blinde zones ontstaan.'},
 {id:'medical',name:'Medische post',short:'MEDISCH',pu:1,decay:40,recovery:25,warning:'Medische apparatuur verliest capaciteit.'},
 {id:'7g',name:'Circuit 7-G — BUITEN GEBRUIK',short:'7-G',pu:2,decay:50,recovery:35,warning:'Onverklaarde terugkoppeling. Bestemming onbekend.'},
]
const BASE = [[0,2],[0,1],[0,1,3]]
const STEP = [-5,1,5,-1]
export function ports(cell:any,rotation:number):number[] {return BASE[cell.shape].map(d=>(d+rotation)%4)}
function neighbor(i:number,d:number) {const j=i+STEP[d];return j>=0&&j<30&&!(d===1&&i%5===4)&&!(d===3&&i%5===0)?j:-1}
function direction(a:number,b:number) {return a-b===5?0:b-a===1?1:b-a===5?2:3}
export const PATHS:number[][] = [[0, 5, 10, 15, 20, 21, 16, 17, 18, 13, 12, 11, 6, 1, 2, 3, 8, 9, 14, 19, 24, 29], [0, 1, 6, 11, 12, 17, 16, 21, 20, 25, 26, 27, 28, 23, 18, 13, 8, 9, 14, 19, 24, 29], [0, 1, 2, 3, 8, 13, 12, 11, 16, 21, 20, 25, 26, 27, 22, 17, 18, 19, 24, 23, 28, 29], [0, 1, 2, 7, 8, 9, 14, 13, 18, 17, 12, 11, 6, 5, 10, 15, 16, 21, 26, 27, 28, 29], [0, 1, 6, 5, 10, 11, 12, 17, 16, 15, 20, 21, 22, 27, 28, 23, 18, 13, 14, 19, 24, 29], [0, 5, 10, 11, 6, 1, 2, 7, 12, 13, 18, 23, 22, 21, 16, 15, 20, 25, 26, 27, 28, 29], [0, 5, 6, 7, 12, 17, 16, 11, 10, 15, 20, 21, 26, 27, 28, 23, 18, 13, 14, 19, 24, 29], [0, 5, 6, 7, 12, 13, 8, 9, 14, 19, 24, 23, 18, 17, 16, 11, 10, 15, 20, 21, 22, 27, 28, 29], [0, 5, 6, 7, 2, 3, 8, 9, 14, 13, 12, 11, 10, 15, 16, 21, 22, 17, 18, 19, 24, 23, 28, 29], [0, 5, 10, 15, 16, 21, 26, 27, 22, 17, 18, 13, 12, 11, 6, 1, 2, 7, 8, 9, 14, 19, 24, 29], [0, 1, 2, 7, 6, 11, 10, 15, 20, 21, 26, 27, 28, 23, 22, 17, 12, 13, 18, 19, 24, 29], [0, 5, 6, 1, 2, 7, 8, 3, 4, 9, 14, 13, 12, 17, 18, 19, 24, 23, 22, 27, 28, 29]]
export function config(player:string,phase=0) {
 const k=PLAYERS.indexOf(player)
 if(k<0||!Number.isInteger(phase)||phase<0||phase>2)throw Error('Onbekend subsystem of fase.')
 const path=PATHS[k*3+phase]
 let seed=9817+k*381+phase*1127
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed}
 const cells=Array.from({length:30},(_,i)=>({shape:random()%3,motor:CIRCUITS[i%5].id,damaged:false,initial:random()%4}))
 const solution=cells.map(c=>c.initial)
 path.forEach((i,n)=>{
  const ds=[n?direction(i,path[n-1]):3,n===path.length-1?1:direction(i,path[n+1])]
  cells[i].shape=ds[0]%2===ds[1]%2?0:1
  solution[i]=[0,1,2,3].find(r=>ds.every(d=>ports(cells[i],r).includes(d)))!
  cells[i].initial=(solution[i]+(random()>>>12)%4)%4
 })
 // Place real hazards at plausible wrong turns, while leaving the known route intact.
 const hazards:number[]=[]
 path.forEach((i,n)=>{
  const incoming=n?direction(i,path[n-1]):3
  for(let r=0;r<4;r++)for(const d of ports(cells[i],r)){
   const j=neighbor(i,d)
   if(ports(cells[i],r).includes(incoming)&&j>=0&&!path.includes(j)&&!hazards.includes(j))hazards.push(j)
  }
 })
 for(const j of hazards.slice(0,3))cells[j].damaged=true
 if(!hazards.length)throw Error('Configuratie zonder relevante beschadiging.')
 // Guarantee a broken inlet in the initial layout, without using a uniform scramble.
 if(ports(cells[0],cells[0].initial).includes(3))cells[0].initial=[0,1,2,3].find(r=>!ports(cells[0],r).includes(3))!
 const checkpoints=Array.from({length:phase+1},(_,j)=>path[Math.floor((j+1)*path.length/(phase+2))])
 if(k===1&&phase===0)checkpoints[0]=9
 return {player,phase,phaseName:PHASES[phase].name,goal:PHASES[phase].goal,rows:6,cols:5,source:0,target:29,sourcePort:3,targetPort:1,checkpoints,cells,solution}
}
export function analyze(cfg:any,rotations:number[]) {
 const active=new Set<number>(),faults=new Set<number>(),breaks:any[]=[],queue:number[]=[]
 if(ports(cfg.cells[cfg.source],rotations[cfg.source]).includes(cfg.sourcePort)){active.add(cfg.source);queue.push(cfg.source)}
 while(queue.length){
  const i=queue.shift()!
  for(const d of ports(cfg.cells[i],rotations[i])){
   if((i===cfg.source&&d===cfg.sourcePort)||(i===cfg.target&&d===cfg.targetPort))continue
   const j=neighbor(i,d)
   if(j<0){breaks.push({i,d});continue}
   if(cfg.cells[j].damaged){faults.add(j);continue}
   if(!ports(cfg.cells[j],rotations[j]).includes((d+2)%4)){breaks.push({i,d});continue}
   if(!active.has(j)){active.add(j);queue.push(j)}
  }
 }
 const checkpoints=cfg.checkpoints.map((i:number)=>active.has(i))
 const output=active.has(cfg.target)&&ports(cfg.cells[cfg.target],rotations[cfg.target]).includes(cfg.targetPort)
 // Checkpoints must lie on one continuous path in order, not on unrelated branches.
 let searches=0
 function waypointPath(i:number,visited:Set<number>,next:number):boolean{
  if(++searches>20000)return false
  const cp=cfg.checkpoints.indexOf(i)
  if(cp>=0){if(cp!==next)return false;next++}
  if(i===cfg.target)return next===cfg.checkpoints.length&&ports(cfg.cells[i],rotations[i]).includes(cfg.targetPort)
  for(const d of ports(cfg.cells[i],rotations[i])){
   const j=neighbor(i,d)
   if(j<0||visited.has(j)||cfg.cells[j].damaged||!active.has(j)||!ports(cfg.cells[j],rotations[j]).includes((d+2)%4))continue
   visited.add(j);if(waypointPath(j,visited,next))return true;visited.delete(j)
  }
  return false
 }
 const waypointRoute=output&&checkpoints.every(Boolean)&&waypointPath(cfg.source,new Set([cfg.source]),0)
 return {active:[...active],faults:[...faults],breaks,checkpoints,output,waypointRoute,valid:waypointRoute&&!faults.size}
}
export function fresh(now:number) {
 return {version:VERSION,archiveSignalLost:null as boolean|null,openedPhase:-1,releases:[] as any[],paused:false,online:false,onlineAt:null as number|null,requests:[] as string[],puzzles:Object.fromEntries(PLAYERS.map(player=>[player,{userId:null as number|null,phase:0,waiting:false,history:[] as any[],rotations:config(player).cells.map(c=>c.initial),circuits:CIRCUITS.map(()=>true),conditions:CIRCUITS.map(()=>100),incidents:[] as any[],last:now,completed:false,completedAt:null as number|null}]))}
}
export function upgrade(old:any,now:number) {
 const s:any=fresh(now)
 for(const player of PLAYERS)s.puzzles[player].userId=old.puzzles?.[player]?.userId??null
 s.archiveSignalLost=true
 s.previousVersion=old
 return s
}
export function settle(state:any,now:number){
 for(const player of PLAYERS){
  const p=state.puzzles[player],elapsed=Math.max(0,(now-p.last)/1000)
  if(state.openedPhase>=0&&!state.paused&&!p.completed&&!state.online)CIRCUITS.forEach((c,k)=>{
   const before=p.conditions[k],after=Math.max(0,Math.min(100,before+elapsed*(p.circuits[k]?100/c.recovery:-100/c.decay)))
   if(before>0&&after===0)p.incidents.push({circuit:c.id,at:p.last+before*c.decay*10,message:c.warning,phase:p.phase})
   p.conditions[k]=after
  })
  p.last=now
 }
 return state
}
export function free(p:any){return CIRCUITS.reduce((sum,c,k)=>sum+(p.circuits[k]?0:c.pu),0)}
export function readiness(s:any){return PLAYERS.filter(player=>{const p=s.puzzles[player];return p.phase===2&&p.history.length===3&&p.completed&&free(p)>=3&&analyze(config(player,2),p.rotations).valid}).length}
export function encounter(s:any){
 if(s.openedPhase<0)return {phase:-1,nextPhase:0,waiting:[] as string[],ready:true}
 const waiting=PLAYERS.filter(player=>s.puzzles[player].waiting&&s.puzzles[player].phase===s.openedPhase)
 return {phase:s.openedPhase,nextPhase:s.openedPhase<2?s.openedPhase+1:null,waiting,ready:s.openedPhase<2&&waiting.length===4}
}
export function act(s:any,player:string|null,dm:boolean,b:any,now:number){
 settle(s,now)
 if(['pause','resume','reset','resetAll','initialize','upgrade','release','archives'].includes(b.action)){
  if(!dm)throw Error('Alleen de Architect mag deze actie uitvoeren.')
  if(b.action==='pause')s.paused=true
  if(b.action==='resume')s.paused=false
  if(b.action==='upgrade')return s
  if(b.action==='archives'){
   if(typeof b.lost!=='boolean')throw Error('Ongeldige archiefstatus.')
   if(!b.lost&&(!s.online||readiness(s)!==4))throw Error('Initialiseer eerst de hoofdrelay voordat Archives wordt hersteld.')
   s.archiveSignalLost=b.lost
  }
  if(b.action==='release'){
   const gate=encounter(s)
   if(!gate.ready||b.phase!==gate.nextPhase)throw Error('Alle vier spelers moeten de huidige fase afronden voordat de volgende kan worden vrijgegeven.')
   if(gate.nextPhase===0){s.openedPhase=0;s.releases.push({phase:0,at:now});return s}
   for(const name of PLAYERS){
    const p=s.puzzles[name]
    if(p.history.length!==s.openedPhase+1||!analyze(config(name,p.phase),p.rotations).valid||!p.circuits.every(Boolean))throw Error('De opgeslagen fasekalibraties zijn niet geldig.')
   }
   s.openedPhase++
   s.releases.push({phase:s.openedPhase,at:now})
   for(const name of PLAYERS){const p=s.puzzles[name];p.phase=s.openedPhase;p.waiting=false;p.rotations=config(name,p.phase).cells.map(c=>c.initial)}
  }
  if(b.action==='resetAll'){const reset:any=fresh(now);for(const p of PLAYERS)reset.puzzles[p].userId=s.puzzles[p].userId;reset.previousVersion=s.previousVersion;reset.archiveSignalLost=true;return reset}
  if(b.action==='reset'){
   if(!PLAYERS.includes(b.player))throw Error('Onbekend subsystem.')
   const id=s.puzzles[b.player].userId;s.puzzles[b.player]=fresh(now).puzzles[b.player];s.puzzles[b.player].userId=id;s.online=false;s.onlineAt=null;s.archiveSignalLost=true
  }
  if(b.action==='initialize'){if(readiness(s)!==4)throw Error('Alle vier subsystemen moeten alle drie fases voltooien.');s.online=true;s.onlineAt??=now}
  return s
 }
 if(!player)throw Error('Dit account heeft geen spelersmatrix.')
 if(s.openedPhase<0)throw Error('De Architect heeft fase 1 nog niet vrijgegeven.')
 const p=s.puzzles[player],cfg=config(player,p.phase)
 if(s.paused||s.online||p.completed||p.waiting)throw Error('Subsystem vergrendeld: pauze, voltooiing of externe interventie.')
 if(b.phase!==p.phase)throw Error('Deze fase is gewijzigd. Vernieuw de console en probeer opnieuw.')
 if(b.action==='rotate'){
  if(!Number.isInteger(b.cell)||b.cell<0||b.cell>=30)throw Error('Ongeldig knooppunt.')
  const c=cfg.cells[b.cell],column=b.cell%5
  if(c.damaged)throw Error('Fysieke leidingbreuk. Zoek een omweg.')
  if(p.circuits[column])throw Error('Kolom onder spanning. Schakel '+CIRCUITS[column].name+' UIT voor onderhoud.')
  p.rotations[b.cell]=(p.rotations[b.cell]+1)%4
 }else if(b.action==='toggle'){
  const k=CIRCUITS.findIndex(c=>c.id===b.circuit)
  if(k<0||typeof b.on!=='boolean')throw Error('Ongeldige schakelstand.')
  if(!b.on&&p.circuits[k]&&p.circuits.filter((on:boolean)=>!on).length>=2)throw Error('Onderhoudsbus vol: maximaal twee kolommen tegelijk vrijschakelen. Herstel eerst een circuit.')
  p.circuits[k]=b.on
 }else if(b.action==='advance'||b.action==='complete'){
  if(!analyze(cfg,p.rotations).valid)throw Error('Verbind bron, alle controlepunten en uitgang zonder beschadigde leiding.')
  if(p.phase<2){
   if(b.action!=='advance')throw Error('Voltooi eerst de aanvoer en het verdeelnet.')
   if(!p.circuits.every(Boolean)||p.conditions.some((v:number)=>v<60))throw Error('Herstel alle circuits en laat elke conditie minimaal 60% bereiken voor fasekalibratie.')
   p.history.push({phase:p.phase,at:now})
   if(p.phase<s.openedPhase){p.phase++;p.rotations=config(player,p.phase).cells.map(c=>c.initial)}
   else p.waiting=true
  }else{
   if(b.action!=='complete'||free(p)<3)throw Error('De eindfase vereist minstens 3 PU vrij vermogen.')
   p.history.push({phase:2,at:now});p.completed=true;p.completedAt=now
  }
 }else throw Error('Onbekende actie.')
 return s
}
