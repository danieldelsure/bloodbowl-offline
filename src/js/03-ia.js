/* =====================================================================
   IA
   ===================================================================== */
class AI {
  constructor(t, f) { this.t = t; if (f) this._f = Object.assign({}, AI2.f, f); }   // f: perillas propias de esta instancia (para la evolución)
  get f() { return this._f || AI2.f; }
  get team() { return G.teams[this.t]; }
  over() { return G.turnover || G.td != null; }
  mine() { return this.team.players.filter(p => p.loc === 'pitch'); }
  foes() { return G.teams[1 - this.t].players.filter(p => p.loc === 'pitch'); }
  avail() { return this.mine().filter(p => !p.used && !p.started && p.state !== 'stunned'); }
  dir() { return this.t === 0 ? 1 : -1; }
  pause() { return sleep(420); }
  async setup() {}
  async chooseKick() { return this.t === 0 ? [19, 7] : [6, 7]; }
  chooseTouchback() { return defaultTouchback(this.t); }
  async askReroll() { return true; }
  /* ganchos que el plan del entrenador sobrescribe (valores por defecto = comportamiento original) */
  blitzMin(isC) { return this.bashing ? 0.35 : isC ? 0.5 : 0.8; }
  blitzDice() { return this.bashing ? 1 : 2; }
  hitC() { return 60; }
  hitX() { return 0; }
  oneDieOk(p, e) { return this.bashing || has(p, 'Block') || G.ball.carrier === e; }
  advThr() { return 0.95; }
  /* los 3 compañeros más cercanos al portador se reservan para cubrirlo, salvo en el último turno */
  coverSet() {
    const c = G.ball.carrier;
    if (!c || c.team !== this.t || c.state !== 'standing' || G.turn[this.t] >= TURNS) return null;
    return new Set(this.avail().filter(p => p !== c && p.state === 'standing').sort((a, b) => cheb(a.x, a.y, c.x, c.y) - cheb(b.x, b.y, c.x, c.y)).slice(0, 3));
  }
  passMin(last) { return last ? 0.05 : 0.5; }
  async tryPassAdvance() { return false; }   // AI2: entregas y pases cortos para mover el balón con equipos lentos
  carrierFit() { return 0; }   // AI2: quién conviene que lleve el balón, a igualdad de probabilidad de recogerlo
  longOk() { return false; }   // AI2: equipos con buen pase pueden intentar pase largo para anotar
  carrierThreat() { return 0; }   // AI2 lo sobreescribe: peso de un rival que puede tumbar a mi portador
  holdScore() { return false; }
  /* último turno de la mitad y no hay forma razonable de anotar: todo a pegar */
  lastStand() {
    if (G.turn[this.t] < TURNS) return false;
    const c = G.ball.carrier;
    if (c && c.team === this.t) { const n = this.scoreNode(c); if (n && n.prob >= 0.2) return false; }
    return true;
  }
  async finalBash() {
    this.bashing = true;
    try {
      await this.tryPunt(); if (this.over()) return;
      const c = G.ball.carrier;
      if (c && c.team === this.t && await this.tryPassScore(true)) return;
      await this.doBlocks(2); if (this.over()) return;
      await this.doBlitz(); if (this.over()) return;
      await this.doBlocks(2); if (this.over()) return;
      await this.doSpecials(); if (this.over()) return;
      if (this.doFoul) { await this.doFoul(); if (this.over()) return; }
      await this.doBlocks(1);
    } finally { this.bashing = false; }
  }
  async confirm(kind, text, p) { if (kind === 'apoKO') return !!(p && (p.big || p.skills.size >= 2)); return true; }
  async solidDefence() {}
  async quickSnap() {}
  async playCharge() { await this.pause(); await this.doBlitz(); }
  rate(face, att, def) {
    const c = G.ball.carrier === def ? 6 : 0, ac = G.ball.carrier === att ? 6 : 0;
    if (face === 'skull') return -10 - ac;
    if (face === 'both') { const aD = !has(att, 'Block'), dD = !has(def, 'Block'); return (dD ? 8 + c : 0) + (aD ? -10 - ac : 0); }
    const sf = surfPossible(att.x, att.y, def) ? 12 : 0;
    if (face === 'push') return 3 + c / 6 + sf;
    if (face === 'stumble') return ((has(def, 'Dodge') && !has(att, 'Tackle')) ? 3 : 8 + c) + sf;
    return 8 + c + sf;
  }
  async blockDecision(dice, att, def, attChooses, canRR) {
    const sc = dice.map(f => this.rate(f, att, def));
    const out = attChooses ? Math.max(...sc) : Math.min(...sc);
    if (canRR && out < 0) return 'reroll';
    return sc.indexOf(Math.max(...sc));
  }
  async chooseDefDie(dice, att, def) { const sc = dice.map(f => this.rate(f, att, def)); return sc.indexOf(Math.min(...sc)); }
  async chooseHitRun(p, sq) {
    let best = sq[0], bv = 1e9;
    for (const [x, y] of sq) { const v = this.threat(x, y) + Math.random() * 0.01; if (v < bv) { bv = v; best = [x, y]; } }
    return best;
  }
  pAV(av) { let n = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b >= av) n++; return n / 36; }
  /* Apuñalar y Vómito como acción propia (sin riesgo de turnover), cuando no hay un buen bloqueo disponible */
  async doSpecials() {
    for (;;) {
      let best = null, bs = 0;
      for (const p of this.avail()) {
        if (p.state !== 'standing' || G.ball.carrier === p || (!has(p, 'Stab') && !has(p, 'Projectile Vomit'))) continue;
        for (const e of this.foes()) {
          if (e.state !== 'standing' || cheb(p.x, p.y, e.x, e.y) !== 1) continue;
          const info = blockDice(p, e);
          const blockOk = info.attChooses && (info.n >= 2 || (info.n === 1 && this.oneDieOk(p, e)));
          const isC = G.ball.carrier === e, fa = has(e, 'Foul Appearance') ? 5 / 6 : 1;
          for (const kind of ['stab', 'vomit']) {
            if (kind === 'stab' && !has(p, 'Stab')) continue;
            if (kind === 'vomit' && !has(p, 'Projectile Vomit')) continue;
            const pb = this.pAV(e.av) * fa * (kind === 'vomit' ? 5 / 6 : 1);
            if (pb < 0.3) continue;
            let v = pb * 10 + (isC ? pb * 30 : 0) + (e.skills.size >= 3 ? pb * 4 : 0) - (blockOk ? 5 : 0);
            if (v > bs) { bs = v; best = { p, e, kind }; }
          }
        }
      }
      if (!best) return;
      const { p, e, kind } = best;
      if (await begin(p, kind)) { if (kind === 'stab') await stab(p, e); else await vomit(p, e); await this.pause(); }
      finish(p);
      if (this.over()) return;
    }
  }
  stabBlitz(p, e, info) {
    return has(p, 'Stab') && this.pAV(e.av) >= 0.4 && (!info.attChooses || info.n < 2 || !has(p, 'Block'));
  }
  /* Lanzar compañero: solo en el último turno, lanzando al portador (Right Stuff) hacia la zona de anotación */
  async tryTTM() {
    const c = G.ball.carrier;
    if (G.ttmUsed || !c || c.team !== this.t || !has(c, 'Right Stuff') || c.state !== 'standing' || c.used || c.started || G.turn[this.t] < TURNS) return false;
    const sn = this.scoreNode(c), base = sn ? sn.prob : 0;
    const th = this.avail().find(q => q !== c && has(q, 'Throw Team-mate') && q.state === 'standing' && !q.rooted && cheb(q.x, q.y, c.x, c.y) === 1);
    if (!th) return false;
    const gx = goalX(this.t), hungry = has(th, 'Always Hungry') ? 5 / 6 : 1;
    let best = null, bp = Math.max(0.03, base + 0.02);
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
      if (playerAt(xx, yy) || (xx === th.x && yy === th.y) || Math.abs(xx - gx) > 4) continue;
      const band = rangeBand(th.x, th.y, xx, yy); if (band !== 0 && band !== 1) continue;
      const mod = band + markers(th).length + (wx('sunny') ? 1 : 0) + disturb(th) - (has(th, 'Strong Arm') ? 1 : 0);
      let pTD = 0;
      for (let r = 1; r <= 6; r++) {
        const fumble = r === 1 || r - mod <= 1; if (fumble) continue;
        const ok = r === 6 || r - mod >= th.pa;
        for (let k = 0; k < 120; k++) {
          let x = xx, y = yy, out = false;
          for (let i = 0; i < 3 && !out; i++) { const [dx, dy] = DIRS[d(8) - 1]; if (!inPitch(x + dx, y + dy)) out = true; else { x += dx; y += dy; } }
          if (out || x !== gx || (playerAt(x, y) && playerAt(x, y) !== c)) continue;
          const need = c.ag + (ok ? 0 : 1) + markersAt(x, y, this.t).length;
          pTD += clampP((7 - need) / 6) / 120 / 6;
        }
      }
      pTD *= hungry;
      if (pTD > bp) { bp = pTD; best = [xx, yy]; }
    }
    if (!best) return false;
    if (await begin(th, 'ttm')) { await throwTeammate(th, c, best[0], best[1]); await this.pause(); }
    finish(th); return true;
  }
  /* Despeje: solo en el último turno, hacia la meta, si puede dejar el balón en un compañero que anota */
  async tryPunt() {
    const c = G.ball.carrier;
    if (G.puntUsed || !c || c.team !== this.t || !has(c, 'Punt') || c.state !== 'standing' || c.used || c.started || G.turn[this.t] < TURNS) return false;
    const sn = this.scoreNode(c), base = sn ? sn.prob : 0;
    const dx = this.dir(); let ev = 0;
    for (const dy of [-1, 0, 1]) for (let n = 1; n <= 6; n++) {
      let x = c.x, y = c.y, out = false;
      for (let i = 0; i < n; i++) { if (!inPitch(x + dx, y + dy)) { out = true; break; } x += dx; y += dy; }
      if (out) continue;
      const q = playerAt(x, y);
      if (!q || q.team !== this.t || q.state !== 'standing' || q.used) continue;
      let pc = clampP((7 - (q.ag + markers(q).length)) / 6); if (has(q, 'Catch')) pc = 1 - (1 - pc) * (1 - pc);
      let pz = q.x === goalX(this.t) ? 1 : 0; if (!pz) { const nn = this.scoreNode(q); if (nn) pz = nn.prob; }
      ev += pc * pz / 18;
    }
    if (ev < Math.max(0.03, base + 0.02)) return false;
    if (await begin(c, 'punt')) { await punt(c, dx, 0); await this.pause(); } else finish(c);
    return true;
  }
  async askFollow(att, def, fx, fy) {
    const c = G.ball.carrier;
    if (c && c.team === this.t && att !== c && G.turn[this.t] < TURNS && cheb(att.x, att.y, c.x, c.y) === 1 && cheb(fx, fy, c.x, c.y) > 1) return false;
    return true;
  }
  async onTheBall(q, mv, target) {
    let best = null, bd = cheb(q.x, q.y, target[0], target[1]);
    for (const n of mv.values()) { if (n.prob < 0.999) continue; const dd = cheb(n.x, n.y, target[0], target[1]); if (dd < bd || (best && dd === bd && n.steps < best.steps)) { bd = dd; best = n; } }
    return best;
  }
  async dumpOff(def, c) {
    const need = q => q.ag + markers(q).length;
    const b = c.slice().sort((x, y) => need(x) - need(y))[0];
    return need(b) <= 4 ? b : null;
  }
  async choosePush(q, squares, own) {
    if (own) {
      let b = squares[0], v = 1e9;
      for (const s of squares) { const c = markersAt(s[0], s[1], q.team).length * 10 + (Math.min(s[1], H - 1 - s[1]) < 1 ? 5 : 0) + Math.random(); if (c < v) { v = c; b = s; } }
      return b;
    }
    const crowd = squares.find(([x, y]) => !inPitch(x, y)); if (crowd) return crowd;
    let best = squares[0], bs = -1e9;
    for (const s of squares) { const v = -Math.min(s[1], H - 1 - s[1]) + Math.abs(s[0] - goalX(q.team)) * 0.3 + Math.random() * 0.1; if (v > bs) { bs = v; best = s; } }
    return best;
  }
  scoreNode(c) {
    const mv = computeMoves(c), gx = goalX(this.t); let best = null;
    for (const n of mv.values()) if (n.x === gx && (!best || n.prob > best.prob)) best = n;
    return best;
  }
  async tryScore(minProb) {
    const c = G.ball.carrier;
    if (!c || c.team !== this.t || c.used || c.started || c.state !== 'standing') return false;
    const n = this.scoreNode(c); if (!n || n.prob < minProb) return false;
    if (await begin(c, 'move')) await moveAlong(c, pathOf(n));
    finish(c); return true;
  }
  riskyBlock(p) {
    if (p.state !== 'standing' || G.ball.carrier === p) return null;
    let best = null;
    for (const e of this.foes()) {
      if (e.state !== 'standing' || cheb(p.x, p.y, e.x, e.y) !== 1) continue;
      const info = blockDice(p, e);
      if (info.n === 1 && (has(p, 'Block') || G.ball.carrier === e)) best = e;
    }
    return best;
  }
  async doBlocks(minDice) {
    for (;;) {
      let best = null, bs = -1;
      const cov = this.coverSet(), cc = G.ball.carrier;
      for (const p of this.avail()) {
        if (p.state !== 'standing' || G.ball.carrier === p) continue;
        if (cov && cov.has(p) && cheb(p.x, p.y, cc.x, cc.y) !== 1) continue;
        for (const e of this.foes()) {
          if (e.state !== 'standing' || cheb(p.x, p.y, e.x, e.y) !== 1) continue;
          const info = blockDice(p, e);
          if ((!info.attChooses && !this.bashing) || info.n < minDice) continue;
          if (info.n === 1 && !this.oneDieOk(p, e)) continue;
          const s = info.n * 10 + (G.ball.carrier === e ? 50 : 0) + this.carrierThreat(e) + (surfPossible(p.x, p.y, e) ? 14 : 0) + this.hitX(e) * 0.3 + (has(p, 'Block') ? 3 : 0) + (has(p, 'Mighty Blow') ? 2 : 0) - (has(e, 'Block') ? 2 : 0);
          if (s > bs) { bs = s; best = [p, e]; }
        }
      }
      if (!best) return;
      const [p, e] = best;
      if (await begin(p, 'block')) { await block(p, e, true); await this.pause(); }
      finish(p);
      if (this.over()) return;
    }
  }
  async doBlitz(dry) {
    if (G.blitzUsed) return null;
    const myC = G.ball.carrier && G.ball.carrier.team === this.t ? G.ball.carrier : null;
    let best = null, bs = 0;
    const cov = this.coverSet();
    for (const p of this.avail()) {
      if (G.ball.carrier === p) continue;
      if (p.rooted) continue;
      if (cov && cov.has(p)) continue;
      const mv = computeMoves(p, { reserve: 1, action: 'blitz' }), ox = p.x, oy = p.y;
      for (const e of this.foes()) {
        if (e.state !== 'standing') continue;
        const isC = G.ball.carrier === e;
        for (const [dx, dy] of DIRS) {
          const x = e.x + dx, y = e.y + dy; if (!inPitch(x, y)) continue;
          let node = null, prob = 1;
          if (x === ox && y === oy) { if (p.state === 'prone' && p.ma < 4 && !has(p, 'Jump Up')) continue; }
          else { node = mv.get(idx(x, y)); if (!node) continue; prob = node.prob; }
          if (prob < this.blitzMin(isC)) continue;
          p.x = x; p.y = y; const info = blockDice(p, e, p.st + (has(p, 'Horns') ? 1 : 0)); p.x = ox; p.y = oy;
          if ((!info.attChooses && !has(p, 'Stab') && !this.bashing) || (info.n < this.blitzDice(p) && !isC && !has(p, 'Stab'))) continue;
          const s = prob * (info.n * 10 + (isC ? this.hitC() : 0) + this.carrierThreat(e) + (surfPossible(x, y, e) ? 14 : 0) + this.hitX(e) + (myC && cheb(e.x, e.y, myC.x, myC.y) === 1 ? 8 : 0) + (has(p, 'Block') ? 3 : 0));
          if (s > bs) { bs = s; best = { p, e, node, info }; }
        }
      }
    }
    if (dry) return best ? best.p : null;
    if (!best) return;
    const { p, e, node, info } = best;
    if (await begin(p, 'blitz')) {
      const r = node ? await moveAlong(p, pathOf(node)) : 'ok';
      if (r === 'ok' && e.loc === 'pitch' && e.state === 'standing' && p.state === 'standing' && cheb(p.x, p.y, e.x, e.y) === 1) await blitzBlock(p, e, true, this.stabBlitz(p, e, info));
      await this.pause();
    }
    finish(p);
  }
  threat(x, y) {
    let s = 0;
    for (const e of this.foes()) { if (!hasTZ(e)) continue; const dd = cheb(e.x, e.y, x, y); s += dd <= 1 ? 6 : dd <= 2 ? 2.5 : dd <= e.ma ? 0.6 : 0; }
    for (const f of this.mine()) if (hasTZ(f) && cheb(f.x, f.y, x, y) === 1) s -= 0.4;
    return s;
  }
  async advance(c) {
    const mv = computeMoves(c), gx = goalX(this.t), hold = this.holdScore(c);
    let best = null, bs = -Math.abs(gx - c.x) - this.threat(c.x, c.y);
    for (const n of mv.values()) {
      if (n.prob < this.advThr()) continue;
      if (hold && Math.abs(gx - n.x) < 3) continue;
      const s = -Math.abs(gx - n.x) - this.threat(n.x, n.y) - (n.prob < 0.999 ? 3 : 0) + (n.x === gx ? 100 : 0);
      if (s > bs) { bs = s; best = n; }
    }
    if (best) await moveAlong(c, pathOf(best));
  }
  async ballPlay() {
    let c = G.ball.carrier;
    if (!c && ballLoose()) {
      const bi = idx(G.ball.x, G.ball.y);
      const tzb = markersAt(G.ball.x, G.ball.y, this.t).length;
      let best = null, bs = 0.3;
      for (const p of this.avail()) {
        const node = computeMoves(p).get(bi); if (!node) continue;
        let pp = canSecure(p) ? 5 / 6 : clampP((7 - (p.ag + tzb)) / 6);
        if (!canSecure(p) && has(p, 'Sure Hands')) pp = 1 - (1 - pp) * (1 - pp);
        const s = node.prob * pp - node.steps * 0.001 + this.carrierFit(p);
        if (s > bs) { bs = s; best = { p, node }; }
      }
      if (!best) return;
      const { p, node } = best, act = canSecure(p) ? 'secure' : 'move';
      if (await begin(p, act)) {
        await moveAlong(p, pathOf(node));
        if (!this.over() && G.ball.carrier === p && act === 'move') await this.advance(p);
        await this.pause();
      }
      finish(p); return;
    }
    if (!c || c.team !== this.t || c.used || c.started) return;
    const last = G.turn[this.t] >= TURNS;
    if (await this.tryScore(last ? 0.01 : 0.5)) return;
    if (await this.tryPassScore(last)) return;
    if (!last && await this.tryPassAdvance()) return;
    if (await begin(c, 'move')) { await this.advance(c); await this.pause(); }
    finish(c);
  }
  async tryPassScore(last) {
    const c = G.ball.carrier; if (!c || c.state !== 'standing' || has(c, 'My Ball')) return false;
    const gx = goalX(this.t); let best = null, bs = this.passMin(last);
    for (const t of this.avail()) {
      if (t === c || t.state !== 'standing') continue;
      const adj = cheb(c.x, c.y, t.x, t.y) === 1, band = rangeBand(c.x, c.y, t.x, t.y);
      let p1;
      if (adj && !G.handUsed) p1 = 1;
      else { if (G.passUsed || c.noPA || band < 0 || band > (wx('blizzard') ? 1 : last || this.longOk() ? 2 : 1)) continue; p1 = clampP((7 - (c.pa + band + markers(c).length)) / 6); if (has(c, 'Pass')) p1 = 1 - (1 - p1) * (1 - p1); }
      let pc = clampP((7 - (t.ag + markers(t).length)) / 6); if (has(t, 'Catch')) pc = 1 - (1 - pc) * (1 - pc);
      let pz = 0;
      if (t.x === gx) pz = 1; else { const n = this.scoreNode(t); if (n) pz = n.prob; }
      const s = p1 * pc * pz;
      if (s > bs) { bs = s; best = { t, hand: adj && !G.handUsed }; }
    }
    if (!best) return false;
    const { t, hand } = best;
    if (!(await begin(c, hand ? 'handoff' : 'pass'))) { finish(c); return true; }
    if (hand) await handoff(c, t); else await pass(c, t.x, t.y);
    await this.pause();
    if (this.over()) return true;
    if (G.ball.carrier === t && !t.used) {
      const n = this.scoreNode(t);
      if (n && await begin(t, 'move')) await moveAlong(t, pathOf(n));
      finish(t);
    }
    return true;
  }
  async position() {
    const c = G.ball.carrier;
    const dn = t => Math.min(99, ...G.teams[t].players.filter(p => p.loc === 'pitch' && p.state === 'standing').map(p => cheb(p.x, p.y, G.ball.x, G.ball.y)));
    const off = c ? c.team === this.t : (ballLoose() && dn(this.t) <= dn(1 - this.t));   // balón suelto y más cerca de los míos: rodearlo como en ataque
    const [bx, by] = ballPos(); if (!inPitch(bx, by)) return;
    const dr = this.dir(), g = -dr; let targets = [];
    if (off) {
      targets = [[bx + dr, by + 1], [bx + dr, by - 1], [bx - dr, by + 1], [bx - dr, by - 1]];
      for (const k of [0, -3, 3, -6, 6]) targets.push([bx + 3 * dr, by + k]);
      targets.push([bx + 5 * dr, by - 2], [bx + 5 * dr, by + 2]);
    } else if (this.f.def && this.defTargets) {
      targets = this.defTargets(bx, by, g, c);
    } else {
      targets = [[bx + g, by], [bx + g, by - 1], [bx + g, by + 1], [bx, by - 1], [bx, by + 1]];
      for (const k of [0, -2, 2, -4, 4, -6, 6]) targets.push([bx + 3 * g, by + k]);
    }
    targets = targets.filter(([x, y]) => inPitch(x, y)).filter(([x, y]) => { const q = playerAt(x, y); return !(q && q.team === this.t && hasTZ(q) && (q.used || q === c)); });
    const ps = this.avail().filter(p => p !== c && !this.riskyBlock(p) && !(this.skipSet && this.skipSet.has(p))).sort((a, b) => cheb(a.x, a.y, bx, by) - cheb(b.x, b.y, bx, by));
    const bi = ballLoose() ? idx(bx, by) : -1;
    if (off && this instanceof AI2 && this.f.pass && c && c.team === this.t && c.state === 'standing') {   // el corredor se adelanta para recibir una entrega o un pase corto
      const pt = this.passTeam(), nR = pt ? 3 : 1;
      const fit = q => this.carrierFit(q) + (q.ma - c.ma) * 0.02 + (q.ag <= 3 || has(q, 'Catch') ? 0.1 : 0);
      const cand = ps.filter(q => !q.used && !q.started && q.loc === 'pitch' && q.state === 'standing' && !q.big && q.ma >= 5 && !q.noHands && !has(q, 'No Hands') && (pt ? (q.ag <= 3 || has(q, 'Catch')) : fit(q) > this.carrierFit(c) + 0.02)).sort((x, y) => fit(y) - fit(x)).slice(0, nR);
      const slots = pt ? [[bx + 3 * dr, by - 3], [bx + 3 * dr, by + 3], [bx + 5 * dr, by]] : [[bx + dr, by + 1]];
      for (let k = 0; k < cand.length; k++) {
        const runner = cand[k], TS = (pt ? [slots[k], [slots[k][0], slots[k][1] + (slots[k][1] > by ? -1 : 1)]] : slots).filter(([x, y]) => inPitch(x, y));
        if (!TS.length || runner.used) continue;
        const opts = [{ x: runner.x, y: runner.y, steps: 0, node: null }];
        for (const n of computeMoves(runner).values()) if (n.prob >= 0.999 && n.i !== bi && !playerAt(n.x, n.y)) opts.push({ x: n.x, y: n.y, steps: n.steps, node: n });
        let best = null, bs = 1e9;
        for (const o of opts) { const sc = Math.min(...TS.map(t => cheb(o.x, o.y, t[0], t[1]))) * 10 + this.exposure(o.x, o.y, runner) * 1.2 + o.steps * 0.1; if (sc < bs) { bs = sc; best = o; } }
        ps.splice(ps.indexOf(runner), 1);
        if (best && best.node && await begin(runner, 'move')) { await moveAlong(runner, pathOf(best.node)); await sleep(150); finish(runner); if (this.over()) return; }
      }
    }
    for (const p of ps) {
      if (p.used || p.started || p.loc !== 'pitch') continue;
      if (!off && c && hasTZ(p) && cheb(p.x, p.y, c.x, c.y) === 1) continue;
      const opts = [{ x: p.x, y: p.y, steps: 0, node: null }];
      for (const n of computeMoves(p).values()) if (n.prob >= 0.999 && n.i !== bi) opts.push({ x: n.x, y: n.y, steps: n.steps, node: n });
      const tl = targets.length ? targets : [[bx, by]];
      let best = null, bs = 1e9, bt = -1;
      tl.forEach((t, ti) => { for (const o of opts) { const s = cheb(o.x, o.y, t[0], t[1]) * 10 + ti * 4 + o.steps * 0.1; if (s < bs) { bs = s; best = o; bt = ti; } } });
      if (targets.length && bt >= 0) targets.splice(bt, 1);
      if (!best.node && p.state === 'standing') continue;
      if (await begin(p, 'move')) { if (best.node) await moveAlong(p, pathOf(best.node)); await sleep(150); }
      finish(p);
      if (this.over()) return;
    }
  }
  async playTurn() {
    await this.pause();
    if (await this.tryScore(0.99)) return;
    await this.tryTTM(); if (this.over()) return;
    if (this.lastStand()) { await this.finalBash(); return; }
    await this.doBlocks(2); if (this.over()) return;
    await this.doBlitz(); if (this.over()) return;
    await this.doBlocks(2); if (this.over()) return;
    await this.doSpecials(); if (this.over()) return;
    await this.tryPunt(); if (this.over()) return;
    await this.ballPlay(); if (this.over()) return;
    await this.position(); if (this.over()) return;
    await this.doBlocks(1);
  }
}

