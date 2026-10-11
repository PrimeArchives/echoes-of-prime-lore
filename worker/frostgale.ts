import {PLAYERS,CIRCUITS,config,fresh,settle,act,free,analyze,readiness,VERSION,upgrade,encounter} from './frostgale-engine'
const reply=(body:any,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})
export async function frostgale(request:Request,db:any,user:any):Promise<Response> {
 if(!user)return reply({error:'Log in met je bestaande PrimeOS-account.'},401)
 if(!['GET','POST'].includes(request.method))return reply({error:'Methode niet toegestaan.'},405)
 const dm=user.role==='architect'
 const username=String(user.username).trim().toLowerCase()
 if(!dm&&!PLAYERS.includes(username))return reply({error:'Dit account heeft geen Frostgale-toegang.'},403)
 let body:any=null
 if(request.method==='POST') {
  if(request.headers.get('Origin')!==new URL(request.url).origin)return reply({error:'Ongeldige herkomst.'},403)
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply({error:'JSON vereist.'},415)
  if(Number(request.headers.get('Content-Length')||0)>2048)return reply({error:'Verzoek te groot.'},413)
  try {const raw=await request.text();if(raw.length>2048)return reply({error:'Verzoek te groot.'},413);body=JSON.parse(raw)}catch{return reply({error:'Ongeldig verzoek.'},400)}
  if(!body||typeof body!=='object'||typeof body.requestId!=='string'||! /^[a-zA-Z0-9-]{10,80}$/.test(body.requestId))return reply({error:'Ongeldig verzoek.'},400)
 }
 try {
  await db.prepare('INSERT OR IGNORE INTO frostgale_relay (id,revision,state) VALUES (1,0,?)').bind(JSON.stringify(fresh(Date.now()))).run()
  for(let attempt=0;attempt<5;attempt++) {
   const row=await db.prepare('SELECT revision,state FROM frostgale_relay WHERE id=1').first()
   let state=JSON.parse(row.state);const now=Date.now()
   // Bind the authenticated database identity once. Request bodies cannot select a player.
   let player=PLAYERS.find(p=>state.puzzles[p].userId===user.id)||null
   if(!dm&&!player) {
    const p=state.puzzles[username]
    if(p.userId!==null&&p.userId!==user.id)return reply({error:'Accountkoppeling komt niet overeen. Neem contact op met de Architect.'},403)
    p.userId=user.id;player=username
   }
   if(state.version!==VERSION){
    if(body?.action==='upgrade'&&dm)state=upgrade(state,now)
    else if(body)return reply({error:'De Architect moet eerst de nieuwe puzzelversie activeren.'},403)
    else return reply({needsUpgrade:true,dm,player,version:VERSION,paused:true,online:state.online,readiness:0,progress:PLAYERS.map(player=>({player,completed:false})),puzzle:null,overview:null,circuits:CIRCUITS,serverTime:now,revision:row.revision})
   }
   settle(state,now)
   const requestKey=body?user.id+':'+body.requestId:null
   if(body&&!state.requests.includes(requestKey)) {
    try{state=act(state,player,dm,body,now);state.requests.push(requestKey);state.requests=state.requests.slice(-256)}catch(e){return reply({error:(e as Error).message},400)}
   }
   const result=await db.prepare('UPDATE frostgale_relay SET state=?,revision=revision+1 WHERE id=1 AND revision=?').bind(JSON.stringify(state),row.revision).run()
   if(!result.meta.changes)continue
   const present=(p:string)=>{const cfg=config(p,state.puzzles[p].phase);const {solution:_,...publicCfg}=cfg;const puzzle=state.puzzles[p];return {waiting:puzzle.waiting,nextReleased:puzzle.phase<state.openedPhase,phase:puzzle.phase,history:puzzle.history,config:publicCfg,rotations:puzzle.rotations,circuits:puzzle.circuits,conditions:puzzle.conditions,incidents:dm?puzzle.incidents:[],completed:puzzle.completed,free:free(puzzle),analysis:analyze(cfg,puzzle.rotations),last:puzzle.last}}
   return reply({needsUpgrade:false,started:state.openedPhase>=0,archiveSignalLost:state.archiveSignalLost??null,version:VERSION,revision:row.revision+1,serverTime:now,paused:state.paused,online:state.online,onlineAt:state.onlineAt,dm,player,circuits:CIRCUITS,readiness:readiness(state),encounter:encounter(state),progress:PLAYERS.map(p=>({player:p,completed:state.puzzles[p].completed,phase:state.puzzles[p].phase,waiting:state.puzzles[p].waiting})),puzzle:player&&state.openedPhase>=0?present(player):null,overview:dm?PLAYERS.map(p=>({player:p,...present(p)})):null})
  }
  return reply({error:'Console bezet. Probeer opnieuw.'},409)
 }catch {return reply({error:'Frostgale-opslag niet beschikbaar. Controleer de D1-migratie.'},503)}
}

// Public endpoint: only the presentation flag, never users, matrices or DM information.
export async function frostgaleSignal(request:Request,db:any):Promise<Response>{
 if(request.method!=='GET')return reply({error:'Methode niet toegestaan.'},405)
 try{
  const row=await db.prepare('SELECT state FROM frostgale_relay WHERE id=1').first()
  const state=row?JSON.parse(row.state):null
  return reply({signalLost:state?.version===VERSION&&typeof state.archiveSignalLost==='boolean'?state.archiveSignalLost:null})
 }catch{return reply({signalLost:null},503)}
}
