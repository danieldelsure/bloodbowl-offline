import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width':1400,'height':800}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html')))
        await pg.click('text=Partido rápido'); await pg.click('#modalBtns button:first-child'); await pg.evaluate("DELAY=0.02")
        await pg.wait_for_timeout(400)
        box = await pg.locator('#board').bounding_box(); S = box['width']/26
        async def sq(x,y): await pg.mouse.click(box['x']+(x+.5)*S, box['y']+(y+.5)*S)
        for i in range(80):
            if await pg.is_visible('#modal'): await pg.click('#modalBtns button:first-child'); continue
            m = await pg.inner_text('#msg')
            if 'Patada inicial.' in m: await sq(19,7)
            elif 'Formación' in m or 'Defensa' in m or 'Saque' in m: await pg.click('#bReady')
            elif 'Touchback' in m or 'On the Ball' in m:
                q = await pg.evaluate("(()=>{const p=G.teams[0].players.find(hasTZ); return [p.x,p.y]})()"); await sq(q[0],q[1])
            elif 'Carga' in m or 'Stalling' in m:
                try: await pg.click('#bEndTurn', timeout=1500)
                except Exception: pass
            elif 'Tu turno' in m: break
            await pg.wait_for_timeout(300)
        # tumbar un rival adyacente a uno mio
        r = await pg.evaluate("""(()=>{const me=G.teams[0].players.filter(p=>p.loc==='pitch'&&p.state==='standing');
          for(const p of me) for(const e of G.teams[1].players) if(e.loc==='pitch'&&cheb(p.x,p.y,e.x,e.y)===1){ e.state='prone'; render(); return [p.x,p.y,e.x,e.y,p.pos,computeMoves(p).size]} return null})()""")
        print(r)
        box = await pg.locator('#board').bounding_box(); S = box['width']/26
        await sq(r[0],r[1]); await pg.wait_for_timeout(300)
        print(await pg.inner_text('#msg'), await pg.inner_text('#cardL'))
        mv = await pg.evaluate(f"(()=>{{const p=playerAt({r[0]},{r[1]}); const m=[...computeMoves(p).values()].find(n=>n.prob>.3); return m?[m.x,m.y]:null}})()")
        print('mv',mv)
        await sq(*mv); await pg.wait_for_timeout(800)
        print(await pg.inner_text('#msg'), await pg.evaluate("[document.querySelector('#modal').hidden, [...document.querySelectorAll('#log div')].slice(-3).map(d=>d.textContent)]"))
        print(errs); await pg.screenshot(path='dbg2.png'); await b.close()
asyncio.run(main())
