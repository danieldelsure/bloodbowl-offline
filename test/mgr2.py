from playwright.sync_api import sync_playwright
URL='file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_context(viewport={'width':1440,'height':900}).new_page()
    pg.goto(URL); pg.wait_for_timeout(500)
    pg.click('text=Partido rápido'); pg.wait_for_timeout(300)
    pg.click('label:has(input[value="m"])'); pg.wait_for_timeout(100); pg.screenshot(path='test/m_menu.png',clip={'x':430,'y':220,'width':580,'height':470})
    pg.click('#modalBtns >> text=Jugar'); pg.wait_for_timeout(1500)
    pg.click('#cpPre >> text=Locura ofensiva'); pg.wait_for_timeout(300)
    pg.screenshot(path='test/m_panel2.png')
    b.close()
