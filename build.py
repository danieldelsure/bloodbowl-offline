"""Arma index.html (un solo archivo, funciona sin internet) juntando src/.

  src/index.html      estructura de la página
  src/css/            estilos
  src/js/NN-*.js      código del juego, en orden numérico
  src/data/           sprites (assets.js), torneo (tourney.js), tipografías (fonts.css)
"""
import glob, os
root = os.path.dirname(os.path.abspath(__file__))
rd = lambda *p: open(os.path.join(root, 'src', *p), encoding='utf8').read()
js = ''.join(open(f, encoding='utf8').read() for f in sorted(glob.glob(os.path.join(root, 'src', 'js', '*.js'))))
s = rd('index.html').replace('/*STYLE*/', rd('css', 'style.css')).replace('/*SCRIPT*/', js.rstrip('\n'))
assert '/*ASSETS*/' in s and '/*TOURNEY*/' in s
s = s.replace('/*ASSETS*/', rd('data', 'assets.js')).replace('/*FONTS*/', rd('data', 'fonts.css')).replace('/*TOURNEY*/', rd('data', 'tourney.js'))
out = os.path.join(root, 'index.html')
open(out, 'w', encoding='utf8').write(s)
print('build ok', len(s))
