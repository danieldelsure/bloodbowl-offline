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
        await pg.click('#bEndTurn'); await pg.wait_for_timeout(500)
        print('bnr visible', await pg.is_visible('#bnr'), await pg.inner_text('#bnr'))
        await pg.screenshot(path='bnr.png')
        await pg.wait_for_timeout(1500)
        print(errs); await b.close()
asyncio.run(main())
