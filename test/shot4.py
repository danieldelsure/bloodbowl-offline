from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_page(viewport={'width':1440,'height':900}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))); pg.wait_for_timeout(600)
    pg.click('text=Partido rápido'); pg.wait_for_timeout(300); pg.click('#modalBtns >> text=Jugar'); pg.wait_for_timeout(1500)
    pg.select_option('#speed','0.35')
    for i in range(12):
        pg.wait_for_timeout(2500)
        if pg.is_visible('button:text-is("Listo")'): pg.click('button:text-is("Listo")')
        pg.screenshot(path=f'test/s_p{i}.png')
        if pg.is_enabled("#bEndTurn") and i>4: break
    print(errs, pg.inner_text('#msg')[:120]); b.close()
