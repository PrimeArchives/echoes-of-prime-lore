import { QuartzComponent } from "../../types"
import PrimeAuth from "../PrimeAuth"

const css = String.raw`
.fr{--cyan:#69f9e1;--violet:#bb94ff;--amber:#ffcb70;--red:#ff657c;background:#030e19;color:#daf9f2;font-family:var(--codeFont,monospace);padding:18px;min-height:75vh;position:relative;isolation:isolate;overflow:hidden}.fr *{box-sizing:border-box}.fr [hidden]{display:none!important}.fr:before{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent 0 3px,#67ffd908 3px 4px);z-index:-1}.fr-rain{position:absolute;inset:0;overflow:hidden;pointer-events:none;opacity:.12;z-index:-1;display:flex;justify-content:space-around}.fr-rain span{writing-mode:vertical-rl;color:#74ff98;letter-spacing:12px;animation:fr-fall 18s linear infinite;transform:translateY(-100%)}.fr-rain span:nth-child(2n){animation-delay:-7s}.fr-rain span:nth-child(3n){animation-delay:-13s}@keyframes fr-fall{to{transform:translateY(120vh)}}.fr-wrap{max-width:1000px;margin:auto}.fr h2{font-size:clamp(23px,5vw,38px);color:#dffff3;text-shadow:0 0 25px #5bffd34d;margin:10px 0}.fr h3{font-size:15px;color:var(--cyan);margin:0 0 12px}.fr p{font-size:12px;line-height:1.7}.fr small{font-size:11px;color:#a4c9c9}.fr-kicker{color:var(--cyan);font-size:11px;letter-spacing:.12em}.fr-panel{background:#0b1c2de8;border:1px solid #285064;border-radius:10px;padding:16px;margin:12px 0;box-shadow:inset 0 1px 0 #ffffff08}.fr-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.fr-summary>div{border:1px solid #275264;padding:12px;background:#061725}.fr-summary strong{display:block;font-size:22px;color:var(--cyan)}.fr-layout{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:14px}.fr button{font:inherit;cursor:pointer;min-height:44px;color:var(--cyan);border:1px solid #35796e;background:#102f35;border-radius:6px;padding:10px}.fr button:hover{background:#18504a}.fr button:disabled{opacity:.55;cursor:default}.fr button:focus-visible{outline:3px solid var(--violet);outline-offset:2px}.fr-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;margin:14px 0}.fr-grid button{position:relative;aspect-ratio:1;padding:0;min-height:44px;min-width:0;background:#06121e;border-color:#2a4054;touch-action:manipulation}.fr-grid svg{width:100%;height:100%;display:block}.fr-grid button[data-live="true"]{border-color:var(--cyan);box-shadow:0 0 12px #69f9e120;background:#10372f}.fr-grid button[data-lock="true"]{border-style:dashed;border-color:var(--amber)}.fr-grid button[data-broken="true"]{border-color:var(--red);background:#351323}.fr-grid em{position:absolute;bottom:2px;right:3px;font:9px monospace;color:#c6d9df}.fr-grid b{position:absolute;top:2px;right:3px;font-size:10px;color:var(--amber)}.fr-grid button[data-selected="true"]{outline:2px solid var(--violet);outline-offset:1px}.fr:has(.prime-auth__panel:not([hidden])){overflow:visible}.fr-circuit{padding:12px 0;border-bottom:1px solid #274252;display:grid;grid-template-columns:1fr auto;gap:6px}.fr-circuit strong{font-size:12px}.fr-circuit small{display:block;margin-top:5px}.fr-circuit meter{width:100%;height:13px;grid-column:1/-1}.fr-circuit meter::-webkit-meter-bar{background:#142631;border:0}.fr-circuit meter::-webkit-meter-optimum-value{background:#69f9e1}.fr-circuit meter::-webkit-meter-suboptimum-value{background:#ffcb70}.fr-circuit meter::-webkit-meter-even-less-good-value{background:#ff657c}.fr-diagnosis{border-left:3px solid var(--violet);padding:10px;background:#17203b;line-height:1.65;font-size:12px;margin:10px 0}.fr-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.fr-progress{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:10px}.fr-progress span{border:1px solid #365269;font-size:11px;text-align:center;padding:10px 2px}.fr-progress span[data-done="true"]{color:var(--cyan);border-color:var(--cyan);background:#0c352f}.fr-error{color:#ffcb70;min-height:24px;font-size:12px;line-height:1.6}.fr-log{max-height:180px;overflow:auto;white-space:pre-wrap;font-size:11px;color:#96d3b6;background:#030c13;padding:12px}.fr-status{color:var(--amber)}.fr legend{font-size:11px}.fr-dm details{padding:12px;border:1px solid #38556a;margin:8px 0}.fr-dm summary{cursor:pointer;min-height:44px;color:var(--violet)}.fr-source{display:flex;justify-content:space-between;font-size:11px;color:var(--cyan)}@media(max-width:720px){.fr-layout{grid-template-columns:1fr}.fr{padding:10px}.fr-summary>div{padding:9px 5px}.fr-summary strong{font-size:18px}.fr-panel{padding:12px}}@media(prefers-reduced-motion:reduce){.fr-rain{display:none}.fr *{animation:none!important}}
.fr-columns{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}.fr-columns button{padding:8px 2px;font-size:9px;line-height:1.6;min-height:65px;overflow-wrap:anywhere}.fr-columns button[data-off="true"]{border-color:var(--amber);color:var(--amber);background:#352f16}.fr-grid{margin-top:5px}.fr-grid button[data-lock="true"]{border-style:solid;border-color:#476074}.fr-grid button[data-free="true"]{border-color:var(--amber);border-style:dashed}.fr-grid button[data-endpoint="true"]{outline:2px solid var(--violet);outline-offset:0}.fr-grid .fr-marker{left:3px;right:auto;color:var(--violet);font-size:12px}.fr-phase-track{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.fr-phase-track span{font-size:11px;border:1px solid #385269;padding:10px}.fr-phase-track span[data-current="true"]{border-color:var(--violet);color:var(--violet)}.fr-phase-track span[data-done="true"]{border-color:var(--cyan);color:var(--cyan)}.fr-checkpoints{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;margin:12px 0}.fr-checkpoints span{padding:7px;border:1px solid #46606d;color:#aac0cf}.fr-checkpoints span[data-live="true"]{color:var(--cyan);border-color:var(--cyan)}.fr-source{padding:10px;background:#1e2440;border-left:3px solid var(--violet);font-size:12px;line-height:1.6}.fr-source--target{justify-content:flex-end;border-left:0;border-right:3px solid var(--violet)}.fr-goal{font-size:14px!important;color:var(--violet)}
`

