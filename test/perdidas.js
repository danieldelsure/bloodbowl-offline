// cuándo se pierde el balón: en el propio turno (dodge/GFI/pase fallado) o en el turno rival (bloqueo)
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB, T=BB.TDC.teams, N=+process.argv[3]||2; if(process.env.FLAGS)Object.assign(BB.AI2.f,JSON.parse(process.env.FLAGS));
(async()=>{ for(const nm of process.argv[2].split(',')){ const me=T.findIndex(t=>t.name.startsWith(nm)); const S={ini:0,propio:0,fin:0,rival:0,lleva:0};
  const o=BB.AI2.prototype.playTurn; BB.AI2.prototype.playTurn=async function(){ const G=BB.getG(), mi=G.teams[this.t].name===T[me].name; let had=false; if(mi){ const c=G.ball.carrier; had=!!(c&&c.team===this.t); if(had)S.ini++; }
    await o.call(this); if(mi&&had){ const c=G.ball.carrier; const sc0=0; if(!(c&&c.team===this.t)&&!G.__td) S.propio++; else S.fin++; } };
  const g0=BB.AI2.prototype.playTurn;
  for(let j=0;j<T.length;j++){ if(j===me)continue; for(let k=0;k<N;k++){ const side=k%2; BB.newGame(T[side?j:me],T[side?me:j]); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1); await BB.runMatch(); } }
  BB.AI2.prototype.playTurn=o;
  console.log(T[me].name.slice(0,16),'turnos con balon al inicio',S.ini,'lo pierde en su propio turno',(100*S.propio/S.ini).toFixed(0)+'%','(resto lo conserva o anota)'); } })();
