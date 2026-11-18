const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
new Function(js+';globalThis.__X={ROSTERS,TDC}')();
const {ROSTERS,TDC}=globalThis.__X; let miss=new Set(),tot=0,ex=0;
const strip=k=>k.replace(/ \(.*\)/,'').replace('Side Step','Sidestep');
for(const t of TDC.teams){ const rk=Object.keys(ROSTERS).find(k=>ROSTERS[k].name===t.race); if(!rk){miss.add('RACE '+t.race);continue;}
  for(const p of t.players){ const d=ROSTERS[rk].players.find(x=>x.pos===p.pos); tot++; if(!d){miss.add(t.race+':'+p.pos);continue;}
    const base=d.sk.map(strip); const e=p.sk.filter(k=>!base.includes(strip(k))); if(e.length)ex++; if(t.name==='Ancla Boyz')console.log(p.name,p.pos,'extra:',e.join(','),'| base',d.sk.join(','));}}
console.log('total',tot,'con extra',ex,'sin base',[...miss]);
