const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1]+';globalThis.__Z={goalX,markersAt}')();
const BB=globalThis.__BB, Z=globalThis.__Z; const T=BB.TDC.teams; const NAME=process.argv[2]||'Wakala'; const ME=T.findIndex(t=>t.name===NAME);
const st={n:0,carry:0,dist:[],marked:0,lost:0,drives:0,td:0,bigCarry:0,turnoverEnd:0};
(async()=>{
  const orig=BB.AI2.prototype.playTurn;
  BB.AI2.prototype.playTurn=async function(){ const G=BB.getG(); const mine=G.teams[this.t].name===NAME; const had=G.ball.carrier&&G.ball.carrier.team===this.t; const s0=G.teams[this.t].score; await orig.call(this); if(!mine)return;
    st.n++; const c=G.ball.carrier; if(c&&c.team===this.t){ st.carry++; st.dist.push(Math.abs(Z.goalX(this.t)-c.x)); if(Z.markersAt(c.x,c.y,this.t).length) st.marked++; if(c.big||c.ma<=4)st.bigCarry++; } else if(had&&G.teams[this.t].score===s0) st.lost++; };
  for(let j=0;j<T.length;j++){ if(j===ME)continue; for(let k=0;k<4;k++){ const me=k%2; BB.newGame(T[me?j:ME],T[me?ME:j]); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1); await BB.runMatch(); } }
  const d=st.dist; console.log(NAME,JSON.stringify({turns:st.n,conBalonAlFinal:st.carry,distMedia:+(d.reduce((a,b)=>a+b,0)/d.length).toFixed(1),portadorMarcado:st.marked,portadorLento:st.bigCarry,perdioBalonEnSuTurno:st.lost}));
})();
