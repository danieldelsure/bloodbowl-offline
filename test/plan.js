const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
new Function(js)();
const BB=globalThis.__BB;
(async()=>{
  const N=+process.argv[2]||40, a=process.argv[3]||'equil', b=process.argv[4]||'equil';
  const mod=process.argv[5]?JSON.parse(process.argv[5]):{};
  const pa=Object.assign({},BB.PRESETS[a],mod), pb=BB.PRESETS[b];
  const t0=Date.now();
  const r=await BB.bench(N,BB.AI2,BB.AI2,pa,pb);
  const g=r.a+r.b+r.d;
  console.log(`${a}${process.argv[5]||''} vs ${b}: ${g} partidos, A gana ${(100*(r.a+r.d/2)/g).toFixed(1)}% (${r.a}-${r.d}-${r.b}), TD ${(r.ta/g).toFixed(2)}-${(r.tb/g).toFixed(2)}, bajas ${(r.casA/g).toFixed(1)}-${(r.casB/g).toFixed(1)}, ${Date.now()-t0}ms`);
})().catch(e=>{console.error('FALLO',e);process.exit(1)});
