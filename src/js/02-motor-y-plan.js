/* =====================================================================
   Plan táctico del entrenador: formaciones con nombre y presets
   (coordenadas del equipo 0; el equipo 1 se refleja en x)
   ===================================================================== */
const FORMS = {
  def: {
    std:   { name: 'Estándar', desc: '3 en la línea, pantalla ancha a dos casillas y los valiosos atrás. Sirve casi siempre.', slots: null },
    wide:  { name: 'Frente ancho', desc: 'Línea abierta: el rival gasta más fuerza y asistencias, y el Guard pierde valor.',
      slots: [[12,4,'L'],[12,7,'L'],[12,10,'L'],[10,5,'B'],[10,9,'B'],[10,2,'W'],[10,12,'W'],[8,7,'K'],[9,7,'M'],[9,3,'M'],[9,11,'M']] },
    wall:  { name: 'Muro central', desc: 'Todo compacto en el centro. Fuerte de frente, débil por las bandas.',
      slots: [[12,6,'L'],[12,7,'L'],[12,8,'L'],[11,5,'B'],[11,9,'B'],[11,4,'W'],[11,10,'W'],[9,7,'K'],[10,6,'M'],[10,8,'M'],[11,7,'M']] },
    five:  { name: 'Regla de cinco', desc: 'Tres al frente, tres en tercera línea y los cinco más valiosos protegidos detrás.',
      slots: [[12,6,'L'],[12,7,'L'],[12,8,'L'],[10,4,'M'],[10,7,'M'],[10,10,'M'],[9,5,'B'],[9,9,'B'],[8,6,'W'],[8,8,'W'],[7,7,'K']] },
    open:  { name: 'Medio abierto', desc: 'Deja huecos para que el rival no pueda armar un cage. Lo obliga a anotar rápido o arriesgar el balón.',
      slots: [[12,5,'L'],[12,7,'L'],[12,9,'L'],[9,4,'B'],[9,10,'B'],[10,2,'W'],[10,12,'W'],[8,7,'K'],[8,5,'M'],[8,9,'M'],[7,7,'M']] },
    deep:  { name: 'Retaguardia', desc: 'Todos lejos del rival. Casi no se pueden hacer bajas, pero se cede campo.',
      slots: [[12,6,'L'],[12,7,'L'],[12,8,'L'],[9,5,'B'],[9,9,'B'],[8,3,'W'],[8,11,'W'],[7,7,'K'],[8,6,'M'],[8,8,'M'],[9,7,'M']] }
  },
  att: {
    front: { name: 'Frente completo', desc: 'Todos al frente listos para pegar en el primer turno, con un portador atrás.', slots: null },
    cage:  { name: 'Cage lento', desc: 'Cinco al frente y el resto cerca del portador para armar el cage rápido.',
      slots: [[12,6,'L'],[12,7,'L'],[12,8,'L'],[11,5,'B'],[11,9,'B'],[10,4,'W'],[10,10,'W'],[7,7,'K'],[9,6,'M'],[9,8,'M'],[8,7,'M']] },
    spread:{ name: 'Abierto (pase)', desc: 'Línea abierta y receptores en las bandas. Para jugar con pase y velocidad.',
      slots: [[12,4,'L'],[12,7,'L'],[12,10,'L'],[11,2,'W'],[11,12,'W'],[10,5,'B'],[10,9,'B'],[6,7,'K'],[8,7,'M'],[9,3,'M'],[9,11,'M']] },
    flank: { name: 'Banda', desc: 'Un grupo de ocho cargando por una banda (la del lado con menos rivales).',
      slots: [[12,4,'L'],[12,5,'L'],[12,6,'L'],[11,4,'B'],[11,6,'B'],[10,3,'W'],[10,5,'W'],[7,5,'K'],[9,4,'M'],[9,6,'M'],[8,5,'M']] }
  }
};
const SCORING = { fast: 'Rápido: anota apenas pueda', balanced: 'Equilibrado', late: 'Tardío: aguanta el balón y anota en el último turno' };
const TARGETS = { carrier: 'El portador del balón', key: 'Jugadores clave (con habilidades extra)', weak: 'Los de menor armadura' };
const FOULS = { never: 'Nunca', opp: 'Cuando hay buena chance', always: 'Siempre que se pueda' };
const RRPOL = { early: 'Usarlos apenas fallen', save: 'Guardarlos para el balón y el último turno' };
const PRESETS = {
  equil:  { name: 'Equilibrado', desc: 'El juego de siempre de la IA.', def: 'std', att: 'front', style: 50, scoring: 'balanced', risk: 50, target: 'carrier', fouls: 'opp', rr: 'early', auto: false },
  cerrojo:{ name: 'Cerrojo', desc: 'Juego estándar de los buenos entrenadores: nada de riesgos, cage y anotar en el último turno.', def: 'five', att: 'cage', style: 30, scoring: 'late', risk: 20, target: 'carrier', fouls: 'opp', rr: 'save', auto: false },
  muro:   { name: 'Muro', desc: 'Defensa compacta que va por el portador y no regala nada.', def: 'wall', att: 'cage', style: 25, scoring: 'late', risk: 30, target: 'carrier', fouls: 'opp', rr: 'save', auto: true },
  cage:   { name: 'Cage lento', desc: 'Arma el cage con calma, golpea a los clave y aprovecha las faltas.', def: 'std', att: 'cage', style: 40, scoring: 'late', risk: 25, target: 'key', fouls: 'always', rr: 'save', auto: false },
  locura: { name: 'Locura ofensiva', desc: 'Todos adelante, pase y velocidad, riesgo alto.', def: 'wide', att: 'spread', style: 90, scoring: 'fast', risk: 85, target: 'carrier', fouls: 'never', rr: 'early', auto: false },
  banda:  { name: 'Banda rápida', desc: 'Carga por una banda y anota rápido.', def: 'open', att: 'flank', style: 70, scoring: 'fast', risk: 65, target: 'carrier', fouls: 'opp', rr: 'early', auto: false },
  bash:   { name: 'Contra pegadores', desc: 'Retaguardia para no regalar bajas y faltas a los caídos.', def: 'deep', att: 'cage', style: 30, scoring: 'balanced', risk: 30, target: 'weak', fouls: 'always', rr: 'save', auto: false }
};
const clone = o => JSON.parse(JSON.stringify(o));
function formSlots(kind, key, ti) {
  const f = FORMS[kind][key] || FORMS[kind][kind === 'def' ? 'std' : 'front'];
  if (!f.slots) return null;
  let sl = f.slots.map(a => a.slice());
  if (kind === 'att' && key === 'flank') {   // carga por la banda con menos rivales
    const foes = G.teams[1 - ti].players.filter(p => p.loc === 'pitch');
    const top = foes.filter(p => p.y <= 6).length, bot = foes.filter(p => p.y >= 8).length;
    if (bot < top) sl = sl.map(([x, y, r]) => [x, 14 - y, r]);
  }
  return sl;
}
/* coloca el equipo según la formación del plan; si no cumple las reglas vuelve a la formación base */
function planSetup(ti, kicking, key) {
  const slots = formSlots(kicking ? 'def' : 'att', key, ti);
  if (!slots) return;
  for (const p of G.teams[ti].players) if (p.loc === 'pitch') { p.loc = 'reserve'; p.x = p.y = -1; }
  autoSetup(ti, kicking, slots);
  if (setupProblem(ti)) {
    for (const p of G.teams[ti].players) if (p.loc === 'pitch') { p.loc = 'reserve'; p.x = p.y = -1; }
    autoSetup(ti, kicking);
  }
}

const KICKEV = {
  2: ['A por el árbitro', 'Cada equipo recibe un soborno gratis.'],
  3: ['Tiempo muerto', 'Los marcadores de turno avanzan o retroceden una casilla.'],
  4: ['Defensa sólida', 'El equipo que patea puede recolocar jugadores libres.'],
  5: ['Patada alta', 'Un receptor puede ponerse justo bajo el balón.'],
  6: ['Hinchada animando', 'El ganador tiene una asistencia extra en su primer bloqueo.'],
  7: ['Entrenamiento brillante', 'El ganador recibe un reroll extra para esta entrada.'],
  8: ['Cambio de clima', 'Se vuelve a tirar el clima.'],
  9: ['Saque rápido', 'El que recibe mueve una casilla a varios jugadores libres.'],
  10: ['Carga', 'El que patea activa varios jugadores libres, y uno puede hacer blitz.'],
  11: ['Colación sospechosa', 'Un jugador de cada equipo puede enfermarse.'],
  12: ['Invasión de campo', 'La hinchada derriba jugadores del equipo perdedor.']
};
let G = null;
let render = () => {};
let flash = () => {};
let fxRoll = async () => {}, fxPick = async () => {}, fxBanner = async () => {};
let onLog = () => {};

function log(text, cls) { G.log.push(text); if (!SIM) onLog(text, cls); }
const has = (p, s) => p.skills.has(s);
const nm = p => p.name;
const allPlayers = () => G.teams[0].players.concat(G.teams[1].players);
const pitchPlayers = () => allPlayers().filter(p => p.loc === 'pitch');
function playerAt(x, y) { for (const t of G.teams) for (const p of t.players) if (p.loc === 'pitch' && p.x === x && p.y === y) return p; return null; }
const hasTZ = p => p.loc === 'pitch' && p.state === 'standing' && !p.distracted;
function markersAt(x, y, team, except) {   // rivales de "team" con zona de defensa sobre (x,y)
  const r = [];
  for (const q of G.teams[1 - team].players) if (q !== except && hasTZ(q) && cheb(q.x, q.y, x, y) === 1) r.push(q);
  return r;
}
const markers = (p, except) => markersAt(p.x, p.y, p.team, except);
const goalX = team => team === 0 ? W - 1 : 0;
const inHalf = (x, team) => team === 0 ? x <= 12 : x >= 13;
function ballPos() { const c = G.ball.carrier; return c ? [c.x, c.y] : [G.ball.x, G.ball.y]; }
const disturb = p => G.teams[1 - p.team].players.filter(q => q.loc === 'pitch' && q.state === 'standing' && has(q, 'Disturbing Presence') && cheb(q.x, q.y, p.x, p.y) <= 3).length;
const ballLoose = () => !G.ball.carrier && inPitch(G.ball.x, G.ball.y);
const WX = { heat: 'Calor sofocante', sunny: 'Muy soleado', nice: 'Clima perfecto', rain: 'Lluvia torrencial', blizzard: 'Ventisca' };
const wx = k => G.weather === k;
const rushNeed = () => wx('blizzard') ? 3 : 2;
const d3 = () => Math.ceil(d6() / 2);
const openPlayers = ti => G.teams[ti].players.filter(p => hasTZ(p) && markers(p).length === 0);
function pickRandom(arr, n) { const a = arr.slice(), r = []; while (a.length && r.length < n) r.push(a.splice(d(a.length) - 1, 1)[0]); return r; }
function rollWeather() {
  const r = d6() + d6();
  G.weather = r === 2 ? 'heat' : r === 3 ? 'sunny' : r <= 10 ? 'nice' : r === 11 ? 'rain' : 'blizzard';
  log(`Clima (${r}): ${WX[G.weather]}`, 'hd');
}

