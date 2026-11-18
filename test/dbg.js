const fs=require('fs');
const html=fs.readFileSync('/home/claude/bloodbowl-src.html','utf8');
let js=html.match(/<script>([\s\S]*)<\/script>/)[1].replace('/*ASSETS*/','');
js+=`\nglobalThis.__T={newGame,AI,computeMoves,pathOf,getG:()=>G};`;
new Function(js)();
const T=globalThis.__T;
T.newGame('orc','human'); const G=T.getG(); G.phase='turn'; G.active=0;
function put(p,x,y,st){p.loc='pitch';p.x=x;p.y=y;p.state=st||'standing';return p;}
const p=put(G.teams[0].players[1],10,7); put(G.teams[1].players[6],11,7,'prone'); put(G.teams[1].players[7],11,6); put(G.teams[1].players[8],11,8);
const mv=T.computeMoves(p); const n=mv.get(7*26+12); console.log(n&&{prob:n.prob,steps:n.steps,jump:n.jump,path:T.pathOf(n)});
