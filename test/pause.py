from playwright.sync_api import sync_playwright
import json
URL='file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))
def state(pg): return pg.evaluate("JSON.stringify({t:G.turn,h:G.half,act:G.active,ph:G.phase,pos:G.teams.map(t=>t.players.map(p=>[p.x,p.y,p.state,p.loc])),ball:[G.ball.x,G.ball.y]})")
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':1440,'height':900}); pg=ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(500)
    pg.click('text=Partido rápido'); pg.wait_for_timeout(300); pg.click('#modalBtns >> text=Jugar'); pg.wait_for_timeout(1200)
    pg.select_option('#speed','0.35')
    for i in range(30):
        pg.wait_for_timeout(700)
        if pg.is_visible('button:text-is("Listo")') and pg.is_enabled('button:text-is("Listo")'): pg.click('button:text-is("Listo")')
        if pg.evaluate("G.phase==='turn' && G.active===0"): break
    pg.wait_for_timeout(500)
    print('turno humano', pg.evaluate("[G.half,G.turn]"))
    # mover un jugador para tener estado a mitad de turno
    s0=state(pg)
    pg.click('#bPause'); pg.wait_for_timeout(300)
    print('menu pausa:', pg.inner_text('#modalBody')[:140].replace('\n',' '))
    pg.click('#modalBtns >> text=Guardar y volver al menú'); pg.wait_for_timeout(1200)
    print('menu principal:', [x.inner_text() for x in pg.query_selector_all('#modalBtns button')])
    pg.click('#modalBtns >> text=Continuar partida'); pg.wait_for_timeout(1500)
    s1=state(pg); print('estado igual tras cargar:', s0==s1, pg.evaluate("[ui_ok=document.getElementById('bEndTurn').disabled]"))
    # pausa durante turno IA
    pg.click('#bEndTurn'); pg.wait_for_timeout(1500)
    pg.click('#bPause'); pg.wait_for_timeout(300)
    a=pg.evaluate("G.log.length"); pg.wait_for_timeout(3000); bb=pg.evaluate("G.log.length")
    print('IA congelada en pausa:', a==bb, a, bb)
    print(pg.inner_text('#modalBody')[:200].replace('\n',' '))
    pg.click('#modalBtns >> text=Continuar'); pg.wait_for_timeout(6000)
    print('reanuda tras continuar:', pg.evaluate("G.log.length")>bb, pg.evaluate("[G.active,G.phase]"))
    print(errs); b.close()
