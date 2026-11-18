from playwright.sync_api import sync_playwright
URL='file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_context(viewport={'width':1440,'height':900}).new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(500)
    pg.click('#modalBtns >> text=Torneo de Campeones II'); pg.wait_for_timeout(300)
    pg.click('#modalBtns >> text=Empezar torneo'); pg.wait_for_timeout(400)
    pg.click('#modalBtns >> text=Jugar mi partido'); pg.wait_for_timeout(1200)
    pg.select_option('#speed','0.35')
    for i in range(60):
        pg.wait_for_timeout(700)
        if pg.is_visible('button:text-is("Listo")') and pg.is_enabled('button:text-is("Listo")'): pg.click('button:text-is("Listo")')
        t=pg.inner_text('#msg')
        if 'Haz clic en la casilla del campo rival' in t:
            r=pg.evaluate("(()=>{const r=document.getElementById('board').getBoundingClientRect();return [r.left,r.top,r.width/26]})()"); pg.mouse.click(r[0]+19.5*r[2],r[1]+7.5*r[2])
        if 'Touchback' in t:
            q=pg.evaluate("(()=>{const r=document.getElementById('board').getBoundingClientRect(),S=r.width/26,p=G.teams[0].players.find(p=>p.loc==='pitch');return [r.left+(p.x+.5)*S,r.top+(p.y+.5)*S]})()"); pg.mouse.click(q[0],q[1])
        if pg.evaluate("G.phase==='turn' && G.active===0 && G.turn[0]>=1 && !document.getElementById('bEndTurn').disabled"): break
    pg.wait_for_timeout(500)
    info=pg.evaluate("""(()=>{const c=document.getElementById('board'),r=c.getBoundingClientRect(),S=r.width/26;
      const pl=G.teams[0].players.filter(p=>p.loc==='pitch'&&p.state==='standing');
      for(const q of pl){const e=G.teams[1].players.find(o=>o.loc==='pitch'&&Math.abs(o.x-q.x)<=1&&Math.abs(o.y-q.y)<=1&&(o.x!==q.x||o.y!==q.y)); if(e) return {ax:r.left+(q.x+.5)*S,ay:r.top+(q.y+.5)*S,bx:r.left+(e.x+.5)*S,by:r.top+(e.y+.5)*S,ex:q.ex}}})()""")
    print(info)
    pg.mouse.move(info['ax'],info['ay']); pg.mouse.click(info['ax'],info['ay']); pg.wait_for_timeout(400)
    print('card izq:',pg.inner_text('#cardL')[:60].replace(chr(10),' '),'| msg:',pg.inner_text('#msg')[:90])
    pg.mouse.click(info['bx'],info['by']); pg.wait_for_timeout(400)
    print('menu:',[x.inner_text() for x in pg.query_selector_all('#ctx button')])
    pg.click('#ctx button >> text=Blitz'); pg.wait_for_timeout(2500)
    print('tras Blitz -> modal:', pg.is_visible('#modal') and pg.inner_text('#modalBody')[:100].replace(chr(10),' '), '| modo blitz activo:', pg.evaluate("document.getElementById('bBlitz').classList.contains('on')"), '| G.blitzUsed', pg.evaluate('G.blitzUsed'))
    if pg.is_visible('#modal'): pg.screenshot(path='test/s_blitz.png')
    print(errs); b.close()
