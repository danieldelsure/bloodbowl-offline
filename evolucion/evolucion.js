#!/usr/bin/env node
/*
 Evolución de la IA2 (BB Chile - El desafío)
 Cada generación: 15 hijos con pequeñas variaciones del campeón. Cada hijo juega contra el campeón,
 contra sus ancestros y contra la IA2 de fábrica. Si el mejor supera 55% y lo confirma en una segunda
 ronda con partidas nuevas, se convierte en el nuevo campeón.
 Uso:  node evolucion.js [--hijos 15] [--pares 50] [--horas 10] [--nucleos N] [--reiniciar]
 Se puede cortar con Ctrl+C y retomar después: guarda todo en evolucion_estado.json
*/
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const DIR = __dirname, HTML = fs.existsSync(path.join(DIR, 'index.html')) ? path.join(DIR, 'index.html') : path.join(DIR, '..', 'index.html');
// nombre: [mínimo, máximo, valor de fábrica]
const PARAMS = {
  advW: [0.4, 3, 1.15],      // peso del avance del portador
  expW: [0.2, 3, 1],         // peso de la exposición del portador
  pcost: [0.5, 6, 2.5],      // costo de arriesgar un pase
  passP: [0.4, 0.9, 0.6],    // probabilidad mínima para pasar
  wait: [0, 6, 0],           // turnos de paciencia con el cage armado
  press: [0, 1, 1],          // presión al portador rival (>=0.5 activa)
  blkMin: [0.5, 3, 1.5],     // valor mínimo para hacer un bloqueo
  pBadC: [0.15, 0.6, 0.35],  // riesgo máximo de turnover al bloquear al portador
  pBadO: [0.08, 0.4, 0.2],   // riesgo máximo de turnover en otros bloqueos
  thrFree: [0.7, 1, 0.95],   // probabilidad mínima de cada paso del portador libre
  thrMarked: [0.4, 0.85, 0.62], // idem con el portador marcado
  foulMin: [0.2, 0.9, 0.45], // probabilidad mínima para cometer falta
  risk: [0, 100, 50],        // riesgo del plan
  style: [0, 100, 50]        // estilo del plan (0 conservador, 100 ofensivo)
};
const FABRICA = Object.fromEntries(Object.entries(PARAMS).map(([k, v]) => [k, v[2]]));

/* ---------------- trabajador: juega partidas ---------------- */
function cargarMotor() {
  const html = fs.readFileSync(HTML, 'utf8');
  new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
  return globalThis.__BB;
}
if (process.argv[2] === '--worker') {
  const BB = cargarMotor(), T = BB.TDC.teams;
  const mk = (cls, side, p) => {
    if (cls === 'ai1') return new BB.AI(side);
    const f = {}; for (const k of Object.keys(p)) if (k !== 'risk' && k !== 'style') f[k] = p[k];
    return new BB.AI2(side, f);
  };
  const plan = p => { const o = JSON.parse(JSON.stringify(BB.PRESETS.equil)); if (p) { o.risk = p.risk; o.style = p.style; } return o; };
  process.on('message', async job => {
    let w = 0, d = 0, l = 0;
    for (let i = 0; i < job.pares; i++) {
      const x = Math.floor(Math.random() * T.length); let y; do { y = Math.floor(Math.random() * T.length); } while (y === x);
      for (const swap of [false, true]) {
        BB.newGame(T[x], T[y]); const G = BB.getG();
        const ca = swap ? 1 : 0, cb = 1 - ca;   // ca: lado de A
        G.teams[ca].ctrl = mk(job.a.cls || 'ai2', ca, job.a.p); G.teams[cb].ctrl = mk(job.b.cls || 'ai2', cb, job.b.p);
        G.teams[ca].plan = plan(job.a.p); G.teams[cb].plan = plan(job.b.p);
        await BB.runMatch();
        const sa = G.teams[ca].score, sb = G.teams[cb].score;
        if (sa > sb) w++; else if (sa < sb) l++; else d++;
      }
    }
    process.send({ id: job.id, w, d, l });
  });
  return;
}

