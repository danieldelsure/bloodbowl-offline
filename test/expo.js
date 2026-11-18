const fs=require('fs');
const html=fs.readFileSync(process.env.HTML||require('path').join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1]+';globalThis.__Y={cheb}')();
const BB=globalThis.__BB, Y=globalThis.__Y; if(process.env.FLAGS)Object.assign(BB.AI2.f,JSON.parse(process.env.FLAGS));
(async()=>{
  const N=+process.argv[2]||30; let iso=0,iso1=0,expo=0,turns=0, hasC=0, adjE=0, adjE0=0, reach=0, surfs=0;
  const orig=BB.AI2.prototype.playTurn;
  BB.AI2.prototype.playTurn=async function(){
    await orig.call(this);
    const G=BB.getG(), c=G.ball.carrier; turns++;
    if(c&&c.team===this.t&&c.loc==='pitch'){ hasC++;
      const foes=G.teams[1-this.t].players.filter(p=>p.loc==='pitch'&&p.state==='standing');
      const friends=G.teams[this.t].players.filter(p=>p.loc==='pitch'&&p!==c&&p.state==='standing');
      const ae=foes.filter(e=>Y.cheb(e.x,e.y,c.x,c.y)===1).length, af=friends.filter(f=>Y.cheb(f.x,f.y,c.x,c.y)===1).length;
      if(ae>0){adjE++; if(af===0)adjE0++;} if(af===0)iso++; if(af<=1)iso1++; const th=foes.filter(e=>Y.cheb(e.x,e.y,c.x,c.y)<=e.ma+1).length; if(th>=3&&af<=1)expo++;
    }
  };
  for(let k=0;k<N;k++){ BB.newGame('human','orc'); const G=BB.getG(); G.teams[0].ctrl=new BB.AI2(0);G.teams[1].ctrl=new BB.AI2(1); await BB.runMatch();
    surfs+=G.log.filter(l=>/público|multitud|a la grada|crowd/i.test(l)).length; }
  console.log('sin compañeros adyacentes',iso,'con 1 o menos',iso1,'alcanzable por 3+ rivales y <=1 compañero',expo,'| turnos',turns,'con portador propio',hasC,'portador con rival adyacente al terminar',adjE,'y sin compañero adyacente',adjE0,'| lineas de surf en log',surfs);
})();
