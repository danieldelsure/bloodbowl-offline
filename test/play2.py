import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width':1400,'height':800})
        errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html')))
        import sys
        await pg.click('text=Partido rápido'); await pg.click('#modalBtns button:first-child')
        await pg.evaluate("DELAY=0.02")
        await pg.wait_for_timeout(400)
        box = await pg.locator('#board').bounding_box(); S = box['width']/26
        async def sq(x,y): await pg.mouse.click(box['x']+(x+.5)*S, box['y']+(y+.5)*S)
        shots=0; turns=0; seg=0; fxshot=0; lastb=None
        for i in range(3000):
            if await pg.is_visible('#modal'):
                t = await pg.inner_text('#modalBody')
                if 'Ganaste' in t or 'Ganó' in t or 'Empate' in t: print('FIN:', t.replace('\n',' ')); break
                if shots<1 and 'Elige un dado' in t: await pg.screenshot(path=f'm{shots}.png'); shots+=1
                die = pg.locator('#modalBody button.die')
                if await die.count(): await die.first.click()
                else: await pg.click('#modalBtns button:first-child')
                continue
            m = await pg.inner_text('#msg')
            if 'Patada' in m: await sq(19,7)
            elif 'Formación' in m or 'Defensa sólida' in m or 'Saque rápido' in m: await pg.click('#bReady')
            elif 'Touchback' in m:
                q = await pg.evaluate("(()=>{const p=G.teams[0].players.find(hasTZ); return [p.x,p.y]})()"); await sq(q[0],q[1])
            elif '¿Seguir?' in m:
                if seg<4:
                    await pg.screenshot(path=f'seg{seg}.png'); seg+=1
                ax,ay,fx_,fy_ = lastb
                await sq(fx_,fy_) if seg%2 else await sq(ax,ay)
            elif 'Empujón.' in m or 'Sidestep.' in m or 'Hit and Run.' in m:
                s = await pg.evaluate("0"); 
                # clic en todas las casillas hasta que cambie
                for x in range(26):
                    for y in range(15):
                        if not await pg.evaluate('!!document.querySelector("#msg") && (typeof 0)==="number"') : break
                        mm = await pg.inner_text('#msg')
                        if not ('Empujón.' in mm or 'Sidestep.' in mm or 'Hit and Run.' in mm): break
                        await sq(x,y)
            elif 'Tu turno' in m or 'Selecciona' in m or 'Clic en' in m or 'Carga' in m or 'Stalling' in m:
                turns+=1
                # intenta un bloqueo y un movimiento, luego termina
                a = await pg.evaluate("""(()=>{const me=G.teams[0].players.filter(p=>p.loc==='pitch'&&!p.used&&p.state==='standing');
                  for(const p of me) for(const e of G.teams[1].players) if(e.loc==='pitch'&&e.state==='standing'&&cheb(p.x,p.y,e.x,e.y)===1&&blockDice(p,e).n>=2&&blockDice(p,e).attChooses) return [p.x,p.y,e.x,e.y]; return null})()""")
                if a and turns%2:
                    lastb=a; await sq(a[0],a[1]); await sq(a[2],a[3]); await pg.wait_for_timeout(450)
                    if fxshot<2: await pg.screenshot(path=f'fx{fxshot}.png'); fxshot+=1
                    print('dfx visible', await pg.is_visible('#dfx'), 'modal', await pg.is_visible('#modal'))
                    continue
                c = await pg.evaluate("""(()=>{const c=G.ball.carrier; if(c&&c.team===0&&!c.used&&!c.started){const mv=[...computeMoves(c).values()].filter(n=>n.prob>0.99).sort((a,b)=>b.x-a.x)[0]; if(mv) return [c.x,c.y,mv.x,mv.y];} return null})()""")
                if c: await sq(c[0],c[1]); await sq(c[2],c[3]); await pg.wait_for_timeout(200)
                if not await pg.is_visible('#modal'):
                    try: await pg.click('#bEndTurn', timeout=1500)
                    except Exception: pass
            await pg.wait_for_timeout(120)
        print('errores log:', await pg.evaluate("[...document.querySelectorAll('#log div')].map(d=>d.textContent).filter(t=>t.startsWith('Error')).join(' | ')"))
        #print('log eventos:', await pg.evaluate("G.log.filter(l=>l.startsWith('Evento')||l.startsWith('Clima')).join(' | ')"))
        print('turnos humano', turns, 'marcador', await pg.evaluate("[G.teams[0].score,G.teams[1].score,G.half,G.turn]"))
        await pg.screenshot(path='end.png')
        print('errores:', errs, 'seguir prompts', seg)
        await b.close()
asyncio.run(main())