/* ---------------- director ---------------- */
const arg = (n, def) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : def; };
const HIJOS = +arg('hijos', 15), PARES = +arg('pares', 50), HORAS = +arg('horas', 0), NUC = +arg('nucleos', os.cpus().length);
const ESTADO = path.join(DIR, 'evolucion_estado.json'), MEJOR = path.join(DIR, 'mejores_parametros.json'), LOG = path.join(DIR, 'evolucion_log.txt');
const log = s => { const t = `[${new Date().toLocaleTimeString()}] ${s}`; console.log(t); fs.appendFileSync(LOG, t + '\n'); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

const workers = [], libres = [], cola = []; let nextId = 1; const pend = new Map();
function lanzar() {
  for (let i = 0; i < NUC; i++) {
    const w = cp.fork(__filename, ['--worker']); workers.push(w); libres.push(w);
    w.on('message', m => { libres.push(w); const f = pend.get(m.id); pend.delete(m.id); f(m); despachar(); });
  }
}
function despachar() { while (libres.length && cola.length) { const w = libres.pop(), j = cola.shift(); w.send(j.job); pend.set(j.job.id, j.res); } }
const jugar = (a, b, pares) => new Promise(res => { cola.push({ job: { id: nextId++, a, b, pares }, res }); despachar(); });
// reparte los pares entre varios trabajadores para que todos los núcleos trabajen
async function duelo(a, b, pares) {
  const trozos = Math.min(NUC, pares), base = Math.floor(pares / trozos), extra = pares % trozos, rs = [];
  for (let i = 0; i < trozos; i++) rs.push(jugar(a, b, base + (i < extra ? 1 : 0)));
  const r = await Promise.all(rs); return r.reduce((s, x) => ({ w: s.w + x.w, d: s.d + x.d, l: s.l + x.l }), { w: 0, d: 0, l: 0 });
}
const puntaje = r => (r.w + 0.5 * r.d) / Math.max(1, r.w + r.d + r.l);
const dif = (p, q) => Object.keys(p).filter(k => Math.abs(p[k] - q[k]) > 1e-9).map(k => `${k} ${q[k].toFixed(2)}→${p[k].toFixed(2)}`).join(', ') || 'sin cambios';

function mutar(p, sigma) {
  const h = Object.assign({}, p), claves = Object.keys(PARAMS); let cambios = 0;
  for (const k of claves) if (Math.random() < 0.45) { const [a, b] = PARAMS[k]; h[k] = clamp(h[k] + gauss() * sigma * (b - a), a, b); cambios++; }
  if (!cambios) { const k = claves[Math.floor(Math.random() * claves.length)], [a, b] = PARAMS[k]; h[k] = clamp(h[k] + gauss() * sigma * (b - a), a, b); }
  return h;
}

async function main() {
  if (!fs.existsSync(HTML)) { console.error('Falta index.html junto a este archivo.'); process.exit(1); }
  if (process.argv.includes('--reiniciar')) for (const f of [ESTADO, MEJOR, LOG]) if (fs.existsSync(f)) fs.unlinkSync(f);
  let E = fs.existsSync(ESTADO) ? JSON.parse(fs.readFileSync(ESTADO, 'utf8')) : { gen: 0, campeon: FABRICA, ancestros: [], aceptados: 0, t0: Date.now(), previo: 0 };
  E.previo = (E.previo || 0) + 0; const inicio = Date.now(), previo = E.previo;
  lanzar();
  const guardar = () => { E.previo = previo + (Date.now() - inicio); fs.writeFileSync(ESTADO, JSON.stringify(E, null, 1)); fs.writeFileSync(MEJOR, JSON.stringify(E.campeon, null, 1)); };
  process.on('SIGINT', () => { log('Cortado con Ctrl+C. Estado guardado; puedes retomar con el mismo comando.'); guardar(); process.exit(0); });
  log(`Inicio en la generación ${E.gen + 1}. Núcleos: ${NUC}, hijos: ${HIJOS}, pares por hijo: ${PARES} (${PARES * 2} partidas).`);
  const F = a => ({ cls: 'ai2', p: a });
  while (true) {
    if (HORAS && (previo + Date.now() - inicio) / 3.6e6 >= HORAS) { log('Se cumplieron las horas pedidas.'); break; }
    E.gen++; const t1 = Date.now(), sigma = Math.max(0.04, 0.12 * Math.pow(0.97, E.gen - 1));
    const rivales = [E.campeon, ...E.ancestros.slice(0, 2), FABRICA].filter((r, i, a) => a.findIndex(q => JSON.stringify(q) === JSON.stringify(r)) === i);
    const hijos = Array.from({ length: HIJOS }, () => mutar(E.campeon, sigma)), res = [];
    for (const h of hijos) {   // cada hijo juega contra cada rival
      const pr = Math.max(1, Math.round(PARES / rivales.length)); let tot = { w: 0, d: 0, l: 0 };
      for (const r of rivales) { const x = await duelo(F(h), F(r), pr); tot = { w: tot.w + x.w, d: tot.d + x.d, l: tot.l + x.l }; }
      res.push({ h, s: puntaje(tot), n: tot.w + tot.d + tot.l });
    }
    res.sort((a, b) => b.s - a.s); const mejor = res[0];
    let linea = `Gen ${E.gen}: mejor hijo ${(100 * mejor.s).toFixed(1)}% (${mejor.n} partidas), mediana ${(100 * res[Math.floor(res.length / 2)].s).toFixed(1)}%`;
    if (mejor.s >= 0.55) {
      let c = { w: 0, d: 0, l: 0 };
      for (const r of [E.campeon, ...(E.ancestros.length ? [E.ancestros[0]] : [])]) { const x = await duelo(F(mejor.h), F(r), PARES * 3); c = { w: c.w + x.w, d: c.d + x.d, l: c.l + x.l }; }
      const sc = puntaje(c); linea += ` | confirmación ${(100 * sc).toFixed(1)}% (${c.w + c.d + c.l} partidas)`;
      if (sc >= 0.535) { E.ancestros.unshift(E.campeon); E.ancestros = E.ancestros.slice(0, 3); linea += ` | NUEVO CAMPEÓN: ${dif(mejor.h, E.campeon)}`; E.campeon = mejor.h; E.aceptados++; }
      else linea += ' | no se confirma, sigue el campeón';
    } else linea += ' | ninguno llega a 55%';
    log(linea + ` | ${((Date.now() - t1) / 60000).toFixed(1)} min`);
    if (E.gen % 5 === 0) {   // chequeo de progreso
      const a = await duelo(F(E.campeon), F(FABRICA), 100), b = await duelo(F(E.campeon), { cls: 'ai1' }, 100);
      log(`  Chequeo gen ${E.gen}: campeón vs IA2 de fábrica ${(100 * puntaje(a)).toFixed(1)}%, vs IA base ${(100 * puntaje(b)).toFixed(1)}% (200 partidas cada uno; ±3.5). Campeones aceptados: ${E.aceptados}.`);
    }
    guardar();
  }
  guardar(); workers.forEach(w => w.kill()); process.exit(0);
}
main();
