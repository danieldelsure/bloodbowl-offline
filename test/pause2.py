from playwright.sync_api import sync_playwright
URL='file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_context(viewport={'width':1440,'height':900}).new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(500)
    pg.click('text=Partido rápido'); pg.wait_for_timeout(300); pg.click('#modalBtns >> text=Jugar'); pg.wait_for_timeout(1200)
    pg.select_option('#speed','0.35')
    for i in range(30):
        pg.wait_for_timeout(700)
        if pg.is_visible('button:text-is("Listo")') and pg.is_enabled('button:text-is("Listo")'): pg.click('button:text-is("Listo")')
        if pg.evaluate("G.phase==='turn' && G.active===0 && G.turn[0]>=1 && !document.getElementById('bEndTurn').disabled"): break
    pg.wait_for_timeout(600)
    # elegir un humano en cancha y moverlo una casilla
    info=pg.evaluate("""(()=>{const c=document.getElementById('board'),r=c.getBoundingClientRect(),S=r.width/26;const pl=G.teams[0].players.filter(p=>p.loc==='pitch'&&p.state==='standing');const q=pl.find(p=>!G.teams[1].players.some(o=>o.loc==='pitch'&&Math.abs(o.x-p.x)<=1&&Math.abs(o.y-p.y)<=1));return {x:r.left+(q.x+.5)*S,y:r.top+(q.y+.5)*S,S,px:q.x,py:q.y,id:q.id}})()""")
    pg.mouse.click(info['x'],info['y']); pg.wait_for_timeout(300)
    pg.mouse.click(info['x']-info['S'],info['y']); pg.wait_for_timeout(2500)
    cur=pg.evaluate("G.cur?[G.cur.id,G.cur.x,G.cur.y,G.cur.started]:null"); print('jugador activo antes:',cur, 'ini',info['px'],info['py'])
    print('modal:',pg.is_visible('#modal') and pg.inner_text('#modalBody')[:150].replace(chr(10),' '))
    if pg.is_visible('#modal'): pg.click('#modalBtns button >> nth=0'); pg.wait_for_timeout(2500)
    print('activo:',pg.evaluate('G.cur?[G.cur.id,G.cur.x,G.cur.y,G.cur.started]:null'))
    pg.click('#bPause'); pg.wait_for_timeout(300); print(pg.inner_text('#modalBody')[:130].replace(chr(10),' '))
    pg.click('#modalBtns >> text=Guardar y volver al menú'); pg.wait_for_timeout(1200)
    pg.click('#modalBtns >> text=Continuar partida'); pg.wait_for_timeout(1500)
    print('jugador activo tras cargar:',pg.evaluate("G.cur?[G.cur.id,G.cur.x,G.cur.y,G.cur.started]:null"), pg.evaluate("[G.active,G.phase]"))
    pg.screenshot(path='test/s_resume.png')
    pg.click('#bEndTurn'); pg.wait_for_timeout(5000); print('sigue jugando:',pg.evaluate("[G.active,G.phase,G.turn]"))
    pg.click('#bPause'); pg.wait_for_timeout(400); pg.screenshot(path='test/s_pause.png',clip={'x':300,'y':150,'width':800,'height':500})
    print(errs); b.close()
