from playwright.sync_api import sync_playwright
URL='file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_context(viewport={'width':1440,'height':900}).new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(500)
    pg.click('text=Partido rápido'); pg.wait_for_timeout(300); pg.click('#modalBtns >> text=Jugar'); pg.wait_for_timeout(1500)
    print('picker:',pg.is_visible('.lu-list'), pg.inner_text('#luCount'))
    pg.screenshot(path='test/lineup.png')
    ids_before=pg.evaluate("G.teams[0].players.filter(p=>p.loc==='pitch').map(p=>p.id)")
    # sacar al primero marcado y meter al no marcado
    boxes=pg.query_selector_all('.lu-row input'); on=[x for x in boxes if x.is_checked()]; off=[x for x in boxes if not x.is_checked()]
    on[0].click(); pg.wait_for_timeout(100); print('tras quitar:',pg.inner_text('#luCount'), 'aceptar deshabilitado:',pg.is_disabled('#modalBtns button >> nth=0'))
    off[0].click(); pg.wait_for_timeout(100); print('tras agregar:',pg.inner_text('#luCount'))
    pg.click('#modalBtns >> text=Aceptar'); pg.wait_for_timeout(600)
    ids_after=pg.evaluate("G.teams[0].players.filter(p=>p.loc==='pitch').map(p=>p.id)")
    print('cambio:',sorted(ids_before)!=sorted(ids_after), len(ids_after), 'lineup guardado:',pg.evaluate("G.teams[0].lineup&&G.teams[0].lineup.length"))
    print('boton visible:',pg.is_visible('#bLineup'))
    pg.click('#bLineup'); pg.wait_for_timeout(300); print('reabre:',pg.is_visible('.lu-list')); pg.click('#modalBtns >> text=Cancelar'); pg.wait_for_timeout(200)
    print('errores',errs); b.close()
