const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB, T=BB.TDC.teams, ME=T.findIndex(t=>t.name===(process.argv[2]||'Wakala')); const st={calls:0,did:0,to:0};
(async()=>{ const o=BB.AI2.prototype.tryPassAdvance;
  BB.AI2.prototype.tryPassAdvance=async function(){ const G=BB.getG(); const mine=G.teams[this.t].name===T[ME].name; if(mine)st.calls++; const r=await o.call(this); if(mine&&r)st.did++; return r; };
  let td=0,n=0; for(let j=0;j<T.length;j++){ if(j===ME)continue; for(let k=0;k<4;k++){ const me=k%2; BB.newGame(T[me?j:ME],T[me?ME:j]); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1); await BB.runMatch(); td+=G.teams[me].score; n++; } }
  console.log(JSON.stringify(globalThis.__PA),JSON.stringify(st),'TD/partido',(td/n).toFixed(2));
})();
