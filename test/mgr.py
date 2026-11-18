from playwright.sync_api import sync_playwright
URL='file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_context(viewport={'width':1440,'height':900}).new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(500)
    pg.click('text=Partido rápido'); pg.wait_for_timeout(300)
    pg.screenshot(path='test/m_menu.png')
    pg.click('label:has(input[value="m"])'); pg.click('#modalBtns >> text=Jugar'); pg.wait_for_timeout(1500)
    print('panel:',pg.is_visible('#cpPre'), pg.inner_text('#modalBody')[:140].replace('\n',' '))
    pg.screenshot(path='test/m_panel.png')
    pg.click('#cpPre >> text=Cerrojo'); pg.wait_for_timeout(300)
    print('def/att/sco:',pg.input_value('#cpDef'),pg.input_value('#cpAtt'),pg.input_value('#cpSco'))
    pg.fill('#cpRisk','60') if False else None
    pg.select_option('#cpFou','never'); pg.wait_for_timeout(200)
    print('desc:',pg.inner_text('#cpPd'))
    pg.screenshot(path='test/m_panel2.png')
    pg.click('#modalBtns >> text=Listo, seguir'); pg.wait_for_timeout(500)
    print('plan en G:',pg.evaluate("JSON.stringify(G.teams[0].plan)"), pg.evaluate("G.mgr"))
    pg.select_option('#speed','0.35')
    # esperar al panel de touchdown o medio tiempo
    got=None
    for i in range(240):
        pg.wait_for_timeout(500)
        if pg.is_visible('#cpPre'): got=pg.inner_text('#modalBody')[:110].replace('\n',' '); break
    print('segundo panel:',got, pg.evaluate("[G.half,G.turn,G.teams[0].score,G.teams[1].score]"))
    pg.screenshot(path='test/m_panel3.png')
    if got:
        pg.click('#modalBtns >> text=Listo, seguir'); pg.wait_for_timeout(1500)
        pg.click('#bPause'); pg.wait_for_timeout(400); print('pausa:',pg.inner_text('#modalBody')[:100].replace('\n',' '))
        pg.click('#modalBtns >> text=Guardar y volver al menú'); pg.wait_for_timeout(1200)
        pg.click('#modalBtns >> text=Continuar partida'); pg.wait_for_timeout(2000)
        print('tras cargar:',pg.evaluate("[G.mgr,G.half,G.turn,JSON.stringify(G.teams[0].plan).slice(0,60)]"))
        pg.wait_for_timeout(4000); print('sigue:',pg.evaluate("[G.phase,G.active,G.turn]"))
    print('errores:',errs); b.close()
