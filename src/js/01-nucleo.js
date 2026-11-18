'use strict';
/* =====================================================================
   Motor de reglas (sin dependencias del navegador, se puede simular)
   ===================================================================== */
const HEADLESS = typeof document === 'undefined';
const W = 26, H = 15, TURNS = 8;
const DIRS = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
let DELAY = 1.6;
let SIM = false;
let PAUSED = false; const PQ = [];
function setPause(v) { PAUSED = v; if (!v) PQ.splice(0).forEach(f => f()); }
const sleep = ms => (HEADLESS || SIM || !ms) ? Promise.resolve() : new Promise(r => setTimeout(() => PAUSED ? PQ.push(r) : r(), ms * DELAY));
let snapHook = null;
let coachHook = null;
/* serializar / restaurar la partida (los jugadores salen una sola vez; el resto son referencias) */
function snapG() {
  const pl = new Set(allPlayers()), own = G.teams.map(t => t.players);
  const rep = function (k, v) {
    if (k === 'ctrl') return undefined;
    if (k === 'log') return v.slice(-120);
    if (v instanceof Set) return { $set: [...v] };
    if (v && typeof v === 'object' && pl.has(v) && !own.includes(this)) return { $p: [v.team, v.id] };
    return v;
  };
  return JSON.stringify(G, rep);
}
function restoreG(str) {
  const g = JSON.parse(str, (k, v) => (v && v.$set) ? new Set(v.$set) : v);
  const fix = o => {
    if (!o || typeof o !== 'object') return o;
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (v && typeof v === 'object') { if (v.$p) o[k] = g.teams[v.$p[0]].players[v.$p[1]]; else fix(v); }
    }
    return o;
  };
  fix(g); G = g; return G;
}
const d = n => 1 + Math.floor(Math.random() * n);
const d6 = () => d(6);
const inPitch = (x, y) => x >= 0 && x < W && y >= 0 && y < H;
const idx = (x, y) => y * W + x;
const cheb = (ax, ay, bx, by) => Math.max(Math.abs(ax - bx), Math.abs(ay - by));
const clampP = p => Math.max(1 / 6, Math.min(5 / 6, p));

const RANGE = ["TQQQSSSSLLLBBB","QQQQSSSSLLLBBB","QQQSSSSLLLLBB","QQSSSSSLLLBBB","SSSSSSLLLLBBB","SSSSSLLLLBBB",
  "SSSSLLLLLBBB","SSLLLLLLBBBB","LLLLLLLBBBB","LLLLLLBBBBB","LLLLBBBBBB","BBBBBBBB","BBBBBB","BBB"];
const BAND_NAME = ['rápido', 'corto', 'largo', 'bomba'];
function rangeBand(ax, ay, bx, by) {
  const a = Math.abs(ax - bx), b = Math.abs(ay - by), lo = Math.min(a, b), hi = Math.max(a, b);
  const row = RANGE[lo]; if (!row || hi >= row.length) return -1;
  return 'TQSLB'.indexOf(row[hi]) - 1 < 0 ? 0 : 'TQSLB'.indexOf(row[hi]) - 1;
}

