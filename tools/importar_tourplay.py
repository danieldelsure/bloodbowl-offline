"""Convierte el export de tourplay (CSV: participants, fixtures, un roster por equipo) al formato de torneo del juego.

Uso:  python3 tools/importar_tourplay.py <carpeta con los CSV> <salida .js> <const> <id> "<nombre>" "<fecha>" <afiche> [--excluir "Equipo A|Equipo B"]
Ej.:  python3 tools/importar_tourplay.py /tmp/d24 src/data/tourney2.js TDC2 tdc2 "Torneo de Campeones II" "30 de noviembre de 2024" poster2024
Necesita rosters.json (volcado de ROSTERS del juego): node tools/volcar_rosters.js
"""
import csv, io, glob, json, os, sys, collections, re

src, out, const, tid, name, date, poster = sys.argv[1:8]
excl = set()
if '--excluir' in sys.argv: excl = set(x.strip().lower() for x in sys.argv[sys.argv.index('--excluir') + 1].split('|'))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mapas import R
rd = lambda f: list(csv.reader(io.StringIO(open(f, encoding='utf-8-sig').read()), delimiter=';'))
dr = lambda f: list(csv.DictReader(io.StringIO(open(f, encoding='utf-8-sig').read()), delimiter=';'))

from mapas import RACE, SHEET, STAR, SKFIX, norm, info
part = {r['TeamName'].strip().lower(): r for r in dr(glob.glob(os.path.join(src, '*participants.csv'))[0])}
fixtures = dr(glob.glob(os.path.join(src, '*fixtures.csv'))[0])
played = set()
for f in fixtures: played |= {f['TeamNameHome'].strip().lower(), f['TeamNameAway'].strip().lower()}

rosters = {}
for f in glob.glob(os.path.join(src, '*roster.csv')):
    rows = rd(f); h = rows[1]; i = [k for k, r in enumerate(rows) if r and r[0] == 'Number'][0]
    pl = []
    for r in rows[i + 1:]:
        if not r or not r[0].strip(): break
        pl.append(dict(n=r[0], name=r[1], pos=r[2], ma=r[3], st=r[4], ag=r[5], pa=r[6], av=r[7], sk=[SKFIX.get(s.strip(), s.strip()) for s in r[8].split(',') if s.strip()], level=r[10]))
    ind = {}
    j = [k for k, r in enumerate(rows) if r and r[0] == 'Inducement']
    if j:
        for r in rows[j[0] + 1:]:
            if r and r[0].strip(): ind[r[0]] = int(r[1] or 0)
    rosters[h[0].strip().lower()] = dict(head=h, players=pl, ind=ind)

# habilidades base de cada puesto (BB2020): lo que tienen en común los jugadores sin avances (Rookie) del mismo puesto; si no hay ninguno, la lista del juego
base = {}
for t in rosters.values():
    for p in t['players']:
        if p['level'] == 'Rookie': k = (t['head'][1], p['pos']); base[k] = (base[k] & set(p['sk'])) if k in base else set(p['sk'])

teams = []; idx = {}
for key, pr in part.items():
    if key in excl or key not in played: print('excluido:', pr['TeamName']); continue
    t = rosters[key]; h = t['head']; rk = RACE[pr['TeamRace']]
    tm = dict(name=re.sub(r'^\[[^\]]*\]\s*', '', pr['TeamName']).strip(), race=R[rk]['name'])
    coach = pr['Coach'].strip(); tm['coach'] = coach if len(coach.split()) <= 3 else pr['NafUser'].strip()
    tm['naf'] = pr['NafUser'].strip(); tm['tv'] = round(int(h[3]) / 1000); tm['tier'] = h[10]; tm['rr'] = int(h[5] or 0)
    tm['apo'] = 1 if h[9] == 'True' else 0; tm['cheer'] = int(h[8] or 0); tm['coaches'] = int(h[7] or 0); tm['fans'] = int(h[6] or 0); tm['kegs'] = t['ind'].get('BloodweiserKeg', 0)
    cnt = collections.Counter(); plist = []
    for p in t['players']:
        if p['pos'] == 'Star Player':
            if p['name'] not in STAR: sys.exit('Estrella sin sprite: ' + p['name'])
            sheet, srole = STAR[p['name']]; g = dict(pos='Estrella', ab='Es', role=srole, big=False, kw='', sk=[])
        else:
            sheet = SHEET[rk].get(p['pos'])
            if not sheet: sys.exit('Sin hoja para %s / %s' % (pr['TeamName'], p['pos']))
            g = info[sheet]
        b = base.get((h[1], p['pos']))
        if b is None: b = set(norm(x) for x in g['sk'])
        ex = [s for s in p['sk'] if s not in b and norm(s) not in set(norm(x) for x in b)] if p['level'] != 'Rookie' else []
        ex = [s for s in ex if not s.startswith(('Animosity', 'Loner', 'Regeneration', 'Bloodlust', 'Stunty'))]  # rasgos de puesto, no se ganan
        if p['pos'] == 'Star Player': ex = []
        v = cnt[sheet]; cnt[sheet] += 1
        d = dict(name=p['name'], pos=('Estrella' if p['pos'] == 'Star Player' else g['pos']), ab=('Es' if p['pos'] == 'Star Player' else g['ab']), sheet=sheet, variant=v, role=g['role'], big=bool(g.get('big')), kw=g.get('kw', ''),
                 ma=int(p['ma']), st=int(p['st']), ag=int(p['ag']), pa=int(p['pa'] or 0), av=int(p['av']), sk=p['sk'], ex=ex)
        plist.append(d)
    tm['players'] = plist; idx[key] = len(teams); teams.append(tm)

fx = []; rows = {i: [i, 0, 0, 0, 0, 0, 0, 0] for i in range(len(teams))}
for f in fixtures:
    a, b = idx[f['TeamNameHome'].strip().lower()], idx[f['TeamNameAway'].strip().lower()]
    sa, sb, ca, cb = int(f['ScoreHome']), int(f['ScoreAway']), int(f['CasualtiesHome'] or 0), int(f['CasualtiesAway'] or 0)
    fx.append([int(f['Round']), a, b, sa, sb, ca, cb])
    for x, y, s1, s2, c1 in ((a, b, sa, sb, ca), (b, a, sb, sa, cb)):
        r = rows[x]; r[5] += s1; r[6] += s2; r[7] += c1
        if s1 > s2: r[1] += 2; r[2] += 1
        elif s1 == s2: r[1] += 1; r[3] += 1
        else: r[4] += 1
real = sorted(rows.values(), key=lambda r: (-r[1], -(r[5] - r[6]), -r[5], -r[7]))
real = [r[:7] for r in real]
data = dict(id=tid, name=name, date=date, poster=poster, rounds=max(f[0] for f in fx), teams=teams, fixtures=fx, real=real)
open(out, 'w', encoding='utf-8').write('const %s=%s;\n' % (const, json.dumps(data, ensure_ascii=False)))
for k, r in enumerate(real): print(k + 1, teams[r[0]]['name'], r[1:])
