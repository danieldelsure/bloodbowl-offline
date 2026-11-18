from playwright.sync_api import sync_playwright
URL='file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_context(viewport={'width':1440,'height':900}).new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(500)
    pg.click('text=Partido rápido'); pg.wait_for_timeout(300)
    pg.click('label:has(input[value="m"])'); pg.click('#modalBtns >> text=Jugar'); pg.wait_for_timeout(1200)
    pg.evaluate("(()=>{const s=document.getElementById('speed');const o=document.createElement('option');o.value='0.01';o.textContent='x';s.appendChild(o);s.value='0.01';s.dispatchEvent(new Event('change'));s.dispatchEvent(new Event('input'))})()")
    seen=[]
    for i in range(1500):
        pg.wait_for_timeout(300)
        if pg.is_visible('#cpPre'):
            t=pg.inner_text('#modalBody').split('\n'); seen.append(t[2][:40] if len(t)>2 else t[0][:40])
            pg.click('#modalBtns >> text=Listo, seguir'); continue
        if pg.is_visible('#modalBtns >> text=Volver al menú'): break
    print('paneles:',seen)
    print('final:',pg.inner_text('#modalBody')[:120].replace('\n',' '))
    print('errores:',errs); b.close()
