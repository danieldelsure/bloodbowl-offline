const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
new Function(js)();
const BB=globalThis.__BB;
(async()=>{
  let bad=0;
  for(let trial=0;trial<40;trial++){
    BB.newGame('human','orc'); let G=BB.getG();
    G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1);
    let n=0, cap=null; const target=3+Math.floor(Math.random()*40);
    BB.setSnapHook((k,a)=>{ if(++n===target) cap={k,a,str:BB.snapG()}; });
    await BB.runMatch();
    if(!cap){continue;}
    G=BB.restoreG(cap.str);
    if(BB.snapG()!==cap.str){bad++;console.log('roundtrip distinto',trial);}
    G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1);
    BB.setSnapHook(null);
    try{ await BB.runMatch(cap.k==='drive'?{}:{a:cap.a}); }catch(e){bad++;console.log('FALLO reanudando',cap.k,e.stack.split('\n').slice(0,3).join(' | '));}
    G=BB.getG(); if(G.phase!=='over'){bad++;console.log('no terminó',cap.k,G.phase);}
  }
  console.log('listo, errores:',bad);
})();
