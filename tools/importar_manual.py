"""Arma un torneo del juego a partir de datos transcritos a mano (tools/tdc1_datos.py).
Uso: python3 tools/importar_manual.py <salida .js>   (genera TDC1: Torneo de Campeones I, 2023)"""
import sys, os, json, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mapas import R, RACE, STAR, info
import tdc1_datos as D
SH = {  # (raza del juego, puesto BB2020) -> hoja
 'nurgle': {'Bloater': 'nurgle_bloater', 'Rotter Lineman': 'nurgle_rotter', 'Pestigor': 'nurgle_pestigor', 'Rotspawn': 'nurgle_rotspawn'},
 'owa': {'Human Catcher': 'oldworldalliance_humancatcher', 'Human Thrower': 'oldworldalliance_humanthrower', 'Dwarf Blitzer': 'oldworldalliance_dwarfblitzer', 'Human Blitzer': 'oldworldalliance_humanblitzer',
         'Dwarf Troll Slayer': 'oldworldalliance_dwarftrollslayer', 'Ogre': 'oldworldalliance_ogre', 'Human Lineman': 'oldworldalliance_humanlineman', 'Halfling Hopeful': 'oldworldalliance_halflinghopeful'},
 'skaven': {'Blitzer': 'skaven_blitzer', 'Gutter Runner': 'skaven_gutterrunner', 'Thrower': 'skaven_thrower', 'Rat Ogre': 'skaven_ratogre', 'Skaven Clanrat Lineman': 'skaven_lineman'},
 'human': {'Blitzer': 'human_blitzer', 'Thrower': 'human_thrower', 'Catcher': 'human_catcher', 'Human Lineman': 'human_lineman', 'Halfling Hopeful': 'human_halflinghopeful', 'Ogre': 'human_ogre'},
 'undead': {'Skeleton Lineman': 'shamblingundead_skeleton', 'Zombie Lineman': 'shamblingundead_zombie', 'Ghoul Runner': 'shamblingundead_ghoulrunner', 'Wight Blitzer': 'shamblingundead_wightblitzer', 'Mummy': 'shamblingundead_mummy'},
 'khorne': {'Bloodspawn': 'khorne_bloodspawn', 'Bloodseeker': 'khorne_bloodseeker', 'Khorngor': 'khorne_khorngor', 'Bloodborn Marauder Lineman': 'khorne_bloodbornmarauderlineman'},
 'underworld': {'Mutant Rat Ogre': 'underworlddenizens_mutantratogre', 'Skaven Blitzer': 'underworlddenizens_skavenblitzer', 'Gutter Runner': 'underworlddenizens_gutterrunner', 'Skaven Thrower': 'underworlddenizens_skaventhrower',
                'Skaven Clanrat': 'underworlddenizens_skavenlineman', 'Underworld Goblin Lineman': 'underworlddenizens_goblin', 'Underworld Snotling': 'underworlddenizens_underworldsnotlings'},
 'norse': {'Yhetee': 'norse_snowtroll', 'Ulfwerener': 'norse_ulfwerenar', 'Valkyrie': 'norse_valkyrie', 'Norse Berserker': 'norse_berserker', 'Norse Raider Lineman': 'norse_lineman', 'Beer Boar': 'norse_beerboar'},
 'blackorc': {'Goblin Bruiser Lineman': 'blackorc_goblinbruiserlineman', 'Black Orc': 'blackorc_blackorc', 'Trained Troll': 'blackorc_trainedtroll'}}
# rol/posición para sprites que no están en las listas del juego
EXTRA = {'underworlddenizens_underworldsnotlings': dict(pos='Snotling del subsuelo', ab='Sn', role='sub', big=False, kw=''), 'underworlddenizens_mutantratogre': dict(pos='Rata Ogro mutante', ab='RO', role='big', big=True, kw='')}
out = sys.argv[1]; teams = []; idx = {}
for t in D.TEAMS:
    cnt = collections.Counter(); pl = []
    for p in t['players']:
        if p['pos'] == 'Star Player':
            sheet, role = STAR[p['name']]; g = dict(pos='Estrella', ab='Es', role=role, big=False, kw='')
        else:
            sheet = SH[t['race']][p['pos']]; g = EXTRA.get(sheet) or info[sheet]
        v = cnt[sheet]; cnt[sheet] += 1
        pl.append(dict(name=p['name'], pos=g['pos'], ab=g['ab'], sheet=sheet, variant=v, role=g['role'], big=bool(g.get('big')), kw=g.get('kw', ''), ma=p['ma'], st=p['st'], ag=p['ag'], pa=p['pa'], av=p['av'], sk=p['sk'], ex=p['ex']))
    tm = {k: t[k] for k in ('name', 'coach')}; tm['race'] = R[t['race']]['name']; tm['naf'] = t['coach']
    tm.update({k: t[k] for k in ('tv', 'tier', 'rr', 'apo', 'cheer', 'coaches', 'fans', 'kegs')}); tm['players'] = pl
    idx[t['name']] = len(teams); teams.append(tm)
fx = [[r, idx[a], idx[b], sa, sb, ca, cb] for r, a, b, sa, sb, ca, cb in D.FIX]
# comprobar contra la tabla de la captura
rows = {n: [0, 0, 0, 0, 0, 0] for n in idx}
for r, a, b, sa, sb, ca, cb in D.FIX:
    for x, s1, s2 in ((a, sa, sb), (b, sb, sa)):
        z = rows[x]; z[4] += s1; z[5] += s2
        if s1 > s2: z[0] += 2; z[1] += 1
        elif s1 == s2: z[0] += 1; z[2] += 1
        else: z[3] += 1
bad = [n for n in idx if tuple(rows[n]) != D.TABLA[n]]
for n in bad: print('NO COINCIDE', n, rows[n], D.TABLA[n])
real = [[idx[n], *D.TABLA[n]] for n in D.ORDEN]
data = dict(id='tdc1', name='Torneo de Campeones I', date='25 de noviembre de 2023', poster='poster2023', rounds=3, teams=teams, fixtures=fx, real=real)
open(out, 'w', encoding='utf-8').write('const TDC1=%s;\n' % json.dumps(data, ensure_ascii=False))
print('equipos', len(teams), 'cruces', len(fx), 'diferencias con la tabla:', len(bad))
