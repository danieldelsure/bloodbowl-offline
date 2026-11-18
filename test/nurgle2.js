const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB; const T=BB.TDC.teams; const ME=15;
const stat={turns:0,withBall:0,carrierPos:{},oppBall:0,loose:0,markedEnd:0,avgX:0};
(async()=>{
  const orig=BB.AI2.prototype.playTurn;
  BB.AI2.prototype.playTurn=async function(){ const G=BB.getG(); const mine=G.teams[this.t].name==='Wakala'; await orig.call(this); if(!mine)return;
    stat.turns++; const c=G.ball.carrier; if(c&&c.team===this.t){stat.withBall++; stat.carrierPos[c.name]=(stat.carrierPos[c.name]||0)+1; } else if(c) stat.oppBall++; else stat.loose++; };
  for(let j=0;j<T.length;j++){ if(j===ME)continue; for(let k=0;k<4;k++){ const me=k%2; BB.newGame(T[me?j:ME],T[me?ME:j]); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1); await BB.runMatch(); } }
  console.log(JSON.stringify(stat));
})();