function makePlayer(team, id, d) {
  const skills = new Set(); let loner = d.loner || 0, animo = '';
  for (const raw of d.sk) {
    let k = raw.replace(/ \(.*\)/, '');
    if (k === 'Side Step') k = 'Sidestep';
    const m = raw.match(/\((.*)\)/);
    if (k === 'Loner' && m) loner = parseInt(m[1]) || 4;
    if (k === 'Animosity' && m) animo = m[1];
    skills.add(k);
  }
  return { id, team, name: d.name, pos: d.pos, ab: d.ab, sheet: d.sheet, variant: d.variant || 0, role: d.role, kw: d.kw || '',
    ma: d.ma, st: d.st, ag: d.ag, pa: d.pa || 7, noPA: !d.pa, av: d.av, skills, skList: d.sk, ex: d.ex || [], loner, animo, big: !!d.big,
    x: -1, y: -1, loc: 'reserve', state: 'standing',
    used: false, started: false, distracted: false, dodgeUsed: false, btUsed: false, sfUsed: false, blitzBlocked: false, stunStart: false,
    maLeft: 0, rushes: 0, action: null, stall: false, snack: false, heat: false, rooted: false, gouged: false, shadowUses: 0 };
}
function teamShell(i, o, players) {
  const rr = o.rr, line = (o.players || []).find(d => d.role === 'line') || o.lineDef || null;
  return { i, race: o.race, name: o.name, coach: o.coach || '', color: i === 0 ? '#3f8a86' : '#d2693a', players, rrMax: rr, rerolls: rr, score: 0, ctrl: null,
    apo: o.apo, bribes: 0, canArgue: true, cheer: o.cheer || 0, coaches: o.coaches || 0, fans: Math.max(1, o.fans || 0), kegs: o.kegs || 0, leaderRR: false, plagueUsed: false, lineDef: line, ff: 0, cheerAssist: false, bonusRR: 0, rrUsed: 0 };
}
function makeTeam(i, race) {
  if (typeof race === 'object') return teamShell(i, race, race.players.map((d, k) => makePlayer(i, k, d)));
  const R = ROSTERS[race], players = [];
  for (const def of R.players) for (let k = 1; k <= def.q; k++)
    players.push(makePlayer(i, players.length, Object.assign({}, def, { name: def.q > 1 ? `${def.pos} ${k}` : def.pos, variant: k - 1 + (def.vo || 0) })));
  const ld = R.players.find(d => d.role === 'line');
  return teamShell(i, { race, name: R.name, rr: R.rr, apo: R.apo, lineDef: ld ? Object.assign({}, ld, { name: ld.pos }) : null }, players);
}
function newGame(race0, race1) {
  G = { teams: [makeTeam(0, race0), makeTeam(1, race1)], ball: { x: -1, y: -1, carrier: null }, half: 1, turn: [0, 0],
    active: -1, phase: 'pre', log: [], turnover: false, td: null, cur: null, kick: null, touchback: false,
    blitzUsed: false, passUsed: false, handUsed: false, foulUsed: false, secureUsed: false, ttmUsed: false,
    weather: 'nice', charge: null, pendingStall: null, ballAir: null };
  return G;
}

/* ---------- tiradas ---------- */
const leaderOn = t => t.leaderRR && t.players.some(p => p.loc === 'pitch' && has(p, 'Leader'));
const rrLeft = t => t.rerolls + (leaderOn(t) ? 1 : 0);
function spendReroll(p) {
  const t = G.teams[p.team];
  if (leaderOn(t)) { t.leaderRR = false; log(`${t.name} usa el reroll de Leader`, 't' + p.team); } else t.rerolls--;
  t.rrUsed++;
  if (p.loner) {
    const r = d6();
    if (r < p.loner) { log(`${nm(p)} es Solitario (necesita ${p.loner}+) y saca ${r}: el reroll se pierde`, 'bad'); return false; }
    log(`${nm(p)} es Solitario (necesita ${p.loner}+) y saca ${r}: el reroll vale`, 't' + p.team);
  }
  log(`${G.teams[p.team].name} usa un reroll de equipo (quedan ${rrLeft(t)})`, 't' + p.team);
  return true;
}
async function teamReroll(p, label) {
  const t = G.teams[p.team];
  if (G.phase !== 'turn' || G.active !== p.team || rrLeft(t) <= 0) return false;
  if (!(await t.ctrl.askReroll(p, label))) return false;
  return spendReroll(p);
}
async function rollTest(p, label, need, o) {
  o = o || {};
  const pass = r => (r === 6 || (r !== 1 && r >= need) || (r !== 1 && o.rescue && o.rescue(r))) && !(o.spoil && o.spoil(r));
  const shown = Math.max(2, Math.min(6, need));
  let r = d6(); if (o.out) o.out.r = r;
  if (pass(r)) { log(`${nm(p)}: ${label} (${shown}+) saca ${r}, éxito`, 't' + p.team); return true; }
  log(`${nm(p)}: ${label} (${shown}+) saca ${r}, falla`, 't' + p.team);
  let again = false;
  if (o.skill) { again = true; if (o.onSkill) o.onSkill(); log(`${nm(p)} repite con ${o.skill}`, 't' + p.team); }
  else if (o.team !== false && await teamReroll(p, label)) again = true;
  if (!again) return false;
  r = d6(); if (o.out) o.out.r = r;
  const ok = pass(r);
  log(`${nm(p)}: ${label} (${shown}+) repite y saca ${r}, ${ok ? 'éxito' : 'falla'}`, 't' + p.team);
  return ok;
}

/* ---------- lesiones ---------- */
function removeFromPitch(p, loc) { p.loc = loc; p.x = p.y = -1; p.state = 'standing'; p.distracted = false; if (G.cur === p) G.cur = null; p.used = true; }
const CAS = r => r <= 8 ? 'Malherido' : r <= 10 ? 'Herida seria' : r <= 12 ? 'Lesión grave' : r <= 14 ? 'Lesión permanente' : 'MUERTO';
async function applyInjury(p, bonus, crowd, by) {
  const a = d6(), b = d6(), r = a + b + (bonus || 0), t = G.teams[p.team];
  let kind;
  if (has(p, 'Stunty')) kind = r <= 6 ? 'stun' : r <= 8 ? 'ko' : r === 9 ? 'bh' : 'cas';
  else kind = (r <= 7 || (r === 8 && has(p, 'Thick Skull'))) ? 'stun' : r <= 9 ? 'ko' : 'cas';
  const head = `Herida de ${nm(p)}: ${a}+${b}${bonus ? '+' + bonus : ''} = ${r}: `;
  if (kind === 'stun') {
    if (crowd) { removeFromPitch(p, 'reserve'); log(head + 'vuelve a la reserva', 't' + p.team); }
    else { p.state = 'stunned'; p.stunStart = false; log(head + 'aturdido', 't' + p.team); }
    return [a, b];
  }
  if (kind === 'ko') {
    log(head + 'inconsciente (KO)', 'bad');
    if (t.apo > 0 && await t.ctrl.confirm('apoKO', `${nm(p)} quedó inconsciente (KO). ¿Usar el apotecario? Solo se puede una vez por partido. Se quedaría ${crowd ? 'en la reserva' : 'en el campo, aturdido'}.`, p)) {
      t.apo--; log(`El apotecario reanima a ${nm(p)}`, 'good');
      if (crowd) removeFromPitch(p, 'reserve'); else { p.state = 'stunned'; p.stunStart = false; }
    } else removeFromPitch(p, 'ko');
    return [a, b];
  }
  log(head + 'BAJA', 'bad');
  if (has(p, 'Regeneration')) {
    const g = d6();
    if (g >= 4) { removeFromPitch(p, 'reserve'); log(`${nm(p)} se regenera (${g}) y va a la reserva`, 'good'); return [a, b]; }
    log(`${nm(p)} no logra regenerarse (${g})`, 't' + p.team);
  }
  const dec = has(p, 'Decay') ? 1 : 0;
  let c = kind === 'bh' ? 1 : Math.min(16, d(16) + dec);
  log(`Lesión de ${nm(p)}${kind === 'bh' ? '' : ' (D16: ' + c + ')'}: ${CAS(c)}`, 'bad');
  if (t.apo > 0 && await t.ctrl.confirm('apoCas', `${nm(p)} sufre una baja: ${CAS(c)}. ¿Usar el apotecario? Solo se puede una vez por partido. Se tira otra vez y te quedas con el mejor resultado.`, p)) {
    t.apo--;
    const c2 = kind === 'bh' ? 1 : Math.min(16, d(16) + dec); c = Math.min(c, c2);
    log(`Apotecario${kind === 'bh' ? '' : ' (D16: ' + c2 + ')'}: queda como ${CAS(c)}`, 'good');
    if (c <= 8) { removeFromPitch(p, 'reserve'); log(`${nm(p)} queda parchado y va a la reserva`, 'good'); return [a, b]; }
  }
  removeFromPitch(p, 'cas');
  const bt = by ? G.teams[by.team] : null;
  if (c >= 15 && bt && has(by, 'Plague Ridden') && !bt.plagueUsed && bt.lineDef && !p.big && !has(p, 'Decay') && !has(p, 'Regeneration') && !has(p, 'Stunty')) {
    bt.plagueUsed = true;
    const np = makePlayer(by.team, bt.players.length, Object.assign({}, bt.lineDef, { name: bt.lineDef.pos + ' nuevo' }));
    bt.players.push(np);
    log(`Plague Ridden: ${nm(p)} se levanta como ${np.name} y se suma a la reserva de ${bt.name}`, 'good');
  }
  return [a, b];
}
async function dropBall(p, sx, sy) {
  if (G.ball.carrier === p) { G.ball.carrier = null; G.ball.x = sx; G.ball.y = sy; render(); await bounceBall(sx, sy); }
  else if (ballLoose() && G.ball.x === sx && G.ball.y === sy) await bounceBall(sx, sy);
}
async function placeProne(p) {
  if (p.loc !== 'pitch') return;
  const had = G.ball.carrier === p;
  p.state = 'prone'; p.rooted = false;
  if (had && p.team === G.active && G.phase === 'turn') G.turnover = true;
  const sx = p.x, sy = p.y;
  if (had) { G.ball.carrier = null; G.ball.x = sx; G.ball.y = sy; }
  render();
  if (had || (ballLoose() && G.ball.x === sx && G.ball.y === sy)) await bounceBall(sx, sy);
}
async function knockDown(p, o) {   // devuelve true si el jugador realmente cae
  o = o || {};
  if (p.loc !== 'pitch') return false;
  if (has(p, 'Steady Footing') && p.state === 'standing') {
    const r = d6();
    if (r === 6) { log(`${nm(p)} se mantiene en pie (Steady Footing, 6)`, 'good'); return false; }
    log(`${nm(p)} intenta mantenerse en pie (Steady Footing): ${r}`, 't' + p.team);
  }
  const sx = p.x, sy = p.y, had = G.ball.carrier === p;
  p.state = 'prone'; p.rooted = false;
  if (p.team === G.active && G.phase === 'turn' && !o.noTO) G.turnover = true;
  const a = d6(), b = d6(); let ar = a + b, mb = !!o.mb, broke = ar >= p.av, note = '';
  if (!broke && o.claws && ar >= 8) { broke = true; note = ' (Claws)'; }
  if (!broke && mb && ar + 1 >= p.av) { broke = true; mb = false; note = ' (+1 Mighty Blow)'; }
  log(`${nm(p)} cae. Armadura ${p.av}+: ${a}+${b}${note} ${broke ? 'rota' : 'aguanta'}`, 't' + p.team);
  if (broke) await applyInjury(p, mb ? 1 : 0, false, o.by);
  if (had) { G.ball.carrier = null; G.ball.x = sx; G.ball.y = sy; }
  render(); await sleep(200);
  if (had) await bounceBall(sx, sy);
  else if (ballLoose() && G.ball.x === sx && G.ball.y === sy) await bounceBall(sx, sy);
  return true;
}
async function crowdPush(p, ox, oy) {
  const sx = p.x, sy = p.y, had = G.ball.carrier === p;
  log(`¡${nm(p)} es empujado al público!`, 'bad');
  if (had && p.team === G.active && G.phase === 'turn') G.turnover = true;
  p.state = 'standing';
  if (had) { G.ball.carrier = null; G.ball.x = sx; G.ball.y = sy; }
  await applyInjury(p, 0, true);
  if (p.loc === 'pitch') removeFromPitch(p, 'reserve');
  render(); await sleep(200);
  if (had) await throwIn(sx, sy, ox, oy);
}

