"""Datos del Torneo de Campeones I (2023), transcritos a mano de las capturas de tourplay (no hubo export .zip).
Habilidades en inglés (nombres del motor). 'ex' = las habilidades ganadas (las marcadas con fondo en la ficha)."""
Z = 'Foul Appearance, Plague Ridden, Disturbing Presence, Regeneration'
def P(name, pos, ma, st, ag, pa, av, sk='', ex=''):
    sk = [s.strip() for s in sk.split(',') if s.strip()]; ex = [s.strip() for s in ex.split(',') if s.strip()]
    return dict(name=name, pos=pos, ma=ma, st=st, ag=ag, pa=pa, av=av, sk=sk + ex, ex=ex)
GB = 'Thick Skull, Stunty, Dodge, Right Stuff'
OW = 'Animosity (Dwarf, Halfling)'
TEAMS = [
 dict(name='Wakala', race='nurgle', coach='Spektras_1024', tv=1300, tier='3', rr=2, apo=0, cheer=0, coaches=0, fans=1, kegs=0, players=[
  P('Glart Smashrip', 'Star Player', 5, 4, 4, 0, 9, 'Arm Bar, Claws, Juggernaut, Stand Firm, Block, Loner (4+), Frenzied Rush'),
  P('Skerel Battleshadow', 'Bloater', 4, 4, 4, 6, 10, Z, 'Guard'), P('Reggol Bladebinder', 'Bloater', 4, 4, 4, 6, 10, Z, 'Guard'),
  P('Qhorzhos Cinderbreath', 'Bloater', 4, 4, 4, 6, 10, Z, 'Guard'), P('Czarzhuz Bladedancer', 'Bloater', 4, 4, 4, 6, 10, Z, 'Guard'),
  P('Abomniable Mutt', 'Rotter Lineman', 5, 3, 4, 6, 9, 'Decay, Plague Ridden'), P('Mutt', 'Rotter Lineman', 5, 3, 4, 6, 9, 'Decay, Plague Ridden'),
  P('Shoddy Nit', 'Rotter Lineman', 5, 3, 4, 6, 9, 'Decay, Plague Ridden'),
  P('Barkrez', 'Pestigor', 6, 3, 3, 4, 9, 'Horns, Plague Ridden, Regeneration'), P('Stoneridge', 'Pestigor', 6, 3, 3, 4, 9, 'Horns, Plague Ridden, Regeneration', 'Sure Hands'),
  P('Moonmaw', 'Pestigor', 6, 3, 3, 4, 9, 'Horns, Plague Ridden, Regeneration'), P('Zarkux', 'Pestigor', 6, 3, 3, 4, 9, 'Horns, Plague Ridden, Regeneration')]),
 dict(name='Los Sake De Binks (C)', race='owa', coach='Sr_R', tv=1320, tier='4', rr=3, apo=0, cheer=0, coaches=0, fans=1, kegs=0, players=[
  P('Ludger Tiedemann', 'Human Catcher', 8, 2, 3, 5, 8, OW + ', Catch, Dodge', 'Block'), P('Ute Krakouer', 'Human Thrower', 6, 3, 3, 3, 9, OW + ', Sure Hands, Pass'),
  P('Drethud Steelmaker', 'Dwarf Blitzer', 5, 3, 3, 4, 10, 'Thick Skull, Block, Loner (3+)', 'Guard'), P('Gotlinde Steinheil', 'Human Blitzer', 7, 3, 3, 4, 9, OW + ', Block', 'Diving Tackle'),
  P('Brirbaolig Solidaxe', 'Dwarf Troll Slayer', 5, 3, 4, 0, 9, 'Dauntless, Thick Skull, Frenzy, Block, Loner (3+)', 'Mighty Blow (+1)'),
  P('Glocrokk Chainhead', 'Ogre', 5, 5, 4, 5, 10, 'Thick Skull, Bone Head, Mighty Blow (+1), Throw Team-mate, Loner (4+)', 'Guard'),
  P('Wendelgard Semmler', 'Human Lineman', 6, 3, 3, 4, 9, '', 'Break Tackle'), P('Gerharde Hersch', 'Human Lineman', 6, 3, 3, 4, 9), P('Isebrand Quattlebaum', 'Human Lineman', 6, 3, 3, 4, 9),
  P('Berchildis Bolger', 'Halfling Hopeful', 5, 2, 3, 4, 7, 'Animosity (Dwarf, Human), Stunty, Dodge, Right Stuff'), P('Adelhard Wichterle', 'Human Lineman', 6, 3, 3, 4, 9),
  P('Karla Von Kill', 'Star Player', 6, 4, 3, 4, 9, 'Dauntless, Jump Up, Dodge, Block, Loner (4+), Indomitable')]),
 dict(name='Fester Pike Nibblers', race='skaven', coach='MoomRa', tv=1310, tier='2', rr=3, apo=1, cheer=0, coaches=0, fans=1, kegs=0, players=[
  P('Snuech Mournchaser', 'Blitzer', 7, 3, 3, 5, 9, 'Block', 'Mighty Blow (+1)'), P('Xoteekch Deepchaser', 'Blitzer', 7, 3, 3, 5, 9, 'Block', 'Diving Tackle'),
  P('Uosqinq Deeptaker', 'Gutter Runner', 9, 2, 2, 4, 8, 'Dodge', 'Block'), P('Chak Skyback', 'Gutter Runner', 9, 2, 2, 4, 8, 'Dodge', 'Wrestle'),
  P('Qikzik Caskfinger', 'Gutter Runner', 9, 2, 2, 4, 8, 'Dodge', 'Side Step'), P('Srunket Crowreaper', 'Thrower', 7, 3, 3, 2, 8, 'Sure Hands, Pass'),
  P('Thrushrol Blackfingers', 'Rat Ogre', 6, 5, 4, 0, 9, 'Animal Savagery, Prehensile Tail, Frenzy, Mighty Blow (+1), Loner (4+)', 'Block')] +
  [P(n, 'Skaven Clanrat Lineman', 7, 3, 3, 4, 8) for n in ['Vuashqok Cragmaster', 'Snit Darkwatcher', 'Skueenqik Coventhorn', 'Chrilik Blackcleaver', 'Sriek Lowcrest', 'Srusqien Roughclaw']]),
 dict(name='Todos Por El Chico', race='human', coach='Nogardo', tv=1255, tier='1', rr=3, apo=0, cheer=0, coaches=0, fans=1, kegs=0, players=[
  P('Walo Dannecker', 'Blitzer', 7, 3, 3, 4, 9, 'Block', 'Diving Tackle'), P('Clodomiro Feininger', 'Blitzer', 7, 3, 3, 4, 9, 'Block'), P('Huberta Wach', 'Blitzer', 7, 3, 3, 4, 9, 'Block'),
  P('Godfrey Schulhof', 'Blitzer', 7, 3, 3, 4, 9, 'Block'), P('Aldo Kreutzwald', 'Thrower', 6, 3, 3, 2, 9, 'Sure Hands, Pass'), P('Dietlinde Blomberg', 'Thrower', 6, 3, 3, 2, 9, 'Sure Hands, Pass', 'Block'),
  P('Frauke Kamphaus', 'Catcher', 8, 2, 3, 5, 8, 'Catch, Dodge', 'Block'), P('Luitgarde Goodwort', 'Halfling Hopeful', 5, 2, 3, 4, 7, 'Stunty, Dodge, Right Stuff'),
  P('Bernharde Bretschneider', 'Human Lineman', 6, 3, 3, 4, 9), P('Ida Weinreich', 'Human Lineman', 6, 3, 3, 4, 9), P('Belinda Rohrmann', 'Human Lineman', 6, 3, 3, 4, 9),
  P('Mighty Zug', 'Star Player', 4, 5, 4, 6, 10, 'Mighty Blow (+1), Block, Loner (4+), Crushing Blow'), P('Gerharde Schilder', 'Human Lineman', 6, 3, 3, 4, 9),
  P('Chlodwig Fallohide', 'Halfling Hopeful', 5, 2, 3, 4, 7, 'Stunty, Dodge, Right Stuff')]),
 dict(name='Ratlético De Madrid', race='skaven', coach='Cristian Ascencio', tv=1340, tier='2', rr=3, apo=0, cheer=2, coaches=1, fans=1, kegs=0, players=[
  P('Qhranq Nightcutter', 'Rat Ogre', 6, 5, 4, 0, 9, 'Animal Savagery, Prehensile Tail, Frenzy, Mighty Blow (+1), Loner (4+)', 'Block'),
  P('Stranq Roughscar', 'Blitzer', 7, 3, 3, 5, 9, 'Block', 'Diving Tackle'), P('Krisqon Emberbrow', 'Blitzer', 7, 3, 3, 5, 9, 'Block', 'Diving Tackle'),
  P('Chrixqul Blackfingers', 'Gutter Runner', 9, 2, 2, 4, 8, 'Dodge', 'Block'), P('Thruqeekch Steelchaser', 'Gutter Runner', 9, 2, 2, 4, 8, 'Dodge', 'Wrestle'),
  P('Zhiat Wildback', 'Gutter Runner', 9, 2, 2, 4, 8, 'Dodge'), P('Khreexkeekch Steelback', 'Gutter Runner', 9, 2, 2, 4, 8, 'Dodge'),
  P('Zrik Blazingbleeded', 'Skaven Clanrat Lineman', 7, 3, 3, 4, 8, '', 'Kick')] +
  [P(n, 'Skaven Clanrat Lineman', 7, 3, 3, 4, 8) for n in ['Chech Heartfinger', 'Etukch Bristlescream', 'Stat Lonedigger', 'Qrixrol Darkbreath', 'Kriaxrin Wildgazer', 'Struat Caskweaver']]),
 dict(name='Universidad Del Tuétano', race='undead', coach='Diego Barrenechea', tv=1255, tier='1', rr=3, apo=0, cheer=0, coaches=0, fans=1, kegs=0, players=[
  P('Shekal', 'Skeleton Lineman', 5, 3, 4, 6, 8, 'Thick Skull, Regeneration'), P('Ydrez', 'Skeleton Lineman', 5, 3, 4, 6, 8, 'Thick Skull, Regeneration'), P("Nhouk'Shekuk", 'Skeleton Lineman', 5, 3, 4, 6, 8, 'Thick Skull, Regeneration'),
  P('Bonehead', 'Zombie Lineman', 4, 3, 4, 0, 9, 'Regeneration'), P('Gunk', 'Zombie Lineman', 4, 3, 4, 0, 9, 'Regeneration'),
  P('Zut', 'Ghoul Runner', 7, 3, 3, 4, 8, 'Dodge', 'Sprint'), P('Korux', 'Ghoul Runner', 7, 3, 3, 4, 8, 'Dodge'), P('Khuksod', 'Ghoul Runner', 7, 3, 3, 4, 8, 'Dodge'),
  P("Ciq'Gex", 'Wight Blitzer', 6, 3, 3, 5, 9, 'Block, Regeneration', 'Diving Tackle'), P('Adhegru', 'Wight Blitzer', 6, 3, 3, 5, 9, 'Block, Regeneration', 'Diving Tackle'),
  P('The Hairy Vision', 'Mummy', 3, 5, 5, 0, 10, 'Mighty Blow (+1), Regeneration'), P('The Ruthless Horror M...', 'Mummy', 3, 5, 5, 0, 10, 'Mighty Blow (+1), Regeneration'),
  P("Bryce 'The Slice' Cambuel", 'Star Player', 5, 3, 4, 0, 9, 'Secret Weapon, Thick Skull, Stand Firm, Chainsaw, Regeneration, Loner (4+), Ghostly Flames')]),
 dict(name='Enojo Khornita', race='khorne', coach='Naku32', tv=1370, tier='3', rr=3, apo=1, cheer=1, coaches=1, fans=1, kegs=0, players=[
  P('Stone Khorne Steve Au...', 'Bloodspawn', 5, 5, 4, 0, 9, 'Frenzy, Claws, Mighty Blow (+1), Unchannelled Fury, Loner (4+)', 'Pro'),
  P('Rage Cena', 'Bloodseeker', 5, 4, 4, 6, 10, 'Frenzy', 'Guard'), P('Underkhornetaker', 'Bloodseeker', 5, 4, 4, 6, 10, 'Frenzy', 'Guard'),
  P('Dwanay "Mariposa Jho..."', 'Bloodseeker', 5, 4, 4, 6, 10, 'Frenzy', 'Block'), P('Triple K...Khorne', 'Bloodseeker', 5, 4, 4, 6, 10, 'Frenzy', 'Block'),
  P('Shane Mc Pestigor', 'Khorngor', 6, 3, 3, 4, 9, 'Horns, Juggernaut', 'Extra Arms'), P('Vince Mc Pestigor', 'Khorngor', 6, 3, 3, 4, 9, 'Horns, Juggernaut', 'Strip Ball'),
  P('Bob De Contabilidad', 'Bloodborn Marauder Lineman', 6, 3, 3, 4, 8, 'Frenzy', 'Dirty Player (+1)'), P('Greg De Logistica', 'Bloodborn Marauder Lineman', 6, 3, 3, 4, 8, 'Frenzy'),
  P('Maria De RRHH', 'Bloodborn Marauder Lineman', 6, 3, 3, 4, 8, 'Frenzy'), P('Victor De Finanzas', 'Bloodborn Marauder Lineman', 6, 3, 3, 4, 8, 'Frenzy')]),
 dict(name='Warpstone Eaters', race='underworld', coach='Joaquin Gómez', tv=1280, tier='2', rr=2, apo=1, cheer=0, coaches=0, fans=1, kegs=0, players=[
  P('Scratchy', 'Mutant Rat Ogre', 6, 5, 4, 0, 9, 'Animal Savagery, Prehensile Tail, Frenzy, Mighty Blow (+1), Loner (4+)', 'Juggernaut'),
  P('Nocorra', 'Skaven Blitzer', 7, 3, 3, 5, 9, 'Animosity (Goblin), Block', 'Diving Tackle'), P('Sincallos', 'Gutter Runner', 9, 2, 2, 4, 8, 'Animosity (Goblin), Dodge', 'Block'),
  P('Manitas', 'Skaven Thrower', 7, 3, 3, 2, 8, 'Animosity (Goblin), Sure Hands, Pass', 'Leader')] +
  [P(n, 'Skaven Clanrat', 7, 3, 3, 4, 8, 'Animosity (Goblin)') for n in ['Cuidao', 'Apestosin', 'Bubonicock']] +
  [P(n, 'Underworld Goblin Lineman', 6, 2, 3, 4, 8, 'Stunty, Dodge, Right Stuff') for n in ['Colera', 'Rabia']] +
  [P(n, 'Underworld Snotling', 5, 1, 3, 5, 6, 'Titchy, Side Step, Stunty, Dodge, Right Stuff') for n in ['Aristoteles', 'Platon', 'Socrates', 'Relleneitor', 'Rellenissimo', 'Rellenostro']] +
  [P('Varag Ghoul-Chewer', 'Star Player', 6, 5, 3, 5, 10, 'Thick Skull, Jump Up, Mighty Blow (+1), Block, Loner (4+), Crushing Blow')]),
 dict(name='Midnight Lions', race='human', coach='Iceman002', tv=1260, tier='1', rr=2, apo=0, cheer=0, coaches=0, fans=1, kegs=0, players=[
  P("El'Jonson", 'Ogre', 5, 5, 4, 5, 10, 'Thick Skull, Bone Head, Mighty Blow (+1), Throw Team-mate, Loner (4+)', 'Guard'),
  P('Gado', 'Blitzer', 7, 3, 3, 4, 9, 'Block', 'Diving Tackle'), P('Leonidas', 'Blitzer', 7, 3, 3, 4, 9, 'Block'), P('Escanor', 'Blitzer', 7, 3, 3, 4, 9, 'Block', 'Diving Tackle'),
  P('Aioria', 'Blitzer', 7, 3, 3, 4, 9, 'Block'), P('Lion-O', 'Thrower', 6, 3, 3, 2, 9, 'Sure Hands, Pass'),
  P('S. Kennedy', 'Catcher', 8, 2, 3, 5, 8, 'Catch, Dodge'), P('Takashi Shirogane', 'Catcher', 8, 2, 3, 5, 8, 'Catch, Dodge')] +
  [P(n, 'Human Lineman', 6, 3, 3, 4, 9) for n in ['Richard I', 'Scar', 'Ban', 'Kimba']] +
  [P('Karla Von Kill', 'Star Player', 6, 4, 3, 4, 9, 'Dauntless, Jump Up, Dodge, Block, Loner (4+), Indomitable')]),
 dict(name='Norteños', race='norse', coach='Daniel Ferreira', tv=1340, tier='2', rr=3, apo=1, cheer=1, coaches=0, fans=0, kegs=0, players=[
  P('Wikkihl', 'Yhetee', 5, 5, 4, 0, 9, 'Frenzy, Claws, Unchannelled Fury, Disturbing Presence, Loner (4+)', 'Block'),
  P("Knif 'Knifr - Knife'", 'Ulfwerener', 6, 4, 4, 0, 9, 'Frenzy', 'Block'), P("Áræði 'Courage'", 'Ulfwerener', 6, 4, 4, 0, 9, 'Frenzy', 'Block'),
  P('Friagrior', 'Valkyrie', 7, 3, 3, 3, 8, 'Dauntless, Catch, Pass, Strip Ball', 'Dodge'),
  P("Harm 'Harmr - Grief'", 'Norse Berserker', 6, 3, 3, 5, 8, 'Jump Up, Frenzy, Block', 'Guard'), P("Vísindi 'Intelligence'", 'Norse Berserker', 6, 3, 3, 5, 8, 'Jump Up, Frenzy, Block', 'Diving Tackle'),
  P("Hegnan 'Aid'", 'Norse Raider Lineman', 6, 3, 3, 4, 8, 'Drunkard, Thick Skull, Block'), P("Illska 'Cruelty'", 'Norse Raider Lineman', 6, 3, 3, 4, 8, 'Drunkard, Thick Skull, Block'),
  P("Félagi 'Companion'", 'Norse Raider Lineman', 6, 3, 3, 4, 8, 'Drunkard, Thick Skull, Block'), P("Skat 'Tribute'", 'Norse Raider Lineman', 6, 3, 3, 4, 8, 'Drunkard, Thick Skull, Block'),
  P('Khordur', 'Beer Boar', 5, 1, 3, 0, 6, 'Pick-me-up, Titchy, Stunty, Dodge, No Hands'), P("Gu'Rez", 'Beer Boar', 5, 1, 3, 0, 6, 'Pick-me-up, Titchy, Stunty, Dodge, No Hands'),
  P('Hila', 'Valkyrie', 7, 3, 3, 3, 8, 'Dauntless, Catch, Pass, Strip Ball')]),
 dict(name='Brutales Pero Astutos', race='blackorc', coach='Die.Vedra', tv=1295, tier='3', rr=3, apo=0, cheer=0, coaches=0, fans=0, kegs=0, players=[
  P('Snis', 'Goblin Bruiser Lineman', 6, 2, 3, 4, 8, GB, 'Sneaky Git'), P('Tesz', 'Goblin Bruiser Lineman', 6, 2, 3, 4, 8, GB), P('Stekton', 'Goblin Bruiser Lineman', 6, 2, 3, 4, 8, GB), P('Skim', 'Goblin Bruiser Lineman', 6, 2, 3, 4, 8, GB),
  P('Ugkar Gorechaser', 'Black Orc', 4, 4, 4, 5, 10, 'Arm Bar, Brawler', 'Guard'), P('Bargur Stoutscream', 'Black Orc', 4, 4, 4, 5, 10, 'Arm Bar, Brawler', 'Mighty Blow (+1)'),
  P('Wagdot Moltencleaver', 'Black Orc', 4, 4, 4, 5, 10, 'Arm Bar, Brawler', 'Block'), P('Urgat Stormbreaker', 'Black Orc', 4, 4, 4, 5, 10, 'Arm Bar, Brawler'),
  P('Migud The Traitor', 'Black Orc', 4, 4, 4, 5, 10, 'Arm Bar, Brawler'), P('Grarluk Spiritfang', 'Black Orc', 4, 4, 4, 5, 10, 'Arm Bar, Brawler'),
  P('Seshi', 'Trained Troll', 4, 5, 5, 5, 10, 'Mighty Blow (+1), Throw Team-mate, Projectile Vomit, Really Stupid, Regeneration, Always Hungry, Loner (3+)', 'Strong Arm'),
  P('Fungus The Loon', 'Star Player', 4, 7, 3, 0, 8, 'Secret Weapon, Ball & Chain, Stunty, Mighty Blow (+1), No Hands, Loner (4+), Whirling Dervish')]),
 dict(name='Los Calculos Renales', race='nurgle', coach='Franco Carrasco', tv=1340, tier='3', rr=3, apo=0, cheer=0, coaches=0, fans=0, kegs=0, players=[
  P('MILEI', 'Bloater', 4, 4, 4, 6, 10, Z, 'Block'), P('MANDINGO', 'Bloater', 4, 4, 4, 6, 10, Z, 'Block'), P('GOLPISTA', 'Bloater', 4, 4, 4, 6, 10, Z, 'Block'), P('EL MANCO', 'Bloater', 4, 4, 4, 6, 10, Z),
  P('EL CORRE MANO', 'Rotspawn', 4, 5, 5, 0, 10, 'Foul Appearance, Mighty Blow (+1), Plague Ridden, Disturbing Presence, Really Stupid, Regeneration, Loner (4+), Tentacles', 'Prehensile Tail'),
  P('TENTA CULO', 'Pestigor', 6, 3, 3, 4, 9, 'Horns, Plague Ridden, Regeneration', 'Extra Arms, Block'), P('CARE PALO', 'Pestigor', 6, 3, 3, 4, 9, 'Horns, Plague Ridden, Regeneration', 'Wrestle'),
  P('JAVIER', 'Pestigor', 6, 3, 3, 4, 9, 'Horns, Plague Ridden, Regeneration'), P('ESPONJA USADA', 'Pestigor', 6, 3, 3, 4, 9, 'Horns, Plague Ridden, Regeneration'),
  P('EL PRIMO', 'Rotter Lineman', 5, 3, 4, 6, 9, 'Decay, Plague Ridden'), P('EL PRIMO DEL PRIMO', 'Rotter Lineman', 5, 3, 4, 6, 9, 'Decay, Plague Ridden')]),
]
# cruces (ronda, local, visitante, TD local, TD visitante, bajas local, bajas visitante) por nombre
FIX = [
 (1, 'Wakala', 'Universidad Del Tuétano', 2, 0, 1, 0), (1, 'Norteños', 'Warpstone Eaters', 0, 3, 3, 4), (1, 'Los Sake De Binks (C)', 'Fester Pike Nibblers', 0, 0, 2, 1),
 (1, 'Ratlético De Madrid', 'Midnight Lions', 1, 2, 1, 4), (1, 'Todos Por El Chico', 'Los Calculos Renales', 2, 0, 2, 2), (1, 'Brutales Pero Astutos', 'Enojo Khornita', 1, 2, 1, 4),
 (2, 'Warpstone Eaters', 'Todos Por El Chico', 1, 3, 0, 4), (2, 'Enojo Khornita', 'Wakala', 0, 1, 2, 1), (2, 'Midnight Lions', 'Los Sake De Binks (C)', 0, 3, 0, 2),
 (2, 'Fester Pike Nibblers', 'Brutales Pero Astutos', 1, 0, 2, 1), (2, 'Universidad Del Tuétano', 'Ratlético De Madrid', 2, 2, 5, 2), (2, 'Los Calculos Renales', 'Norteños', 0, 0, 1, 1),
 (3, 'Todos Por El Chico', 'Wakala', 0, 1, 0, 3), (3, 'Los Sake De Binks (C)', 'Warpstone Eaters', 3, 0, 5, 2), (3, 'Enojo Khornita', 'Fester Pike Nibblers', 1, 2, 1, 1),
 (3, 'Universidad Del Tuétano', 'Midnight Lions', 1, 0, 2, 2), (3, 'Ratlético De Madrid', 'Los Calculos Renales', 2, 0, 2, 2), (3, 'Norteños', 'Brutales Pero Astutos', 1, 1, 1, 5)]
