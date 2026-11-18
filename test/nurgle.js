const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB; if(process.env.FLAGS)Object.assign(BB.AI2.f,JSON.parse(process.env.FLAGS)); const T=BB.TDC.teams; const ME=+(process.argv[2]??15), N=+(process.argv[3]||8);
(async()=>{ const tot={w:0,d:0,l:0,tf:0,ta:0,cf:0,ca:0,n:0}, per={};
  for(let j=0;j<T.length;j++){ if(j===ME)continue; const r={w:0,d:0,l:0};
    for(let k=0;k<N;k++){ const me=k%2; const a=me?j:ME, b=me?ME:j;
      BB.newGame(T[a],T[b]); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1); if(process.env.PLAN) G.teams[me].plan=JSON.parse(JSON.stringify(BB.PRESETS[process.env.PLAN])); await BB.runMatch();
      const s=[G.teams[0].score,G.teams[1].score], cas=t=>G.teams[1-t].players.filter(p=>p.loc==='cas').length;
      const mi=me, sf=s[mi], sa=s[1-mi]; tot.tf+=sf; tot.ta+=sa; tot.cf+=cas(mi); tot.ca+=cas(1-mi); tot.n++;
      if(sf>sa){tot.w++;r.w++;} else if(sf<sa){tot.l++;r.l++;} else {tot.d++;r.d++;} }
    per[T[j].name]=r; }
  console.log(T[ME].name, JSON.stringify(tot)); console.log(JSON.stringify(per));
})();