/* ---------- balón ---------- */
function checkTD() {
  const c = G.ball.carrier;
  if (c && c.loc === 'pitch' && c.state === 'standing' && c.x === goalX(c.team) && G.td == null && G.phase !== 'kickoff') G.td = c.team;
}
async function ballArrives(x, y, o) {
  if (!inPitch(x, y)) { if (G.kick) { G.touchback = true; return; } await throwIn(o.last[0], o.last[1], x, y); return; }
  if (G.kick && !inHalf(x, G.kick.recv)) { G.touchback = true; return; }
  G.ball.carrier = null; G.ball.x = x; G.ball.y = y; render(); await sleep(260);
  const q = playerAt(x, y);
  if (q) {
    if (hasTZ(q) && !has(q, 'No Ball')) {
      const need = q.ag + (has(q, 'Nerves of Steel') ? 0 : markers(q).length) - (o.mod || 0) + (wx('rain') ? 1 : 0) + disturb(q) - (o.acc && has(q, 'Diving Catch') ? 1 : 0);
      const ok = await rollTest(q, 'Atrapar', need, { skill: has(q, 'Catch') ? 'Catch' : null });
      if (ok) { G.ball.carrier = q; log(`${nm(q)} se queda con el balón`, 't' + q.team); render(); checkTD(); return; }
    }
    await bounceBall(x, y); return;
  }
  if (o.thenBounce) {
    const dc = pitchPlayers().filter(q => has(q, 'Diving Catch') && hasTZ(q) && !has(q, 'No Ball') && cheb(q.x, q.y, x, y) === 1).sort((a, b) => (a.team === G.active ? 0 : 1) - (b.team === G.active ? 0 : 1))[0];
    if (dc) {
      const need = dc.ag + (has(dc, 'Nerves of Steel') ? 0 : markers(dc).length) - (o.mod || 0) + (wx('rain') ? 1 : 0) + disturb(dc);
      if (await rollTest(dc, 'Atrapar en plancha (Diving Catch)', need, { skill: has(dc, 'Catch') ? 'Catch' : null })) { G.ball.carrier = dc; log(`${nm(dc)} se queda con el balón`, 't' + dc.team); render(); checkTD(); return; }
    }
    await bounceBall(x, y);
  }
}
async function bounceBall(x, y) {
  const [dx, dy] = DIRS[d(8) - 1];
  log('El balón rebota');
  await ballArrives(x + dx, y + dy, { mod: -1, last: [x, y] });
}
async function throwIn(lx, ly, ox, oy) {
  let dirs;
  if (oy < 0) dirs = [[-1,1],[0,1],[1,1]]; else if (oy >= H) dirs = [[-1,-1],[0,-1],[1,-1]];
  else if (ox < 0) dirs = [[1,-1],[1,0],[1,1]]; else dirs = [[-1,-1],[-1,0],[-1,1]];
  const [dx, dy] = dirs[d(3) - 1], n = d6() + d6() - 1;
  log(`El balón sale del campo: el público lo devuelve ${n} casillas`);
  let x = lx, y = ly;
  for (let i = 0; i < n; i++) {
    if (!inPitch(x + dx, y + dy)) { await throwIn(x, y, x + dx, y + dy); return; }
    x += dx; y += dy;
  }
  await ballArrives(x, y, { mod: -1, last: [x, y], thenBounce: true });
}
async function pickUp(p) {
  let ok;
  if (has(p, 'No Ball')) { log(`${nm(p)} no puede tocar el balón (No Ball)`, 'bad'); ok = false; }
  else if (p.action === 'secure') ok = await rollTest(p, 'Asegurar balón', 2, {});
  else ok = await rollTest(p, 'Recoger balón', p.ag + markers(p).length + (wx('rain') ? 1 : 0), { skill: has(p, 'Sure Hands') ? 'Sure Hands' : null });
  if (ok) { G.ball.carrier = p; render(); }
  else { if (p.team === G.active) G.turnover = true; await bounceBall(p.x, p.y); }
}