# tabla oficial (orden de tourplay)
ORDEN = ['Wakala', 'Los Sake De Binks (C)', 'Fester Pike Nibblers', 'Todos Por El Chico', 'Ratlético De Madrid', 'Universidad Del Tuétano', 'Enojo Khornita', 'Warpstone Eaters', 'Midnight Lions', 'Norteños', 'Brutales Pero Astutos', 'Los Calculos Renales']
# puntos, G-E-P y TD a favor-en contra según la captura de la tabla
TABLA = {'Wakala': (6, 3, 0, 0, 4, 0), 'Los Sake De Binks (C)': (5, 2, 1, 0, 6, 0), 'Fester Pike Nibblers': (5, 2, 1, 0, 3, 1), 'Todos Por El Chico': (4, 2, 0, 1, 5, 2), 'Ratlético De Madrid': (3, 1, 1, 1, 5, 4),
         'Universidad Del Tuétano': (3, 1, 1, 1, 3, 4), 'Enojo Khornita': (2, 1, 0, 2, 3, 4), 'Warpstone Eaters': (2, 1, 0, 2, 4, 6), 'Midnight Lions': (2, 1, 0, 2, 2, 5), 'Norteños': (2, 0, 2, 1, 1, 4),
         'Brutales Pero Astutos': (1, 0, 1, 2, 2, 4), 'Los Calculos Renales': (1, 0, 1, 2, 0, 4)}
