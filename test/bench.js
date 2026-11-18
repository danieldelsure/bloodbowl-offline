const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
new Function(js)();
const BB=globalThis.__BB;
(async()=>{
  const N=+process.argv[2]||50, t0=Date.now();
  if(process.argv[5])Object.assign(BB.AI2.f,JSON.parse(process.argv[5]));const A=BB[process.argv[3]||'AI'], B=BB[process.argv[4]||'AI'];
  const r=await BB.bench(N,A,B);
  const g=r.a+r.b+r.d;
  console.log(`${process.argv[3]||'AI'} vs ${process.argv[4]||'AI'}: ${g} partidos, A gana ${(100*(r.a+r.d/2)/g).toFixed(1)}% (${r.a}-${r.d}-${r.b}), TD ${(r.ta/g).toFixed(2)}-${(r.tb/g).toFixed(2)}, bajas ${(r.casA/g).toFixed(1)}-${(r.casB/g).toFixed(1)}, ${Date.now()-t0}ms`);
})().catch(e=>{console.error('FALLO',e);process.exit(1)});
