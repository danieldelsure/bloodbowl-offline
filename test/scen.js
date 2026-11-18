const fs=require('fs');
const html=fs.readFileSync('/home/claude/bloodbowl-src.html','utf8');
let js=html.match(/<script>([\s\S]*)<\/script>/)[1].replace('/*ASSETS*/','');
js+=`\nglobalThis.__T={newGame,AI,begin,finish,throwTeammate,vomit,jumpTo,foul,computeMoves,pathOf,moveAlong,playerAt,kickoffEvent,resolveStall,freeScore,block,getG:()=>G,stepTo};`;
new Function(js)();
const BB=globalThis.__BB,T=globalThis.__T;
BB.setHook(()=>BB.checkInvariants());
function fresh(){ T.newGame('orc','human'); const G=T.getG(); G.teams[0].ctrl=new T.AI(0); G.teams[1].ctrl=new T.AI(1); G.phase='turn'; G.active=0; G.turn=[3,3]; G.half=1; return G; }
function put(p,x,y,st){p.loc='pitch';p.x=x;p.y=y;p.state=st||'standing';p.used=false;p.started=false;return p;}
(async()=>{
  const cnt={};
  const tally=(G)=>{ for(const l of G.log){ for(const k of ['se come','aterriza de pie','cae encima','al público','TOUCHDOWN','Vómito','se vomita','Saltar','soborno funciona','discute','boticario','Boticario','Stalling','lanzamiento soberbio','lanzamiento pobre','se le cae','se escapa']) if(l.includes(k)) cnt[k]=(cnt[k]||0)+1; } };
  for(let i=0;i<400;i++){ // TTM: troll lanza goblin con balón hacia zona de anotación
    const G=fresh(); const tr=put(G.teams[0].players[0],20,7), gb=put(G.teams[0].players[11],21,7);
    put(G.teams[1].players[6],23,6); put(G.teams[1].players[7],24,1); put(G.teams[0].players[6],22,9);
    G.ball.carrier=gb;
    if(await T.begin(tr,'ttm')) await T.throwTeammate(tr,gb,24,7);
    BB.checkInvariants(); tally(G);
    if(G.ball.carrier && G.ball.carrier.loc!=='pitch') throw new Error('balón con jugador fuera');
  }
  for(let i=0;i<200;i++){ // vómito
    const G=fresh(); const tr=put(G.teams[0].players[0],10,7), e=put(G.teams[1].players[1],11,7); G.ball.carrier=e;
    if(await T.begin(tr,'vomit')) await T.vomit(tr,e); BB.checkInvariants(); tally(G);
  }
  let jumps=0;
  for(let i=0;i<200;i++){ // salto sobre caído
    const G=fresh(); const p=put(G.teams[0].players[1],10,7); put(G.teams[1].players[6],11,7,'prone'); put(G.teams[1].players[7],11,6); put(G.teams[1].players[8],11,8);
    const mv=T.computeMoves(p); 
    if(await T.begin(p,'move')){ await T.jumpTo(p,12,7); jumps++; } BB.checkInvariants(); tally(G);
  }
  for(let i=0;i<300;i++){ // falta con soborno
    const G=fresh(); G.teams[0].bribes=1; const p=put(G.teams[0].players[6],10,7), e=put(G.teams[1].players[6],11,7,'prone');
    if(await T.begin(p,'foul')) await T.foul(p,e); BB.checkInvariants(); tally(G);
  }
  for(let i=0;i<100;i++){ // stalling
    const G=fresh(); const p=put(G.teams[0].players[1],22,7); G.ball.carrier=p; const o=put(G.teams[0].players[6],5,5);
    if(!T.freeScore(p)) throw new Error('freeScore');
    if(await T.begin(p,'move')){ await T.stepTo(p,22,8); T.finish(p); }
    await T.begin(o,'move'); tally(G); BB.checkInvariants();
  }
  console.log(cnt,'saltos',jumps);
  // eventos en partidos simulados
  const res=await BB.simulate(150); const all=res.flatMap(r=>r.log); const ev={};
  for(const l of all){ const m=l.match(/^Evento de patada \((\d+)\)/); if(m) ev[m[1]]=(ev[m[1]]||0)+1; }
  const c=k=>all.filter(x=>x.includes(k)).length;
  console.log('eventos',ev); console.log({clima:['Calor','Muy soleado','perfecto','Lluvia','Ventisca'].map(k=>c('): '+k)), boticario:c('oticario'), stalling:c('Stalling'), saltar:c('Saltar'), desmaya:c('desmaya'), discute:c('discute'), td:c('TOUCHDOWN'), carga:c('¡Carga!')});
})().catch(e=>{console.error('FALLO',e);process.exit(1)});