/* plan por defecto según raza, solo donde la simulación mostró mejora sostenida (Nurgle: banda, +6 puntos de victoria en 300 partidos) */
const RACE_PLAN = { Nurgle: 'banda' };
// plan por defecto de la IA2 (evolucionado: algo más ofensivo y con riesgo medio-bajo)
const AI_PLAN = Object.assign({}, PRESETS.equil, { risk: 46, style: 56 });
class AI2 extends AI {
  /* plan efectivo del equipo (con el cambio automático según el marcador) */
  plan() {
    const t = this.team, p = t.plan || PRESETS[RACE_PLAN[t.race]] || AI_PLAN;
    if (!p.auto) return p;
    const lead = t.score - G.teams[1 - this.t].score, e = Object.assign({}, p);
    if (lead > 0) { e.style = Math.max(0, p.style - 30); e.scoring = 'late'; e.risk = Math.max(0, p.risk - 25); }
    else if (lead < 0) { e.style = Math.min(100, p.style + 25); e.scoring = 'fast'; e.risk = Math.min(100, p.risk + 25); }
    return e;
  }
  /* quedan pocos turnos y no voy ganando por mucho: hay que anotar ya */
  urgent() { const left = TURNS - G.turn[this.t], lead = this.team.score - G.teams[1 - this.t].score; return this.f.rush && left <= 2 && lead <= 1; }
  rk() { return (this.plan().risk - 50) / 50; }
  st() { return (this.plan().style - 50) / 50; }
  aggr() { return Math.max(-1, Math.min(1, this.rk() + 0.5 * this.st())); }
  async setup(kicking) { const pl = this.plan(); planSetup(this.t, kicking, kicking ? pl.def : pl.att); }
  blitzMin(isC) { return this.bashing ? 0.35 : Math.max(0.2, (isC ? 0.5 : 0.8) - 0.15 * this.aggr()); }
  blitzDice(p) { return this.bashing || (this.aggr() > 0.6 && has(p, 'Block')) ? 1 : 2; }
  hitC() { return this.plan().target === 'weak' ? 50 : 60; }
  keyness(e) { return (e.ex ? e.ex.length : 0) * 22 + (e.skills.size >= 3 ? 10 : 0) + (e.big ? 6 : 0); }
  hitX(e) {
    const t = this.plan().target;
    if (t === 'key') return this.keyness(e);
    if (t === 'weak') return Math.max(0, 10 - e.av) * 5 + (e.st <= 2 ? 8 : 0);
    return 0;
  }
  /* mover el balón con entregas y pases cortos hacia un compañero que llegue más lejos (equipos lentos, cage, Pestigors, etc.) */
  /* equipo de pase: algún buen lanzador (PA 3+ o Pass) y al menos 3 receptores ágiles (AG 3+ o Catch) */
  passTeam() {
    const ps = G.teams[this.t].players.filter(p => p.loc === 'pitch' && !p.big && !p.noHands && !has(p, 'No Hands'));
    return ps.some(p => (p.pa && p.pa <= 3) || has(p, 'Pass')) && ps.filter(p => p.ag <= 3 || has(p, 'Catch')).length >= 3;
  }
  longOk() { return !!this.f.pass && this.passTeam(); }
  async tryPassAdvance() {
    const c = G.ball.carrier;
    if (!this.f.pass || !c || c.team !== this.t || c.state !== 'standing' || has(c, 'My Ball') || c.used) return false;
    const gx = goalX(this.t), urg = this.urgent(), pt = this.passTeam();
    const eff = (p, mk) => p.ma * (mk ? 0.5 : 1) - (p.big ? 0.5 : 0);
    const dc = Math.abs(gx - c.x) - eff(c, markers(c).length > 0);
    let best = null, bs = urg ? 0.3 : 1.0;
    for (const t of this.avail()) {
      if (t === c || t.state !== 'standing' || t.noHands || has(t, 'No Hands') || t.big && t.st < 5) continue;
      const adj = cheb(c.x, c.y, t.x, t.y) === 1, band = rangeBand(c.x, c.y, t.x, t.y);
      let p1;
      if (adj && !G.handUsed) p1 = 1;
      else { if (G.passUsed || c.noPA || band < 0 || band > (urg ? 2 : 1)) continue; p1 = clampP((7 - (c.pa + band + markers(c).length)) / 6); if (has(c, 'Pass')) p1 = 1 - (1 - p1) * (1 - p1); }
      let pc = clampP((7 - (t.ag + markers(t).length)) / 6); if (has(t, 'Catch')) pc = 1 - (1 - pc) * (1 - pc);
      let ps = p1 * pc; if (this.team.rr > 0 && !G.rrUsed) ps = ps + (1 - ps) * ps;   // con segunda oportunidad (relanzamiento)
      if (ps < (urg ? 0.45 : this.f.passP - 0.1 * this.aggr() + (pt ? -0.1 : 0.1))) continue;
      const dt = Math.abs(gx - t.x) - eff(t, markers(t).length > 0);
      const gain = dc - dt;
      const sc = gain - (1 - ps) * this.f.pcost - this.exposure(t.x, t.y, t) * 0.2 + (has(t, 'Sure Hands') ? 0.8 : 0);
      if (sc > bs) { bs = sc; best = { t, hand: adj && !G.handUsed }; }
    }
    if (!best) return false;
    const { t, hand } = best;
    if (!(await begin(c, hand ? 'handoff' : 'pass'))) { finish(c); return true; }
    if (hand) await handoff(c, t); else await pass(c, t.x, t.y);
    await this.pause();
    if (this.over()) return true;
    if (G.ball.carrier === t && !t.used && await begin(t, 'move')) { await this.advance(t); await this.pause(); finish(t); }
    return true;
  }
  carrierFit(p) {
    if (!this.f.runner) return 0;
    return 0.04 * (p.ma - 5) + (has(p, 'Sure Hands') ? 0.05 : 0) + (p.ag <= 3 ? 0.03 : p.ag >= 5 ? -0.03 : 0) + (p.big ? -0.1 : 0) + (has(p, 'Dodge') ? 0.02 : 0) + (p.st >= 4 && p.ma <= 4 ? -0.03 : 0);
  }
  /* rival que puede llegar al portador este turno y pegar fuerte (F4+, Mighty Blow): bloquearlo vale más que rodear al portador */
  carrierThreat(e) {
    const c = G.ball.carrier;
    if (!this.f.thr || !c || c.team !== this.t || e.state !== 'standing' || !hasTZ(e) || G.turn[this.t] >= TURNS) return 0;
    if (cheb(e.x, e.y, c.x, c.y) > e.ma + 2) return 0;
    return (e.st >= 4 ? 40 : e.st === 3 ? 12 : 3) + (has(e, 'Mighty Blow') ? 8 : 0) + (has(e, 'Tackle') ? 3 : 0) + (has(e, 'Frenzy') ? 4 : 0);
  }
  coverSet() {
    const c = G.ball.carrier;
    if (this.f.thr && c && c.team === this.t && this.foes().some(e => this.carrierThreat(e) >= 40)) {   // hay un F4+ cerca: casi todos quedan libres para ir a por él
      if (c.state !== 'standing' || G.turn[this.t] >= TURNS) return null;
      return new Set(this.avail().filter(p => p !== c && p.state === 'standing').sort((a, b) => cheb(a.x, a.y, c.x, c.y) - cheb(b.x, b.y, c.x, c.y)).slice(0, 1));
    }
    return super.coverSet();
  }
  oneDieOk(p, e) { return this.bashing ? true : this.f.thr && this.carrierThreat(e) >= 40 && has(p, 'Block') ? true : this.rk() < -0.5 ? has(p, 'Block') : super.oneDieOk(p, e); }
  advThr() { const r = this.rk(); return r < -0.5 ? 0.999 : r > 0.5 ? 0.8 : 0.95; }
  passMin(last) {
    if (last) return 0.05;
    if (this.urgent()) return 0.25;
    const r = this.rk(); let m = r < -0.5 ? 0.8 : r > 0.5 ? 0.35 : 0.5;
    if (this.plan().scoring === 'fast') m = Math.min(m, 0.4);
    return m;
  }
  /* plan tardío: guarda el balón sin cruzar a tres casillas de la meta hasta el último turno, salvo peligro */
  holdScore(c) {
    if (!c || c.team !== this.t || this.plan().scoring !== 'late' || G.turn[this.t] >= TURNS || this.urgent()) return false;
    return !this.foes().some(e => e.state === 'standing' && cheb(e.x, e.y, c.x, c.y) <= 1);
  }
  async tryScore(minProb) {
    const c = G.ball.carrier;
    if (c && this.holdScore(c)) return false;
    if (this.plan().scoring === 'fast') minProb = Math.min(minProb, minProb >= 0.99 ? 0.7 : 0.3);
    if (this.urgent()) minProb = Math.min(minProb, minProb >= 0.99 ? 0.55 : 0.2);
    return super.tryScore(minProb);
  }
  async tryPassScore(last) {
    const c = G.ball.carrier;
    if (c && this.holdScore(c)) return false;
    return super.tryPassScore(last);
  }
  async askReroll(p, label) {
    if (this.plan().rr !== 'save') return true;
    const t = this.team;
    if (G.turn[this.t] >= TURNS || rrLeft(t) >= 3) return true;
    if (G.ball.carrier === p || /balón|Atrapar|Pase/.test(label)) return true;
    return false;
  }
  async blockDecision(dice, att, def, attChooses, canRR) {
    const r = await super.blockDecision(dice, att, def, attChooses, canRR);
    if (r === 'reroll' && this.plan().rr === 'save' && G.turn[this.t] < TURNS && G.ball.carrier !== att && G.ball.carrier !== def && rrLeft(this.team) < 3) {
      const sc = dice.map(f => this.rate(f, att, def));
      return attChooses ? sc.indexOf(Math.max(...sc)) : sc.indexOf(Math.min(...sc));
    }
    return r;
  }
  async chooseKick() { const f = this.f; if (!f.kick) return super.chooseKick(); const y = (G.turn[0] + G.turn[1]) % 2 ? 3 : 11; return this.t === 0 ? [f.kick, y] : [W - 1 - f.kick, y]; }
  /* amenaza sobre una casilla para el portador */
  exposure(x, y, me) {
    let s = 0;
    for (const e of this.foes()) {
      if (e.state !== 'standing' || !hasTZ(e)) continue;
      const dd = cheb(e.x, e.y, x, y);
      if (dd <= 1) s += 7; else if (dd - 1 <= e.ma) s += 2.2 + (e.st > (me ? me.st : 3) ? 0.8 : 0);
    }
    for (const f of this.mine()) if (f !== me && hasTZ(f) && f.state === 'standing' && cheb(f.x, f.y, x, y) === 1) s -= 1.4;
    return s;
  }
  /* cuántos compañeros disponibles pueden llegar a una diagonal de (x,y) */
  support(x, y, reach, me) {
    let n = 0;
    for (const [p, set] of reach) {
      if (p === me) continue;
      let ok = false;
      for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const cx = x + dx, cy = y + dy; if (inPitch(cx, cy) && (set.has(idx(cx, cy)) || (p.x === cx && p.y === cy))) { ok = true; break; } }
      if (ok) n++;
    }
    return Math.min(4, n);
  }
  reachMap(me) {
    const m = new Map();
    for (const p of this.avail()) { if (p === me) continue; const set = new Set(); for (const n of computeMoves(p).values()) if (n.prob >= 0.999) set.add(n.i); m.set(p, set); }
    return m;
  }
  /* valor esperado de un bloqueo: enumera las caras posibles de n dados */
  evalDice(att, def, n, attChooses) {
    const F = ['skull', 'both', 'push', 'push', 'stumble', 'pow'], r = F.map(f => this.rate(f, att, def));
    let tot = 0, cnt = 0, bad = 0;
    const rec = (k, best, worst, anyOk) => {
      if (k === n) { const v = attChooses ? best : worst; tot += v; cnt++; if (v < 0) bad++; return; }
      for (const x of r) rec(k + 1, Math.max(best, x), Math.min(worst, x));
    };
    rec(0, -1e9, 1e9);
    return { ev: tot / cnt, pBad: bad / cnt };
  }
  async doBlocks(minDice) {
    if (!this.f.blk) return super.doBlocks(minDice);
    for (;;) {
      let best = null, bs = this.f.blk === 2 ? 0.6 : this.f.blkMin;
      for (const p of this.avail()) {
        const isC = G.ball.carrier === p;
        if (p.state !== 'standing' || (isC && !(this.f.cblk && markers(p).length > 0))) continue;   // el portador marcado puede bloquear si es seguro (mejor que esquivar con el balón)
        for (const e of this.foes()) {
          if (e.state !== 'standing' || cheb(p.x, p.y, e.x, e.y) !== 1) continue;
          const info = blockDice(p, e); if (!info.attChooses) continue;
          if (isC && info.n < 2) continue;
          if (info.n < minDice && !(has(p, 'Block') || G.ball.carrier === e)) continue;
          const { ev, pBad } = this.evalDice(p, e, info.n, true);
          if (isC ? pBad > this.f.pBadK : pBad > (G.ball.carrier === e ? this.f.pBadC : this.f.pBadO)) continue;
          const s = ev + (G.ball.carrier === e ? 6 : 0) + (has(p, 'Mighty Blow') ? 1 : 0) - markers(p).length * 0.3;
          if (s > bs) { bs = s; best = [p, e]; }
        }
      }
      if (!best) return;
      const [p, e] = best;
      if (await begin(p, 'block')) { await block(p, e, G.ball.carrier !== p); await this.pause(); }
      finish(p);
      if (this.over()) return;
    }
  }
  /* defensa: pantalla ancha en columnas de a dos separadas por 2 casillas, siempre por delante del portador */
  defTargets(bx, by, g, c) {
    const t = [];
    const sty = this.st(), d1 = 2 + (sty <= -0.5 ? 1 : 0) - (sty >= 0.5 ? 1 : 0);
    const x1 = Math.max(1, Math.min(W - 2, bx + d1 * g)), x2 = Math.max(1, Math.min(W - 2, bx + (d1 + 1) * g));
    const goalSide = this.t === 0 ? bx > 12 : bx < 13;
    const mid = c ? by : 7;
    t.push([bx + g, by]);
    if (this.f.press >= 0.5 && c) { t.push([bx, by - 1]); t.push([bx, by + 1]); }   // presión: dos marcadores más pegados al portador rival
    for (const k of [0, -2, 2, -4, 4, -6, 6]) { t.push([x1, mid + k]); }
    for (const k of [0, -2, 2, -4, 4]) t.push([x2 + g * 0, mid + k + 1]);
    return t.filter(([x, y]) => y >= 0 && y < H);
  }
  /* faltas: usa asistencias y solo si la armadura se rompe con buena probabilidad */
  foulOdds(p, e, atSq) {
    let off = 0, de = 0;
    for (const q of pitchPlayers()) {
      if (!hasTZ(q) || q === p) continue;
      if (q.team === p.team && cheb(q.x, q.y, e.x, e.y) === 1 && markersAt(q.x, q.y, q.team).length === 0) off++;
      if (q.team === e.team && q !== e && cheb(q.x, q.y, atSq[0], atSq[1]) === 1 && markersAt(q.x, q.y, q.team, p).length === 0) de++;
    }
    let ok = 0; const need = e.av - off + de;
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b >= need) ok++;
    return { off, de, pb: ok / 36 };
  }
  async doFoul() {
    const fp = this.plan().fouls;
    if (!this.f.foul || G.foulUsed || fp === 'never') return;
    let best = null, bs = this.bashing ? 0.2 : fp === 'always' ? 0.3 : (this.f.foulMin || 0.55);
    const targets = this.foes().filter(e => e.state !== 'standing');
    if (!targets.length) return;
    for (const p of this.avail()) {
      if (p.state !== 'standing' || G.ball.carrier === p || p.skills.size > 2 && !has(p, 'Dirty Player')) continue;
      const mv = computeMoves(p);
      for (const e of targets) for (const [dx, dy] of DIRS) {
        const x = e.x + dx, y = e.y + dy; if (!inPitch(x, y) || (playerAt(x, y) && playerAt(x, y) !== p)) continue;
        let node = null;
        if (!(x === p.x && y === p.y)) { node = mv.get(idx(x, y)); if (!node || node.prob < 0.95) continue; }
        const o = this.foulOdds(p, e, [x, y]);
        const sc = o.pb - (has(p, 'Sneaky Git') ? 0.05 : 0.17) + (e.skills.size ? 0.03 : 0) - (node ? node.steps * 0.005 : 0) - (markersAt(x, y, p.team).length * 0.04);
        if (sc > bs) { bs = sc; best = { p, e, node }; }
      }
    }
    if (!best) return;
    const { p, e, node } = best;
    if (await begin(p, 'foul')) {
      const r = node ? await moveAlong(p, pathOf(node)) : 'ok';
      if (r === 'ok' && e.loc === 'pitch' && e.state !== 'standing' && p.state === 'standing' && cheb(p.x, p.y, e.x, e.y) === 1) await foul(p, e);
      await this.pause();
    }
    finish(p);
  }
  /* probabilidad de tumbar al rival con n dados (elige el atacante) */
  pDown(att, def, n) {
    const q = (1 + (!has(def, 'Dodge') || has(att, 'Tackle') ? 1 : 0) + (has(att, 'Block') && !has(def, 'Block') ? 1 : 0)) / 6;
    return 1 - Math.pow(1 - q, n);
  }
  /* el portador está marcado y anotaría si quedara libre: un compañero tumba al marcador (bloqueo o blitz), o el propio portador hace blitz, sigue y corre */
  async freeCarrier() {
    if (!this.f.freeC) return false;
    const gx = goalX(this.t), maxMk = this.f.freeC2 ? 2 : 1;
    for (let it = 0; it < (this.f.freeC2 ? 3 : 2); it++) {
      const c = G.ball.carrier;
      if (!c || c.team !== this.t || c.state !== 'standing' || c.used || c.started || this.holdScore(c)) return false;
      const mk = markers(c); if (!mk.length || mk.length > maxMk || Math.abs(gx - c.x) > c.ma + 2) return false;
      const sn0 = this.scoreNode(c); if (sn0 && sn0.prob >= 0.7) return false;
      const sts = mk.map(m => m.state); mk.forEach(m => { m.state = 'prone'; });
      const sn1 = this.scoreNode(c); mk.forEach((m, i) => { m.state = sts[i]; });
      const pAfter = sn1 ? sn1.prob : 0, need = mk.length > 1 ? 0.6 : 1;   // con dos marcadores hace falta además un segundo golpe
      let best = null, bs = this.f.freeMin;
      for (const e of mk) {
        for (const p of this.avail()) {
          if (p.rooted || p.state !== 'standing') continue;
          const isC = p === c;
          if (isC && (!this.f.freeC2 || G.blitzUsed)) continue;
          const adj = cheb(p.x, p.y, e.x, e.y) === 1;
          const tryAt = (x, y, node, prob) => {
            const ox = p.x, oy = p.y; p.x = x; p.y = y;
            const info = blockDice(p, e, p.st + (has(p, 'Horns') && node ? 1 : 0)); p.x = ox; p.y = oy;
            if (!info.attChooses || info.n < 2) return;
            const { pBad } = this.evalDice(p, e, info.n, true);
            if (pBad > (isC ? this.f.pBadK : this.f.pBadO)) return;
            let pa = pAfter * need;
            if (isC) {   // el portador bloquea (1 de movimiento), sigue a la casilla del rival y corre con lo que le queda
              const sx = c.x, sy = c.y, st = e.state; c.x = e.x; c.y = e.y; e.state = 'prone';
              const mv = computeMoves(c, { ma: c.ma - 1, rush: 2 }); c.x = sx; c.y = sy; e.state = st;
              pa = 0; for (const n of mv.values()) if (n.x === gx && n.prob > pa) pa = n.prob;
            }
            const sc = prob * this.pDown(p, e, info.n) * pa;
            if (sc > bs) { bs = sc; best = { p, e, node, isC }; }
          };
          if (adj) tryAt(p.x, p.y, null, 1);
          else if (!isC && !G.blitzUsed) {
            const mv = computeMoves(p, { reserve: 1, action: 'blitz' });
            for (const [dx, dy] of DIRS) { const x = e.x + dx, y = e.y + dy; if (!inPitch(x, y)) continue; const node = mv.get(idx(x, y)); if (node && node.prob >= 0.6) tryAt(x, y, node, node.prob); }
          }
        }
      }
      if (!best) return false;
      const { p, e, node, isC } = best;
      (globalThis.__FC = globalThis.__FC || { a: 0, s: 0, bl: 0, c: 0 }).a++; if (node) __FC.bl++; if (isC) __FC.c++;
      if (await begin(p, node || isC ? 'blitz' : 'block')) {
        const r = node ? await moveAlong(p, pathOf(node)) : 'ok';
        if (r === 'ok' && e.loc === 'pitch' && e.state === 'standing' && p.state === 'standing' && cheb(p.x, p.y, e.x, e.y) === 1) { if (node || isC) await blitzBlock(p, e, true, false); else await block(p, e, true); }
        if (isC && !this.over() && p.state === 'standing' && !G.turnover) { const n = this.scoreNode(p); if (n && n.prob >= 0.3) await moveAlong(p, pathOf(n)); }
        await this.pause();
      }
      finish(p);
      if (this.over()) return true;
      if (!isC && await this.tryScore(0.5)) { __FC.s++; return true; }
      if (isC) return false;
    }
    return false;
  }
  /* al cerrar el turno, los jugadores que quedan libres tapan las casillas alrededor del portador por donde llegarían los rivales */
  async guardCarrier() {
    const c = G.ball.carrier;
    if (!this.f.guard || !c || c.team !== this.t || c.state !== 'standing' || G.td != null || G.turnover) return;
    const th = this.foes().filter(e => e.state === 'standing' && hasTZ(e) && cheb(e.x, e.y, c.x, c.y) <= e.ma + 1);
    if (!th.length) return;
    for (let k = 0; k < 4; k++) {
      const sq = DIRS.map(([dx, dy]) => [c.x + dx, c.y + dy]).filter(([x, y]) => inPitch(x, y) && !playerAt(x, y));
      if (!sq.length) return;
      sq.sort((a, b) => Math.min(...th.map(e => cheb(a[0], a[1], e.x, e.y))) - Math.min(...th.map(e => cheb(b[0], b[1], e.x, e.y))));
      let best = null, bs = 1e9;
      for (const p of this.avail()) {
        if (p === c || p.state !== 'standing' || p.rooted) continue;
        if (markers(p).length > 0 || cheb(p.x, p.y, c.x, c.y) <= 1) continue;   // el que marca a un rival no se mueve; el que ya está pegado se queda
        const mv = computeMoves(p);
        for (let i = 0; i < Math.min(3, sq.length); i++) {
          const n = mv.get(idx(sq[i][0], sq[i][1])); if (!n || n.prob < 0.999) continue;
          const sc = i * 4 + n.steps * 0.2; if (sc < bs) { bs = sc; best = { p, n }; }
        }
      }
      if (!best) return;
      if (await begin(best.p, 'move')) { await moveAlong(best.p, pathOf(best.n)); await sleep(150); }
      finish(best.p); if (this.over()) return;
    }
  }
  async position() { await super.position(); await this.guardCarrier(); }
  async advance(c) {
    if (!this.f.adv) return super.advance(c);
    const mv = computeMoves(c), gx = goalX(this.t), reach = this.reachMap(c), last = G.turn[this.t] >= TURNS;
    const strong = this.f.adv === 2, hold = this.holdScore(c);
    const marked = this.f.dodge && markersAt(c.x, c.y, this.t).length > 0;   // portador marcado: vale la pena un dodge
    const urg = this.urgent(), thr = marked ? Math.max(0.4, this.f.thrMarked - 0.12 * this.aggr()) : urg ? (TURNS - G.turn[this.t] <= 1 ? 0.6 : 0.8) : this.f.thrFree;
    if (this.f.wait && !urg && !last && G.turn[this.t] < this.f.wait && this.support(c.x, c.y, reach, c) >= 3 && !this.foes().some(e => e.state === 'standing' && cheb(e.x, e.y, c.x, c.y) <= 1)) return;   // paciencia: con el cage armado y sin nadie encima, no se mueve al principio de la mitad
    const val = (x, y, prob) => { const sp = this.support(x, y, reach, c); return -Math.abs(gx - x) * (last ? 3 : urg ? 2.4 : this.f.advW) - this.exposure(x, y, c) * (urg ? 0.5 : this.f.expW) + (strong && !last ? 2.6 * sp - (sp < 2 ? 5 : 0) : 1.3 * sp) - (prob < 0.999 ? 3 + (marked ? (1 - prob) * 10 : 0) : 0) + (x === gx ? 100 : 0) - (hold && Math.abs(gx - x) < 3 ? 1000 : 0); };
    let best = null, bs = val(c.x, c.y, 1);
    for (const n of mv.values()) {
      if (n.prob < thr) continue;
      const sc = val(n.x, n.y, n.prob);
      if (sc > bs) { bs = sc; best = n; }
    }
    if (best) await moveAlong(c, pathOf(best));
  }
  async playTurn() {
    const c = G.ball.carrier, off = c && c.team === this.t;
    await this.pause();
    if (await this.tryScore(0.99)) return;
    if (await this.freeCarrier()) return; if (this.over()) return;
    await this.tryTTM(); if (this.over()) return;
    if (this.lastStand()) { await this.finalBash(); return; }
    if (this.f.free && (this.f.free === 1 || (!off && !ballLoose()))) {   // primero lo que no usa dados: reposicionar a quienes no pelearán este turno
      const keep = new Set(this.avail().filter(p => this.foes().some(e => e.state === 'standing' && cheb(p.x, p.y, e.x, e.y) === 1)));
      const bl = await this.doBlitz(true); if (bl) keep.add(bl);
      if (off) for (const p of this.avail()) if (cheb(p.x, p.y, c.x, c.y) <= 3) keep.add(p);   // la escolta del portador no se mueve antes de tiempo
      this.skipSet = keep; await this.position(); this.skipSet = null; if (this.over()) return;
    }
    if (off && this.urgent()) {   // con el tiempo encima, primero correr con el balón y después pelear
      await this.ballPlay(); if (this.over()) return;
      await this.doBlitz(); if (this.over()) return;
      await this.doBlocks(2); if (this.over()) return;
      await this.position(); if (this.over()) return;
      await this.doBlocks(1); return;
    }
    if (off && AI2.v === 1) {
      await this.ballPlay(); if (this.over()) return;
      await this.doBlitz(); if (this.over()) return;
      await this.doBlocks(2); if (this.over()) return;
      await this.position(); if (this.over()) return;
      await this.doBlocks(1); return;
    }
    await this.doBlocks(2); if (this.over()) return;
    await this.doBlitz(); if (this.over()) return;
    await this.doBlocks(2); if (this.over()) return;
    await this.doSpecials(); if (this.over()) return;
    await this.tryPunt(); if (this.over()) return;
    await this.ballPlay(); if (this.over()) return;
    await this.doFoul(); if (this.over()) return;
    await this.position(); if (this.over()) return;
    await this.doBlocks(1);
  }
}
AI2.v = 0; AI2.f = { freeC: 1, freeC2: 1, guard: 0, freeMin: 0.3, cblk: 1, pBadK: 0.12, blkMin: 1.10, pBadC: 0.31, pBadO: 0.14, passP: 0.53, thrFree: 0.97, thrMarked: 0.62, pcost: 2.38, press: 1, wait: 0.18, advW: 1.70, expW: 0.72, foul: 1, foulMin: 0.54, def: 1, kick: 0, adv: 1, dodge: 1, free: 2, rush: 1, thr: 1, runner: 1, pass: 1 };
class AI2b extends AI2 {}

