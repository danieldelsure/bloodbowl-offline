const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1]+';globalThis.__Y={cheb}')();
const BB=globalThis.__BB, Y=globalThis.__Y; if(process.env.FLAGS)Object.assign(BB.AI2.f,JSON.parse(process.env.FLAGS));
(async()=>{ let n=0,bad=0,far=0;
  const orig=BB.AI2.prototype.playTurn;
  BB.AI2.prototype.playTurn=async function(){ const G=BB.getG(); const wasLoose=!G.ball.carrier&&G.ball.x>=0;
    await orig.call(this); if(!wasLoose)return; n++;
    if(!G.ball.carrier&&G.ball.x>=0){ const mine=G.teams[this.t].players.filter(p=>p.loc==='pitch'&&p.state==='standing');
      const adj=mine.filter(p=>Y.cheb(p.x,p.y,G.ball.x,G.ball.y)<=1).length; const dn=t=>Math.min(...G.teams[t].players.filter(p=>p.loc==='pitch'&&p.state==='standing').map(p=>Y.cheb(p.x,p.y,G.ball.x,G.ball.y))); if(adj===0&&dn(this.t)<=dn(1-this.t))bad++; } };
  for(let k=0;k<+process.argv[2];k++){ BB.newGame('human','orc'); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0);G.teams[1].ctrl=new BB.AI2(1); await BB.runMatch(); }
  console.log('turnos con balon suelto al inicio',n,'terminan con balon suelto sin ningun propio adyacente',bad);
})();
