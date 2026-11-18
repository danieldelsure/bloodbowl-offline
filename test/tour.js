const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
new Function(js)();
const BB=globalThis.__BB; BB.setHook(()=>BB.checkInvariants());
(async()=>{
  const N=+process.argv[2]||8, t0=Date.now(); const champs={}, wins={}, games={}; let td=0,g=0;
  for(let k=0;k<N;k++){ const st=await BB.tAuto(); const rows=BB.tStandings(st); const c=BB.TDC.teams[rows[0].i].name; champs[c]=(champs[c]||0)+1;
    for(const r of rows){ const n=BB.TDC.teams[r.i].name; wins[n]=(wins[n]||0)+r.pts; games[n]=(games[n]||0)+4; td+=r.tf; } g+=32;
    // rematches
    const seen=new Set(); let rem=0; for(const rd of st.res) for(const [a,b] of rd){ const key=Math.min(a,b)+'-'+Math.max(a,b); if(seen.has(key)) rem++; seen.add(key);} if(rem) console.log('revanchas',rem);
  }
  console.log('torneos',N,'ms',Date.now()-t0,'TD/partido',(td/g).toFixed(2));
  console.log(Object.entries(wins).sort((a,b)=>b[1]-a[1]).map(([n,p])=>n.slice(0,22).padEnd(22)+' pts/torneo '+(p/N).toFixed(1)+' campeón '+(champs[n]||0)).join('\n'));
})().catch(e=>{console.error('FALLO',e);process.exit(1)});
