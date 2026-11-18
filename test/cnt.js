const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
new Function(js)();
const BB=globalThis.__BB; Object.assign(BB.AI2.f,JSON.parse(process.argv[2]||'{}'));
(async()=>{ let f=0,e=0,n=40; const old=BB.AI;
  for(let k=0;k<n;k++){ const r=await BB.simulate(1,BB.AI2); f+=r[0].log.filter(x=>String(x).includes('comete falta')).length; e+=r[0].log.filter(x=>String(x).includes('expulsa')||String(x).includes('Expulsad')).length; }
  console.log('faltas/partido',(f/n).toFixed(2),'expulsiones',(e/n).toFixed(2)); })();
