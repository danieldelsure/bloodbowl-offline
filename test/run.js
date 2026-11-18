const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
new Function(js)();
const BB=globalThis.__BB;
BB.setHook(()=>BB.checkInvariants());
(async()=>{
  const N=+process.argv[2]||40; let tot=[0,0],byRace={human:0,orc:0},wins={human:0,orc:0,draw:0},cas=0;
  const t0=Date.now();
  const res=await BB.simulate(N);
  for(const r of res){ r.races.forEach((rc,i)=>byRace[rc]+=r.score[i]); cas+=r.cas;
    const h=r.score[r.races.indexOf('human')], o=r.score[r.races.indexOf('orc')]; wins[h>o?'human':o>h?'orc':'draw']++; }
  console.log('partidos',N,'ms',Date.now()-t0,'TD',byRace,'wins',wins,'bajas/partido',(cas/N).toFixed(1));
  const l=res[0].log; console.log(l.length,'lineas log'); console.log(l.slice(0,60).join('\n'));
  const all=res.flatMap(r=>r.log); const c=k=>all.filter(x=>x.includes(k)).length;
  console.log({turnover:c('Turnover'),td:c('TOUCHDOWN'),pase:c('lanza un pase'),inter:c('intercepta'),publico:c('al público'),touchback:c('Touchback'),asegurar:c('Asegurar'),blitzRush:c('Esprintar'),entrega:c('entrega el balón'),sale:c('sale del campo')});
})().catch(e=>{console.error('FALLO',e);process.exit(1)});