/* ---------- activaciones y movimiento ---------- */
function finish(p) {
  if (!p) return;
  if (p.stall && G.ball.carrier === p && G.td == null) G.pendingStall = p;
  p.stall = false; p.used = true; if (G.cur === p) G.cur = null;
}
function freeScore(p) {
  if (p.state !== 'standing') return false;
  const gx = goalX(p.team);
  for (const n of computeMoves(p).values()) if (n.x === gx && n.prob >= 0.999) return true;
  return false;
}
async function resolveStall() {
  const p = G.pendingStall; G.pendingStall = null;
  if (!p || G.ball.carrier !== p || G.td != null || G.turnover || G.phase !== 'turn' || G.charge) return;
  const r = d6(), turn = G.turn[p.team];
  if (r >= turn) { log(`${nm(p)} pierde tiempo (Stalling). El público actúa: ${r} contra turno ${turn}, ¡lo derriban!`, 'bad'); await knockDown(p); }
  else log(`${nm(p)} pierde tiempo (Stalling): ${r} contra turno ${turn}, se salva`, 't' + p.team);
}
async function begin(p, action) {
  if (G.cur && G.cur !== p) finish(G.cur);
  await resolveStall();
  if (G.turnover) return false;
  if (G.charge) {
    if (G.charge.left <= 0) return false;
    G.charge.left--;
    if (G.charge.left === 0) for (const q of G.teams[p.team].players) if (q !== p && !q.started) q.used = true;
  }
  p.stall = G.ball.carrier === p && !has(p, 'Bone Head') && !has(p, 'Really Stupid') && freeScore(p);
  G.cur = p; p.action = action; p.started = true; p.distracted = false; p.gouged = false; p.maLeft = p.ma; p.rushes = 0; p.blitzBlocked = false;
  if (action === 'blitz') G.blitzUsed = true; if (action === 'pass') G.passUsed = true; if (action === 'handoff') G.handUsed = true;
  if (action === 'foul') G.foulUsed = true; if (action === 'secure') G.secureUsed = true; if (action === 'ttm') G.ttmUsed = true; if (action === 'punt') G.puntUsed = true;
  if (has(p, 'Bone Head')) {
    const r = d6();
    if (r === 1) { log(`${nm(p)}: Bone Head, saca 1 y se queda distraído`, 'bad'); p.distracted = true; finish(p); render(); return false; }
  }
  if (has(p, 'Really Stupid')) {
    const help = G.teams[p.team].players.some(q => q !== p && hasTZ(q) && !has(q, 'Really Stupid') && cheb(q.x, q.y, p.x, p.y) === 1);
    const r = d6();
    if (r + (help ? 2 : 0) < 4) { log(`${nm(p)}: Really Stupid, saca ${r}${help ? '+2' : ''} y se queda distraído`, 'bad'); p.distracted = true; finish(p); render(); return false; }
  }
  if (has(p, 'Take Root') && p.state === 'standing' && !p.rooted) {
    const r = d6();
    if (r === 1) { p.rooted = true; log(`${nm(p)} echa raíces (Take Root, 1): no podrá moverse hasta el final de la entrada o hasta que lo derriben`, 'bad'); }
  }
  if (p.state === 'prone') {
    if (has(p, 'Jump Up')) {
      if (action === 'block') {
        if (!(await rollTest(p, 'Jump Up para bloquear', p.ag - 1, { team: false }))) { finish(p); render(); return false; }
      }
      p.state = 'standing'; log(`${nm(p)} se levanta de un salto (Jump Up)`, 't' + p.team);
    } else if (p.ma < 3) {
      const bonus = has(p, 'Timmm-ber!') ? G.teams[p.team].players.filter(q => q !== p && hasTZ(q) && cheb(q.x, q.y, p.x, p.y) === 1 && markers(q).length === 0).length : 0;
      const r = d6();
      if (r === 1 || r + bonus < 4) { log(`${nm(p)} intenta levantarse (4+): saca ${r}${bonus ? '+' + bonus : ''} y sigue en el suelo`, 't' + p.team); finish(p); render(); return false; }
      p.state = 'standing'; log(`${nm(p)} se levanta (${r}${bonus ? '+' + bonus : ''})`, 't' + p.team);
    } else { p.state = 'standing'; p.maLeft = Math.max(0, p.ma - 3); log(`${nm(p)} se levanta`, 't' + p.team); }
    render();
  }
  return true;
}
const rushRoll = p => rollTest(p, 'Esprintar', rushNeed(), { skill: has(p, 'Sure Feet') && !p.sfUsed ? 'Sure Feet' : null, onSkill: () => { p.sfUsed = true; } });
const rushCap = p => 2 + (has(p, 'Sprint') && p.action === 'move' ? 1 : 0);
/* Modificadores de rivales al esquivar o saltar fuera de sus zonas */
async function leaveZone(p, mk, ox, oy, label, baseNeed, extra) {
  const tackled = mk.some(q => has(q, 'Tackle'));
  const need = baseNeed + (mk.some(q => has(q, 'Prehensile Tail')) ? 1 : 0);
  const bt = has(p, 'Break Tackle') ? (p.st <= 3 ? 1 : p.st === 4 ? 2 : 3) : 0;
  const dt = mk.find(q => has(q, 'Diving Tackle')); let dtUsed = false;
  const o = Object.assign({
    skill: label === 'Esquivar' && has(p, 'Dodge') && !p.dodgeUsed && !tackled ? 'Dodge' : null, onSkill: () => { p.dodgeUsed = true; },
    rescue: r => { if (label === 'Esquivar' && bt && !p.btUsed && r + bt >= need) { p.btUsed = true; log(`${nm(p)} usa Break Tackle (+${bt})`, 't' + p.team); return true; } return false; },
    spoil: r => {
      if (!dt || dtUsed || r === 6 || r >= need + 2 || !hasTZ(dt) || playerAt(ox, oy)) return false;
      dtUsed = true; log(`${nm(dt)} se lanza con Diving Tackle (-2)`, 't' + dt.team); return true;
    } }, extra || {});
  const ok = await rollTest(p, label, need, o);
  if (dtUsed && !playerAt(ox, oy)) { const bx = dt.x, by = dt.y, had = G.ball.carrier === dt; dt.x = ox; dt.y = oy; dt.state = 'prone'; if (had) { G.ball.carrier = null; G.ball.x = ox; G.ball.y = oy; } render(); if (had) await bounceBall(ox, oy); }
  const sh = mk.find(q => has(q, 'Shadowing') && hasTZ(q) && q.shadowUses < q.ma && q !== dt);
  if (sh && !playerAt(ox, oy) && !(ballLoose() && G.ball.x === ox && G.ball.y === oy)) {
    sh.shadowUses++; const r = d6();
    if (r >= 4) { sh.x = ox; sh.y = oy; log(`${nm(sh)} lo sigue de cerca (Shadowing, ${r})`, 't' + sh.team); render(); }
  }
  return ok;
}
async function stepTo(p, nx, ny) {
  if (!inPitch(nx, ny) || playerAt(nx, ny) || cheb(p.x, p.y, nx, ny) !== 1 || p.state !== 'standing' || p.rooted) return 'blocked';
  const rush = p.maLeft <= 0;
  if (rush && p.rushes >= rushCap(p)) return 'blocked';
  const mk = markers(p), ox = p.x, oy = p.y;
  if (rush) p.rushes++; else p.maLeft--;
  p.x = nx; p.y = ny; render(); await sleep(95);
  if (rush && !(await rushRoll(p)) && await knockDown(p)) return 'down';
  if (mk.length) {
    const ok = await leaveZone(p, mk, ox, oy, 'Esquivar', p.ag + (has(p, 'Stunty') ? 0 : markers(p).length));
    if (!ok && await knockDown(p)) return 'down';
  }
  if (ballLoose() && G.ball.x === nx && G.ball.y === ny) { await pickUp(p); if (G.turnover) return 'stop'; }
  checkTD(); if (G.td != null) return 'td';
  return 'ok';
}
async function jumpTo(p, nx, ny) {
  if (!inPitch(nx, ny) || playerAt(nx, ny) || p.state !== 'standing' || p.rooted) return 'blocked';
  const rn = Math.max(0, 2 - p.maLeft); if (p.rushes + rn > rushCap(p)) return 'blocked';
  const mk = markers(p), ox = p.x, oy = p.y;
  const m0 = Math.max(mk.length, markersAt(nx, ny, p.team).length);
  const mod = (has(p, 'Pogo Stick') ? 0 : has(p, 'Leap') && m0 > 1 ? m0 - 1 : m0) - (has(p, 'Very Long Legs') ? 1 : 0);
  p.maLeft = Math.max(0, p.maLeft - 2);
  for (let i = 0; i < rn; i++) { p.rushes++; if (!(await rushRoll(p)) && await knockDown(p)) return 'down'; }
  const out = {};
  p.x = nx; p.y = ny;
  const ok = await leaveZone(p, mk, ox, oy, 'Saltar', p.ag + mod, { out });
  if (!ok && out.r === 1 && !playerAt(ox, oy)) { p.x = ox; p.y = oy; }
  render(); await sleep(140);
  if (!ok && await knockDown(p)) return 'down';
  if (ballLoose() && G.ball.x === p.x && G.ball.y === p.y) { await pickUp(p); if (G.turnover) return 'stop'; }
  checkTD(); if (G.td != null) return 'td';
  return 'ok';
}
async function moveAlong(p, path) {
  let r = 'ok';
  for (const [x, y, jump] of path) { r = jump ? await jumpTo(p, x, y) : await stepTo(p, x, y); if (r !== 'ok') break; }
  return r;
}
/* Casillas alcanzables: mejor probabilidad de llegar a cada una */
function computeMoves(p, o) {
  o = o || {};
  const occ = new Uint8Array(W * H), tz = new Uint8Array(W * H), tk = new Uint8Array(W * H), dn = new Uint8Array(W * H), hard = new Uint8Array(W * H);
  for (const q of pitchPlayers()) {
    if (q !== p) { occ[idx(q.x, q.y)] = 1; if (q.state !== 'standing') dn[idx(q.x, q.y)] = 1; }
    if (q.team !== p.team && hasTZ(q)) for (const [dx, dy] of DIRS) {
      const x = q.x + dx, y = q.y + dy; if (!inPitch(x, y)) continue;
      tz[idx(x, y)]++; if (has(q, 'Tackle')) tk[idx(x, y)] = 1;
      if (has(q, 'Prehensile Tail')) hard[idx(x, y)] = Math.max(hard[idx(x, y)], 1); if (has(q, 'Diving Tackle')) hard[idx(x, y)] = 2;
    }
  }
  if (p.rooted || p.loc !== 'pitch') return new Map();
  const started = G.cur === p && p.started;
  const ma = o.ma != null ? o.ma : started ? p.maLeft : (p.state === 'prone' && !has(p, 'Jump Up') ? Math.max(0, p.ma - 3) : p.ma);
  const act = started ? p.action : (o.action || 'move');
  const rushes = o.rush != null ? o.rush : 2 + (has(p, 'Sprint') && act === 'move' ? 1 : 0) - (started ? p.rushes : 0);
  const maxSteps = ma + rushes - (o.reserve || 0);
  const ballSq = ballLoose() ? idx(G.ball.x, G.ball.y) : -1;
  if (ballSq >= 0 && has(p, 'No Ball')) occ[ballSq] = 1;
  if (o.half != null) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!inHalf(x, o.half)) occ[idx(x, y)] = 1;
  const leaper = has(p, 'Leap') || has(p, 'Pogo Stick'), pogo = has(p, 'Pogo Stick'), lp = has(p, 'Leap'), vll = has(p, 'Very Long Legs') ? 1 : 0;
  const jmod = m => (pogo ? 0 : lp && m > 1 ? m - 1 : m) - vll;
  const dodgeRR = has(p, 'Dodge') && !p.dodgeUsed, stunty = has(p, 'Stunty'), RP = (7 - rushNeed()) / 6;
  const best = new Map();
  const layers = Array.from({ length: Math.max(0, maxSteps) + 3 }, () => new Map());
  const put = (L, n) => { const ex = L.get(n.i); if (!ex || ex.prob < n.prob - 1e-9 || (Math.abs(ex.prob - n.prob) <= 1e-9 && n.rolls < ex.rolls)) L.set(n.i, n); };
  layers[0].set(idx(p.x, p.y), { i: idx(p.x, p.y), x: p.x, y: p.y, prob: 1, prev: null, steps: 0, rolls: 0 });
  for (let s = 0; s < maxSteps; s++) {
    for (const n of layers[s].values()) {
      if (n.i === ballSq && s > 0) continue;
      const marked = tz[n.i] > 0;
      for (const [dx, dy] of DIRS) {
        const x = n.x + dx, y = n.y + dy; if (!inPitch(x, y)) continue;
        const ni = idx(x, y);
        if (occ[ni] || leaper) {
          if ((dn[ni] || leaper) && s + 2 <= maxSteps && !o.noJump) for (const [ex, ey] of DIRS) {
            const lx = x + ex, ly = y + ey; if (!inPitch(lx, ly)) continue;
            const li = idx(lx, ly); if (occ[li] || cheb(lx, ly, n.x, n.y) <= 1) continue;
            const jn = p.ag + jmod(Math.max(tz[n.i], tz[li])) + hard[n.i], lab = [];
            let pr = n.prob * clampP((7 - jn) / 6), rolls = n.rolls + 1;
            for (const k of [s + 1, s + 2]) if (k > ma) { pr *= RP; rolls++; lab.push(rushNeed() + '+'); }
            lab.push(Math.max(2, Math.min(6, jn)) + '+');
            put(layers[s + 2], { i: li, x: lx, y: ly, prob: pr, prev: n, steps: s + 2, rolls, jump: true, lab });
          }
          if (occ[ni]) continue;
        }
        let pr = n.prob, rolls = n.rolls; const lab = [];
        if (s + 1 > ma) { pr *= RP; rolls++; lab.push(rushNeed() + '+'); }
        if (marked) { const dn2 = p.ag + (stunty ? 0 : tz[ni]) + hard[n.i]; let ps = clampP((7 - dn2) / 6); if (dodgeRR && !tk[n.i]) ps = 1 - (1 - ps) * (1 - ps); pr *= ps; rolls++; lab.push(Math.max(2, Math.min(6, dn2)) + '+'); }
        put(layers[s + 1], { i: ni, x, y, prob: pr, prev: n, steps: s + 1, rolls, lab });
      }
    }
  }
  for (let s = 1; s <= maxSteps; s++) for (const n of layers[s].values()) { const b = best.get(n.i); if (!b || n.prob > b.prob + 1e-9 || (Math.abs(n.prob - b.prob) <= 1e-9 && n.rolls < b.rolls)) best.set(n.i, n); }
  return best;
}
function pathOf(node) { const r = []; for (let n = node; n && n.prev; n = n.prev) r.unshift([n.x, n.y, !!n.jump]); return r; }
function canSecure(p) {
  if (G.secureUsed || p.big || has(p, 'Unsteady') || !ballLoose() || p.started) return false;
  return !G.teams[1 - p.team].players.some(q => hasTZ(q) && cheb(q.x, q.y, G.ball.x, G.ball.y) <= 2);
}

