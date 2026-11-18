const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB;
(async()=>{
  const N=+process.argv[2]||60;
  const pat={stab:/apuñala a/,vomit:/usa Vómito/,hr:/Hit and Run/,ttm:/levanta a .* para lanzarlo/,punt:/despeja el balón/};
  const cnt={stab:0,vomit:0,hr:0,ttm:0,punt:0}; let games=0, err=0;
  for(let k=0;k<N;k++){
    try{
      const out=await BB.simulate(1,BB.AI2); games++;
      for(const line of out[0].log) for(const [n,r] of Object.entries(pat)) if(r.test(line)) cnt[n]++;
    }catch(e){err++; console.log('ERR',e.message)}
  }
  console.log('partidos',games,'errores',err,JSON.stringify(cnt));
})();