export const interactiveAfterDOMLoaded = String.raw`
;(() => {
 if(window.__frostgale22)return;window.__frostgale22=true;
 const labels={lumi:'Lumi',clav:'Clavator',dakka:'Dakka',venn:'Venn'};
 const phases=['Aanvoer','Verdeelnet','Zender'];
 const base=[[0,2],[0,1],[0,1,3]],coords=[[50,0],[100,50],[50,100],[0,50]];
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function mount(root){
  if(root.dataset.mounted)return;root.dataset.mounted='1';
  let data=null,busy=false,authVersion=0,selected=null,disposed=false,polling=false;
  const q=s=>root.querySelector(s),msg=q('[data-fr-error]');
  const unlocked=p=>p.circuits.filter(on=>!on).length;
  function view(){
   if(!data)return;
   q('[data-fr-content]').hidden=false;
   q('[data-fr-upgrade]').hidden=!data.needsUpgrade;
   q('[data-fr-upgrade-button]').hidden=!data.dm;
   q('[data-fr-main]').hidden=!!data.needsUpgrade;
   if(data.needsUpgrade)return;
   q('[data-fr-not-started]').hidden=data.started||data.dm;
   q('[data-fr-readiness]').textContent=data.readiness+'/4';
   q('[data-fr-relay]').textContent=data.online?'ONLINE':data.readiness===4?'GEREED':'OFFLINE';
   q('[data-fr-signal]').textContent=data.online?'HERSTELD':'GEEN SIGNAAL';
   q('[data-fr-pause]').textContent=data.paused?'TIMERS GEPAUZEERD':'ONDERHOUDSCONSOLE ACTIEF';
   q('[data-fr-progress]').innerHTML=data.progress.map(p=>'<span data-done="'+p.completed+'">'+labels[p.player]+'<br>'+(p.completed?'Gereed':p.waiting?'Wacht op event':'Fase '+(p.phase+1))+'</span>').join('');
   q('[data-fr-player]').hidden=!data.puzzle;q('[data-fr-dm]').hidden=!data.dm;
   const p=data.puzzle;
   if(p){
    const a=p.analysis,cfg=p.config,locked=data.paused||p.completed||p.waiting||data.online;
    q('[data-fr-name]').textContent=labels[data.player]+' // FASE '+(p.phase+1)+' VAN 3';
    q('[data-fr-phase-name]').textContent=cfg.phaseName;
    q('[data-fr-goal]').textContent=cfg.goal;
    q('[data-fr-waiting]').hidden=!p.waiting;
    q('[data-fr-wait-text]').textContent=p.phase===0?'AANVOER HERSTELD — externe beveiliging reageert niet. Handmatige interventie vereist bij verdeelstation F-02.':'VERDEELNET HERSTELD — externe antennekoppeling geblokkeerd. Handmatige interventie vereist aan de zendtoren.';
    q('[data-fr-wait-progress]').textContent='Spelers gereed voor interventie: '+data.encounter.waiting.length+'/4. Alleen de Architect kan de volgende fase vrijgeven. Alle voorzieningen staan aan en herstellen.';
    q('[data-fr-free]').textContent=p.free+' PU vrij · '+unlocked(p)+'/2 kolommen in onderhoud';
    q('[data-fr-phase-track]').innerHTML=phases.map((name,i)=>'<span data-current="'+(i===p.phase)+'" data-done="'+(i<p.phase||p.completed||i===p.phase&&p.waiting)+'">'+(i+1)+' · '+name+'</span>').join('');
    q('[data-fr-columns]').innerHTML=data.circuits.map((c,k)=>'<button type="button" data-circuit="'+c.id+'" data-off="'+!p.circuits[k]+'" '+(busy||locked||p.circuits[k]&&unlocked(p)>=2?'disabled':'')+' aria-label="Kolom '+(k+1)+': '+esc(c.name)+' '+(p.circuits[k]?'uitschakelen':'herstellen')+'">'+esc(c.short)+'<br>'+(p.circuits[k]?'AAN · 🔒':'UIT · ↻')+'<br>'+Math.round(p.conditions[k])+'%</button>').join('');
    q('[data-fr-grid]').innerHTML=cfg.cells.map((c,i)=>{
     const live=a.active.includes(i),bad=c.damaged,col=i%5,lock=p.circuits[col]||locked;
     const color=bad?'#ff657c':live?'#69f9e1':'#567086';
     const ps=base[c.shape].map(d=>(d+p.rotations[i])%4);
     const pipes=ps.map(d=>'<line x1="50" y1="50" x2="'+coords[d][0]+'" y2="'+coords[d][1]+'" stroke="'+color+'" stroke-width="10"/>').join('');
     const breaks=a.breaks.filter(b=>b.i===i).map(b=>'<circle cx="'+(50+(coords[b.d][0]-50)*.8)+'" cy="'+(50+(coords[b.d][1]-50)*.8)+'" r="6" fill="#ffcb70"/>').join('');
     const point=cfg.checkpoints.indexOf(i),marker=i===cfg.source?'→ BRON':i===cfg.target?'UIT →':point>=0?'◆ '+String.fromCharCode(65+point):'';
     return '<button type="button" data-cell="'+i+'" data-live="'+live+'" data-lock="'+lock+'" data-free="'+(!lock&&!bad)+'" data-broken="'+bad+'" data-endpoint="'+(i===cfg.source||i===cfg.target)+'" data-selected="'+(selected===i)+'" aria-label="Knooppunt J-'+(i+1)+', kolom '+(col+1)+', '+(bad?'beschadigd':lock?'vergrendeld':'draaibaar')+'"><svg viewBox="0 0 100 100" aria-hidden="true">'+pipes+'<circle cx="50" cy="50" r="7" fill="'+color+'"/>'+breaks+(bad?'<path d="M30 30L70 70M70 30L30 70" stroke="#ff657c" stroke-width="5"/>':'')+'</svg><b class="fr-marker">'+marker+'</b><b>'+(lock?'🔒':'↻')+'</b><em>J-'+(i+1)+'</em></button>';
    }).join('');
    q('[data-fr-checkpoints]').innerHTML=cfg.checkpoints.map((i,k)=>'<span data-live="'+a.checkpoints[k]+'">◆ '+String.fromCharCode(65+k)+' · J-'+(i+1)+' · '+(a.checkpoints[k]?'BEREIKT':'GEEN STROOM')+'</span>').join('');
    q('[data-fr-circuits]').innerHTML=data.circuits.map((c,k)=>{
     const v=p.conditions[k],on=p.circuits[k],status=v<=20?'KRITIEK':!on?'RISICO':v<99.9?'HERSTELLEND':'STABIEL';
     const seconds=on?Math.ceil((100-v)*c.recovery/100):Math.ceil(v*c.decay/100);
     return '<div class="fr-circuit"><div><strong>Kolom '+(k+1)+' · '+esc(c.name)+'</strong><small>'+c.pu+' PU · '+Math.round(v)+'% · '+status+'</small><small>'+(on?'Onder spanning: draaien geblokkeerd.':'Vrijgeschakeld: draaien mogelijk. '+seconds+' s tot 0%.')+'</small><small>'+(v<50?esc(c.warning):on&&v<100?'Vol herstel over ongeveer '+seconds+' s.':c.id==='7g'?'Bestemming onbekend; toch actief verbruik.':'Voorziening functioneert normaal.')+'</small></div><button type="button" data-circuit="'+c.id+'" '+(locked||busy||on&&unlocked(p)>=2?'disabled':'')+'>'+(on?'VRIJSCHAKELEN':'HERSTELLEN')+'</button><meter min="0" max="100" low="50" high="80" optimum="100" value="'+v+'" aria-label="Conditie '+esc(c.name)+'"></meter></div>';
    }).join('');
    q('[data-fr-route]').textContent=a.valid?'Route compleet: bron, controlepunten en uitgang zijn verbonden.':a.faults.length?'Stroom bereikt een rode leidingbreuk. Draai de aanvoer weg.':!a.active.length?'Begin linksboven bij J-01: verbind de ingang aan de linkerkant.':a.output&&!a.checkpoints.every(Boolean)?'Uitgang bereikt, maar nog niet alle controlepunten. Kies een route via de gemarkeerde punten.':a.output&&!a.waypointRoute?'De controlepunten krijgen stroom, maar liggen nog niet op één route in de volgorde A → B → C. Herleid de verbinding.':'Volg de cyan stroom. Amber punten tonen onderbrekingen; draai een vrijgeschakelde kolom om verder te komen.';
    const detail=q('[data-fr-detail]'),unlock=q('[data-fr-unlock]');unlock.hidden=true;
    if(selected!==null){
     const c=cfg.cells[selected],k=selected%5;
     detail.textContent='J-'+(selected+1)+' · Kolom '+(k+1)+' · '+data.circuits[k].name+' · '+(c.damaged?'Fysieke breuk: zoek een omweg.':locked?'Console vergrendeld.':p.circuits[k]?'Onder spanning. Schakel dit circuit UIT om de hele kolom te kunnen draaien.':'Vrijgeschakeld. Iedere tik draait 90° rechtsom.');
     if(p.circuits[k]&&!c.damaged&&!locked){unlock.hidden=false;unlock.dataset.circuit=data.circuits[k].id;unlock.textContent='SCHAKEL KOLOM '+(k+1)+' VRIJ';unlock.disabled=busy||unlocked(p)>=2;}
    }else detail.textContent='Tik op een tegel. Is de kolom vergrendeld? Schakel boven het raster het bijbehorende circuit UIT.';
    const restored=p.circuits.every(Boolean)&&p.conditions.every(v=>v>=60);
    q('[data-fr-requirements]').textContent=p.waiting?'Fasekalibratie opgeslagen. Wacht op externe interventie; voorzieningen herstellen.':p.completed?'Alle drie fases afgerond. Reserve gebufferd; jouw timers staan stil.':p.phase<2?'Kalibratie vereist: geldige route, alle circuits AAN en alle condities ≥60%.':'Eindfase vereist: geldige route en minstens 3 PU vrij vermogen.';
    q('[data-fr-complete]').disabled=busy||locked||!a.valid||(p.phase<2?!restored:p.free<3);
    q('[data-fr-complete]').textContent=p.waiting?'WACHTEN OP EXTERNE INTERVENTIE':p.completed?'SUBSYSTEM GEREED':p.phase<2?p.nextReleased?'KALIBREER EN OPEN FASE '+(p.phase+2):'ROND FASE '+(p.phase+1)+' AF':'VERGRENDEL SUBSYSTEM';
   }
   if(data.dm){
    const gate=data.encounter;
    q('[data-fr-encounter-title]').textContent=gate.phase<0?'SESSIESTART — CONSOLE NOG VERGRENDELD':gate.phase===0?'TUSSENMOMENT 1 — VERDEELSTATION F-02':gate.phase===1?'TUSSENMOMENT 2 — EXTERNE ANTENNEKOPPELING':'ALLE VERHAALBLOKKADES VRIJGEGEVEN';
    q('[data-fr-encounter-status]').textContent=gate.phase<0?'Spelers kunnen inloggen, maar krijgen nog geen matrix. Geef fase 1 vrij zodra de sessie begint.':gate.nextPhase===null?'Laat de spelers de eindfase voltooien.':gate.waiting.length+'/4 spelers klaar. '+(gate.ready?'Speel de gezamenlijke scène. Geef daarna de volgende fase vrij.':'Wacht totdat alle vier deze fase hebben afgerond.');
    const release=q('[data-fr-release]');release.hidden=gate.nextPhase===null;release.disabled=busy||!gate.ready;release.dataset.phase=gate.nextPhase;release.textContent='GEEF FASE '+(gate.nextPhase+1)+' VRIJ';
    const openPanels=[...q('[data-fr-dm-list]').querySelectorAll('details')].map(d=>d.open);
    q('[data-fr-dm-list]').innerHTML=data.overview.map(p=>'<details><summary>'+labels[p.player]+' · Fase '+(p.phase+1)+'/3 · '+(p.completed?'GEREED':p.waiting?'WACHT OP EXTERNE INTERVENTIE':'IN UITVOERING')+'</summary><p>'+p.analysis.active.length+'/30 knooppunten onder spanning · '+(p.analysis.valid?'Route verbonden':'Route onderbroken')+' · '+p.free+' PU vrij</p>'+data.circuits.map((c,k)=>'<p>Kolom '+(k+1)+' · '+esc(c.short)+': '+Math.round(p.conditions[k])+'% · '+(p.circuits[k]?'AAN / VERGRENDELD':'UIT / ONDERHOUD')+'</p>').join('')+'<pre class="fr-log">'+esc(p.incidents.length?p.incidents.map(e=>new Date(e.at).toLocaleString('nl-NL')+' · Fase '+(e.phase+1)+' · '+e.message).join('\n'):'Geen kritieke incidenten geregistreerd.')+'</pre><button data-reset="'+p.player+'">Reset '+labels[p.player]+'</button></details>').join('');
    q('[data-fr-dm-list]').querySelectorAll('details').forEach((d,i)=>d.open=!!openPanels[i]);
    q('[data-fr-pause-btn]').textContent=data.paused?'HERVAT TIMERS':'PAUZEER TIMERS';
    q('[data-fr-initialize]').disabled=busy||data.readiness!==4||data.online;
    const archives=q('[data-fr-archives]');archives.dataset.lost=String(data.archiveSignalLost===false);archives.textContent=data.archiveSignalLost===false?'ZET ARCHIVES OP SIGNAL LOST':'HERSTEL ARCHIVES-VERBINDING';archives.disabled=busy||data.archiveSignalLost!==false&&!data.online;
   }
  }
  async function refresh(){if(disposed||busy||polling)return;polling=true;const version=authVersion;try{const r=await fetch('/api/frostgale',{credentials:'same-origin',cache:'no-store'});const d=await r.json();if(disposed||version!==authVersion)return;if(!r.ok){data=null;q('[data-fr-content]').hidden=true;msg.textContent=d.error;return;}if(!data||d.revision>=data.revision)data=d;view();}catch{if(!disposed)msg.textContent='Geen verbinding. Wijzigingen gelden pas na serverbevestiging.';}finally{polling=false;}}
  async function send(action,extra={}){if(busy||!data)return;const version=authVersion;busy=true;view();try{const r=await fetch('/api/frostgale',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,phase:data.puzzle?.phase,requestId:crypto.randomUUID(),...extra})});const d=await r.json();if(disposed||version!==authVersion)return;if(!r.ok)throw Error(d.error);data=d;if(action==='advance'||action==='upgrade')selected=null;msg.textContent='✓ '+({rotate:'Tegel gedraaid',toggle:'Kolomschakelaar bijgewerkt',advance:'Kalibratie opgeslagen. Controleer de fase-status.' ,archives:'Archives-verbindingsstatus opgeslagen voor alle bezoekers.',release:'Externe interventie bevestigd. Volgende fase voor alle spelers vrijgegeven.',complete:'Alle fases voltooid. Reserve gebufferd.',initialize:'Frostgale Relay online. Tabletsignaal hersteld.',pause:'Timers gepauzeerd',resume:'Timers hervat',reset:'Subsystem gereset',resetAll:'Relay gereset',upgrade:'Nieuwe puzzelversie actief. De console is vergrendeld totdat de Architect fase 1 vrijgeeft.'}[action]||'Toestand bijgewerkt');}catch(e){if(!disposed)msg.textContent=e.message;}finally{busy=false;if(!disposed){view();await refresh();}}}
  const clickHandler=e=>{const b=e.target.closest('button');if(!b||!root.contains(b)||busy||!data)return;
   if(b.dataset.cell!==undefined){selected=Number(b.dataset.cell);view();const p=data.puzzle,c=p.config.cells[selected];if(data.paused||data.online||p.completed||p.waiting)return;if(c.damaged){msg.textContent='J-'+(selected+1)+' is fysiek beschadigd. Kies een andere route.';return;}if(p.circuits[selected%5]){msg.textContent='Kolom '+(selected%5+1)+' is onder spanning. Schakel '+data.circuits[selected%5].name+' UIT om te draaien.';return;}send('rotate',{cell:selected});}
   else if(b.dataset.circuit)send('toggle',{circuit:b.dataset.circuit,on:!data.puzzle.circuits[data.circuits.findIndex(c=>c.id===b.dataset.circuit)]});
   else if(b.hasAttribute('data-fr-complete'))send(data.puzzle.phase<2?'advance':'complete');
   else if(b.hasAttribute('data-fr-pause-btn'))send(data.paused?'resume':'pause');
   else if(b.hasAttribute('data-fr-initialize'))send('initialize');
   else if(b.hasAttribute('data-fr-release'))send('release',{phase:Number(b.dataset.phase)});
   else if(b.hasAttribute('data-fr-archives'))send('archives',{lost:b.dataset.lost==='true'});
   else if(b.dataset.reset&&confirm('Reset alle drie fases van '+labels[b.dataset.reset]+'? De hoofdrelay gaat offline.'))send('reset',{player:b.dataset.reset});
   else if(b.hasAttribute('data-fr-reset-all')&&confirm('Alle fases, incidenten en relayvoortgang opnieuw starten?'))send('resetAll');
   else if(b.hasAttribute('data-fr-upgrade-button')&&confirm('Nieuwe puzzelversie activeren? Alle spelers beginnen opnieuw met een vergrendelde console; de oude toestand wordt als serverarchief bewaard.'))send('upgrade');
  };
  root.addEventListener('click',clickHandler);
  const timer=setInterval(()=>{if(!document.hidden)refresh();},1500);
  const auth=()=>{authVersion++;data=null;q('[data-fr-content]').hidden=true;refresh();};document.addEventListener('prime-auth-changed',auth);
  function cleanup(){if(disposed)return;disposed=true;clearInterval(timer);document.removeEventListener('prime-auth-changed',auth);root.removeEventListener('click',clickHandler);delete root.dataset.mounted;observer.disconnect();}
  window.addCleanup?.(cleanup);
  const observer=new MutationObserver(()=>{if(!root.isConnected){cleanup();observer.disconnect();}});observer.observe(document.body,{childList:true,subtree:true});
  refresh();
 }
 function boot(){document.querySelectorAll('[data-frostgale]').forEach(mount);}
 document.addEventListener('nav',boot);document.addEventListener('render',boot);boot();
})();
`

