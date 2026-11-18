const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
new Function(js+';globalThis.__Y={blockDice,markers,has,newGame,hasTZ}')();
const Y=globalThis.__Y, BB=globalThis.__BB; Y.newGame('human','human'); const G=BB.getG();
for(const t of G.teams)for(const p of t.players){p.loc='reserve';p.x=p.y=-1;p.state='standing';}
const put=(t,i,x,y)=>{const p=G.teams[t].players[i];p.loc='pitch';p.x=x;p.y=y;return p;};
const att=put(0,0,5,5), def=put(1,0,6,5); const gd=put(0,1,6,4); const mk=put(1,1,7,3);  // gd adyacente a def, marcado por mk
att.st=3;def.st=3;gd.st=3;mk.st=3;
console.log('sin guard:',JSON.stringify(Y.blockDice(att,def)));
gd.skills.add('Guard'); console.log('con guard marcado:',JSON.stringify(Y.blockDice(att,def)),'marcadores gd:',Y.markers(gd,def).length);
