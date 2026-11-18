const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
new Function(js)();
const BB=globalThis.__BB; let G;
(async()=>{
  const rows=[];
  BB.setHook(()=>{});
  const res=await BB.simulate(1);
  const L=res[0].log.map(x=>typeof x==='string'?x:x.t||JSON.stringify(x));
  console.log(res[0].races,res[0].score,L.length); console.log(L.slice(0,160).join('\n'));
})();