const Interactive: QuartzComponent = () => (
 <section class="fr" data-frostgale>
  <style dangerouslySetInnerHTML={{ __html: css }} />
  <div class="fr-rain" aria-hidden="true">{Array.from({length:16},(_,i)=><span key={i}>0101 ϟ 1100 0011 AETHER 1010 ϟ 0010 1110 0101</span>)}</div>
  <div class="fr-wrap">
   <div class="fr-kicker">PRIMEOS // ONDERHOUDSOVERRIDE 2.2</div><h2>FROSTGALE RELAY</h2>
   <p><strong>Vijf kolommen, vijf circuits.</strong> Circuit AAN = kolom vergrendeld. Circuit UIT = tegels draaibaar, conditie daalt. Herstel op tijd en voltooi drie reparatiefases.</p>
   <PrimeAuth />
   <p class="fr-error" data-fr-error role="status" aria-live="polite">Beveiligde verbinding opbouwen…</p>
   <div data-fr-content hidden>
    <section class="fr-panel" data-fr-upgrade hidden><h3>NIEUWE REPARATIEPROCEDURE BESCHIKBAAR</h3><p>De Architect moet versie 2.2 activeren voordat de nieuwe puzzels beginnen. De oude voortgang is nog intact.</p><button data-fr-upgrade-button hidden>ACTIVEER PUZZELVERSIE 2.2</button></section>
    <div data-fr-main>
     <section class="fr-panel" data-fr-not-started hidden><h3>WACHTEN OP DE ARCHITECT</h3><p>De console is vergrendeld. Fase 1 wordt tijdens de sessie vrijgegeven. Je matrix is tot die tijd niet beschikbaar.</p></section>
     <div class="fr-summary"><div><small>HOOFDRELAY</small><strong data-fr-relay>OFFLINE</strong></div><div><small>GEREEDHEID</small><strong data-fr-readiness>0/4</strong></div><div><small>TABLETSIGNAAL</small><strong data-fr-signal>GEEN SIGNAAL</strong></div></div>
     <div class="fr-progress" data-fr-progress /><p class="fr-status" data-fr-pause />
     <div data-fr-player hidden>
      <h3 data-fr-name /><div class="fr-phase-track" data-fr-phase-track />
      <section class="fr-panel" data-fr-waiting hidden><h3>WACHTEN OP EXTERNE INTERVENTIE</h3><p class="fr-goal" data-fr-wait-text /><p data-fr-wait-progress /></section>
      <div class="fr-layout">
       <div class="fr-panel"><h3 data-fr-phase-name /><p class="fr-goal" data-fr-goal />
        <p>Start linksboven, eindig rechtsonder. Verbind ook de paarse controlepunten in alfabetische volgorde. Tik op een vrijgeschakelde tegel om 90° rechtsom te draaien. Maximaal twee kolommen tegelijk in onderhoud.</p>
        <div class="fr-source">→ AETHER-BRON · links van J-01, linksboven</div>
        <div class="fr-columns" data-fr-columns /><div class="fr-grid" data-fr-grid />
        <div class="fr-source fr-source--target">UITGANG → rechts van J-30, rechtsonder</div>
        <div class="fr-checkpoints" data-fr-checkpoints />
        <small>Cyan: stroom · Rood: breuk · Paarse ◆: controlepunt · 🔒: spanning aan · ↻: vrijgeschakeld</small>
        <div class="fr-diagnosis" data-fr-detail /><button data-fr-unlock hidden>SCHAKEL KOLOM VRIJ</button><div class="fr-diagnosis" data-fr-route />
       </div>
       <div class="fr-panel"><h3>KOLOMONDERHOUD</h3><strong data-fr-free />
        <p>Schakel een circuit UIT om die kolom te bewerken. De leiding zelf blijft stroom doorlaten. Schakel weer AAN om de voorziening te herstellen; tegelstanden blijven behouden.</p>
        <div data-fr-circuits /><p data-fr-requirements /><button data-fr-complete>KALIBREER FASE</button>
        <p>Condities blijven op de server doorlopen, ook na sluiten of refresh. Alleen een voltooid subsystem stopt zijn timers. Kritieke incidenten worden voor de Architect geregistreerd.</p>
       </div>
      </div>
     </div>
     <section class="fr-panel fr-dm" data-fr-dm hidden><h3>ARCHITECT // RELAYBEHEER</h3><p>Iedere speler moet drie fases voltooien voordat de hoofdrelay kan starten.</p><div class="fr-actions"><button data-fr-pause-btn>PAUZEER TIMERS</button><button data-fr-initialize>INITIALISEER HOOFDRELAY</button><button data-fr-archives>HERSTEL ARCHIVES-VERBINDING</button><button data-fr-reset-all>RESET VOLLEDIGE RELAY</button></div><section class="fr-panel"><h3 data-fr-encounter-title /><p data-fr-encounter-status /><button data-fr-release>GEEF VOLGENDE FASE VRIJ</button></section><div data-fr-dm-list /></section>
    </div>
   </div>
  </div>
 </section>
)
export default Interactive
