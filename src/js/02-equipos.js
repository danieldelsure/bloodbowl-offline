/* Equipos extra del Partido rápido (reglas BB 2025, Tercera Temporada). Atributos y habilidades de bloodbowlbase.ru/bb2025.
   El orden de P(): nombre, hoja de sprites, sigla, rol, costo, máximo, cantidad en la alineación de ejemplo, MA, FU, AG, PA, AR, habilidades.
   PA 0 = no puede pasar. "rules" son reglas especiales del equipo que tienen efecto dentro del partido. */
Object.assign(ROSTERS, {
  blackorc: { name: 'Orcos Negros', tier: 3, rrCost: 60, rr: 3, apo: 1, rules: ['Bribery'], players: [
    P('Troll adiestrado', 'blackorc_trainedtroll', 'Tr', 'big', 115, 1, 1, 4, 5, 5, 5, 10, ['Always Hungry','Mighty Blow','Projectile Vomit','Really Stupid','Regeneration','Throw Team-mate'], { big: true, kw: 'troll' }),
    P('Orco Negro', 'blackorc_blackorc', 'ON', 'los', 90, 6, 4, 4, 4, 4, 5, 10, ['Brawler','Grab']),
    P('Goblin Pendenciero', 'blackorc_goblinbruiserlineman', 'Gp', 'line', 45, 16, 6, 6, 2, 3, 4, 8, ['Dodge','Right Stuff','Stunty','Thick Skull']) ] },
  chaoschosen: { name: 'Elegidos del Caos', tier: 3, rrCost: 50, rr: 3, apo: 1, players: [
    P('Minotauro', 'chaoschosen_minotaur', 'Mi', 'big', 150, 1, 1, 5, 5, 4, 6, 9, ['Frenzy','Horns','Loner (4+)','Mighty Blow','Thick Skull','Unchannelled Fury'], { loner: 4, big: true }),
    P('Elegido del Caos', 'chaoschosen_chosenblocker', 'EC', 'los', 100, 4, 4, 5, 4, 3, 5, 10, ['Arm Bar']),
    P('Hombre Bestia', 'chaoschosen_beastmanrunner', 'Hb', 'line', 55, 16, 6, 6, 3, 3, 3, 9, ['Horns','Thick Skull']) ] },
  chaosdwarf: { name: 'Enanos del Caos', tier: 1, rrCost: 70, rr: 2, apo: 1, players: [
    P('Minotauro esclavo', 'chaosdwarf_enslavedminotaur', 'Mi', 'big', 150, 1, 1, 5, 5, 4, 6, 9, ['Frenzy','Horns','Loner (4+)','Mighty Blow','Thick Skull','Unchannelled Fury'], { loner: 4, big: true }),
    P('Centauro Toro', 'chaosdwarf_bullcentaurblitzer', 'CT', 'blitz', 130, 2, 2, 6, 4, 4, 6, 10, ['Sprint','Sure Feet','Thick Skull','Unsteady']),
    P('Bloqueador Enano del Caos', 'chaosdwarf_chaosdwarfblocker', 'Be', 'los', 70, 4, 3, 4, 3, 4, 6, 10, ['Block','Iron Hard Skin','Thick Skull']),
    P('Herrero de Fuego', 'chaosdwarf_chaosdwarfflamesmith', 'Hf', 'blitz', 80, 2, 1, 5, 3, 4, 6, 10, ['Brawler','Breathe Fire','Disturbing Presence','Thick Skull']),
    P('Hobgoblin Apuñalador', 'chaosdwarf_hobgoblinsneakystabba', 'Ha', 'wing', 60, 2, 1, 6, 3, 3, 5, 8, ['Shadowing','Stab']),
    P('Hobgoblin', 'chaosdwarf_hobgoblin', 'Hg', 'line', 40, 16, 4, 6, 3, 3, 4, 8, []) ] },
  chaosrenegade: { name: 'Renegados del Caos', tier: 3, rrCost: 70, rr: 2, apo: 1, players: [
    P('Ogro', 'chaosrenegade_ogre', 'Og', 'big', 140, 1, 1, 5, 5, 4, 5, 10, ['Bone Head','Loner (3+)','Mighty Blow','Thick Skull','Throw Team-mate'], { loner: 3, big: true }),
    P('Minotauro', 'chaosrenegade_minotaur', 'Mi', 'big', 150, 1, 1, 5, 5, 4, 6, 9, ['Frenzy','Horns','Loner (4+)','Mighty Blow','Thick Skull','Unchannelled Fury'], { loner: 4, big: true }),
    P('Lanzador humano renegado', 'chaosrenegade_renegadehumanthrower', 'Lz', 'back', 75, 1, 1, 6, 3, 3, 3, 9, ['Animosity (All)','Pass','Sure Hands']),
    P('Elfo oscuro renegado', 'chaosrenegade_renegadedarkelflineman', 'Eo', 'wing', 65, 1, 1, 6, 3, 2, 3, 9, ['Animosity (All)']),
    P('Skaven renegado', 'chaosrenegade_renegadeskavenlineman', 'Sk', 'wing', 50, 1, 1, 7, 3, 3, 4, 8, ['Animosity (All)']),
    P('Orco renegado', 'chaosrenegade_renegadeorclineman', 'Or', 'los', 50, 1, 1, 5, 3, 3, 4, 10, ['Animosity (All)']),
    P('Goblin renegado', 'chaosrenegade_renegadegoblin', 'Gb', 'sub', 40, 1, 1, 6, 2, 3, 4, 8, ['Animosity (All)','Dodge','Right Stuff','Stunty']),
    P('Humano renegado', 'chaosrenegade_renegadehumanlineman', 'Hr', 'line', 50, 16, 4, 6, 3, 3, 4, 9, ['Animosity (All)']) ] },
  dwarf: { name: 'Enanos', tier: 2, rrCost: 60, rr: 3, apo: 1, rules: ['Bribery'], players: [
    P('Atropellador', 'dwarf_deathroller', 'At', 'big', 170, 1, 1, 5, 7, 5, 0, 11, ['Break Tackle','Dirty Player','Juggernaut','Loner (4+)','Mighty Blow','No Ball','Secret Weapon','Stand Firm'], { loner: 4, big: true }),
    P('Blitzer enano', 'dwarf_blitzer', 'Bz', 'blitz', 100, 2, 2, 5, 3, 4, 4, 10, ['Block','Diving Tackle','Tackle','Thick Skull']),
    P('Matatrolls', 'dwarf_trollslayer', 'Mt', 'blitz', 95, 2, 2, 5, 3, 4, 5, 9, ['Block','Dauntless','Frenzy','Hatred (Troll)','Thick Skull']),
    P('Corredor enano', 'dwarf_runner', 'Ce', 'wing', 80, 2, 1, 6, 3, 3, 4, 9, ['Sprint','Sure Hands','Thick Skull']),
    P('Línea enano', 'dwarf_blocker', 'Le', 'line', 70, 16, 5, 4, 3, 4, 5, 10, ['Block','Defensive','Thick Skull']) ] },
  elvenunion: { name: 'Unión Élfica', tier: 2, rrCost: 50, rr: 3, apo: 1, players: [
    P('Blitzer elfo', 'elvenunion_blitzer', 'Bz', 'blitz', 115, 2, 2, 7, 3, 2, 3, 9, ['Block','Sidestep']),
    P('Receptor elfo', 'elvenunion_catcher', 'Rc', 'wing', 100, 2, 2, 8, 3, 2, 4, 8, ['Catch','Diving Catch','Nerves of Steel']),
    P('Lanzador elfo', 'elvenunion_thrower', 'Lz', 'back', 75, 2, 1, 6, 3, 2, 2, 8, ['Hail Mary Pass','Pass']),
    P('Línea elfo', 'elvenunion_lineman', 'Ln', 'line', 65, 16, 6, 6, 3, 2, 3, 8, ['Fumblerooski']) ] },
  gnome: { name: 'Gnomos', tier: 4, rrCost: 50, rr: 3, apo: 1, players: [
    P('Hombre Árbol de Altern', 'gnome_alternforesttreeman', 'Ar', 'big', 120, 2, 1, 2, 6, 5, 5, 11, ['Mighty Blow','Stand Firm','Strong Arm','Take Root','Thick Skull','Throw Team-mate','Timmm-ber!'], { big: true }),
    P('Domador gnomo', 'gnome_gnomebeastmaster', 'Dg', 'los', 55, 2, 2, 5, 2, 3, 4, 8, ['Guard','Jump Up','Stunty','Wrestle']),
    P('Ilusionista gnomo', 'gnome_gnomeillusionist', 'Il', 'back', 50, 2, 1, 5, 2, 3, 3, 7, ['Jump Up','Stunty','Trickster','Wrestle']),
    P('Zorro del bosque', 'gnome_woodlandfox', 'Zo', 'wing', 50, 2, 2, 7, 2, 2, 0, 6, ['Dodge','My Ball','Sidestep','Stunty']),
    P('Gnomo', 'gnome_gnomelineman', 'Gn', 'line', 40, 16, 5, 5, 2, 3, 4, 7, ['Jump Up','Right Stuff','Stunty','Wrestle']) ] },
  goblin: { name: 'Goblins', tier: 4, rrCost: 60, rr: 3, apo: 1, rules: ['Bribery'], players: [
    P('Troll adiestrado', 'goblin_troll', 'Tr', 'big', 115, 2, 1, 4, 5, 5, 5, 10, ['Always Hungry','Mighty Blow','Projectile Vomit','Really Stupid','Regeneration','Throw Team-mate'], { big: true, kw: 'troll' }),
    P('Fanático', 'goblin_fanatic', 'Fa', 'los', 70, 1, 1, 3, 7, 3, 0, 8, ['Ball & Chain','No Ball','Secret Weapon','Stunty']),
    P('Loco', 'goblin_looney', 'Lo', 'sub', 40, 1, 1, 6, 2, 3, 0, 8, ['Chainsaw','No Ball','Secret Weapon','Stunty']),
    P('Bomma', 'goblin_bomma', 'Bm', 'back', 45, 1, 1, 6, 2, 3, 4, 8, ['Bombardier','Dodge','Secret Weapon','Stunty']),
    P("'Ooligan", 'goblin_ooligan', 'Oo', 'blitz', 60, 1, 1, 6, 2, 3, 5, 8, ['Dirty Player (+1)','Disturbing Presence','Dodge','Right Stuff','Stunty','Taunt']),
    P('Clavadista', 'goblin_doomdiver', 'Cv', 'wing', 65, 1, 1, 6, 2, 3, 6, 8, ['Dodge','Right Stuff','Stunty','Swoop']),
    P('Saltarín', 'goblin_pogoer', 'Sa', 'wing', 75, 1, 1, 7, 2, 3, 4, 8, ['Dodge','Pogo Stick','Stunty']),
    P('Goblin', 'goblin_goblin', 'Gb', 'line', 40, 16, 5, 6, 2, 3, 4, 8, ['Dodge','Right Stuff','Stunty']) ] },
  imperial: { name: 'Nobleza Imperial', tier: 2, rrCost: 60, rr: 3, apo: 1, players: [
    P('Ogro', 'imperialnobility_ogre', 'Og', 'big', 140, 1, 1, 5, 5, 4, 5, 10, ['Bone Head','Loner (3+)','Mighty Blow','Thick Skull','Throw Team-mate'], { loner: 3, big: true }),
    P('Guardaespaldas', 'imperialnobility_bodyguard', 'Ge', 'los', 85, 4, 2, 5, 3, 3, 4, 9, ['Stand Firm','Wrestle']),
    P('Blitzer noble', 'imperialnobility_nobleblitzer', 'Bn', 'blitz', 90, 2, 2, 7, 3, 3, 4, 9, ['Block','Catch','Pro']),
    P('Lanzador imperial', 'imperialnobility_imperialthrower', 'Li', 'back', 75, 2, 1, 6, 3, 3, 2, 9, ['Give and Go','Pass','Pro']),
    P('Sirviente imperial', 'imperialnobility_imperialretainerlineman', 'Si', 'line', 45, 16, 5, 6, 3, 3, 4, 8, ['Fend']) ] },
  khorne: { name: 'Khorne', tier: 3, rrCost: 60, rr: 3, apo: 1, players: [
    P('Engendro de sangre', 'khorne_bloodspawn', 'Es', 'big', 160, 1, 1, 5, 5, 4, 6, 9, ['Claws','Frenzy','Loner (4+)','Mighty Blow','Unchannelled Fury'], { loner: 4, big: true }),
    P('Buscasangre', 'khorne_bloodseeker', 'Bs', 'los', 105, 4, 2, 5, 4, 4, 6, 10, ['Frenzy']),
    P('Khorngor', 'khorne_khorngor', 'Kg', 'wing', 70, 2, 2, 6, 3, 3, 4, 9, ['Horns','Juggernaut','Jump Up','Thick Skull']),
    P('Merodeador de sangre', 'khorne_bloodbornmarauderlineman', 'Mr', 'line', 50, 16, 6, 6, 3, 3, 4, 8, ['Frenzy']) ] },
  nightgoblin: { name: 'Goblins Nocturnos', prov: true, tier: 4, rrCost: 70, rr: 2, apo: 1, rules: ['Bribery'], players: [
    P('Troll adiestrado', 'goblin_troll', 'Tr', 'big', 115, 1, 1, 4, 5, 5, 5, 10, ['Always Hungry','Mighty Blow','Projectile Vomit','Really Stupid','Regeneration','Throw Team-mate'], { big: true, kw: 'troll' }),
    P('Pastor de squigs', 'squigherders_squigherder', 'Ps', 'back', 55, 2, 1, 6, 2, 3, 5, 8, ['Dodge','Disturbing Presence','Fend','Squig Restraint','Stunty']),
    P('Squig saltarín', 'squigherders_squighopper', 'Sh', 'blitz', 80, 2, 2, 7, 3, 3, 4, 8, ['Dodge','Jump Up','Monstrous Mouth','Pogo Stick','Squig Rage']),
    P('Domador de squigs', 'goblin_fanatic', 'Dm', 'los', 70, 2, 1, 3, 7, 3, 0, 8, ['Ball & Chain','No Ball','Squig Rage','Stunty']),
    P('Squig de cueva', 'squigherders_squig', 'Sq', 'sub', 85, 2, 1, 6, 4, 3, 0, 9, ['Frenzy','Jump Up','Monstrous Mouth','No Ball','Pogo Stick','Squig Rage']),
    P('Goblin nocturno', 'forestgoblin_forestgoblin', 'Gn', 'line', 45, 16, 5, 6, 2, 3, 4, 8, ['Dodge','Right Stuff','Shadowing','Stunty','Taunt']) ] },
  norse: { name: 'Nórdicos', tier: 1, rrCost: 60, rr: 3, apo: 1, players: [
    P('Yhetee', 'norse_snowtroll', 'Yh', 'big', 140, 1, 1, 5, 5, 4, 6, 9, ['Claws','Disturbing Presence','Frenzy','Loner (4+)','Unchannelled Fury'], { loner: 4, big: true }),
    P('Ulfwerener', 'norse_ulfwerenar', 'Uw', 'los', 105, 2, 2, 6, 4, 4, 6, 9, ['Frenzy','Unsteady']),
    P('Berserker nórdico', 'norse_berserker', 'Bk', 'blitz', 90, 2, 2, 6, 3, 3, 5, 8, ['Block','Frenzy','Jump Up']),
    P('Valquiria', 'norse_valkyrie', 'Va', 'back', 95, 2, 1, 7, 3, 3, 3, 8, ['Catch','Dauntless','Pass','Strip Ball']),
    P('Jabalí de cerveza', 'norse_beerboar', 'Jb', 'sub', 20, 2, 0, 5, 1, 3, 0, 6, ['Dodge','No Ball','Pick-me-up','Stunty','Titchy']),
    P('Invasor nórdico', 'norse_lineman', 'In', 'line', 50, 16, 5, 6, 3, 3, 4, 8, ['Block','Drunkard','Thick Skull','Unsteady']) ] },
  nurgle: { name: 'Nurgle', tier: 3, rrCost: 60, rr: 3, apo: 0, players: [
    P('Engendro pútrido', 'nurgle_rotspawn', 'Ep', 'big', 140, 1, 1, 4, 5, 5, 6, 10, ['Disturbing Presence','Foul Appearance','Loner (4+)','Mighty Blow','Pick-me-up','Plague Ridden','Really Stupid','Regeneration','Tentacles'], { loner: 4, big: true }),
    P('Hinchado', 'nurgle_bloater', 'Hi', 'los', 110, 4, 2, 4, 4, 4, 6, 10, ['Disturbing Presence','Foul Appearance','Plague Ridden','Regeneration','Stand Firm','Unsteady']),
    P('Pestígor', 'nurgle_pestigor', 'Pe', 'wing', 70, 2, 2, 6, 3, 3, 4, 9, ['Horns','Plague Ridden','Regeneration','Steady Footing','Thick Skull']),
    P('Podrido', 'nurgle_rotter', 'Po', 'line', 40, 16, 6, 5, 3, 4, 6, 9, ['Decay','Plague Ridden']) ] },
  ogre: { name: 'Ogros', tier: 4, rrCost: 70, rr: 3, apo: 1, players: [
    P('Ogro Lanzador', 'ogre_ogreruntpunter', 'OL', 'back', 145, 1, 1, 5, 5, 4, 4, 10, ['Bone Head','Kick Team-mate','Mighty Blow','Thick Skull'], { big: true }),
    P('Ogro Bloqueador', 'ogre_ogre', 'Og', 'los', 140, 5, 4, 5, 5, 4, 5, 10, ['Bone Head','Mighty Blow','Thick Skull','Throw Team-mate'], { big: true }),
    P('Gnoblar', 'ogre_gnoblarlineman', 'Gn', 'line', 15, 16, 6, 5, 1, 3, 4, 6, ['Dodge','Right Stuff','Sidestep','Stunty','Titchy']) ] },
  skaven: { name: 'Skaven', tier: 2, rrCost: 50, rr: 3, apo: 1, players: [
    P('Rata Ogro', 'skaven_ratogre', 'RO', 'big', 150, 1, 1, 6, 5, 4, 6, 9, ['Animal Savagery','Frenzy','Loner (4+)','Mighty Blow','Prehensile Tail'], { loner: 4, big: true }),
    P('Blitzer skaven', 'skaven_blitzer', 'Bz', 'blitz', 90, 2, 2, 8, 3, 3, 4, 9, ['Block','Strip Ball']),
    P('Corredor de alcantarilla', 'skaven_gutterrunner', 'Ca', 'wing', 85, 2, 2, 9, 2, 2, 4, 8, ['Dodge','Stab']),
    P('Lanzador skaven', 'skaven_thrower', 'Lz', 'back', 80, 2, 1, 7, 3, 3, 2, 8, ['Pass','Sure Hands']),
    P('Rata de clan', 'skaven_lineman', 'Rc', 'line', 50, 16, 5, 7, 3, 3, 4, 8, []) ] },
  snotling: { name: 'Snotlings', tier: 4, rrCost: 70, rr: 3, apo: 1, rules: ['Bribery'], players: [
    P('Troll adiestrado', 'snotling_troll', 'Tr', 'big', 115, 2, 1, 4, 5, 5, 5, 10, ['Always Hungry','Mighty Blow','Projectile Vomit','Really Stupid','Regeneration','Throw Team-mate'], { big: true, kw: 'troll' }),
    P('Carro bomba', 'snotling_pumpwagon', 'Cb', 'los', 100, 2, 1, 5, 5, 5, 6, 9, ['Dirty Player','Juggernaut','Mighty Blow','Really Stupid','Stand Firm'], { big: true }),
    P('Lanzahongos', 'snotling_fungusflinga', 'Lh', 'back', 30, 2, 1, 5, 1, 3, 4, 6, ['Bombardier','Dodge','Right Stuff','Secret Weapon','Sidestep','Stunty','Titchy']),
    P('Zancudo', 'snotling_stiltyrunna', 'Za', 'wing', 20, 2, 2, 6, 1, 3, 4, 6, ['Dodge','Right Stuff','Sidestep','Sprint','Stunty']),
    P('Saltarín divertido', 'snotling_funhoppa', 'Sd', 'wing', 20, 2, 1, 6, 1, 3, 4, 6, ['Dodge','Pogo Stick','Right Stuff','Sidestep','Stunty']),
    P('Snotling', 'snotling_snotling', 'Sn', 'line', 15, 16, 6, 5, 1, 3, 4, 6, ['Dodge','Insignificant','Right Stuff','Sidestep','Stunty','Titchy']) ] },
  tombkings: { name: 'Reyes Funerarios', tier: 2, rrCost: 60, rr: 3, apo: 0, players: [
    P('Guardián de la Tumba', 'tombkings_tombguardian', 'Gt', 'los', 115, 4, 2, 4, 5, 5, 6, 10, ['Brawler','Decay','Regeneration'], { big: true }),
    P('Blitzer ungido', 'tombkings_anointedblitzer', 'Bz', 'blitz', 85, 2, 2, 6, 3, 4, 5, 9, ['Block','Regeneration','Thick Skull']),
    P('Lanzador ungido', 'tombkings_anointedthrower', 'Lz', 'back', 65, 2, 1, 6, 3, 4, 3, 9, ['Pass','Regeneration','Sure Hands','Thick Skull']),
    P('Esqueleto', 'tombkings_skeletonlineman', 'Es', 'line', 40, 16, 6, 5, 3, 4, 6, 8, ['Regeneration','Thick Skull']) ] },
  underworld: { name: 'Habitantes del Subsuelo', tier: 1, rrCost: 70, rr: 2, apo: 1, rules: ['Bribery'], players: [
    P('Troll', 'underworlddenizens_underworldtroll', 'Tr', 'big', 115, 1, 1, 4, 5, 5, 5, 10, ['Always Hungry','Loner (4+)','Mighty Blow','Projectile Vomit','Really Stupid','Regeneration','Throw Team-mate'], { loner: 4, big: true, kw: 'troll' }),
    P('Blitzer skaven', 'underworlddenizens_skavenblitzer', 'Bz', 'blitz', 90, 1, 1, 8, 3, 3, 4, 9, ['Animosity (Goblin)','Block','Strip Ball']),
    P('Corredor de alcantarilla', 'underworlddenizens_gutterrunner', 'Ca', 'wing', 85, 1, 1, 9, 2, 2, 4, 8, ['Animosity (Goblin)','Dodge','Stab']),
    P('Lanzador skaven', 'underworlddenizens_skaventhrower', 'Lz', 'back', 80, 1, 1, 7, 3, 3, 2, 8, ['Animosity (Goblin)','Pass','Sure Hands']),
    P('Rata de clan', 'underworlddenizens_skavenlineman', 'Rc', 'los', 50, 3, 3, 7, 3, 3, 4, 8, ['Animosity (Goblin)']),
    P('Goblin', 'underworlddenizens_goblin', 'Gb', 'line', 40, 16, 4, 6, 2, 3, 4, 8, ['Dodge','Right Stuff','Stunty']) ] },
  vampire: { name: 'Vampiros', tier: 2, rrCost: 60, rr: 3, apo: 1, players: [
    P('Vargheist', 'vampire_vargheist', 'Vh', 'big', 150, 1, 1, 5, 5, 4, 6, 10, ['Bloodlust (3+)','Claws','Frenzy','Loner (4+)','Regeneration'], { loner: 4, big: true }),
    P('Vampiro Blitzer', 'vampire_vampireblitzer', 'Vb', 'blitz', 110, 2, 2, 6, 4, 2, 4, 9, ['Bloodlust (3+)','Hypnotic Gaze','Juggernaut','Regeneration']),
    P('Vampiro Corredor', 'vampire_vampirerunner', 'Vc', 'wing', 100, 2, 1, 8, 3, 2, 3, 8, ['Bloodlust (2+)','Hypnotic Gaze','Regeneration']),
    P('Vampiro Lanzador', 'vampire_vampirethrower', 'Vl', 'back', 110, 2, 1, 6, 4, 2, 2, 9, ['Bloodlust (2+)','Hypnotic Gaze','Pass','Regeneration']),
    P('Esclavo', 'vampire_thrall', 'Ts', 'line', 40, 16, 6, 6, 3, 3, 4, 8, [], { kw: 'thrall' }) ] },
  woodelf: { name: 'Elfos Silvanos', tier: 1, rrCost: 50, rr: 3, apo: 1, players: [
    P('Hombre Árbol de Loren', 'woodelf_treeman', 'Ar', 'big', 120, 1, 1, 2, 6, 5, 5, 11, ['Loner (4+)','Mighty Blow','Stand Firm','Strong Arm','Take Root','Thick Skull','Throw Team-mate'], { loner: 4, big: true }),
    P('Bailarín de guerra', 'woodelf_wardancer', 'Bg', 'blitz', 130, 2, 2, 8, 3, 2, 3, 8, ['Block','Dodge','Leap']),
    P('Receptor elfo silvano', 'woodelf_catcher', 'Rc', 'wing', 90, 2, 2, 8, 2, 2, 3, 8, ['Catch','Dodge','Sprint']),
    P('Lanzador elfo silvano', 'woodelf_thrower', 'Lz', 'back', 85, 2, 1, 7, 3, 2, 2, 8, ['Pass','Safe Pair of Hands']),
    P('Línea elfo silvano', 'woodelf_lineman', 'Ln', 'line', 65, 16, 5, 7, 3, 2, 3, 8, []) ] }
});
RACE_ORDER.push('blackorc', 'chaoschosen', 'chaosdwarf', 'chaosrenegade', 'dwarf', 'elvenunion', 'gnome', 'goblin', 'imperial', 'khorne', 'nightgoblin', 'norse', 'nurgle', 'ogre', 'skaven', 'snotling', 'tombkings', 'underworld', 'vampire', 'woodelf');
