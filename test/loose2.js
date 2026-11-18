const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1]+';globalThis.__Y={cheb}')();
const BB=globalThis.__BB, Y=globalThis.__Y; let shown=0;
(async()=>{
  const orig=BB.AI2.prototype.playTurn;
  BB.AI2.prototype.playTurn=async function(){ const G=BB.getG(); const loose=!G.ball.carrier&&G.ball.x>=0; let info=null;
    if(loose){ const dn=t=>Math.min(...G.teams[t].players.filter(p=>p.loc==='pitch'&&p.state==='standing').map(p=>Y.cheb(p.x,p.y,G.ball.x,G.ball.y)));
      info={ball:[G.ball.x,G.ball.y],avail:this.avail().length,dmine:dn(this.t),dfoe:dn(1-this.t),turn:G.turn[this.t],half:G.half}; }
    await orig.call(this); if(!info)return;
    if(!G.ball.carrier&&G.ball.x>=0){ const mine=G.teams[this.t].players.filter(p=>p.loc==='pitch'&&p.state==='standing');
      const adj=mine.filter(p=>Y.cheb(p.x,p.y,G.ball.x,G.ball.y)<=1).length;
      if(adj===0&&info.dmine<=info.dfoe&&shown++<8){ const left=this.avail().length; const near=mine.map(p=>Y.cheb(p.x,p.y,G.ball.x,G.ball.y)).sort((a,b)=>a-b)[0]; console.log(JSON.stringify(info),'quedan disp',left,'mas cercano ahora',near); } } };
  for(let k=0;k<15;k++){ BB.newGame('human','orc'); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0);G.teams[1].ctrl=new BB.AI2(1); await BB.runMatch(); }
})();
