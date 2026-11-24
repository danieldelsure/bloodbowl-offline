/* =====================================================================
   Torneo
   ===================================================================== */
/*TOURNEY*/
/* torneos reales disponibles; TDC es el que está en juego (se cambia con useT al elegir o continuar uno) */
const TORNEOS = [TDC3, TDC2, TDC1];
let TDC = TDC3;
function useT(st) { TDC = TORNEOS.find(t => t.id === (st && st.tid)) || TDC3; }
function tNew(me) { return { me, round: 1, res: [], pair: [], tid: TDC.id }; }
function tStandings(st) {
  const n = TDC.teams.length, rows = Array.from({ length: n }, (_, i) => ({ i, pts: 0, w: 0, d: 0, l: 0, tf: 0, ta: 0, cas: 0, opp: [], bh: 0 }));
  for (const rd of st.res) for (const [a, b, sa, sb, ca, cb] of rd) {
    const A = rows[a], B = rows[b];
    A.tf += sa; A.ta += sb; B.tf += sb; B.ta += sa; A.cas += ca; B.cas += cb; A.opp.push(b); B.opp.push(a);
    if (sa > sb) { A.w++; A.pts += 2; B.l++; } else if (sb > sa) { B.w++; B.pts += 2; A.l++; } else { A.d++; B.d++; A.pts++; B.pts++; }
  }
  for (const r of rows) r.bh = r.opp.reduce((t, o) => t + rows[o].pts, 0);
  return rows.slice().sort((x, y) => (y.pts - x.pts) || (y.bh - x.bh) || ((y.tf - y.ta) - (x.tf - x.ta)) || (y.tf - x.tf) || (y.cas - x.cas) || (x.i - y.i));
}
function tPairings(st) {
  if (st.round === 1) return TDC.fixtures.filter(f => f[0] === 1).map(f => [f[1], f[2]]);
  const order = tStandings(st).map(r => r.i), played = new Set();
  for (const rd of st.res) for (const [a, b] of rd) { played.add(a + '-' + b); played.add(b + '-' + a); }
  const solve = (left, strict) => {
    if (!left.length) return [];
    const a = left[0];
    for (let k = 1; k < left.length; k++) {
      const b = left[k];
      if (strict && played.has(a + '-' + b)) continue;
      const rest = solve(left.filter((_, j) => j !== 0 && j !== k), strict);
      if (rest) return [[a, b]].concat(rest);
    }
    return null;
  };
  return solve(order, true) || solve(order, false);
}
async function tSimMatch(a, b) {
  const keep = SIM; SIM = true;
  try {
    newGame(TDC.teams[a], TDC.teams[b]);
    G.teams[0].ctrl = new AI2(0); G.teams[1].ctrl = new AI2(1);
    await runMatch();
    return tResult(a, b);
  } finally { SIM = keep; }
}
function tResult(a, b) {
  const cas = t => G.teams[1 - t].players.filter(p => p.loc === 'cas').length;
  return [a, b, G.teams[0].score, G.teams[1].score, cas(0), cas(1)];
}
async function tAuto() {   // torneo completo jugado por la IA (pruebas)
  const st = tNew(d(TDC.teams.length) - 1);
  for (; st.round <= TDC.rounds; st.round++) {
    const pr = tPairings(st), rd = [];
    if (pr.length * 2 !== TDC.teams.length || new Set(pr.flat()).size !== TDC.teams.length) throw new Error('emparejamiento inválido');
    for (const [a, b] of pr) rd.push(await tSimMatch(a, b));
    st.res.push(rd);
  }
  return st;
}

/* ---------- simulación sin pantalla (pruebas) ---------- */
async function simulate(n, Mk) {
  const out = [];
  for (let k = 0; k < n; k++) {
    newGame(RACE_ORDER[d(RACE_ORDER.length) - 1], RACE_ORDER[d(RACE_ORDER.length) - 1]);
    G.teams[0].ctrl = new (Mk || AI)(0); G.teams[1].ctrl = new (Mk || AI)(1);
    const orig = playTurn;
    await runMatch();
    out.push({ score: [G.teams[0].score, G.teams[1].score], races: [G.teams[0].race, G.teams[1].race],
      cas: allPlayers().filter(p => p.loc === 'cas').length, log: G.log });
  }
  return out;
}
function checkInvariants() {
  const seen = new Set();
  for (const p of pitchPlayers()) {
    if (!inPitch(p.x, p.y)) throw new Error('fuera del campo: ' + p.name);
    const k = idx(p.x, p.y); if (seen.has(k)) throw new Error('dos jugadores en la misma casilla ' + p.x + ',' + p.y); seen.add(k);
  }
  for (const t of G.teams) if (t.players.filter(p => p.loc === 'pitch').length > 11) throw new Error('más de 11 en cancha');
  const c = G.ball.carrier; if (c && c.loc !== 'pitch') throw new Error('portador fuera de cancha');
  if (c && c.state !== 'standing') throw new Error('portador en el suelo');
}
async function bench(n, MkA, MkB, planA, planB) {
  const r = { a: 0, b: 0, d: 0, ta: 0, tb: 0, casA: 0, casB: 0 };
  for (let k = 0; k < n; k++) {
    const r0 = RACE_ORDER[d(RACE_ORDER.length) - 1], r1 = RACE_ORDER[d(RACE_ORDER.length) - 1];
    for (const swap of [false, true]) {
      newGame(r0, r1);
      const ia = swap ? 1 : 0;
      G.teams[ia].ctrl = new MkA(ia); G.teams[1 - ia].ctrl = new MkB(1 - ia);
      if (planA) G.teams[ia].plan = clone(planA); if (planB) G.teams[1 - ia].plan = clone(planB);
      await runMatch();
      const sa = G.teams[ia].score, sb = G.teams[1 - ia].score;
      r.ta += sa; r.tb += sb; if (sa > sb) r.a++; else if (sb > sa) r.b++; else r.d++;
      r.casA += G.teams[1 - ia].players.filter(p => p.loc === 'cas').length; r.casB += G.teams[ia].players.filter(p => p.loc === 'cas').length;
    }
  }
  return r;
}
if (HEADLESS) globalThis.__BB = { DESAFIOS, playTurn, allPlayers, throwTeammate, throwBomb, ballAndChain, RACE_ORDER, ROSTERS, PRESETS, FORMS, AI, AI2, AI2b, snapG, restoreG, runMatch, setSnapHook: f => { snapHook = f; }, newGame, bench, tAuto, tStandings, get TDC() { return TDC; }, TORNEOS, useT, simulate, checkInvariants, getG: () => G, setHook: f => { render = f; } };

