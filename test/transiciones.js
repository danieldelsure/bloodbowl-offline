// desde un turno propio con el balón: qué pasa en el siguiente turno propio (sigue, se pierde, anota)
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB, T=BB.TDC.teams, N=+process.argv[3]||2; if(process.env.FLAGS)Object.assign(BB.AI2.f,JSON.parse(process.env.FLAGS));
(async()=>{ for(const nm of process.argv[2].split(',')){ const me=T.findIndex(t=>t.name.startsWith(nm)); const S={sigue:0,pierde:0,anota:0,fin:0}, X={rec:0,tot:0}; let prev=null, nd=0, dsum=0;
  const o=BB.AI2.prototype.playTurn; BB.AI2.prototype.playTurn=async function(){ const G=BB.getG(); if(G.teams[this.t].name===T[me].name){ const c=G.ball.carrier, sc=G.teams[this.t].score;
      if(prev&&prev.half===G.half){ if(sc>prev.sc)S.anota++; else if(c&&c.team===this.t)S.sigue++; else S.pierde++; } else if(prev&&prev.own)S.fin++;
      prev=(c&&c.team===this.t)?{own:true,half:G.half,sc}:null; if(c&&c.team===this.t){ dsum+=Math.abs((this.dir()>0?25:0)-c.x); nd++; } } return o.call(this); };
  for(let j=0;j<T.length;j++){ if(j===me)continue; for(let k=0;k<N;k++){ prev=null; const side=k%2; BB.newGame(T[side?j:me],T[side?me:j]); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1); await BB.runMatch(); } }
  BB.AI2.prototype.playTurn=o; const t=S.sigue+S.pierde+S.anota+S.fin;
  console.log(T[me].name.slice(0,16),'tras turno con balon -> sigue',(100*S.sigue/t).toFixed(0)+'%','pierde',(100*S.pierde/t).toFixed(0)+'%','anota',(100*S.anota/t).toFixed(0)+'%','fin de mitad',(100*S.fin/t).toFixed(0)+'%','dist media a la meta',(dsum/nd).toFixed(1)); } })();
