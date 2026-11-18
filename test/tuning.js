// uso: node test/tuning.js <desde> <hasta> <partidos por rival> <presets separados por coma>
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB, T=BB.TDC.teams;
const [lo,hi,N,pl]=[+process.argv[2],+process.argv[3],+process.argv[4]||4,(process.argv[5]||'equil,cerrojo,banda,bash,locura').split(',')];
(async()=>{
  for(let me=lo;me<hi;me++){ const out={};
    for(const pn of pl){ let pts=0,n=0,tf=0,ta=0;
      for(let j=0;j<T.length;j++){ if(j===me)continue;
        for(let k=0;k<N;k++){ const side=k%2, a=side?j:me, b=side?me:j;
          BB.newGame(T[a],T[b]); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1);
          G.teams[side].plan=JSON.parse(JSON.stringify(BB.PRESETS[pn])); await BB.runMatch();
          const s=[G.teams[0].score,G.teams[1].score]; tf+=s[side]; ta+=s[1-side]; n++; pts+= s[side]>s[1-side]?1:s[side]===s[1-side]?0.5:0; } }
      out[pn]={win:+(100*pts/n).toFixed(1),tf:+(tf/n).toFixed(2),ta:+(ta/n).toFixed(2),n}; }
    console.log(JSON.stringify({i:me,name:T[me].name,race:T[me].race,out})); }
})();
