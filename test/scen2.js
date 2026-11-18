const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
let js=html.match(/<script>([\s\S]*)<\/script>/)[1];
js+=`\nglobalThis.__T={newGame,AI,begin,finish,pass,punt,block,blitzBlock,stab,vomit,kickoff,playerAt,rrLeft,spendReroll,applyInjury,knockDown,has,TDC,getG:()=>G};`;
new Function(js)();
const BB=globalThis.__BB,T=globalThis.__T; BB.setHook(()=>BB.checkInvariants());
const ti=n=>T.TDC.teams.find(t=>t.name.startsWith(n));
function fresh(a,b){ T.newGame(a,b); const G=T.getG(); G.teams[0].ctrl=new T.AI(0); G.teams[1].ctrl=new T.AI(1); G.phase='turn'; G.active=0; G.turn=[3,3]; G.half=1; return G; }
function put(p,x,y,st){p.loc='pitch';p.x=x;p.y=y;p.state=st||'standing';p.used=false;p.started=false;return p;}
const by=(G,t,sk)=>G.teams[t].players.find(p=>T.has(p,sk));
(async()=>{
  const cnt={}; const tally=G=>{ for(const l of G.log) for(const k of ['On the Ball','Dump-off','Punt','Plague Ridden','reroll de Leader','Diving Catch','Indomitable','Strip Ball','intercepta','Animosity','reacciona']) if(l.includes(k)) cnt[k]=(cnt[k]||0)+1; };
  for(let i=0;i<200;i++){ // pase humano vs amazonas con On the Ball
    const G=fresh('human','amazon'); const th=put(G.teams[0].players.find(p=>p.pos==='Lanzador'),8,7), rc=put(G.teams[0].players.find(p=>p.pos==='Receptor'),13,7);
    const py=put(by(G,1,'On the Ball'),15,9); G.ball.carrier=th;
    if(await T.begin(th,'pass')) await T.pass(th,13,7); BB.checkInvariants(); tally(G);
  }
  for(let i=0;i<200;i++){ // dump-off: humano bloquea al corredor elfo oscuro
    const G=fresh('human','darkelf'); const bz=put(G.teams[0].players.find(p=>p.pos==='Blitzer'),10,7); const rn=put(by(G,1,'Dump-off'),11,7), ln=put(G.teams[1].players.find(p=>p.pos.startsWith('Línea')),12,8); G.ball.carrier=rn;
    if(await T.begin(bz,'block')) await T.block(bz,rn,true); T.finish(bz); BB.checkInvariants(); tally(G);
    if(G.turnover && !G.log.some(l=>l.includes('cae')||l.includes('Wrestle'))) throw new Error('turnover por dump-off');
  }
  for(let i=0;i<200;i++){ // punt
    const G=fresh('darkelf','human'); const rn=put(by(G,0,'Punt'),10,7); put(G.teams[1].players[1],14,7); put(G.teams[0].players[5],13,5); G.ball.carrier=rn;
    if(await T.begin(rn,'punt')) await T.punt(rn,1,0); BB.checkInvariants(); tally(G);

  }
  { // Leader
    const G=fresh(ti('Principes'),ti('Wakala')); const t=G.teams[0]; const L=by(G,0,'Leader'); put(L,5,5); t.leaderRR=true;
    const a=T.rrLeft(t); T.spendReroll(L); const b=T.rrLeft(t); L.loc='ko'; t.leaderRR=true; const c=T.rrLeft(t);
    console.log('Leader rr', a,b,c,'(esperado',t.rrMax+1,t.rrMax,t.rrMax,')'); tally(G);
  }
  for(let i=0;i<3000;i++){ // Plague Ridden: bloater derriba línea
    const G=fresh(ti('Wakala'),ti('Atl')); const pz=put(by(G,0,'Plague Ridden'),10,7), v=put(G.teams[1].players.find(p=>p.pos==='Línea'),11,7);
    const n0=G.teams[0].players.length; await T.knockDown(v,{by:pz}); tally(G);
    if(G.teams[0].players.length>n0+1) throw new Error('plague doble');
  }
  for(let i=0;i<300;i++){ // Karla dauntless vs kroxigor
    const G=fresh(ti('Spring'),ti('Chicureo')); const k=put(G.teams[0].players.find(p=>p.name.startsWith('Karla')),10,7), e=put(G.teams[1].players.find(p=>p.big),11,7);
    if(await T.begin(k,'block')) await T.block(k,e,true); T.finish(k); BB.checkInvariants(); tally(G);
  }
  for(let i=0;i<300;i++){ // Strip Ball + Diving Catch
    const G=fresh(ti('Gwyn'),ti('Sapos')); const w=put(by(G,0,'Strip Ball'),10,7), c=put(by(G,1,'Diving Catch'),11,7); G.ball.carrier=c;
    if(await T.begin(w,'block')) await T.block(w,c,true); T.finish(w); BB.checkInvariants(); tally(G);
  }
  for(let i=0;i<200;i++){ // pase a casilla vacía junto a Diving Catch
    const G=fresh(ti('Sapos'),ti('Wakala')); const th=put(G.teams[0].players[3],8,7), c=put(by(G,0,'Diving Catch'),12,7); G.ball.carrier=th;
    if(await T.begin(th,'pass')) await T.pass(th,12,8); BB.checkInvariants(); tally(G);
  }
  console.log(cnt);
})().catch(e=>{console.error('FALLO',e);process.exit(1)});