const P = (pos, sheet, ab, role, cost, max, q, ma, st, ag, pa, av, sk, x) => Object.assign({ pos, sheet, ab, role, cost, max, q, ma, st, ag, pa, av, sk }, x || {});
const ROSTERS = {
  human: { name: 'Humanos', tier: 2, rrCost: 50, rr: 3, apo: 1, players: [
    P('Ogro', 'human_ogre', 'Og', 'big', 140, 1, 1, 5, 5, 4, 5, 10, ['Bone Head','Loner (3+)','Mighty Blow','Thick Skull','Throw Team-mate'], { loner: 3, big: true }),
    P('Blitzer', 'human_blitzer', 'Bz', 'blitz', 85, 2, 2, 7, 3, 3, 4, 9, ['Block','Tackle']),
    P('Receptor', 'human_catcher', 'Rc', 'wing', 75, 2, 2, 8, 3, 3, 4, 8, ['Catch','Dodge']),
    P('Lanzador', 'human_thrower', 'Lz', 'back', 75, 2, 1, 6, 3, 3, 3, 9, ['Pass','Sure Hands']),
    P('Línea', 'human_lineman', 'Ln', 'line', 50, 16, 5, 6, 3, 3, 4, 9, []),
    P('Halfling', 'human_halflinghopeful', 'Hf', 'sub', 30, 3, 1, 5, 2, 3, 4, 7, ['Dodge','Right Stuff','Stunty']) ] },
  orc: { name: 'Orcos', tier: 2, rrCost: 60, rr: 3, apo: 1, players: [
    P('Troll', 'orc_troll', 'Tr', 'big', 115, 1, 1, 4, 5, 5, 5, 10, ['Always Hungry','Loner (4+)','Mighty Blow','Projectile Vomit','Really Stupid','Regeneration','Throw Team-mate'], { loner: 4, big: true, kw: 'troll' }),
    P('Blitzer orco', 'orc_blitzer', 'Bz', 'blitz', 85, 2, 2, 6, 3, 3, 4, 10, ['Block','Break Tackle']),
    P('Big Un', 'orc_bigunblocker', 'BU', 'los', 95, 2, 2, 5, 4, 4, 6, 10, ['Mighty Blow','Taunt','Thick Skull','Unsteady']),
    P('Lanzador orco', 'orc_thrower', 'Lz', 'back', 75, 2, 1, 6, 3, 3, 3, 9, ['Pass','Sure Hands']),
    P('Línea orco', 'orc_lineman', 'Ln', 'line', 50, 16, 5, 5, 3, 3, 4, 10, []),
    P('Goblin', 'orc_goblin', 'Gb', 'sub', 40, 4, 1, 6, 2, 3, 4, 8, ['Dodge','Right Stuff','Stunty']) ] },
  amazon: { name: 'Amazonas', tier: 1, rrCost: 60, rr: 3, apo: 1, players: [
    P('Guerrera Jaguar', 'amazon_jaguarwarriorblocker', 'Jg', 'los', 110, 2, 2, 6, 4, 3, 4, 9, ['Defensive','Dodge']),
    P('Guerrera Piraña', 'amazon_piranhawarriorblitzer', 'Pi', 'blitz', 90, 2, 2, 7, 3, 3, 4, 8, ['Dodge','Hit and Run','Jump Up']),
    P('Guerrera Pitón', 'amazon_eaglewarriorthrower', 'Pt', 'back', 80, 2, 2, 6, 3, 3, 3, 8, ['Dodge','On the Ball','Pass','Safe Pass']),
    P('Guerrera Águila', 'amazon_triballinewoman', 'Ag', 'line', 50, 16, 6, 6, 3, 3, 4, 8, ['Dodge']) ] },
  undead: { name: 'No Muertos', tier: 2, rrCost: 70, rr: 3, apo: 0, players: [
    P('Momia', 'shamblingundead_mummy', 'Mo', 'big', 125, 2, 2, 3, 5, 5, 6, 10, ['Mighty Blow','Regeneration']),
    P('Tumulario', 'shamblingundead_wightblitzer', 'Tu', 'blitz', 95, 2, 2, 6, 3, 3, 5, 9, ['Block','Regeneration','Tackle','Thick Skull']),
    P('Necrófago', 'shamblingundead_ghoulrunner', 'Nc', 'wing', 75, 2, 2, 7, 3, 3, 3, 8, ['Dodge','Regeneration']),
    P('Zombi', 'shamblingundead_zombie', 'Zo', 'los', 40, 16, 3, 4, 3, 4, 6, 9, ['Eye Gouge','Regeneration','Unsteady']),
    P('Esqueleto', 'shamblingundead_skeleton', 'Es', 'line', 40, 16, 3, 5, 3, 4, 6, 8, ['Regeneration','Thick Skull']) ] },
  darkelf: { name: 'Elfos Oscuros', tier: 1, rrCost: 50, rr: 2, apo: 1, players: [
    P('Elfa Bruja', 'darkelf_witchelf', 'Br', 'wing', 110, 2, 2, 7, 3, 2, 4, 8, ['Dodge','Frenzy','Jump Up']),
    P('Blitzer elfo oscuro', 'darkelf_blitzer', 'Bz', 'blitz', 105, 2, 2, 7, 3, 2, 3, 9, ['Block']),
    P('Corredor', 'darkelf_runner', 'Co', 'back', 80, 2, 1, 7, 3, 2, 3, 8, ['Dump-off','Punt']),
    P('Asesino', 'darkelf_assassin', 'As', 'line', 90, 2, 1, 7, 3, 2, 4, 8, ['Hit and Run','Shadowing','Stab']),
    P('Línea elfo oscuro', 'darkelf_lineman', 'Ln', 'line', 65, 16, 5, 6, 3, 2, 3, 9, []) ] },
  halfling: { name: 'Halflings', tier: 4, rrCost: 60, rr: 3, apo: 1, players: [
    P('Hombre Árbol', 'halfling_treeman', 'Ar', 'big', 120, 2, 2, 2, 6, 5, 5, 11, ['Loner (4+)','Mighty Blow','Stand Firm','Strong Arm','Take Root','Thick Skull','Throw Team-mate','Timmm-ber!'], { loner: 4, big: true }),
    P('Halfling Robusto', 'halfling_halflinghefty', 'Ro', 'los', 50, 2, 2, 5, 2, 3, 3, 8, ['Dodge','Fend','Stunty']),
    P('Halfling Receptor', 'halfling_halflingcatcher', 'Rc', 'wing', 55, 2, 2, 5, 2, 3, 4, 7, ['Catch','Dodge','Right Stuff','Sprint','Stunty']),
    P('Halfling', 'halfling_halflinghopeful', 'Hf', 'line', 30, 16, 8, 5, 2, 3, 4, 7, ['Dodge','Right Stuff','Stunty']) ] },
  necro: { name: 'Nigromantes', tier: 2, rrCost: 70, rr: 2, apo: 0, players: [
    P('Gólem de Carne', 'necromantichorror_fleshgolem', 'Go', 'los', 110, 2, 2, 4, 4, 4, 6, 10, ['Regeneration','Stand Firm','Thick Skull','Unsteady']),
    P('Hombre Lobo', 'necromantichorror_werewolf', 'Lo', 'blitz', 120, 2, 2, 8, 3, 3, 3, 9, ['Claws','Frenzy','Regeneration']),
    P('Espectro', 'necromantichorror_wraith', 'Ep', 'wing', 85, 2, 2, 6, 3, 3, 7, 9, ['Block','Foul Appearance','No Ball','Regeneration','Sidestep']),
    P('Necrófago', 'necromantichorror_ghoulrunner', 'Nc', 'back', 75, 2, 2, 7, 3, 3, 3, 8, ['Dodge','Regeneration']),
    P('Zombi', 'necromantichorror_zombie', 'Zo', 'line', 40, 16, 4, 4, 3, 4, 6, 9, ['Eye Gouge','Regeneration','Unsteady']) ] },
  owa: { name: 'Alianza del Viejo Mundo', tier: 1, rrCost: 70, rr: 2, apo: 1, players: [
    P('Ogro', 'oldworldalliance_ogre', 'Og', 'big', 140, 1, 1, 5, 5, 4, 5, 10, ['Bone Head','Loner (3+)','Mighty Blow','Thick Skull','Throw Team-mate'], { loner: 3, big: true }),
    P('Matatrolls', 'oldworldalliance_dwarftrollslayer', 'Mt', 'blitz', 95, 1, 1, 5, 3, 4, 5, 9, ['Block','Dauntless','Frenzy','Hatred (Troll)','Thick Skull']),
    P('Blitzer enano', 'oldworldalliance_dwarfblitzer', 'Be', 'blitz', 100, 1, 1, 5, 3, 4, 4, 10, ['Block','Diving Tackle','Tackle','Thick Skull']),
    P('Blitzer humano', 'oldworldalliance_humanblitzer', 'Bz', 'blitz', 85, 1, 1, 7, 3, 3, 4, 9, ['Block','Tackle']),
    P('Línea enano', 'oldworldalliance_dwarfblocker', 'Le', 'los', 70, 3, 3, 4, 3, 4, 5, 10, ['Block','Defensive','Thick Skull']),
    P('Corredor enano', 'oldworldalliance_dwarfrunner', 'Ce', 'wing', 80, 1, 1, 6, 3, 3, 4, 9, ['Sprint','Sure Hands','Thick Skull']),
    P('Receptor humano', 'oldworldalliance_humancatcher', 'Rc', 'wing', 75, 1, 1, 8, 3, 3, 4, 8, ['Catch','Dodge']),
    P('Lanzador humano', 'oldworldalliance_humanthrower', 'Lz', 'back', 75, 1, 1, 6, 3, 3, 3, 9, ['Pass','Sure Hands']),
    P('Línea humano', 'oldworldalliance_humanlineman', 'Ln', 'line', 50, 16, 2, 6, 3, 3, 4, 9, []),
    P('Halfling', 'oldworldalliance_halflinghopeful', 'Hf', 'sub', 30, 3, 0, 5, 2, 3, 4, 7, ['Dodge','Right Stuff','Stunty']),
    P('Hombre Árbol', 'oldworldalliance_alternforesttreeman', 'Ar', 'big', 120, 1, 0, 2, 6, 5, 5, 11, ['Loner (4+)','Mighty Blow','Stand Firm','Strong Arm','Take Root','Thick Skull','Throw Team-mate','Timmm-ber!'], { loner: 4, big: true }) ] },
  lizard: { name: 'Hombres Lagarto', tier: 1, rrCost: 70, rr: 2, apo: 1, players: [
    P('Kroxigor', 'lizardmen_kroxigor', 'Kx', 'big', 140, 1, 1, 6, 5, 5, 6, 10, ['Bone Head','Loner (4+)','Mighty Blow','Prehensile Tail','Thick Skull'], { loner: 4, big: true }),
    P('Saurio', 'lizardmen_saurusblocker', 'Sa', 'los', 90, 6, 6, 6, 4, 5, 6, 10, ['Juggernaut','Unsteady']),
    P('Eslizón Camaleón', 'lizardmen_chameleonskink', 'Cm', 'wing', 70, 2, 1, 7, 2, 3, 3, 8, ['Dodge','On the Ball','Shadowing','Stunty']),
    P('Eslizón', 'lizardmen_skinkrunner', 'Ez', 'line', 60, 16, 4, 8, 2, 3, 4, 8, ['Dodge','Stunty']) ] },
  highelf: { name: 'Altos Elfos', tier: 1, rrCost: 50, rr: 2, apo: 1, players: [
    P('Príncipe Dragón', 'highelf_blitzer', 'PD', 'blitz', 110, 2, 2, 8, 3, 2, 4, 9, ['Block','My Ball','Steady Footing']),
    P('León Blanco', 'highelf_catcher', 'LB', 'wing', 110, 2, 2, 7, 3, 2, 3, 9, ['Claws','Wrestle']),
    P('Guerrero Fénix', 'highelf_thrower', 'Fx', 'back', 90, 2, 1, 6, 3, 2, 2, 9, ['Cloud Burster','Pass','Safe Pass']),
    P('Línea alto elfo', 'highelf_lineman', 'Ln', 'line', 65, 16, 6, 6, 3, 2, 3, 9, []) ] },
  bret: { name: 'Bretonianos', tier: 2, rrCost: 60, rr: 3, apo: 1, players: [
    P('Caballero del Grial', 'bretonnian_blitzers', 'Gr', 'blitz', 95, 2, 2, 7, 3, 3, 4, 10, ['Block','Dauntless','Steady Footing']),
    P('Caballero Receptor', 'bretonnian_yeomen', 'CR', 'wing', 85, 2, 2, 7, 3, 3, 4, 9, ['Catch','Dauntless','Nerves of Steel']),
    P('Caballero Lanzador', 'bretonnian_yeomen', 'CL', 'back', 80, 2, 1, 6, 3, 3, 3, 9, ['Dauntless','Nerves of Steel','Pass'], { vo: 2 }),
    P('Escudero', 'bretonnian_linemen', 'Ec', 'line', 50, 16, 7, 6, 3, 3, 4, 8, ['Wrestle']) ] }
};
const RACE_ORDER = ['human', 'orc', 'amazon', 'undead', 'darkelf', 'halfling', 'necro', 'owa', 'lizard', 'highelf', 'bret'];
const SLOT_ROLES = ['L', 'L', 'L', 'B', 'B', 'W', 'W', 'K', 'M', 'M', 'M'];
const ROLE_PREF = { L: ['big', 'los', 'line', 'blitz', 'wing', 'back', 'sub'], B: ['blitz', 'los', 'line', 'wing', 'back', 'big', 'sub'], W: ['wing', 'line', 'blitz', 'back', 'los', 'sub', 'big'],
  K: ['back', 'line', 'wing', 'blitz', 'los', 'sub', 'big'], M: ['line', 'blitz', 'los', 'wing', 'back', 'sub', 'big'] };
const SLOTS = {
  recv: [[12,7],[12,6],[12,8],[11,4],[11,10],[11,2],[11,12],[6,7],[10,6],[10,8],[9,7]],
  kick: [[12,7],[12,6],[12,8],[11,4],[11,10],[10,2],[10,12],[8,7],[10,5],[10,9],[9,7]]
};