/* ---------- bloqueo ---------- */
const FACES = ['skull', 'both', 'push', 'push', 'stumble', 'pow'];
const FACE_TXT = { skull: 'Atacante cae', both: 'Ambos caen', push: 'Empujón', stumble: 'Tropiezo', pow: '¡POW!' };
function blockDice(att, def, stA) {
  let off = 0, de = 0; const gOff = [], gDef = [];
  for (const q of pitchPlayers()) {
    if (!hasTZ(q) || q.gouged) continue;
    if (q.team === att.team && q !== att && cheb(q.x, q.y, def.x, def.y) === 1) {
      const mk = markers(q, def);
      if (mk.length === 0) off++; else if (has(q, 'Guard') && !mk.some(m => has(m, 'Defensive'))) { off++; gOff.push(nm(q)); }
    }
    if (q.team === def.team && q !== def && cheb(q.x, q.y, att.x, att.y) === 1) { if (markers(q, att).length === 0) de++; else if (has(q, 'Guard')) { de++; gDef.push(nm(q)); } }
  }
  const cheer = G.teams[att.team].cheerAssist && G.phase === 'turn' && G.active === att.team && !G.charge ? 1 : 0;
  const a = (stA || att.st) + off + cheer, b = def.st + de;
  const n = a === b ? 1 : (a > b ? (a > 2 * b ? 3 : 2) : (b > 2 * a ? 3 : 2));
  return { n, attChooses: a >= b, a, b, off, de, cheer, gOff, gDef };
}
const isFirm = (q, jug) => q.rooted || (has(q, 'Stand Firm') && !jug);
/* ¿puede el atacante en (ax,ay) mandar a e al público con un empujón? */
function surfPossible(ax, ay, e) {
  if (isFirm(e, false) || has(e, 'Sidestep')) return false;
  const dx = Math.sign(e.x - ax), dy = Math.sign(e.y - ay);
  const c = (dx && dy) ? [[dx, dy], [dx, 0], [0, dy]] : dy === 0 ? [[dx, 0], [dx, -1], [dx, 1]] : [[0, dy], [-1, dy], [1, dy]];
  const sq = c.map(([cx, cy]) => [e.x + cx, e.y + cy]);
  if (sq.some(([x, y]) => inPitch(x, y) && !playerAt(x, y))) return false;   // hay casilla libre: no hay surf
  return sq.some(([x, y]) => !inPitch(x, y));
}
async function pushBack(q, px, py, ctl, jug) {
  if (isFirm(q, jug)) { log(`${nm(q)} no se mueve de su casilla (${q.rooted ? 'enraizado' : 'Stand Firm'})`, 't' + q.team); return 'stay'; }
  const dx = Math.sign(q.x - px), dy = Math.sign(q.y - py);
  const c = (dx && dy) ? [[dx, dy], [dx, 0], [0, dy]] : dy === 0 ? [[dx, 0], [dx, -1], [dx, 1]] : [[0, dy], [-1, dy], [1, dy]];
  const sq = c.map(([cx, cy]) => [q.x + cx, q.y + cy]);
  const empty = sq.filter(([x, y]) => inPitch(x, y) && !playerAt(x, y));
  const off = sq.filter(([x, y]) => !inPitch(x, y));
  let dest;
  const side = has(q, 'Sidestep') ? DIRS.map(([ax, ay]) => [q.x + ax, q.y + ay]).filter(([x, y]) => inPitch(x, y) && !playerAt(x, y)) : [];
  if (side.length) { dest = side.length === 1 ? side[0] : await G.teams[q.team].ctrl.choosePush(q, side, true); log(`${nm(q)} elige a dónde va (Sidestep)`, 't' + q.team); }
  else if (empty.length) {   // regla: si hay una casilla libre, hay que usarla
    dest = empty.length === 1 ? empty[0] : await ctl.choosePush(q, empty, false);
  } else {   // sin casillas libres: ocupadas (empujón en cadena) o el público
    const can = sq.filter(([x, y]) => !inPitch(x, y) || !isFirm(playerAt(x, y), false));
    if (!can.length) { log(`${nm(q)} no tiene a dónde ser empujado`); return 'stay'; }
    dest = can.length === 1 ? can[0] : await ctl.choosePush(q, can, false);
    if (!inPitch(dest[0], dest[1])) { await crowdPush(q, dest[0], dest[1]); return 'crowd'; }
    const r = await pushBack(playerAt(dest[0], dest[1]), q.x, q.y, ctl, false);
    if (r === 'stay' || playerAt(dest[0], dest[1])) return 'stay';
  }
  q.x = dest[0]; q.y = dest[1]; render(); await sleep(120);
  if (ballLoose() && G.ball.x === q.x && G.ball.y === q.y) await bounceBall(q.x, q.y);
  return 'ok';
}
async function hitAndRun(p) {
  if (!has(p, 'Hit and Run') || p.loc !== 'pitch' || p.state !== 'standing' || p.rooted || G.turnover || G.td != null) return;
  const foes = G.teams[1 - p.team].players.filter(q => q.loc === 'pitch');
  const sq = DIRS.map(([dx, dy]) => [p.x + dx, p.y + dy]).filter(([x, y]) => inPitch(x, y) && !playerAt(x, y) && !(ballLoose() && G.ball.x === x && G.ball.y === y) && !foes.some(q => cheb(q.x, q.y, x, y) === 1));
  if (!sq.length) return;
  const d = await G.teams[p.team].ctrl.chooseHitRun(p, sq);
  if (d) { p.x = d[0]; p.y = d[1]; log(`${nm(p)} se aparta una casilla (Hit and Run)`, 't' + p.team); render(); await sleep(120); }
}
async function foulAppearance(att, def) {
  if (!has(def, 'Foul Appearance')) return true;
  const r = d6();
  if (r >= 2) return true;
  log(`${nm(att)} no soporta el aspecto de ${nm(def)} (Foul Appearance, 1): pierde la acción`, 'bad');
  return false;
}
async function block(att, def, follow, o) {
  o = o || {};
  const t = G.teams[att.team], actl = t.ctrl, dctl = G.teams[def.team].ctrl, blitz = !!o.blitz;
  if (!o.second && !(await foulAppearance(att, def))) { finish(att); return; }
  if (!o.second) await dumpOff(def);
  let stA = att.st + (blitz && has(att, 'Horns') ? 1 : 0);
  if (has(att, 'Dauntless') && def.st > stA) {
    const r = d6(), ok = r + stA > def.st;
    log(`${nm(att)} usa Dauntless: ${r}+${stA} contra fuerza ${def.st}, ${ok ? 'iguala su fuerza' : 'sin efecto'}`, 't' + att.team);
    if (ok) stA = def.st;
    if (ok && has(att, 'Indomitable') && !att.indomUsed) { att.indomUsed = true; stA = def.st * 2; log(`${nm(att)} usa Indomitable: su fuerza sube al doble de la del rival`, 'good'); }
  }
  const info = blockDice(att, def, stA);
  if (t.cheerAssist && G.phase === 'turn' && G.active === att.team && !G.charge) { t.cheerAssist = false; log(`El público empuja a ${t.name}: asistencia extra en este bloqueo`, 't' + att.team); }
  const roll = () => Array.from({ length: info.n }, () => FACES[d6() - 1]);
  const show = ds => ds.map(f => FACE_TXT[f]).join(' / ');
  let dice = roll();
  log(`${nm(att)} bloquea a ${nm(def)} (fuerza ${info.a} vs ${info.b}): ${info.n} dado${info.n > 1 ? 's' : ''}${info.attChooses ? '' : ', elige el defensor'}: ${show(dice)}`, 't' + att.team);
  if (info.gOff.length || info.gDef.length) log(`Guard: ${[...info.gOff.map(n => n + ' asiste a ' + nm(att)), ...info.gDef.map(n => n + ' asiste a ' + nm(def))].join(', ')} aunque estén marcados`, 'good');
  await fxRoll(att, def, dice);
  let fresh = true;
  if (has(att, 'Hatred') && def.kw === 'troll' && dice.includes('skull')) {
    dice[dice.indexOf('skull')] = FACES[d6() - 1]; fresh = false;
    log(`${nm(att)} repite un "Atacante cae" por Hatred: ${show(dice)}`, 't' + att.team); await fxRoll(att, def, dice);
  }
  if (fresh && !blitz && has(att, 'Brawler') && !has(att, 'Block') && dice.includes('both')) {
    dice[dice.indexOf('both')] = FACES[d6() - 1]; fresh = false;
    log(`${nm(att)} repite un "Ambos caen" por Brawler: ${show(dice)}`, 't' + att.team); await fxRoll(att, def, dice);
  }
  let canRR = fresh && G.phase === 'turn' && G.active === att.team && rrLeft(t) > 0;
  let dec = await actl.blockDecision(dice, att, def, info.attChooses, canRR);
  if (dec === 'reroll' && canRR) {
    if (spendReroll(att)) { dice = roll(); log(`Nueva tirada: ${show(dice)}`, 't' + att.team); await fxRoll(att, def, dice); }
    dec = await actl.blockDecision(dice, att, def, info.attChooses, false);
  }
  const i = info.attChooses ? (dec | 0) : await dctl.chooseDefDie(dice, att, def);
  let face = dice[i] || dice[0];
  log(`Resultado: ${FACE_TXT[face]}`, 't' + att.team);
  await fxPick(i);
  const mbA = has(att, 'Mighty Blow'), claws = has(att, 'Claws'), jug = blitz && has(att, 'Juggernaut');
  const aB = has(att, 'Block'), dB = has(def, 'Block');
  if (face === 'both' && jug && !aB) { face = 'push'; log(`${nm(att)} arrolla (Juggernaut): cuenta como empujón`, 't' + att.team); }
  if (face === 'skull') await knockDown(att);
  else if (face === 'both') {
    const aW = has(att, 'Wrestle') && (!aB || dB), dW = has(def, 'Wrestle') && !jug && !dB && aB;
    if (aW || dW) {
      log(`${nm(aW ? att : def)} usa Wrestle: los dos van al suelo sin tirada de armadura`, 't' + (aW ? att : def).team);
      await placeProne(def); await placeProne(att);
    } else {
      if (aB && dB) log('Los dos tienen Block: nadie cae');
      if (!dB) await knockDown(def, { mb: mbA, claws, by: att });
      if (!aB) await knockDown(att);
    }
  } else {
    const down = face === 'pow' || (face === 'stumble' && !(has(def, 'Dodge') && !has(att, 'Tackle')));
    if (face === 'stumble' && !down) log(`${nm(def)} esquiva el golpe (Dodge): solo empujón`);
    let forced = has(att, 'Frenzy');
    if (!forced && has(def, 'Taunt') && !isFirm(def, jug) && await dctl.confirm('taunt', `${nm(def)} tiene Taunt. ¿Obligar a ${nm(att)} a seguirlo tras el empujón?`, def)) { forced = true; log(`${nm(def)} provoca a ${nm(att)} (Taunt): debe seguirlo`, 't' + def.team); }
    const noFollow = has(def, 'Fend') && !jug;
    const fx = def.x, fy = def.y;
    const res = await pushBack(def, att.x, att.y, actl, jug);
    if (res !== 'stay' && has(att, 'Eye Gouge') && def.loc === 'pitch') { def.gouged = true; log(`${nm(att)} le mete los dedos en los ojos (Eye Gouge): ${nm(def)} no da asistencias hasta que se active`, 't' + att.team); }
    if (res !== 'stay' && !att.rooted && att.loc === 'pitch' && att.state === 'standing' && !playerAt(fx, fy)) {
      if (noFollow) log(`${nm(def)} mantiene la distancia (Fend): no se puede seguir`, 't' + def.team);
      else if (forced || await actl.askFollow(att, def, fx, fy)) {
        att.x = fx; att.y = fy; render(); await sleep(120);
        if (ballLoose() && G.ball.x === fx && G.ball.y === fy) await bounceBall(fx, fy);
      } else log(`${nm(att)} se queda en su casilla`, 't' + att.team);
    }
    if (res === 'ok' && def.loc === 'pitch' && has(att, 'Strip Ball') && G.ball.carrier === def && !has(def, 'Sure Hands')) { log(`${nm(att)} le arranca el balón a ${nm(def)} (Strip Ball)`, 't' + att.team); G.ball.carrier = null; G.ball.x = def.x; G.ball.y = def.y; await bounceBall(def.x, def.y); }
    if (res !== 'crowd' && down) await knockDown(def, { mb: mbA, claws, by: att });
    if (has(att, 'Frenzy') && !o.second && !G.turnover && G.td == null && att.loc === 'pitch' && att.state === 'standing' && def.loc === 'pitch' && def.state === 'standing' && cheb(att.x, att.y, def.x, def.y) === 1) {
      let can = true;
      if (blitz) {
        if (att.maLeft > 0) att.maLeft--;
        else if (att.rushes < rushCap(att)) { att.rushes++; if (!(await rushRoll(att)) && await knockDown(att)) can = false; }
        else can = false;
      }
      if (can && att.state === 'standing') { log(`${nm(att)} sigue golpeando (Frenzy)`, 't' + att.team); await block(att, def, true, { blitz, second: true }); }
    }
  }
  checkTD(); render();
  if (!o.second) await hitAndRun(att);
}
async function blitzBlock(p, e, follow, useStab) {
  if (p.maLeft > 0) p.maLeft--;
  else {
    if (p.rushes >= rushCap(p)) return false;
    p.rushes++;
    if (!(await rushRoll(p)) && await knockDown(p)) return true;
  }
  p.blitzBlocked = true;
  if (useStab) await stab(p, e, true); else await block(p, e, follow, { blitz: true });
  return true;
}
async function stab(p, e, keep) {
  if (await foulAppearance(p, e)) {
    await dumpOff(e);
    const a = d6(), b = d6(), broke = a + b >= e.av, had = G.ball.carrier === e, sx = e.x, sy = e.y;
    log(`${nm(p)} apuñala a ${nm(e)}. Armadura ${e.av}+: ${a}+${b} ${broke ? 'rota' : 'aguanta'}`, 't' + p.team);
    if (broke) {
      await applyInjury(e, 0, false);
      if (had && (e.loc !== 'pitch' || e.state !== 'standing')) { G.ball.carrier = null; G.ball.x = sx; G.ball.y = sy; await bounceBall(sx, sy); }
    }
    render(); await hitAndRun(p);
  }
  if (!keep) finish(p);
  render();
}

