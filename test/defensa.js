// defensa al inicio del turno rival con el balón en manos rivales (mismas medidas que el análisis de replays humanos)
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB, T=BB.TDC.teams, N=+process.argv[3]||2; if(process.env.FLAGS)Object.assign(BB.AI2.f,JSON.parse(process.env.FLAGS));
(async()=>{ for(const nm of process.argv[2].split(',')){ const me=T.findIndex(t=>t.name.startsWith(nm)); const M={n:0,adj:0,w2:0,w3:0,front:0,stand:0,wide:0,oppTurns:0,oppBall:0}; let meT=-1;
  const o=BB.AI2.prototype.playTurn; BB.AI2.prototype.playTurn=async function(){ const G=BB.getG(); if(G.teams[this.t].name!==T[me].name){ M.oppTurns++; const c=G.ball.carrier; if(c&&c.team===this.t){ M.oppBall++; const mine=G.teams[meT].players.filter(p=>p.loc==='pitch'&&p.state==='standing'); const d=p=>Math.max(Math.abs(p.x-c.x),Math.abs(p.y-c.y)); M.n++; M.adj+=mine.filter(p=>d(p)===1).length; M.w2+=mine.filter(p=>d(p)<=2).length; M.w3+=mine.filter(p=>d(p)<=3).length; M.stand+=mine.length;
      const dirMe=G.teams[meT].ctrl.dir(); M.front+=mine.filter(p=>dirMe>0?p.x<c.x:p.x>c.x).length; M.wide+=Math.max(...mine.map(p=>p.y))-Math.min(...mine.map(p=>p.y)); } } return o.call(this); };
  for(let j=0;j<T.length;j++){ if(j===me)continue; for(let k=0;k<N;k++){ const side=k%2; meT=side; BB.newGame(T[side?j:me],T[side?me:j]); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1); if(process.env.PLAN)G.teams[side].plan=JSON.parse(JSON.stringify(BB.PRESETS[process.env.PLAN])); await BB.runMatch(); } }
  BB.AI2.prototype.playTurn=o; const a=k=>(M[k]/M.n).toFixed(1);
  console.log(`${T[me].name.slice(0,14)} plan=${process.env.PLAN||'equil'} | turnos rivales con balon ${(100*M.oppBall/M.oppTurns).toFixed(0)}% | TK de pie ${a('stand')} | adyacentes ${a('adj')} | <=2 ${a('w2')} | <=3 ${a('w3')} | entre portador y meta ${a('front')} | ancho ${a('wide')}`); } })();
