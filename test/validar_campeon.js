// Valida el campeón de evolucion.js contra la IA2 de fábrica con partidas espejo frescas.
// uso: node test/validar_campeon.js [pares] [modo: evo|real]
const fs=require('fs'),path=require('path'),cp=require('child_process');
const HTML=path.join(__dirname,'..','index.html');
const CH=JSON.parse(fs.readFileSync(path.join(__dirname,'..','evolucion','mejores_parametros.json'),'utf8'));
const modo=process.argv[3]||'evo';
if(process.argv[2]==='--w'){
  new Function(fs.readFileSync(HTML,'utf8').match(/<script>([\s\S]*)<\/script>/)[1])();
  const BB=globalThis.__BB,T=BB.TDC.teams;
  const f={};for(const k in CH)if(k!=='risk'&&k!=='style')f[k]=CH[k];
  process.on('message',async job=>{let w=0,d=0,l=0;
    for(let i=0;i<job.pares;i++){const x=Math.floor(Math.random()*T.length);let y;do{y=Math.floor(Math.random()*T.length)}while(y===x);
      for(const sw of [false,true]){BB.newGame(T[x],T[y]);const G=BB.getG();const ca=sw?1:0,cb=1-ca;
        G.teams[ca].ctrl=new BB.AI2(ca,f);G.teams[cb].ctrl=new BB.AI2(cb);
        const eq=()=>JSON.parse(JSON.stringify(BB.PRESETS.equil));
        const pc=eq();pc.risk=CH.risk;pc.style=CH.style;G.teams[ca].plan=pc;
        if(job.modo==='evo')G.teams[cb].plan=eq(); // como en la evolución
        else delete G.teams[cb].plan; // fábrica real (plan por raza)
        if(job.modo==='real'){ /* campeón también con plan por raza salvo risk/style */ }
        await BB.runMatch();const a=G.teams[ca].score,b=G.teams[cb].score;if(a>b)w++;else if(a<b)l++;else d++;}}
    process.send({w,d,l});});
}else{
  const P=+process.argv[2]||300,N=2;let W=0,D=0,L=0,n=0;
  for(let i=0;i<N;i++){const c=cp.fork(__filename,['--w',0,modo]);c.on('message',r=>{W+=r.w;D+=r.d;L+=r.l;c.kill();if(++n===N){const t=W+D+L,s=(W+D/2)/t;console.log(modo,'campeón vs fábrica:',(s*100).toFixed(1)+'%','(',t,'partidas ) W',W,'D',D,'L',L,'±',(100*Math.sqrt(.25/t)*1.96).toFixed(1));}});c.send({pares:Math.ceil(P/N),modo});}
}
