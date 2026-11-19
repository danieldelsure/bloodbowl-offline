// métricas comparables con los replays humanos: posesión, pérdida de balón, turno del gol, goles a favor y en contra
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB, T=BB.TDC.teams, N=+process.argv[3]||2; if(process.env.FLAGS)Object.assign(BB.AI2.f,JSON.parse(process.env.FLAGS));
(async()=>{ for(const nm of process.argv[2].split(',')){ const me=T.findIndex(t=>t.name.startsWith(nm));
  const S={own:0,opp:0,loose:0,tk:0,keep:0,lost:0,ownC:0,gf:0,ga:0,n:0,w:0,tdTurn:{},oppTurns:0}; let prevOwn=null, seen=0, lastLab='';
  const o=BB.AI2.prototype.playTurn; BB.AI2.prototype.playTurn=async function(){ const G=BB.getG(), mine=G.teams[this.t].name===T[me].name; const c=G.ball.carrier, sc=G.teams[this.t].score;
    if(mine){ if(sc>seen){S.tdTurn[lastLab]=(S.tdTurn[lastLab]||0)+(sc-seen);} seen=sc; S.tk++; if(!c)S.loose++; else if(c.team===this.t)S.own++; else S.opp++;
      if(prevOwn&&prevOwn.half===G.half){ if(c&&c.team===this.t)S.keep++; else if(!(G.teams[this.t].score>prevOwn.sc))S.lost++; } prevOwn=(c&&c.team===this.t)?{half:G.half,sc}:null; }
    if(mine)lastLab=G.half+'T'+(G.turn[this.t]+1); await o.call(this); if(mine)lastLab=G.half+'T'+G.turn[this.t]; };
  for(let j=0;j<T.length;j++){ if(j===me)continue; for(let k=0;k<N;k++){ prevOwn=null; seen=0; lastLab=''; const side=k%2; BB.newGame(T[side?j:me],T[side?me:j]); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1);
      if(process.env.PLAN)G.teams[side].plan=JSON.parse(JSON.stringify(BB.PRESETS[process.env.PLAN])); await BB.runMatch(); if(G.teams[side].score>seen)S.tdTurn[lastLab]=(S.tdTurn[lastLab]||0)+(G.teams[side].score-seen); S.n++; S.gf+=G.teams[side].score; S.ga+=G.teams[1-side].score; S.w+=G.teams[side].score>G.teams[1-side].score?1:G.teams[side].score===G.teams[1-side].score?.5:0; } }
  BB.AI2.prototype.playTurn=o;
  const late=Object.entries(S.tdTurn).filter(([k])=>/T[78]$/.test(k)).reduce((a,[,v])=>a+v,0), tot=Object.values(S.tdTurn).reduce((a,b)=>a+b,0);
  if(process.env.TD)console.log(JSON.stringify(S.tdTurn));console.log(`${T[me].name.slice(0,14)} plan=${process.env.PLAN||'equil'} win ${(100*S.w/S.n).toFixed(0)}% goles ${(S.gf/S.n).toFixed(2)}-${(S.ga/S.n).toFixed(2)} | balon inicio de turno: propio ${(100*S.own/S.tk).toFixed(0)}% rival ${(100*S.opp/S.tk).toFixed(0)}% suelto ${(100*S.loose/S.tk).toFixed(0)}% | conserva ${(100*S.keep/Math.max(1,S.keep+S.lost)).toFixed(0)}% | goles en turnos 7-8: ${tot?(100*late/tot).toFixed(0):0}%`); } })();
