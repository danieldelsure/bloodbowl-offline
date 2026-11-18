from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_page(viewport={'width':1440,'height':900}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))); pg.wait_for_timeout(600)
    pg.click('text=Partido rápido'); pg.wait_for_timeout(300); pg.click('#modalBtns >> text=Jugar'); pg.wait_for_timeout(2500)
    pg.screenshot(path='test/s_g.png'); print(errs, pg.evaluate("document.getElementById('modal').hidden")); b.close()
