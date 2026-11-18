// posesión del balón al inicio de cada turno propio, avance y goles, para un equipo (AI2 vs AI2)
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB, T=BB.TDC.teams, N=+process.argv[3]||2;
(async()=>{ for(const nm of process.argv[2].split(',')){ const me=T.findIndex(t=>t.name.startsWith(nm)); const S={own:0,opp:0,loose:0,n:0,ownDist:0,oppDist:0,turns:0,alive:0,aliveOpp:0,lost:0};
  const o=BB.AI2.prototype.playTurn; BB.AI2.prototype.playTurn=async function(){ const G=BB.getG(); if(G.teams[this.t]===G.teams[this.t]&&G.teams[this.t].name===T[me].name){ const c=G.ball.carrier; S.turns++; const gx=BB.goalX?BB.goalX(this.t):null;
      if(!c)S.loose++; else if(c.team===this.t){S.own++;} else S.opp++;
      S.alive+=G.teams[this.t].players.filter(p=>p.loc==='pitch').length; S.aliveOpp+=G.teams[1-this.t].players.filter(p=>p.loc==='pitch').length; } return o.call(this); };
  for(let j=0;j<T.length;j++){ if(j===me)continue; for(let k=0;k<N;k++){ const side=k%2; BB.newGame(T[side?j:me],T[side?me:j]); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1); await BB.runMatch(); S.n++; } }
  BB.AI2.prototype.playTurn=o;
  console.log(T[me].name.slice(0,16),'turnos con balon propio',(100*S.own/S.turns).toFixed(0)+'%','rival',(100*S.opp/S.turns).toFixed(0)+'%','suelto',(100*S.loose/S.turns).toFixed(0)+'%','en cancha prop/rival',(S.alive/S.turns).toFixed(1),(S.aliveOpp/S.turns).toFixed(1)); } })();
