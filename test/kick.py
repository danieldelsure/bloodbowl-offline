from playwright.sync_api import sync_playwright
URL='file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_context(viewport={'width':1440,'height':900}).new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(500)
    pg.click('text=Partido rápido'); pg.wait_for_timeout(300)
    pg.click('label:has(input[value="m"])'); pg.click('#modalBtns >> text=Jugar'); pg.wait_for_timeout(1200)
    pg.click('#modalBtns >> text=Listo, seguir')
    for i in range(80):
        pg.wait_for_timeout(250)
        if pg.is_visible('#bnr .bn.kick'):
            pg.wait_for_timeout(300); print(pg.inner_text('#bnr')); pg.screenshot(path='test/kick.png'); break
    print('errores',errs); b.close()