/* ---------- pase, entrega, falta ---------- */
function bestInterceptor(p, lx, ly, cloud) {
  const vx = lx - p.x, vy = ly - p.y, L2 = vx * vx + vy * vy; if (!L2) return null;
  let best = null;
  for (const q of G.teams[1 - p.team].players) {
    if (!hasTZ(q) || has(q, 'No Ball') || (cloud && !has(q, 'Very Long Legs'))) continue;
    const t = ((q.x - p.x) * vx + (q.y - p.y) * vy) / L2; if (t <= 0.05 || t >= 0.95) continue;
    const dist = Math.abs((q.x - p.x) * vy - (q.y - p.y) * vx) / Math.sqrt(L2); if (dist > 0.9) continue;
    const need = q.ag + markers(q).length + (wx('rain') ? 1 : 0) + (has(q, 'Stunty') ? 1 : 0) + disturb(q) - (has(q, 'Very Long Legs') ? 2 : 0);
    if (!best || need < best.need) best = { q, need };
  }
  return best;
}
async function otbMove(q, mv, target) {
  const node = await G.teams[q.team].ctrl.onTheBall(q, mv, target);
  if (!node) return true;
  log(`${nm(q)} reacciona (On the Ball)`, 't' + q.team);
  const keep = [q.maLeft, q.rushes, q.action];
  q.maLeft = 3; q.rushes = 99; q.action = 'otb';
  await moveAlong(q, pathOf(node));
  [q.maLeft, q.rushes, q.action] = keep;
  return q.loc === 'pitch' && q.state === 'standing';
}
async function onTheBallPass(passer, tx, ty) {
  for (const q of G.teams[1 - passer.team].players) {
    if (!has(q, 'On the Ball') || !hasTZ(q) || q.rooted) continue;
    const mv = computeMoves(q, { ma: 3, rush: 0, noJump: true });
    if (mv.size && !(await otbMove(q, mv, [tx, ty]))) break;
  }
}
async function dumpOff(def) {
  if (!has(def, 'Dump-off') || G.ball.carrier !== def || def.state !== 'standing' || def.noPA) return;
  const c = G.teams[def.team].players.filter(q => q !== def && hasTZ(q) && !has(q, 'No Ball') && rangeBand(def.x, def.y, q.x, q.y) === 0);
  if (!c.length) return;
  const q = await G.teams[def.team].ctrl.dumpOff(def, c);
  if (!q) return;
  log(`${nm(def)} se deshace del balón antes del golpe (Dump-off)`, 't' + def.team);
  await pass(def, q.x, q.y, { dump: true });
}
async function punt(p, fx, fy) {
  const dirs = fx ? [[fx, -1], [fx, 0], [fx, 1]] : [[-1, fy], [0, fy], [1, fy]];
  const [dx, dy] = dirs[d3() - 1], n = d6();
  log(`${nm(p)} despeja el balón (Punt): ${n} casilla${n > 1 ? 's' : ''}`, 't' + p.team);
  G.ball.carrier = null; G.ball.x = p.x; G.ball.y = p.y;
  let x = p.x, y = p.y, out = null;
  for (let i = 0; i < n; i++) { if (!inPitch(x + dx, y + dy)) { out = [x + dx, y + dy]; break; } x += dx; y += dy; }
  if (out) { G.turnover = true; await throwIn(x, y, out[0], out[1]); }
  else await ballArrives(x, y, { mod: 0, last: [x, y], thenBounce: true });
  if (G.ball.carrier && G.ball.carrier.team !== p.team) G.turnover = true;
  checkTD(); finish(p); render();
}
function animosity(p, q) {
  if (!q || !has(p, 'Animosity') || q.team !== p.team) return false;
  const a = p.animo.toLowerCase();
  if (!(a.startsWith('all') || q.pos.toLowerCase().includes(a))) return false;
  const r = d6();
  if (r >= 2) return false;
  log(`${nm(p)} se niega a darle el balón a ${nm(q)} (Animosity, 1)`, 'bad');
  return true;
}
async function pass(p, tx, ty, o) {
  o = o || {};
  if (!o.dump && animosity(p, playerAt(tx, ty))) { finish(p); render(); return; }
  if (!o.dump) await onTheBallPass(p, tx, ty);
  const band = rangeBand(p.x, p.y, tx, ty), mod = band + (has(p, 'Nerves of Steel') ? 0 : markers(p).length) + (wx('sunny') ? 1 : 0) + disturb(p)
    - (has(p, 'Accurate') && band <= 1 ? 1 : 0) - (has(p, 'Cannoneer') && band >= 2 ? 1 : 0);
  const ev = r => (r === 1 || r - mod <= 1) ? 'fumble' : (r === 6 || r - mod >= p.pa) ? 'ok' : 'bad';
  const txt = { ok: 'preciso', bad: 'impreciso', fumble: '¡se le cae el balón!' };
  let r = d6(), res = ev(r);
  log(`${nm(p)} lanza un pase ${BAND_NAME[band]} (${Math.min(6, Math.max(2, p.pa + mod))}+): saca ${r}, ${txt[res]}`, 't' + p.team);
  if (res !== 'ok') {
    let again = false;
    if (has(p, 'Pass')) { again = true; log(`${nm(p)} repite con Pass`, 't' + p.team); }
    else if (await teamReroll(p, 'Pase')) again = true;
    if (again) { r = d6(); res = ev(r); log(`Repite y saca ${r}, ${txt[res]}`, 't' + p.team); }
  }
  if (res === 'fumble' && r === 1 && has(p, 'Safe Pass')) { log(`${nm(p)} se aferra al balón (Safe Pass): no hay turnover`, 'good'); if (!o.dump) finish(p); render(); return; }
  G.ball.carrier = null; G.ball.x = p.x; G.ball.y = p.y;
  if (res === 'fumble') await bounceBall(p.x, p.y);
  else {
    let lx = tx, ly = ty, out = null;
    if (res === 'bad') for (let i = 0; i < 3; i++) {
      const [dx, dy] = DIRS[d(8) - 1];
      if (!inPitch(lx + dx, ly + dy)) { out = [lx + dx, ly + dy]; break; }
      lx += dx; ly += dy;
    }
    const ic = bestInterceptor(p, lx, ly, has(p, 'Cloud Burster'));
    let caught = false;
    if (ic) {
      caught = await rollTest(ic.q, 'Intercepción', ic.need + (res === 'ok' ? 3 : 2), { team: false });
      if (caught) { G.ball.carrier = ic.q; log(`¡${nm(ic.q)} intercepta el pase!`, 'bad'); }
    }
    if (!caught) { if (out) await throwIn(lx, ly, out[0], out[1]); else await ballArrives(lx, ly, { mod: 0, last: [lx, ly], thenBounce: true, acc: res === 'ok' }); }
  }
  if (o.dump) { checkTD(); render(); return; }
  if (!G.ball.carrier || G.ball.carrier.team !== p.team) G.turnover = true;
  checkTD(); finish(p); render();
}
async function handoff(p, q) {
  if (animosity(p, q)) { finish(p); render(); return; }
  log(`${nm(p)} entrega el balón en mano a ${nm(q)}`, 't' + p.team);
  G.ball.carrier = null;
  await ballArrives(q.x, q.y, { mod: 0, last: [q.x, q.y] });
  if (!G.ball.carrier || G.ball.carrier.team !== p.team) G.turnover = true;
  checkTD(); finish(p); render();
}
async function sendOff(p) {
  const t = G.teams[p.team]; let off = true, to = true;
  log(`¡El árbitro lo vio! ${nm(p)} es expulsado`, 'bad');
  if (t.canArgue) {
    const r = d6();
    if (r === 6) { off = false; log(`${t.name} discute con el árbitro (6): ${nm(p)} se queda, pero igual hay turnover`, 'good'); }
    else { if (r === 1) t.canArgue = false; log(`${t.name} discute con el árbitro (${r}): sin efecto${r === 1 ? ' y no podrá discutir más en el partido' : ''}`, 't' + p.team); }
  }
  if (off && t.bribes > 0 && await t.ctrl.confirm('bribe', `${nm(p)} fue expulsado. ¿Usar un soborno? Te quedan ${t.bribes}. Funciona con 2+.`, p)) {
    t.bribes--; const r = d6();
    if (r >= 2) { off = false; to = false; log(`El soborno funciona (${r}): ${nm(p)} sigue en el campo y no hay turnover`, 'good'); }
    else log('El árbitro se queda con el soborno (1) y lo expulsa igual', 'bad');
  }
  if (off) {
    const had = G.ball.carrier === p, sx = p.x, sy = p.y;
    removeFromPitch(p, 'sent');
    if (had) { G.ball.carrier = null; G.ball.x = sx; G.ball.y = sy; await bounceBall(sx, sy); }
  }
  if (to) G.turnover = true;
}
async function foul(p, e) {
  let off = 0, de = 0;
  for (const q of pitchPlayers()) {
    if (!hasTZ(q)) continue;
    if (q.team === p.team && q !== p && cheb(q.x, q.y, e.x, e.y) === 1 && markers(q).length === 0) off++;
    if (q.team === e.team && cheb(q.x, q.y, p.x, p.y) === 1 && markers(q, p).length === 0) de++;
  }
  const a = d6(), b = d6(), tot = a + b + off - de; let dbl = a === b, dp = has(p, 'Dirty Player') ? 1 : 0;
  let broke = tot >= e.av;
  if (!broke && dp && tot + 1 >= e.av) { broke = true; dp = 0; }
  log(`${nm(p)} comete falta sobre ${nm(e)}. Armadura ${e.av}+: ${a}+${b}${off ? '+' + off : ''}${de ? '-' + de : ''} ${broke ? 'rota' : 'aguanta'}`, 't' + p.team);
  if (broke) { const [i1, i2] = await applyInjury(e, dp, false); if (i1 === i2) dbl = true; }
  if (dbl) await sendOff(p);
  finish(p); render();
}
async function vomit(p, e) {
  if (!(await foulAppearance(p, e))) { finish(p); render(); return; }
  await dumpOff(e);
  const r = d6(), tgt = r >= 2 ? e : p;
  log(`${nm(p)} usa Vómito sobre ${nm(e)}: saca ${r}${r >= 2 ? '' : ', ¡se vomita encima!'}`, 't' + p.team);
  const a = d6(), b = d6(), broke = a + b >= tgt.av, had = G.ball.carrier === tgt, sx = tgt.x, sy = tgt.y;
  log(`Armadura de ${nm(tgt)} ${tgt.av}+: ${a}+${b} ${broke ? 'rota' : 'aguanta'}`, 't' + tgt.team);
  if (broke) {
    await applyInjury(tgt, 0, false);
    if (had && (tgt.loc !== 'pitch' || tgt.state !== 'standing')) {
      G.ball.carrier = null; G.ball.x = sx; G.ball.y = sy;
      if (tgt.team === G.active) G.turnover = true;
      await bounceBall(sx, sy);
    }
  }
  finish(p); render();
}
async function throwTeammate(p, m, tx, ty) {
  const had = G.ball.carrier === m;
  log(`${nm(p)} levanta a ${nm(m)} para lanzarlo`, 't' + p.team);
  let res = null;
  if (has(p, 'Always Hungry')) {
    const r = d6();
    if (r === 1) {
      const r2 = d6();
      if (r2 === 1) {
        log(`Always Hungry (1 y 1): ¡${nm(p)} se come a ${nm(m)}!`, 'bad');
        const sx = m.x, sy = m.y; removeFromPitch(m, 'cas'); G.turnover = true;
        if (had) { G.ball.carrier = null; G.ball.x = sx; G.ball.y = sy; await bounceBall(sx, sy); }
        finish(p); render(); return;
      }
      log(`Always Hungry (1 y ${r2}): ${nm(m)} se escapa de la boca, el lanzamiento sale torpe`, 't' + p.team); res = 'fumble';
    }
  }
  const band = rangeBand(p.x, p.y, tx, ty), mod = band + markers(p).length + (wx('sunny') ? 1 : 0) + disturb(p) - (has(p, 'Strong Arm') ? 1 : 0);
  const ev = r => (r === 1 || r - mod <= 1) ? 'fumble' : (r === 6 || r - mod >= p.pa) ? 'ok' : 'bad';
  const txt = { ok: 'lanzamiento soberbio', bad: 'lanzamiento pobre', fumble: 'se le cae' };
  if (!res) {
    let r = d6(); res = ev(r);
    log(`${nm(p)} lanza a ${nm(m)} (${Math.min(6, Math.max(2, p.pa + mod))}+): saca ${r}, ${txt[res]}`, 't' + p.team);
    if (res !== 'ok' && await teamReroll(p, 'Lanzar compañero')) { r = d6(); res = ev(r); log(`Repite y saca ${r}, ${txt[res]}`, 't' + p.team); }
  }
  const auto = m.state !== 'standing' || m.distracted;
  let x, y, lx, ly, fell = false, out = null;
  const fly = (dx, dy) => { if (!inPitch(x + dx, y + dy)) { out = [x + dx, y + dy]; return false; } x += dx; y += dy; return true; };
  if (res === 'fumble') { x = p.x; y = p.y; const [dx, dy] = DIRS[d(8) - 1]; fly(dx, dy); }
  else { x = tx; y = ty; for (let i = 0; i < 3 && !out; i++) { const [dx, dy] = DIRS[d(8) - 1]; fly(dx, dy); } }
  while (!out) {
    const q = playerAt(x, y);
    if (!q || q === m) break;
    log(`${nm(m)} cae encima de ${nm(q)}`, 'bad');
    await knockDown(q); fell = true;
    const [dx, dy] = DIRS[d(8) - 1]; fly(dx, dy);
  }
  if (out) {
    m.x = x; m.y = y; G.turnover = true;
    if (had) { G.ball.carrier = m; }
    await crowdPush(m, out[0], out[1]);
    finish(p); render(); return;
  }
  m.x = x; m.y = y; render(); await sleep(250);
  if (fell || auto) await knockDown(m, { noTO: !had });
  else {
    const need = m.ag + (res === 'ok' ? 0 : 1) + markersAt(x, y, m.team).length;
    if (await rollTest(m, 'Aterrizar', need, {})) {
      log(`${nm(m)} aterriza de pie`, 'good');
      if (ballLoose() && G.ball.x === x && G.ball.y === y) await bounceBall(x, y);
    } else await knockDown(m, { noTO: !had });
  }
  checkTD(); finish(p); render();
}

