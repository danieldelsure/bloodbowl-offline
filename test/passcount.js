// cuenta pases y entregas por partido de un equipo (AI2 vs AI2), con el log del motor
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB, T=BB.TDC.teams; if(process.env.FLAGS)Object.assign(BB.AI2.f,JSON.parse(process.env.FLAGS));
const ME=process.argv[2].split(',').map(n=>T.findIndex(t=>t.name.startsWith(n))), N=+process.argv[3]||2;
(async()=>{ for(const me of ME){ let pa=0,ha=0,td=0,n=0,w=0;
  for(let j=0;j<T.length;j++){ if(j===me)continue; for(let k=0;k<N;k++){ const side=k%2; BB.newGame(T[side?j:me],T[side?me:j]); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0); G.teams[1].ctrl=new BB.AI2(1); await BB.runMatch();
    const nm=T[me].coach||T[me].name; n++; td+=G.teams[side].score; w+=G.teams[side].score>G.teams[1-side].score?1:G.teams[side].score===G.teams[1-side].score?.5:0;
    const mine=new Set(G.teams[side].players.map(p=>p.name)); for(const l of G.log){ const m=l.match(/^(.*?) (lanza un pase|entrega el balón)/); if(m&&mine.has(m[1])){ if(m[2]==='lanza un pase')pa++; else ha++; } } } }
  console.log(T[me].name,T[me].race,'pases/partido',(pa/n).toFixed(2),'entregas',(ha/n).toFixed(2),'TD',(td/n).toFixed(2),'win%',(100*w/n).toFixed(1)); } })();
