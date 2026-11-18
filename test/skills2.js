const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB;
(async()=>{
  const [r0,r1,N]=[process.argv[2],process.argv[3],+process.argv[4]||60];
  const pat={stab:/apuñala a/,vomit:/usa Vómito/,hr:/Hit and Run/,ttm:/levanta a .* para lanzarlo/,punt:/despeja el balón/,tdttm:/aterriza de pie/};
  const cnt={}; for(const k in pat)cnt[k]=0; let td=0;
  for(let k=0;k<N;k++){
    BB.newGame(r0,r1); const G=BB.getG();
    G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1);
    await BB.runMatch();
    for(const line of G.log) for(const [n,r] of Object.entries(pat)) if(r.test(line)) cnt[n]++;
  }
  console.log(r0,'vs',r1,N,'partidos',JSON.stringify(cnt));
})().catch(e=>console.log('ERR',e));
