"""Mapas compartidos de los importadores: razas, puestos BB2020 -> hoja de sprites, jugadores estrella."""
import os, json, re
R = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rosters.json')))
RACE = {'Wood Elf': 'woodelf', 'Orc': 'orc', 'Gnome': 'gnome', 'Elven Union': 'elvenunion', 'Dwarf': 'dwarf', 'High Elf': 'highelf',
        'Necromantic Horror': 'necro', 'Dark Elf': 'darkelf', 'Shambling Undead': 'undead', 'Skaven': 'skaven', 'Vampire': 'vampire', 'Lizardmen': 'lizard',
        'Human': 'human', 'Amazon': 'amazon', 'Halfling': 'halfling', 'Norse': 'norse', 'Nurgle': 'nurgle', 'Chaos Dwarf': 'chaosdwarf', 'Lizardman': 'lizard'}
SHEET = {  # (raza, puesto BB2020) -> hoja de sprites del juego
 'woodelf': {'Catcher': 'woodelf_catcher', 'Thrower': 'woodelf_thrower', 'Wardancer': 'woodelf_wardancer', 'Wood Elf Lineman': 'woodelf_lineman', 'Treeman': 'woodelf_treeman'},
 'orc': {'Thrower': 'orc_thrower', 'Blitzer': 'orc_blitzer', 'Big Un Blocker': 'orc_bigunblocker', 'Untrained Troll': 'orc_troll', 'Troll': 'orc_troll', 'Goblin': 'orc_goblin', 'Orc Lineman': 'orc_lineman'},
 'gnome': {'Altern Forest Treeman': 'gnome_alternforesttreeman', 'Gnome Beastmaster': 'gnome_gnomebeastmaster', 'Woodland Fox': 'gnome_woodlandfox', 'Gnome Illusionist': 'gnome_gnomeillusionist', 'Gnome Lineman': 'gnome_gnomelineman'},
 'elvenunion': {'Lineman': 'elvenunion_lineman', 'Thrower': 'elvenunion_thrower', 'Catcher': 'elvenunion_catcher', 'Blitzer': 'elvenunion_blitzer'},
 'dwarf': {'Dwarf Blitzer': 'dwarf_blitzer', 'Dwarf Runner': 'dwarf_runner', 'Troll Slayer': 'dwarf_trollslayer', 'Dwarf Blocker Lineman': 'dwarf_blocker', 'Deathroller': 'dwarf_deathroller'},
 'highelf': {'Blitzer': 'highelf_blitzer', 'Catcher': 'highelf_catcher', 'Thrower': 'highelf_thrower', 'Lineman': 'highelf_lineman'},
 'necro': {'Flesh Golem': 'necromantichorror_fleshgolem', 'Ghoul Runner': 'necromantichorror_ghoulrunner', 'Wraith': 'necromantichorror_wraith', 'Zombie Lineman': 'necromantichorror_zombie', 'Werewolf': 'necromantichorror_werewolf'},
 'darkelf': {'Blitzer': 'darkelf_blitzer', 'Witch Elf': 'darkelf_witchelf', 'Dark Elf Lineman': 'darkelf_lineman', 'Runner': 'darkelf_runner', 'Assassin': 'darkelf_assassin'},
 'undead': {'Mummy': 'shamblingundead_mummy', 'Wight Blitzer': 'shamblingundead_wightblitzer', 'Ghoul Runner': 'shamblingundead_ghoulrunner', 'Zombie Lineman': 'shamblingundead_zombie', 'Skeleton Lineman': 'shamblingundead_skeleton'},
 'skaven': {'Thrower': 'skaven_thrower', 'Gutter Runner': 'skaven_gutterrunner', 'Blitzer': 'skaven_blitzer', 'Rat Ogre': 'skaven_ratogre', 'Skaven Clanrat Lineman': 'skaven_lineman'},
 'vampire': {'Vampire Runner': 'vampire_vampirerunner', 'Vampire Thrower': 'vampire_vampirethrower', 'Vampire Blitzer': 'vampire_vampireblitzer', 'Thrall Lineman': 'vampire_thrall', 'Vargheist': 'vampire_vargheist'},
 'lizard': {'Saurus Blocker': 'lizardmen_saurusblocker', 'Kroxigor': 'lizardmen_kroxigor', 'Skink Runner Lineman': 'lizardmen_skinkrunner', 'Chameleon Skink': 'lizardmen_chameleonskink'},
}
SKFIX = {'Timmm-Ber!': 'Timmm-ber!'}
norm = lambda x: re.sub(r' \(.*\)', '', x)
info = {}  # hoja -> datos del puesto en el juego
for r in R.values():
    for p in r['players']: info[p['sheet']] = p


# jugadores estrella: hoja propia (sprites de FFB) y rol de IA
STAR = {
 'Gloriel Summerbloom': ('star_glorielsummerbloom', 'back'), 'Bomber Dribblesnot': ('star_bomberdribblesnot', 'sub'), 'Nobbla Blackwart': ('star_nobblablackwart', 'sub'),
 'Wilhelm Chaney': ('star_wilhelmthewolfmanchaney', 'blitz'), 'Karla Von Kill': ('star_karlavonkill', 'blitz'), 'Mighty Zug': ('star_mightyzug', 'los'),
 'Glart Smashrip': ('star_glartsmashrip', 'blitz'), 'Fungus The Loon': ('star_fungustheloon', 'sub'), "Bryce 'The Slice' Cambuel": ('star_brycethesliceCambuel'.lower(), 'blitz'),
 'Varag Ghoul-Chewer': ('star_varagghoulchewer', 'blitz')}
