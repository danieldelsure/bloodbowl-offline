const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
new Function(js)();
const BB=globalThis.__BB;
(async()=>{ const res=await BB.simulate(200); const all=res.flatMap(r=>r.log);
 const c=k=>all.filter(x=>x.includes(k)).length;
 console.log('Solitario',c('Solitario'),'reroll de equipo',c('usa un reroll de equipo'));
 // fallos de jugadores con loner con rerolls
 const idx=[]; all.forEach((x,i)=>{ if(/(Ogro|Troll|Kroxigor|Hombre Árbol)[^:]*: .*falla$/.test(x)) idx.push(i)});
 console.log('fallos grandes',idx.length);
 let sin=0; for(const i of idx.slice(0,400)){ const nx=all.slice(i+1,i+3).join('|'); if(/reroll de equipo/.test(nx)&&!/Solitario/.test(all.slice(i+1,i+3).join('|')) ) sin++; }
 console.log('reroll usado sin tirada loner (fallo grande seguido de reroll)',sin);
 let n=0; for(const i of idx){ const w=all.slice(i,i+4); if(/reroll de equipo/.test(w.join('|'))&&!/Solitario/.test(w.join('|'))&&n++<4) console.log(w); }
})();
