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
        r = await pg.evaluate("""(()=>{const me=G.teams[0].players.filter(p=>p.loc==='pitch'&&p.state==='standing');
          for(const p of me){ if(markers(p).length) continue; for(const [dx,dy] of DIRS){const x=p.x+dx,y=p.y+dy; if(inPitch(x,y)&&!playerAt(x,y)){ const e=G.teams[1].players.find(q=>q.loc==='pitch'&&q.state==='standing'); e.x=x;e.y=y; render(); return [p.x,p.y,x,y]}}} return null})()""")
        print(r)
        box = await pg.locator('#board').bounding_box(); S = box['width']/26
        await sq(r[0],r[1]); await pg.wait_for_timeout(300)
        await pg.click('#bBlitz'); await pg.wait_for_timeout(200)
        await sq(r[2],r[3])
        for i in range(30):
            await pg.wait_for_timeout(400)
            m = await pg.inner_text('#msg')
            if await pg.is_visible('#modal'):
                t=await pg.inner_text('#modalBody'); print('modal',t[:80].replace('\n',' '))
                die = pg.locator('#modalBody button.die')
                if await die.count(): await die.first.click()
                else: await pg.click('#modalBtns button:first-child')
            elif '¿Seguir?' in m: await sq(r[0],r[1])
            elif 'Empujón.' in m:
                for x in range(26):
                    for y in range(15):
                        mm = await pg.inner_text('#msg')
                        if 'Empujón.' not in mm: break
                        await sq(x,y)
            else: break
        print(await pg.inner_text('#msg'))
        st = await pg.evaluate("(()=>{const p=G.teams[0].players.find(q=>q.started&&q.loc==='pitch'); const e=playerAt(%d,%d)||null; return p?[p.x,p.y,p.state,p.maLeft,p.rushes,p.action,[...computeMoves(p).keys()].length, G.teams[1].players.filter(q=>q.state!=='standing'&&q.loc==='pitch').length]:null})()" % (r[2],r[3]))
        print(st)
        print(await pg.evaluate("[...document.querySelectorAll('#log div')].slice(-5).map(d=>d.textContent)"))
        print(await pg.evaluate("[...document.querySelectorAll('#actions button')].map(b=>b.textContent+':'+(b.disabled?'off':'on')).join(',')"))
        await pg.screenshot(path='dbg5.png'); print(errs); await b.close()
asyncio.run(main())
