const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
new Function(js+';globalThis.__Y={newGame,begin,finish}')();
const BB=globalThis.__BB, Y=globalThis.__Y;
function setup(r0,r1){
  Y.newGame(r0,r1); const G=BB.getG();
  for(const t of G.teams)for(const p of t.players){p.loc='reserve';p.x=p.y=-1;p.state='standing';}
  G.phase='turn';G.active=0;G.turn=[3,3];G.turnover=false;G.cur=null;G.charge=null;G.td=null;
  G.blitzUsed=G.passUsed=G.handUsed=G.foulUsed=G.secureUsed=G.ttmUsed=G.puntUsed=false;
  G.ball.carrier=null;G.ball.x=G.ball.y=-1;
  G.teams[0].ctrl=new BB.AI2(0);G.teams[1].ctrl=new BB.AI2(1);
  return G;
}
const find=(G,t,name)=>G.teams[t].players.find(p=>p.pos===name);
const put=(p,x,y)=>{p.loc='pitch';p.x=x;p.y=y;p.state='standing';p.used=false;p.started=false;return p;};
(async()=>{
  // VOMITO: troll contra un rival fuerte (sin buen bloqueo)
  let G=setup('orc','human');
  let tr=put(find(G,0,'Troll'),10,7), e=put(G.teams[1].players[0],11,7); e.st=7; e.av=7;
  await G.teams[0].ctrl.doSpecials();
  console.log('vomito -> log:',G.log.filter(l=>/Vómito|Really Stupid|Armadura/.test(l)).slice(-3));
  // STAB: asesino contra rival con armadura baja y sin buen bloqueo
  G=setup('darkelf','human');
  let as=put(find(G,0,'Asesino'),10,7); e=put(G.teams[1].players[0],11,7); e.st=6; e.av=7;
  await G.teams[0].ctrl.doSpecials();
  console.log('stab -> log:',G.log.filter(l=>/apuñala|Hit and Run/.test(l)).slice(-3));
  // TTM: troll lanza a un goblin portador cerca de la meta, marcado
  let ok=0,tries=40,td=0,thrown=0;
  for(let k=0;k<tries;k++){
    G=setup('orc','human'); G.turn=[8,3];
    const t=put(find(G,0,'Troll'),21,7), gb=put(find(G,0,'Goblin'),22,7);
    G.ball.carrier=gb; G.ball.x=gb.x; G.ball.y=gb.y;
    const hs=G.teams[1].players; put(hs[0],23,6);put(hs[1],23,8);put(hs[2],23,7);put(hs[3],22,6);put(hs[4],22,8);put(hs[5],24,7);put(hs[6],24,6);put(hs[7],24,8);put(hs[8],23,5);put(hs[9],23,9);put(hs[10],22,9);
    const used=await G.teams[0].ctrl.tryTTM(); if(used){thrown++;} if(G.td===0)td++;
  }
  console.log('ttm: lanzamientos',thrown,'de',tries,'TD',td);
  // PUNT: corredor elfo oscuro
  let used2=0; for(let k=0;k<20;k++){
    G=setup('darkelf','human'); G.turn=[8,3];
    const r=put(find(G,0,'Corredor'),18,7); G.ball.carrier=r;G.ball.x=r.x;G.ball.y=r.y;
    const lm=G.teams[0].players.filter(p=>p.pos!=='Corredor'&&p.role==='wing'); const t1=put(lm[0]||G.teams[0].players[1],23,7);
    const hs=G.teams[1].players; put(hs[0],19,6);put(hs[1],19,8);put(hs[2],18,6);put(hs[3],18,8);put(hs[4],17,7);
    if(await G.teams[0].ctrl.tryPunt()) used2++;
  }
  console.log('punt: usos',used2,'de 20');
})().catch(e=>console.log('ERR',e));
// depuracion TTM
(async()=>{
  const G=setup('orc','human'); G.turn=[8,3];
  const t=put(find(G,0,'Troll'),21,7), gb=put(find(G,0,'Goblin'),22,7);
  G.ball.carrier=gb; G.ball.x=gb.x; G.ball.y=gb.y;
  const hs=G.teams[1].players; put(hs[0],23,6);put(hs[1],23,8);put(hs[2],23,7);put(hs[3],22,6);put(hs[4],22,8);put(hs[5],24,7);
  const c=G.teams[0].ctrl;
  const sn=c.scoreNode(gb); console.log('scoreNode',sn&&sn.prob, 'ttmUsed',G.ttmUsed,'avail troll',c.avail().includes(t),'turn',G.turn[0],'used?',gb.used,gb.started,'RS',gb.skills.has('Right Stuff'),'TTM',t.skills.has('Throw Team-mate'));
})();
