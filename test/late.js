const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB;
(async()=>{
  for (const sc of ['balanced','late','fast']) {
    const hist={}; let tds=0, seen=null;
    BB.setHook(()=>{ const G=BB.getG(); if(G.td!=null && seen!==G.td+'|'+G.turn.join()+G.teams[0].score+G.teams[1].score){ seen=G.td+'|'+G.turn.join()+G.teams[0].score+G.teams[1].score; if(G.td===0){const t=G.turn[0]; hist[t]=(hist[t]||0)+1; tds++;} } });
    const p=Object.assign({},BB.PRESETS.equil,{scoring:sc});
    for(let k=0;k<25;k++){ await BB.bench(1,BB.AI2,BB.AI2,p,BB.PRESETS.equil); }
    console.log(sc,'TD del equipo A por turno:',JSON.stringify(hist),'total',tds);
  }
})();