/* ---------- estructura del partido ---------- */
/* valor aproximado de un jugador para decidir quién entra a la cancha */
const pval = p => p.st * 6 + p.ma * 2 + (7 - p.ag) * 2 + Math.min(10, p.av) * 1.5 + p.skills.size * 3 + (p.ex ? p.ex.length * 4 : 0) + (p.big ? 6 : 0) - (p.loner ? 6 : 0) - (has(p, 'Bone Head') || has(p, 'Really Stupid') ? 3 : 0);
function autoSetup(ti, kicking, form) {
  const t = G.teams[ti], slots = form || (kicking ? SLOTS.kick : SLOTS.recv);
  let av = t.players.filter(p => p.loc === 'reserve' && !p.heat).sort((a, b) => pval(b) - pval(a));
  if (t.lineup) {   // alineación elegida por el entrenador; si faltan jugadores se completa con los mejores
    const lu = new Set(t.lineup), mem = av.filter(p => lu.has(p.id)), rest = av.filter(p => !lu.has(p.id));
    av = mem.concat(rest.slice(0, Math.max(0, slots.length - mem.length)));
  }
  slots.forEach(([x, y, rl], k) => {
    if (!av.length) return;
    let p = null;
    for (const role of ROLE_PREF[rl || SLOT_ROLES[k]]) { p = av.find(q => q.role === role); if (p) break; }
    if (!p) p = av[0];
    av.splice(av.indexOf(p), 1);
    p.loc = 'pitch'; p.state = 'standing'; p.x = ti === 0 ? x : W - 1 - x; p.y = y;
  });
}
function setupProblem(ti) {
  const ps = G.teams[ti].players.filter(p => p.loc === 'pitch'), los = ti === 0 ? 12 : 13;
  if (ps.some(p => !inHalf(p.x, ti))) return 'Todos deben estar en tu mitad del campo.';
  if (ps.filter(p => p.x === los).length < Math.min(3, ps.length)) return 'Necesitas al menos 3 jugadores en la línea de scrimmage (la columna pegada al centro).';
  if (ps.filter(p => p.y <= 3).length > 2 || ps.filter(p => p.y >= 11).length > 2) return 'Máximo 2 jugadores en cada banda lateral.';
  return null;
}
async function charge(kicker, n) {
  const t = G.teams[kicker], open = new Set(openPlayers(kicker));
  if (!open.size) return;
  G.active = kicker; G.phase = 'turn'; G.turnover = false; G.cur = null; G.charge = { left: n };
  G.blitzUsed = false; G.passUsed = G.handUsed = G.foulUsed = G.secureUsed = G.ttmUsed = G.puntUsed = true;
  for (const p of t.players) { p.used = !open.has(p); p.started = false; p.dodgeUsed = false; p.btUsed = false; p.blitzBlocked = false; p.stall = false; }
  render();
  await t.ctrl.playCharge(n);
  if (G.cur) finish(G.cur);
  G.charge = null; G.turnover = false; G.pendingStall = null; G.phase = 'kickoff'; G.active = -1;
  for (const p of t.players) { p.used = false; p.started = false; }
  render();
}
async function kickoffEvent(kicker, land) {
  const recv = 1 - kicker, K = G.teams[kicker], R = G.teams[recv], ev = d6() + d6();
  await fxBanner('kick', null, { ev, title: KICKEV[ev][0], text: KICKEV[ev][1] });
  const duel = (fa, fb, label) => { const a = d6() + fa, b = d6() + fb; log(`${label}: ${K.name} ${a}, ${R.name} ${b}`); return [a, b]; };
  const head = t => log(`Evento de patada (${ev}): ${t}`, 'hd');
  if (ev === 2) { head('¡A por el árbitro! Cada equipo recibe un soborno gratis'); K.bribes++; R.bribes++; }
  else if (ev === 3) {
    const delta = G.turn[kicker] + 1 >= 6 ? -1 : 1;
    head(`Tiempo muerto. Los marcadores de turno ${delta < 0 ? 'retroceden' : 'avanzan'} una casilla`);
    G.turn = G.turn.map(v => Math.max(0, Math.min(TURNS, v + delta)));
  } else if (ev === 4) { const n = d3() + 3; head(`Defensa sólida. ${K.name} puede recolocar hasta ${n} jugadores libres`); await K.ctrl.solidDefence(n); }
  else if (ev === 5) {
    head('Patada alta');
    const [lx, ly] = land;
    if (inPitch(lx, ly) && inHalf(lx, recv) && !playerAt(lx, ly)) {
      const c = openPlayers(recv).sort((a, b) => (a.ag - b.ag) || (has(b, 'Catch') - has(a, 'Catch')) || (cheb(a.x, a.y, lx, ly) - cheb(b.x, b.y, lx, ly)));
      if (c.length && await R.ctrl.confirm('highKick', `Patada alta: puedes poner a ${nm(c[0])} justo donde cae el balón. ¿Moverlo?`, c[0])) { c[0].x = lx; c[0].y = ly; log(`${nm(c[0])} se coloca bajo el balón`, 't' + recv); }
    }
  } else if (ev === 6) {
    head('Hinchada animando. El ganador tiene una asistencia extra en su primer bloqueo del próximo turno');
    const [a, b] = duel(K.cheer, R.cheer, 'D6 + animadoras'); if (a >= b) K.cheerAssist = true; if (b >= a) R.cheerAssist = true;
  } else if (ev === 7) {
    head('Entrenamiento brillante. El ganador recibe un reroll extra para esta entrada');
    const [a, b] = duel(K.coaches, R.coaches, 'D6 + ayudantes');
    if (a >= b) { K.rerolls++; K.bonusRR++; } if (b >= a) { R.rerolls++; R.bonusRR++; }
  } else if (ev === 8) {
    head('Cambio de clima'); rollWeather();
    if (wx('nice')) { log('Con clima perfecto el balón se dispersa 3 casillas en el aire'); for (let i = 0; i < 3; i++) { const [dx, dy] = DIRS[d(8) - 1]; land[0] += dx; land[1] += dy; } }
  } else if (ev === 9) { const n = d3() + 3; head(`¡Saque rápido! ${R.name} puede mover una casilla hasta ${n} jugadores libres`); await R.ctrl.quickSnap(n, land); }
  else if (ev === 10) { const n = d3() + 3; head(`¡Carga! ${K.name} activa hasta ${n} jugadores libres: movimiento gratis, y uno puede hacer blitz`); await charge(kicker, n); }
  else if (ev === 11) {
    head('Colación sospechosa');
    const [a, b] = duel(0, 0, 'D6');
    for (const [ti, lose] of [[kicker, a <= b], [recv, b <= a]]) {
      if (!lose) continue;
      const p = pickRandom(G.teams[ti].players.filter(q => q.loc === 'pitch'), 1)[0]; if (!p) continue;
      const r = d6();
      if (r >= 2) { p.ma--; p.av--; p.snack = true; log(`${nm(p)} comió algo malo (${r}): -1 MA y -1 AV por esta entrada`, 't' + ti); }
      else { removeFromPitch(p, 'reserve'); p.used = false; log(`${nm(p)} comió algo muy malo (1): se va a la reserva por esta entrada`, 'bad'); }
    }
  } else if (ev === 12) {
    head('Invasión de campo');
    const [a, b] = duel(K.ff, R.ff, 'D6 + factor de hinchas');
    for (const [ti, lose] of [[kicker, a <= b], [recv, b <= a]]) {
      if (!lose) continue;
      for (const p of pickRandom(G.teams[ti].players.filter(q => q.loc === 'pitch'), d3())) { p.state = 'stunned'; p.stunStart = false; log(`La hinchada derriba a ${nm(p)}: aturdido`, 't' + ti); }
    }
  }
  render();
}
async function kickoff(kicker) {
  const recv = 1 - kicker;
  G.phase = 'kickoff'; G.active = -1; render();
  const [tx, ty] = await G.teams[kicker].ctrl.chooseKick();
  const dist = d6(), [dx, dy] = DIRS[d(8) - 1];
  log(`${G.teams[kicker].name} patea. El balón se desvía ${dist} casilla${dist > 1 ? 's' : ''}`, 'hd');
  const land = [tx + dx * dist, ty + dy * dist];
  G.ballAir = land; render(); await sleep(500);
  if (inPitch(land[0], land[1]) && inHalf(land[0], recv)) {
    for (const q of openPlayers(recv)) {
      if (!has(q, 'On the Ball') || q.rooted) continue;
      const mv = computeMoves(q, { ma: 3, rush: 0, noJump: true, half: recv });
      if (!mv.size) continue;
      const before = [q.x, q.y]; await otbMove(q, mv, land);
      if (q.x !== before[0] || q.y !== before[1] || q.state !== 'standing') break;
    }
  }
  await kickoffEvent(kicker, land);
  G.ballAir = null; G.phase = 'kickoff'; G.active = -1;
  G.kick = { recv }; G.touchback = false;
  await ballArrives(land[0], land[1], { mod: 0, last: [tx, ty], thenBounce: true });
  G.kick = null;
  if (G.touchback) {
    const p = await G.teams[recv].ctrl.chooseTouchback();
    if (p) { G.ball.carrier = p; log(`Touchback: el balón es para ${nm(p)}`, 't' + recv); }
    else { G.ball.carrier = null; G.ball.x = recv === 0 ? 6 : 19; G.ball.y = 7; }
  }
  render();
}
function defaultTouchback(ti) {
  const ps = G.teams[ti].players.filter(hasTZ);
  ps.sort((a, b) => (has(b, 'Sure Hands') - has(a, 'Sure Hands')) || (a.big - b.big) || (Math.abs(a.x - goalX(1 - ti)) - Math.abs(b.x - goalX(1 - ti))));
  return ps[0] || null;
}
async function playTurn(a, live) {
  if (live) { G.active = a; G.phase = 'turn'; render(); }
  else {
  if (snapHook) snapHook('turn', a);
  G.active = a; G.turn[a]++; G.phase = 'turn'; G.turnover = false; G.cur = null;
  G.blitzUsed = G.passUsed = G.handUsed = G.foulUsed = G.secureUsed = G.ttmUsed = G.puntUsed = false; G.pendingStall = null; G.charge = null;
  for (const p of allPlayers()) p.shadowUses = 0;
  for (const p of G.teams[a].players) { p.used = false; p.started = false; p.dodgeUsed = false; p.btUsed = false; p.sfUsed = false; p.blitzBlocked = false; p.stall = false; if (p.state === 'stunned') p.stunStart = true; }
  log(`Mitad ${G.half}, turno ${G.turn[a]} de ${G.teams[a].name}`, 'hd');
  render();
  }
  await G.teams[a].ctrl.playTurn();
  if (G.cur) finish(G.cur);
  if (!G.turnover && G.td == null) {
    const c = G.ball.carrier;
    if (!G.pendingStall && c && c.team === a && !c.started && !has(c, 'Bone Head') && !has(c, 'Really Stupid') && freeScore(c)) G.pendingStall = c;
    await resolveStall();
  }
  G.teams[a].cheerAssist = false;
  for (const p of G.teams[a].players) if (p.loc === 'pitch' && p.state === 'stunned' && p.stunStart) { p.state = 'prone'; p.stunStart = false; }
  if (G.turnover && G.td == null) { log('¡Turnover!', 'bad'); await fxBanner('turnover', G.teams[a]); await sleep(300); }
  else if (G.td == null) await fxBanner('end', G.teams[a]);
  G.phase = 'between'; render();
}
async function drive(kicker, rs) {
  const mid = !!(rs && rs.a != null);
  if (!mid) {
  if (snapHook) snapHook('drive', -1);
  G.td = null; G.turnover = false;
  autoSetup(kicker, true); autoSetup(1 - kicker, false); render();
  await G.teams[kicker].ctrl.setup(true);
  await G.teams[1 - kicker].ctrl.setup(false);
  for (const p of allPlayers()) p.heat = false;
  if (G.halfStart) { G.halfStart = false; for (const t of G.teams) { t.leaderRR = t.players.some(p => p.loc === 'pitch' && has(p, 'Leader')); if (t.leaderRR) log(`${t.name} tiene un reroll extra por Leader`, 't' + t.i); } }
  await kickoff(kicker);
  }
  let a = mid ? rs.a : 1 - kicker, live = mid && !!rs.live;
  for (;;) {
    if (G.turn[a] >= TURNS) { if (G.turn[1 - a] >= TURNS) return null; a = 1 - a; continue; }
    const lv = live; live = false;
    await playTurn(a, lv);
    if (G.td != null) {
      const s = G.td; G.teams[s].score++;
      log(`¡TOUCHDOWN de ${G.teams[s].name}! (${G.teams[0].score} a ${G.teams[1].score})`, 'good'); flash('¡TOUCHDOWN!'); render(); await sleep(1500);
      if (s !== a && G.turn[s] < TURNS) G.turn[s]++;
      return s;
    }
    a = 1 - a;
  }
}
function endDrive() {
  if (wx('heat')) {
    const n = d3();
    for (const t of G.teams) for (const p of pickRandom(t.players.filter(q => q.loc === 'pitch'), n)) { p.heat = true; log(`${nm(p)} se desmaya por el calor y se pierde la próxima entrada`, 't' + p.team); }
  }
  for (const p of allPlayers()) {
    if (p.loc === 'ko') { const kg = G.teams[p.team].kegs || 0, r = d6() + kg; if (r >= 4) { p.loc = 'reserve'; log(`${nm(p)} se recupera del KO (${r})`, 't' + p.team); } else log(`${nm(p)} sigue KO (${r})`, 't' + p.team); }
    else if (p.loc === 'pitch') { p.loc = 'reserve'; p.x = p.y = -1; }
    p.state = 'standing'; p.distracted = false; p.stunStart = false; p.stall = false; p.rooted = false; p.gouged = false;
    if (p.snack) { p.ma++; p.av++; p.snack = false; }
  }
  for (const t of G.teams) {
    if (t.bonusRR > 0 && t.rrUsed < t.bonusRR) t.rerolls = Math.max(0, t.rerolls - (t.bonusRR - t.rrUsed));
    t.bonusRR = 0; t.rrUsed = 0; t.cheerAssist = false;
  }
  G.ball.carrier = null; G.ball.x = G.ball.y = -1; G.pendingStall = null;
}
async function runMatch(rs) {
  if (!rs) {
    G.teams.forEach(t => { t.ff = d3() + t.fans; });
    log(`Hinchas: ${G.teams[0].name} ${G.teams[0].ff}.000, ${G.teams[1].name} ${G.teams[1].ff}.000`);
    rollWeather();
    G.first = d(2) - 1; G.kicker = G.first;
    log(`Sorteo: patea ${G.teams[G.kicker].name}, recibe ${G.teams[1 - G.kicker].name}`, 'hd');
  }
  const first = G.first; let kicker = G.kicker, resumed = !!rs;
  for (G.half = rs ? G.half : 1; G.half <= 2; G.half++) {
    if (!resumed) {
      G.turn = [0, 0]; G.halfStart = true; G.teams.forEach(t => { t.rerolls = t.rrMax; t.bonusRR = 0; t.rrUsed = 0; t.leaderRR = false; });
      if (G.half === 2) { kicker = 1 - first; log('Comienza la segunda mitad', 'hd'); }
    }
    while (G.turn[0] < TURNS || G.turn[1] < TURNS) {
      G.kicker = kicker;
      const r = resumed ? rs : null; resumed = false;
      if (!r && coachHook) await coachHook(G.turn[0] === 0 && G.turn[1] === 0 ? (G.half === 1 ? 'start' : 'half') : 'td');
      const s = await drive(kicker, r);
      if (s != null) kicker = s;
      endDrive();
    }
  }
  G.phase = 'over'; render();
  log(`Final del partido: ${G.teams[0].name} ${G.teams[0].score}, ${G.teams[1].name} ${G.teams[1].score}`, 'hd');
}

