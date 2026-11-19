// recoge rasgos del estado al final de cada turno (desde el punto de vista de quien jugó) y el resultado final
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB, T=BB.TDC.teams, N=+process.argv[2]||300, out=process.argv[3]||'/tmp/eval_datos.csv';
const cheb=(a,b,c,d)=>Math.max(Math.abs(a-c),Math.abs(b-d));
function feats(G,t){ const me=G.teams[t], op=G.teams[1-t], dir=me.ctrl.dir(), gx=dir>0?25:0, ogx=dir>0?0:25;
  const on=s=>s.players.filter(p=>p.loc==='pitch'), st=s=>on(s).filter(p=>p.state==='standing');
  const c=G.ball.carrier, bx=G.ball.x, by=G.ball.y, f={};
  f.ownC=c&&c.team===t?1:0; f.oppC=c&&c.team!==t?1:0; f.loose=c?0:1;
  f.diff=me.score-op.score; f.tl=8-G.turn[t]; f.tlo=8-G.turn[1-t]; f.half=G.half;
  f.stand=st(me).length; f.standO=st(op).length; f.sd=f.stand-f.standO;
  f.prone=on(me).filter(p=>p.state!=='standing').length; f.proneO=on(op).filter(p=>p.state!=='standing').length;
  f.cas=me.players.filter(p=>p.loc==='cas').length; f.casO=op.players.filter(p=>p.loc==='cas').length;
  f.cProg=0;f.cMark=0;f.cCage=0;f.cThreat=0;f.cEdge=0;f.cScoreReach=0;
  if(f.ownC){ f.cProg=1-Math.abs(gx-c.x)/25; f.cMark=st(op).filter(p=>cheb(p.x,p.y,c.x,c.y)===1).length; f.cCage=st(me).filter(p=>p!==c&&cheb(p.x,p.y,c.x,c.y)===1).length;
    f.cThreat=st(op).filter(p=>cheb(p.x,p.y,c.x,c.y)<=Math.min(p.ma+1,7)).length; f.cEdge=(c.y===0||c.y===14||c.x===0||c.x===25)?1:0; f.cScoreReach=Math.abs(gx-c.x)<=c.ma?1:0; }
  f.oProg=0;f.oNear2=0;f.oAdj=0;f.oReach=0;
  if(f.oppC){ f.oProg=1-Math.abs(ogx-c.x)/25; f.oNear2=st(me).filter(p=>cheb(p.x,p.y,c.x,c.y)<=2).length; f.oAdj=st(me).filter(p=>cheb(p.x,p.y,c.x,c.y)===1).length; f.oReach=Math.abs(ogx-c.x)<=c.ma?1:0; }
  f.bd=0; if(f.loose&&bx>=0){ const d=s=>Math.min(99,...st(s).map(p=>cheb(p.x,p.y,bx,by))); f.bd=d(op)-d(me); f.bProg=1-Math.abs(gx-bx)/25; } else f.bProg=0;
  f.edge=on(me).filter(p=>p.x===0||p.x===25||p.y===0||p.y===14).length;
  f.tz=0; return f; }
(async()=>{ const rows=[]; const hdr=null; let ids=0;
  const o=BB.AI2.prototype.playTurn; let cur=[];
  BB.AI2.prototype.playTurn=async function(){ const r=await o.call(this); const G=BB.getG(); if(G.ball.x>=-1) cur.push({t:this.t,f:feats(G,this.t),turn:G.turn[this.t],half:G.half}); return r; };
  for(let m=0;m<N;m++){ const a=Math.floor(Math.random()*16); let b; do{b=Math.floor(Math.random()*16)}while(b===a); cur=[]; BB.newGame(T[a],T[b]); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1); await BB.runMatch();
    const s=[G.teams[0].score,G.teams[1].score]; for(const r of cur){ const w=s[r.t]>s[1-r.t]?1:s[r.t]===s[1-r.t]?0.5:0; rows.push({m,w,...r.f}); } }
  BB.AI2.prototype.playTurn=o; const keys=Object.keys(rows[0]); fs.writeFileSync(out,keys.join(',')+'\n'+rows.map(r=>keys.map(k=>+(r[k]).toFixed?+(+r[k]).toFixed(4):r[k]).join(',')).join('\n')); console.log('filas',rows.length); })();
