const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
new Function(js)();
const BB=globalThis.__BB; BB.setHook(()=>BB.checkInvariants());
(async()=>{
  const N=+process.argv[2]||300, t0=Date.now(); const res=await BB.simulate(N);
  const st={}; let cas=0;
  for(const r of res){ cas+=r.cas; r.races.forEach((rc,i)=>{ const s=st[rc]=st[rc]||{g:0,w:0,d:0,td:0}; s.g++; s.td+=r.score[i]; if(r.score[i]>r.score[1-i]) s.w++; else if(r.score[i]===r.score[1-i]) s.d++; }); }
  console.log('partidos',N,'ms',Date.now()-t0,'bajas/partido',(cas/N).toFixed(1));
  for(const k in st) console.log(k.padEnd(9),'jug',st[k].g,'gana',(100*st[k].w/st[k].g).toFixed(0)+'%','TD/p',(st[k].td/st[k].g).toFixed(2));
  const all=res.flatMap(r=>r.log); const c=k=>all.filter(x=>x.includes(k)).length;
  const keys=['Wrestle','Frenzy','Stand Firm','Fend','Sidestep','Juggernaut','Claws','Dauntless','Hatred','Eye Gouge','Jump Up','Steady Footing','Safe Pass','Foul Appearance','No Ball','Shadowing','Diving Tackle','Take Root','echa raíces','sigue en el suelo','Break Tackle','enraizado','Saltar','Stalling','intercepta'];
  console.log(Object.fromEntries(keys.map(k=>[k,c(k)])));
})().catch(e=>{console.error('FALLO',e);process.exit(1)});
