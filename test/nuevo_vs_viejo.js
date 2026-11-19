// IA2 por defecto (nueva) vs valores de fábrica antiguos y vs IA base. uso: node test/nuevo_vs_viejo.js [pares]
const fs=require('fs'),path=require('path'),cp=require('child_process');
const HTML=path.join(__dirname,'..','index.html');
const VIEJO={blkMin:1.5,pBadC:0.35,pBadO:0.2,passP:0.6,thrFree:0.95,thrMarked:0.62,pcost:2.5,press:1,wait:0,advW:1.15,expW:1,foulMin:0.45};
if(process.argv[2]==='--w'){
  new Function(fs.readFileSync(HTML,'utf8').match(/<script>([\s\S]*)<\/script>/)[1])();
  const BB=globalThis.__BB,T=BB.TDC.teams;
  process.on('message',async job=>{let w=0,d=0,l=0;
    for(let i=0;i<job.pares;i++){const x=Math.floor(Math.random()*T.length);let y;do{y=Math.floor(Math.random()*T.length)}while(y===x);
      for(const sw of [false,true]){BB.newGame(T[x],T[y]);const G=BB.getG();const ca=sw?1:0,cb=1-ca;
        G.teams[ca].ctrl=new BB.AI2(ca); // defaults nuevos + plan por defecto
        if(job.rival==='viejo'){G.teams[cb].ctrl=new BB.AI2(cb,VIEJO);G.teams[cb].plan=JSON.parse(JSON.stringify(BB.PRESETS.equil));}
        else G.teams[cb].ctrl=new BB.AI(cb);
        await BB.runMatch();const a=G.teams[ca].score,b=G.teams[cb].score;if(a>b)w++;else if(a<b)l++;else d++;}}
    process.send({w,d,l});});
}else{
  const P=+process.argv[2]||200;
  const run=rival=>new Promise(res=>{let W=0,D=0,L=0,n=0;for(let i=0;i<2;i++){const c=cp.fork(__filename,['--w']);c.on('message',r=>{W+=r.w;D+=r.d;L+=r.l;c.kill();if(++n===2){const t=W+D+L;res(`${rival}: ${((W+D/2)/t*100).toFixed(1)}% (${t} partidas, ±${(196*Math.sqrt(.25/t)).toFixed(1)})`);}});c.send({pares:P/2,rival});}});
  (async()=>{console.log('IA2 nueva vs',await run('viejo'));console.log('IA2 nueva vs',await run('IA base'));})();
}
