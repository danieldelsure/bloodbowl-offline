// uso: node test/riesgo.js <plan base> <equipos> <partidos por rival> <riesgos separados por coma>
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB, T=BB.TDC.teams, base=process.argv[2], N=+process.argv[4]||4, R=(process.argv[5]||'50').split(',').map(Number);
(async()=>{ for(const nm of process.argv[3].split(',')){ const me=T.findIndex(t=>t.name.startsWith(nm)); const row=[];
  for(const risk of R){ let pts=0,n=0,gf=0,ga=0,to=0; const o=BB.AI2.prototype.playTurn; let meT=0;
    BB.AI2.prototype.playTurn=async function(){ const r=await o.call(this); if(this.t===meT&&BB.getG().turnover)to++; return r; };
    for(let j=0;j<T.length;j++){ if(j===me)continue; for(let k=0;k<N;k++){ const side=k%2; meT=side; BB.newGame(T[side?j:me],T[side?me:j]); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1);
      const pl=JSON.parse(JSON.stringify(BB.PRESETS[base])); pl.risk=risk; G.teams[side].plan=pl; await BB.runMatch(); n++; gf+=G.teams[side].score; ga+=G.teams[1-side].score; pts+=G.teams[side].score>G.teams[1-side].score?1:G.teams[side].score===G.teams[1-side].score?.5:0; } }
    BB.AI2.prototype.playTurn=o; row.push(`riesgo ${risk}: ${(100*pts/n).toFixed(0)}% (${(gf/n).toFixed(2)}-${(ga/n).toFixed(2)}, turnovers ${(to/n).toFixed(1)})`); }
  console.log(T[me].name.slice(0,14),base,'|',row.join(' | ')); } })();
