const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB; const N=+process.argv[2]||5;
(async()=>{ const champs={}, rk={}; const t0=Date.now();
  for(let k=0;k<N;k++){ const st=await BB.tAuto(); const rows=BB.tStandings(st);
    rows.forEach((r,i)=>{ const n=(i=>BB.TDC.teams[i])(r.i).name; rk[n]=(rk[n]||0)+i+1; }); const c=(i=>BB.TDC.teams[i])(rows[0].i).name; champs[c]=(champs[c]||0)+1; }
  console.log('torneos',N,(Date.now()-t0)/1000+'s');
  console.log('campeones',JSON.stringify(champs));
  console.log('puesto medio',JSON.stringify(Object.fromEntries(Object.entries(rk).map(([n,v])=>[n,+(v/N).toFixed(1)]).sort((a,b)=>a[1]-b[1]))));
})();
