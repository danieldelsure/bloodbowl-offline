/* =====================================================================
   Interfaz
   ===================================================================== */
if (!HEADLESS) (function () {
  const $ = id => document.getElementById(id);
  const cv = $('board'), ctx = cv.getContext('2d');
  const HT = 0;
  let S = 30;
  const ui = { limit: null, sel: null, mode: 'move', moves: new Map(), busy: false, phase: 'idle', pick: null, turnRes: null, setupRes: null, hover: null, hl: null };

  /*ASSETS*/
  const IMG = {};
  for (const k in ASSETS) { const im = new Image(); im.onload = () => { im.ok = true; draw(); }; im.src = ASSETS[k]; IMG[k] = im; }

  /* ----- modal ----- */
  function ask(html, buttons, wide, cls, after) {
    return new Promise(res => {
      delete document.body.dataset.drawer;
      $('modalBox').className = (wide ? 'wide ' : '') + (cls || '');
      $('modalBody').innerHTML = html; const bx = $('modalBtns'); bx.innerHTML = '';
      const close = v => { $('modal').hidden = true; res(v); };
      for (const b of buttons) { const el = document.createElement('button'); el.textContent = b.label; if (b.primary) el.className = 'primary'; el.onclick = () => close(b.value); bx.appendChild(el); }
      $('modalBody').querySelectorAll('[data-v]').forEach(el => { el.onclick = () => close(+el.dataset.v); });
      $('modal').hidden = false; if (after) after();
    });
  }
  /* ----- animación de dados sobre la cancha ----- */
  const FXF = ['skull', 'both', 'push', 'stumble', 'pow'];
  function cellBox(x, y) {
    const cv = $('board'), wr = $('boardWrap').getBoundingClientRect(), r = cv.getBoundingClientRect(), k = r.width / (W * S);
    return { cx: r.left - wr.left + (x + .5) * S * k, cy: r.top - wr.top + (y + .5) * S * k, sz: S * k, l: r.left - wr.left, w: r.width };
  }
  const fxWait = ms => new Promise(r => setTimeout(r, ms));
  fxRoll = async (att, def, dice, attChooses = true) => {
    if (SIM) return;
    const box = $('dfx'); box.innerHTML = ''; box.hidden = false;
    const a = cellBox(att.x, att.y), d = cellBox(def.x, def.y);
    const ds = Math.max(40, Math.min(64, d.sz * 1.1)), gap = 8, tw = dice.length * ds + (dice.length - 1) * gap;
    const ty = def.y < 2 ? d.cy + d.sz * 1.2 : d.cy - d.sz * 1.2;
    box.dataset.above = def.y < 2 ? '0' : '1';
    const tx = Math.max(d.l + tw / 2 + 4, Math.min(d.l + d.w - tw / 2 - 4, d.cx));
    const els = [], anims = [];
    dice.forEach((f, i) => {
      const el = document.createElement('div'); el.className = 'fxd' + (attChooses ? '' : ' rv'); el.style.cssText = `width:${ds}px;height:${ds}px;left:${tx - tw / 2 + i * (ds + gap)}px;top:${ty - ds / 2}px`;
      const im = document.createElement('img'); im.src = ASSETS['d_' + FXF[Math.floor(Math.random() * 5)]]; el.appendChild(im); box.appendChild(el); els.push(el);
      const cx = tx - tw / 2 + i * (ds + gap) + ds / 2, sx = a.cx - cx, sy = a.cy - ty, rot = (Math.random() < .5 ? -1 : 1) * 360 * (2 + Math.floor(Math.random() * 2)), dur = 760 + i * 110;
      anims.push(el.animate([
        { transform: `translate(${sx}px,${sy}px) rotate(0deg) scale(.45)`, opacity: .2 },
        { transform: `translate(${sx * .45}px,${sy * .45 - 46}px) rotate(${rot * .55}deg) scale(1.3)`, opacity: 1, offset: .5 },
        { transform: `translate(0,0) rotate(${rot}deg) scale(1)`, opacity: 1 }], { duration: dur, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }));
      const tm = setInterval(() => { im.src = ASSETS['d_' + FXF[Math.floor(Math.random() * 5)]]; }, 75);
      anims[i].finished.then(() => { clearInterval(tm); im.src = ASSETS['d_' + f]; el.style.transform = 'none'; el.animate([{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 160 }); }).catch(() => clearInterval(tm));
    });
    await Promise.all(anims.map(x => x.finished.catch(() => 0)));
    await fxWait(450);
  };
  /* PC: se elige el dado haciendo clic directo en los dados de la cancha (en celular se mantiene la ventana) */
  function inlineDice(n, text, pickable, buttons) {
    const box = $('dfx'), kids = [...box.children];
    if (SIM || document.body.classList.contains('mob') || box.hidden || kids.length !== n || reviewing) return null;
    return new Promise(res => {
      msg(text);
      let bar = null;
      const done = v => { if (bar) bar.remove(); kids.forEach(k => { k.classList.remove('pk'); k.onclick = null; }); res(v); };
      if (pickable) kids.forEach((el, i) => { el.classList.add('pk'); el.onclick = () => done(i); });
      if (buttons && buttons.length) {
        bar = document.createElement('div'); bar.className = 'dfxbar';
        for (const b of buttons) { const el = document.createElement('button'); el.textContent = b.label; if (b.primary) el.className = 'primary'; el.onclick = () => done(b.value); bar.appendChild(el); }
        box.appendChild(bar);
        const f = kids[0], l = kids[n - 1], above = box.dataset.above === '1';
        bar.style.left = f.offsetLeft + 'px'; bar.style.width = (l.offsetLeft + l.offsetWidth - f.offsetLeft) + 'px';
        bar.style.top = (above ? f.offsetTop - bar.offsetHeight - 8 : f.offsetTop + f.offsetHeight + 8) + 'px';
      }
    });
  }
  fxPick = async i => {
    if (SIM) return;
    const box = $('dfx'); [...box.children].forEach((el, k) => el.classList.add(k === i ? 'pick' : 'dim'));
    await fxWait(750); box.hidden = true; box.innerHTML = '';
  };
  fxBanner = async (kind, team, x) => {
    if (SIM) return;
    const el = $('bnr'), to = kind === 'turnover';
    if (kind === 'kick') {
      el.innerHTML = `<div class="bn kick"><span class="kn">${x.ev}</span><div>${x.title}<small>Evento de patada. ${x.text}</small></div></div>`;
      el.hidden = false; await fxWait(2300); el.hidden = true; el.innerHTML = ''; return;
    }
    const ic = to
      ? '<svg viewBox="0 0 52 52"><path d="M26 4 50 46H2Z" fill="#ff4d3d" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><rect x="23.5" y="18" width="5" height="16" rx="2" fill="#fff"/><circle cx="26" cy="40" r="3" fill="#fff"/></svg>'
      : '<svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="currentColor" stroke-width="4"/><path d="M26 12v15l10 6" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';
    el.innerHTML = `<div class="bn ${to ? 'turnover' : ''}" style="${to ? '' : '--c:' + team.color}">${ic}<div>${to ? '¡Turnover!' : 'Fin del turno'}<small>${team.name}${to ? ' pierde el turno' : ''}</small></div></div>`;
    el.hidden = false; await fxWait(to ? 1500 : 850); el.hidden = true; el.innerHTML = '';
  };
  const ICON = { skull: '☠', both: '⚔', push: '➜', stumble: '↯', pow: '✸' };
  const diceHtml = (dice, click) => '<div class="dice">' + dice.map((f, i) => `<${click ? 'button' : 'div'} class="die" ${click ? `data-v="${i}"` : ''}><img src="${ASSETS['d_' + f]}" alt="">${FACE_TXT[f]}</${click ? 'button' : 'div'}>`).join('') + '</div>';

  /* ----- controlador humano ----- */
  class Human {
    constructor(t) { this.t = t; }
    async setup(kicking) {
      ui.kicking = kicking;
      if (G.halfStart) { const r = await lineupPicker(this.t); if (r) applyLineup(this.t, r); }
      ui.phase = 'setup'; ui.sel = null; ui.moves = new Map(); ui.limit = null;
      msg(`<b>Formación.</b> ${kicking ? 'Tú pateas.' : 'Tú recibes.'} Puedes mover a tus jugadores: clic en uno y luego en una casilla de tu mitad (o en otro jugador para intercambiarlos). Cuando estés conforme, aprieta "Listo".`);
      refresh();
      await new Promise(res => { ui.setupRes = res; });
      ui.phase = 'idle'; ui.sel = null; refresh(); msg('Patada inicial…');
    }
    async solidDefence(n) {
      ui.phase = 'setup'; ui.sel = null; ui.moves = new Map(); ui.limit = { n, moved: new Set(), open: new Set(openPlayers(this.t)) };
      msg(`<b>Defensa sólida.</b> Puedes recolocar hasta ${n} jugadores libres (sin rivales adyacentes): clic en uno y luego en una casilla de tu mitad. Aprieta "Listo" al terminar.`);
      refresh();
      await new Promise(res => { ui.setupRes = res; });
      ui.phase = 'idle'; ui.sel = null; ui.limit = null; refresh(); msg('Patada inicial…');
    }
    async quickSnap(n) {
      ui.phase = 'snap'; ui.sel = null; ui.moves = new Map(); ui.limit = { n, moved: new Set(), open: new Set(openPlayers(this.t)) };
      msg(`<b>¡Saque rápido!</b> Puedes mover una casilla hasta ${n} jugadores libres: clic en uno y luego en una casilla vacía adyacente. Aprieta "Listo" al terminar.`);
      refresh();
      await new Promise(res => { ui.setupRes = res; });
      ui.phase = 'idle'; ui.sel = null; ui.limit = null; refresh(); msg('Patada inicial…');
    }
    async confirm(kind, text) {
      const title = { apoKO: 'Apotecario', apoCas: 'Apotecario', bribe: 'Soborno', taunt: 'Taunt', highKick: 'Patada alta' }[kind] || 'Decisión';
      return ask(`<h2>${title}</h2><p>${text}</p>`, [{ label: 'Sí', value: true, primary: true }, { label: 'No', value: false }]);
    }
    async chooseKick() {
      msg('<b>Patada inicial.</b> Haz clic en la casilla del campo rival donde quieres patear. El balón se desvía hasta 6 casillas.');
      ui.hl = { squares: null, color: '#f2b63222' };
      const sq = await new Promise(res => { ui.pick = { ok: (x, y) => x >= 13, res }; });
      ui.hl = null; return sq;
    }
    async chooseTouchback() {
      const ps = G.teams[this.t].players.filter(hasTZ); if (!ps.length) return null;
      msg('<b>Touchback.</b> El balón salió o cayó en campo rival: haz clic en el jugador tuyo que se queda con él.');
      ui.hl = { squares: ps.map(p => [p.x, p.y]), color: '#f2b63277' }; draw();
      const [x, y] = await new Promise(res => { ui.pick = { ok: (x, y) => ps.some(p => p.x === x && p.y === y), res }; });
      ui.hl = null; return playerAt(x, y);
    }
    async askReroll(p, label) {
      return ask(`<h2>Tirada fallada</h2><p>${nm(p)} falló: <b>${label}</b>.</p><p>¿Usar un reroll de equipo? Quedan ${rrLeft(G.teams[this.t])}.${p.loner ? ` Es Solitario: funciona con ${p.loner}+.` : ''}</p>`,
        [{ label: 'Usar reroll', value: true, primary: true }, { label: 'No', value: false }]);
    }
    async blockDecision(dice, att, def, attChooses, canRR) {
      const head = `<h2>${nm(att)} bloquea a ${nm(def)}</h2>`;
      const rr = canRR ? [{ label: `Repetir con reroll (quedan ${rrLeft(G.teams[this.t])})`, value: 'reroll' }] : [];
      const who = `<b>${nm(att)} bloquea a ${nm(def)}.</b> `;
      if (attChooses) {
        if (dice.length === 1 && !canRR) return 0;
        if (dice.length === 1) { const r = inlineDice(1, who + 'Un solo dado: acéptalo o repite con reroll.', false, [{ label: 'Aceptar', value: 0, primary: true }, ...rr]); if (r) return r; return ask(head + diceHtml(dice, false), [{ label: 'Aceptar', value: 0, primary: true }, ...rr]); }
        const r = inlineDice(dice.length, who + 'Elige un dado haciendo clic en él' + (canRR ? ', o repite con reroll.' : '.'), true, rr); if (r) return r;
        return ask(head + '<p>Elige un dado:</p>' + diceHtml(dice, true), rr);
      }
      if (!canRR) return 0;
      { const r = inlineDice(dice.length, who + 'El rival elegirá el dado. Puedes aceptar o repetir con reroll.', false, [{ label: 'Aceptar', value: 0, primary: true }, ...rr]); if (r) return r; }
      return ask(head + '<p>El rival elegirá el dado.</p>' + diceHtml(dice, false), [{ label: 'Aceptar', value: 0, primary: true }, ...rr]);
    }
    async chooseDefDie(dice, att, def) {
      if (dice.length === 1) return 0;
      const r = inlineDice(dice.length, `<b>${nm(att)} bloquea a ${nm(def)}.</b> Tu jugador es más fuerte: elige el dado haciendo clic en él.`, true, null); if (r) return r;
      return ask(`<h2>${nm(att)} bloquea a ${nm(def)}</h2><p>Tu jugador es más fuerte: eliges tú el dado.</p>` + diceHtml(dice, true), []);
    }
    async onTheBall(q, mv, target) {
      const squares = [...mv.values()].map(n => [n.x, n.y]);
      msg(`<b>On the Ball.</b> ${nm(q)} puede moverse hasta 3 casillas antes de que se resuelva la jugada: elige una casilla marcada, o haz clic en el jugador para quedarse. El balón va hacia la casilla con borde blanco.`);
      ui.hl = { squares, color: '#6fb6ff66', mark: target }; draw();
      const [x, y] = await new Promise(res => { ui.pick = { ok: (a, b) => (a === q.x && b === q.y) || mv.has(idx(a, b)), res }; });
      ui.hl = null; draw();
      if (x === q.x && y === q.y) return null;
      const n = mv.get(idx(x, y));
      if (n.prob < 0.999 && !(await ask(`<h2>On the Ball</h2><p>Ese movimiento pide tiradas. Éxito aproximado: <b>${Math.round(n.prob * 100)}%</b>. Si cae, no hay turnover.</p>`, [{ label: 'Mover', value: true, primary: true }, { label: 'Quedarse', value: false }]))) return null;
      return n;
    }
    async dumpOff(def, c) {
      msg(`<b>Dump-off.</b> Van a golpear a ${nm(def)}: puede hacer antes un pase rápido. Elige al compañero marcado, o haz clic en ${nm(def)} para quedarse con el balón.`);
      ui.hl = { squares: c.map(q => [q.x, q.y]), color: '#6fb6ffaa' }; draw();
      const [x, y] = await new Promise(res => { ui.pick = { ok: (a, b) => (a === def.x && b === def.y) || c.some(q => q.x === a && q.y === b), res }; });
      ui.hl = null; draw();
      return (x === def.x && y === def.y) ? null : playerAt(x, y);
    }
    async askFollow(att, def, x, y) {
      msg(`<b>¿Seguir?</b> Haz clic en la casilla marcada para que ${nm(att)} avance tras el empujón, o en el jugador para quedarse donde está.`);
      ui.moves = new Map(); ui.hover = null; ui.hl = { squares: [[x, y]], color: '#6fb6ffaa' }; draw();
      const [px, py] = await new Promise(res => { ui.pick = { ok: (a, b) => (a === x && b === y) || (a === att.x && b === att.y), res }; });
      ui.hl = null; draw();
      return px === x && py === y;
    }
    async chooseHitRun(p, squares) {
      msg(`<b>Hit and Run.</b> ${nm(p)} puede apartarse una casilla gratis: elige una de las marcadas, o haz clic en el jugador para quedarse.`);
      ui.hl = { squares, color: '#6fb6ffaa' }; draw();
      const sq = await new Promise(res => { ui.pick = { ok: (x, y) => (x === p.x && y === p.y) || squares.some(s => s[0] === x && s[1] === y), res }; });
      ui.hl = null; return (sq[0] === p.x && sq[1] === p.y) ? null : sq;
    }
    async choosePush(q, squares, own) {
      const off = squares.filter(([x, y]) => !inPitch(x, y)), on = squares.filter(([x, y]) => inPitch(x, y));
      if (off.length && !own) {
        if (!on.length) return off[0];
        const c = await ask(`<h2>Empujón</h2><p>${nm(q)} puede salir despedido al público (queda expuesto a lesión y suelta el balón) o ir a una casilla del campo.</p>`,
          [{ label: 'Mandarlo al público', value: 'crowd', primary: true }, { label: 'Elegir casilla', value: 'pick' }]);
        if (c === 'crowd') return off[0];
      }
      squares = on;
      msg(own ? `<b>Sidestep.</b> Elige a qué casilla se mueve ${nm(q)}.` : `<b>Empujón.</b> Elige a qué casilla va ${nm(q)}.`);
      ui.hl = { squares, color: '#f2b632aa' }; draw();
      const sq = await new Promise(res => { ui.pick = { ok: (x, y) => squares.some(s => s[0] === x && s[1] === y), res }; });
      ui.hl = null; return sq;
    }
    playTurn() {
      return new Promise(res => {
        ui.turnRes = res; ui.phase = 'turn'; select(null);
        msg(turnMsg());
        refresh();
      });
    }
    playCharge() { return this.playTurn(); }
  }

  /* ----- dibujo ----- */
  /* celular en horizontal: el mismo juego, con los paneles laterales como cajones y los botones en una columna a la derecha */
  const mobQ = () => window.innerHeight <= 540 && window.innerWidth > window.innerHeight;
  function applyMob() { const m = mobQ(); document.body.classList.toggle('mob', m); if (!m) delete document.body.dataset.drawer; }
  (function mobBar() {
    const bar = document.createElement('div'); bar.id = 'mbar';
    bar.innerHTML = '<button data-d="L">Mi ficha</button><button data-d="R">Rival</button><button data-d="log">Registro</button>';
    $('bottom').insertBefore(bar, $('bottom').firstChild);
    bar.onclick = ev => { const b = ev.target.closest('button'); if (!b) return; const cur = document.body.dataset.drawer; if (cur === b.dataset.d) delete document.body.dataset.drawer; else document.body.dataset.drawer = b.dataset.d; };
    document.addEventListener('click', ev => {
      const d = document.body.dataset.drawer; if (!d) return;
      if (ev.target.closest('#mbar') || ev.target.closest('#sideL') || ev.target.closest('#sideR') || ev.target.closest('#log') || ev.target.closest('#modal')) return;
      delete document.body.dataset.drawer; ev.stopPropagation(); ev.preventDefault();
    }, true);
    window.addEventListener('orientationchange', () => setTimeout(() => { applyMob(); if (G) resize(); }, 250));
    applyMob(); window.addEventListener('resize', applyMob);
  })();
  /* zoom de la cancha en celular: botones, pellizco y arrastre con un dedo */
  let zoom = 1; const ZMAX = 3.2;
  function setZoom(z, fx, fy) {
    const bf = $('bframe'), nz = Math.min(ZMAX, Math.max(1, z)); if (nz === zoom) return;
    const px = fx == null ? 0.5 : fx, py = fy == null ? 0.5 : fy;
    const cx = (bf.scrollLeft + bf.clientWidth * px) / (bf.scrollWidth || 1), cy = (bf.scrollTop + bf.clientHeight * py) / (bf.scrollHeight || 1);
    zoom = nz; resize();
    bf.scrollLeft = cx * bf.scrollWidth - bf.clientWidth * px; bf.scrollTop = cy * bf.scrollHeight - bf.clientHeight * py;
    const zc = $('zctl'); if (zc) { zc.querySelector('[data-z=out]').disabled = zoom <= 1.001; zc.querySelector('[data-z=in]').disabled = zoom >= ZMAX - 0.001; }
  }
  (function zoomCtl() {
    const z = document.createElement('div'); z.id = 'zctl';
    const fs = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
    z.innerHTML = '<button data-z="out" aria-label="Alejar" disabled>−</button><button data-z="in" aria-label="Acercar">+</button>' + (fs ? '<button data-z="fs" aria-label="Pantalla completa">⛶</button>' : '');
    $('boardWrap').appendChild(z);
    z.onclick = ev => {
      const b = ev.target.closest('button'); if (!b) return; ev.stopPropagation();
      if (b.dataset.z === 'in') setZoom(zoom * 1.5); else if (b.dataset.z === 'out') setZoom(zoom / 1.5);
      else { const d = document, fsEl = d.fullscreenElement || d.webkitFullscreenElement; if (fsEl) (d.exitFullscreen || d.webkitExitFullscreen).call(d); else (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen).call(document.documentElement); }
    };
    const bf = $('bframe'); let pin = null, raf = 0;
    const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    bf.addEventListener('touchstart', e => { if (e.touches.length === 2 && document.body.classList.contains('mob')) pin = { d: dist(e.touches), z: zoom }; }, { passive: true });
    bf.addEventListener('touchmove', e => {
      if (!pin || e.touches.length !== 2) return; e.preventDefault();
      const r = bf.getBoundingClientRect(), fx = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left) / r.width, fy = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top) / r.height, nz = pin.z * dist(e.touches) / pin.d;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; setZoom(nz, fx, fy); });
    }, { passive: false });
    bf.addEventListener('touchend', e => { if (e.touches.length < 2) pin = null; }, { passive: true });
  })();
  function resize() {
    applyMob();
    const mob = document.body.classList.contains('mob');
    const w = mob ? $('boardWrap').clientWidth - $('bottom').offsetWidth - 34 : $('boardWrap').clientWidth - 44;
    const hAvail = mob ? window.innerHeight - $('boardWrap').getBoundingClientRect().top - $('msg').offsetHeight - 28 : window.innerHeight - $('boardWrap').getBoundingClientRect().top - $('msg').offsetHeight - 262;
    const S0 = Math.max(mob ? 12 : 16, Math.floor(Math.min(w / W, hAvail / H)));
    const bf = $('bframe');
    if (mob) { S = Math.round(S0 * zoom); bf.style.maxWidth = (w + 10) + 'px'; bf.style.maxHeight = (hAvail + 10) + 'px'; }
    else { S = S0; zoom = 1; bf.style.maxWidth = bf.style.maxHeight = ''; }
    const dpr = Math.min(window.devicePixelRatio || 1, 4096 / (W * S));
    cv.width = Math.round(W * S * dpr); cv.height = Math.round(H * S * dpr); cv.style.width = W * S + 'px'; cv.style.height = H * S + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
  }
  function spriteTo(c, p, size) {
    const sh = IMG[p.sheet], g = c.getContext('2d');
    c.width = size; c.height = size; g.imageSmoothingEnabled = false; g.clearRect(0, 0, size, size);
    if (!sh || !sh.ok) return;
    const cw = sh.width / 4, rows = Math.max(1, Math.round(sh.height / cw)), dw = size;
    g.drawImage(sh, (p.team === 0 ? 2 : 0) * cw, (p.variant % rows) * cw, cw, cw, (size - dw) / 2, (size - dw) / 2, dw, dw);
  }
  function draw() {
    if (!G) return;
    ctx.imageSmoothingEnabled = true;
    if (IMG.pitch.ok) ctx.drawImage(IMG.pitch, 1, 1, 780, 450, 0, 0, W * S, H * S);
    else { ctx.fillStyle = '#2f7a37'; ctx.fillRect(0, 0, W * S, H * S); }
    /* paleta aguacate: aclara y calienta el césped sin tocar la textura */
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = '#8f9a52'; ctx.globalAlpha = 0.42; ctx.fillRect(0, 0, W * S, H * S); ctx.restore();
    ctx.fillStyle = G.teams[0].color + '40'; ctx.fillRect(0, 0, S, H * S);
    ctx.fillStyle = G.teams[1].color + '40'; ctx.fillRect((W - 1) * S, 0, S, H * S);
    if ((ui.phase === 'setup' || ui.phase === 'snap') && ui.limit) for (const p of ui.limit.open) if (p.loc === 'pitch') { ctx.fillStyle = ui.limit.moved.has(p) ? '#ffffff30' : '#f2b63250'; ctx.fillRect(p.x * S + 2, p.y * S + 2, S - 4, S - 4); }
    if (ui.phase === 'turn' && ui.sel) {
      for (const n of ui.moves.values()) {
        ctx.fillStyle = n.prob >= 0.999 ? '#7dffa055' : n.prob >= 0.6 ? '#ffe45c70' : '#ff4d3d85';
        ctx.fillRect(n.x * S + 2, n.y * S + 2, S - 4, S - 4);
        if (n.lab && n.lab.length) {
          const two = n.lab.length > 1, fs = Math.round(S * (two ? 0.3 : 0.4));
          ctx.font = `800 ${fs}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 3; ctx.strokeStyle = '#000c'; ctx.fillStyle = '#fff';
          n.lab.slice(0, 3).forEach((t, k, a) => { const yy = n.y * S + S / 2 + (k - (a.length - 1) / 2) * fs * 0.95; ctx.strokeText(t, n.x * S + S / 2, yy); ctx.fillText(t, n.x * S + S / 2, yy); });
        }
      }
    }
    if (ui.hl && ui.hl.squares) for (const [x, y] of ui.hl.squares) { ctx.fillStyle = ui.hl.color; ctx.fillRect(x * S + 2, y * S + 2, S - 4, S - 4); }
    if (ui.hl && ui.hl.mark && inPitch(ui.hl.mark[0], ui.hl.mark[1])) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(ui.hl.mark[0] * S + 2, ui.hl.mark[1] * S + 2, S - 4, S - 4); }
    if (ui.hover && ui.phase === 'turn' && ui.sel) {
      const n = ui.moves.get(idx(ui.hover[0], ui.hover[1]));
      if (n) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ui.sel.x * S + S / 2, ui.sel.y * S + S / 2); for (const [x, y] of pathOf(n)) ctx.lineTo(x * S + S / 2, y * S + S / 2); ctx.stroke(); }
    }
    for (const p of pitchPlayers()) drawPlayer(p);
    if (ballLoose()) { ctx.imageSmoothingEnabled = false; ctx.drawImage(IMG.ball, G.ball.x * S, G.ball.y * S, S, S); }
    if (G.ballAir && inPitch(G.ballAir[0], G.ballAir[1])) { const [ax, ay] = G.ballAir; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.strokeRect(ax * S + 2, ay * S + 2, S - 4, S - 4); ctx.setLineDash([]); ctx.globalAlpha = 0.7; ctx.drawImage(IMG.ball, ax * S, ay * S - S * 0.3, S, S); ctx.globalAlpha = 1; }
  }
  function drawPlayer(p) {
    const x0 = p.x * S, y0 = p.y * S, sh = IMG[p.sheet], down = p.state !== 'standing';
    const usedNow = G.phase === 'turn' && G.active === p.team && p.used;
    ctx.imageSmoothingEnabled = false;
    if (ui.sel === p) { ctx.fillStyle = '#f2b63255'; ctx.fillRect(x0 + 1, y0 + 1, S - 2, S - 2); ctx.strokeStyle = '#f2b632'; ctx.lineWidth = 2; ctx.strokeRect(x0 + 1, y0 + 1, S - 2, S - 2); }
    if (sh.ok) {
      const cw = sh.width / 4, rows = Math.max(1, Math.round(sh.height / cw)), row = p.variant % rows;
      const col = (p.team === 0 ? 2 : 0) + ((G.cur === p && p.started) ? 1 : 0), sz = S * cw / 30;
      ctx.globalAlpha = down ? 0.6 : usedNow ? 0.5 : 1;
      ctx.drawImage(sh, col * cw, row * cw, cw, cw, x0 + (S - sz) / 2, y0 + (S - sz) / 2, sz, sz);
      ctx.globalAlpha = 1;
    }
    if (p.ex && p.ex.length) { const m = S * 0.36; ctx.fillStyle = '#f2b632'; ctx.strokeStyle = '#121417'; ctx.lineWidth = Math.max(1, S / 18); ctx.beginPath(); ctx.moveTo(x0 + S - m, y0 + 1); ctx.lineTo(x0 + S - 1, y0 + 1); ctx.lineTo(x0 + S - 1, y0 + m); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    if (p.state === 'prone') ctx.drawImage(IMG.prone, x0, y0, S, S);
    if (p.state === 'stunned') ctx.drawImage(IMG.stunned, x0, y0, S, S);
    if (p.distracted) ctx.drawImage(IMG.confused, x0, y0, S, S);
    if (G.ball.carrier === p) ctx.drawImage(IMG.hold, x0, y0, S, S);
  }

  /* ----- paneles ----- */
  function msg(h) { $('msg').innerHTML = h; }
  function count(t, loc) { return G.teams[t].players.filter(p => p.loc === loc).length; }
  function header() {
    for (const i of [0, 1]) {
      const t = G.teams[i], el = $('hd' + i);
      el.style.background = t.color;
      el.querySelector('.nm').textContent = t.name + (i === HT ? ' (tú)' : ' (IA)');
      $('sc' + i).textContent = t.score;
      el.querySelector('.meta').textContent = `Rerolls ${rrLeft(t)} · Apotecario ${t.apo}${t.bribes ? ' · Sobornos ' + t.bribes : ''} · Reserva ${count(i, 'reserve')} · KO ${count(i, 'ko')} · Bajas ${count(i, 'cas') + count(i, 'sent')}`;
      el.classList.toggle('active-team', G.phase === 'turn' && G.active === i);
    }
    dugouts();
    $('clock').innerHTML = `Mitad ${Math.min(2, G.half)}<small>Turno ${G.turn[0]} / ${TURNS} · ${G.turn[1]} / ${TURNS} · <span class="wxi" role="button" tabindex="0" aria-label="Qué significa el clima" title="${WX[G.weather]}: toca para ver qué implica" style="color:${WXI[G.weather][0]}">${WXI[G.weather][1]}</span> ${WX[G.weather]}</small>`;
  }
  function renderCard(el, p, extra, empty) {
    if (!p) { el.innerHTML = `<div class="pempty">${empty}</div>`; return; }
    const loc = { reserve: 'En la reserva', ko: 'Inconsciente (KO)', cas: 'Lesionado', sent: 'Expulsado' }[p.loc];
    const st = loc || (p.state === 'prone' ? 'En el suelo' : p.state === 'stunned' ? 'Aturdido' : p.rooted ? 'Enraizado' : p.distracted ? 'Distraído' : 'De pie');
    const mv = (G.cur === p && p.started) ? `<div class="st">Movimiento restante ${Math.max(0, p.maLeft)} (+${Math.max(0, rushCap(p) - p.rushes)} esprint)</div>` : '';
    const tc = p.team === 0 ? 'var(--blue)' : 'var(--acc)';
    el.innerHTML = `<div class="ph" style="background:${G.teams[p.team].color || tc}"><div class="pn">${nm(p)}</div><div class="pp">${p.pos !== p.name ? p.pos : G.teams[p.team].name}</div></div>
      <div class="pimg"><canvas width="96" height="96"></canvas></div><div class="pb">
      <div class="sgrid"><div><b>MA</b><span>${p.ma}</span></div><div><b>ST</b><span>${p.st}</span></div><div><b>AG</b><span>${p.ag}+</span></div><div><b>PA</b><span>${p.noPA ? '-' : p.pa + '+'}</span></div><div><b>AV</b><span>${p.av}+</span></div></div>
      <ul>${p.skList.map(k => `<li${p.ex.includes(k) ? ' class="x"' : ''}>${k}${p.ex.includes(k) ? ' ★' : ''}</li>`).join('') || '<li style="color:#5b616a">Sin habilidades</li>'}</ul>
      <div class="st">${st}${G.ball.carrier === p ? ' · Lleva el balón' : ''}</div>${mv}${extra ? `<div class="ex">${extra}</div>` : ''}</div>`;
    spriteTo(el.querySelector('canvas'), p, 96);
  }
  /* celular: cartel flotante con el equipo y la ficha resumida del jugador tocado (el panel Rival queda escondido en un cajón) */
  let tipT = 0;
  function mobTip(p) {
    if (!document.body.classList.contains('mob') || !p) return;
    let el = $('mtip'); if (!el) { el = document.createElement('div'); el.id = 'mtip'; $('boardWrap').appendChild(el); }
    const t = G.teams[p.team], mine = p.team === HT;
    el.style.setProperty('--tc', t.color || (mine ? 'var(--blue)' : 'var(--acc)'));
    el.innerHTML = `<b class="who">${mine ? 'TU EQUIPO' : 'RIVAL'}</b><b class="tn">${t.name}</b><span class="pl">${nm(p)}${p.pos !== p.name ? ' · ' + p.pos : ''}</span><span class="ss">MA${p.ma} ST${p.st} AG${p.ag}+ AV${p.av}+</span><span class="sk">${p.skList.join(', ')}</span>`;
    el.classList.add('on'); clearTimeout(tipT); tipT = setTimeout(() => el.classList.remove('on'), 5000);
  }
  function card(p, extra) { renderCard($('cardR'), p, extra, 'Pasa el cursor sobre un jugador, en la cancha o en las reservas.'); mobTip(p); }
  function showSel(extra) { renderCard($('cardL'), ui.sel, extra, 'Haz clic en uno de tus jugadores.'); }
  let dugSig = ['', ''];
  function dugouts() {
    for (const i of [0, 1]) {
      const t = G.teams[i], el = $(i === 0 ? 'dugL' : 'dugR');
      const groups = [['Reserva', t.players.filter(p => p.loc === 'reserve')], ['KO', t.players.filter(p => p.loc === 'ko')], ['Bajas y expulsados', t.players.filter(p => p.loc === 'cas' || p.loc === 'sent')]];
      const sig = t.name + '|' + groups.map(g => g[1].map(p => p.id + (p.heat ? 'h' : '')).join(',')).join('|') + '|' + ui.phase + (IMG[t.players[0].sheet].ok ? 1 : 0);
      if (sig === dugSig[i]) continue;
      dugSig[i] = sig; el.innerHTML = '';
      for (const [title, ps] of groups) {
        const h = document.createElement('h4'); h.textContent = `${title} (${ps.length})`; el.appendChild(h);
        const box = document.createElement('div'); box.className = 'slots'; el.appendChild(box);
        for (const p of ps) {
          const c = document.createElement('canvas'); spriteTo(c, p, 60); if (p.heat || p.loc !== 'reserve') c.style.opacity = .55;
          c.onmouseenter = () => card(p);
          c.onclick = () => { card(p); if (i === HT && ui.phase === 'setup' && !ui.limit && p.loc === 'reserve' && !p.heat) benchSwap(p); };
          box.appendChild(c);
        }
      }
    }
  }
  function buttons() {
    const s = ui.sel, turn = ui.phase === 'turn' && !ui.busy, fresh = turn && s && !s.started;
    const set = (id, en, on) => { $(id).disabled = !en; $(id).classList.toggle('on', !!on); };
    set('bBlitz', fresh && !G.blitzUsed, ui.mode === 'blitz');
    set('bPass', fresh && !G.passUsed && !has(s, 'My Ball') && !s.noPA, ui.mode === 'pass');
    set('bHand', fresh && !G.handUsed && !has(s, 'My Ball'), ui.mode === 'handoff');
    set('bFoul', fresh && !G.foulUsed, ui.mode === 'foul');
    set('bSecure', fresh && canSecure(s) && ui.moves.has(idx(G.ball.x, G.ball.y)));
    set('bStand', fresh && s.state === 'prone');
    set('bTTM', fresh && has(s, 'Throw Team-mate') && !G.ttmUsed, ui.mode === 'ttm');
    set('bVomit', fresh && has(s, 'Projectile Vomit') && s.state === 'standing' && !G.charge, ui.mode === 'vomit');
    $('bTTM').hidden = !(ui.phase === 'turn' && s && has(s, 'Throw Team-mate'));
    $('bVomit').hidden = !(ui.phase === 'turn' && s && has(s, 'Projectile Vomit'));
    set('bStab', fresh && has(s, 'Stab') && s.state === 'standing' && !G.charge, ui.mode === 'stab');
    $('bStab').hidden = !(ui.phase === 'turn' && s && has(s, 'Stab'));
    set('bPunt', turn && s && has(s, 'Punt') && ((!s.started && !G.puntUsed) || (s.started && s.action === 'punt')), ui.mode === 'punt');
    $('bPunt').hidden = !(ui.phase === 'turn' && s && has(s, 'Punt'));
    set('bEndAct', turn && s && (s.started || s.state === 'prone'));
    $('bEndAct').textContent = (s && !s.started && s.state === 'prone') ? 'Levantarse y terminar' : 'Terminar activación';
    set('bEndTurn', turn);
    const stp = ui.phase === 'setup' || ui.phase === 'snap';
    $('bReady').hidden = !stp;
    $('bLineup').hidden = !(ui.phase === 'setup' && !ui.limit && G.teams[HT].players.filter(q => (q.loc === 'pitch' || q.loc === 'reserve') && !q.heat).length > 11);
    for (const id of ['bBlitz', 'bPass', 'bHand', 'bFoul', 'bSecure', 'bStand', 'bEndAct', 'bEndTurn']) $(id).hidden = stp;
    $('bench').hidden = true;
  }
  function benchSwap(r) {
    const s = ui.sel; if (!s || s.loc !== 'pitch') { msg('Primero selecciona en el campo al jugador que sale.'); return; }
    r.loc = 'pitch'; r.x = s.x; r.y = s.y; r.state = 'standing'; s.loc = 'reserve'; s.x = s.y = -1; ui.sel = null;
    header(); buttons(); draw(); showSel(); card(r);
  }
  function turnMsg() {
    if (G.charge) return `<b>¡Carga!</b> Puedes activar hasta ${G.charge.left} jugador${G.charge.left === 1 ? '' : 'es'} libre${G.charge.left === 1 ? '' : 's'}: movimiento gratis, y uno puede hacer blitz. Aprieta "Terminar turno" al terminar.`;
    return `<b>Tu turno ${G.turn[HT]} de ${TURNS}.</b> Selecciona un jugador o termina el turno.`;
  }
  function refresh() {
    if (!G) return;
    if (ui.sel && (ui.sel.loc !== 'pitch' || ui.sel.used || ui.sel.state === 'stunned')) { ui.sel = null; ui.mode = 'move'; }
    ui.moves = (ui.phase === 'turn' && ui.sel) ? computeMoves(ui.sel, { action: ui.mode }) : new Map();
    if (ui.sel && ui.sel.state !== 'standing' && ui.sel.started) ui.moves = new Map();
    header(); buttons(); draw();
    showSel();
  }
  render = () => { if (SIM) return; header(); draw(); };
  flash = t => { if (SIM) return; const f = $('flash'); f.textContent = t; f.style.opacity = 1; setTimeout(() => { f.style.opacity = 0; }, 1100); };
  const addLog = (t, cls) => { const el = document.createElement('div'); if (cls) el.className = cls; el.textContent = t; const L = $('log'); L.appendChild(el); L.scrollTop = L.scrollHeight; };
  let ulog = [], curMode = 'quick', lastSnap = null, hist = [], reviewing = false;
  onLog = (t, cls) => { ulog.push([t, cls]); if (ulog.length > 160) ulog.shift(); addLog(t, cls); };

  /* ----- turno humano ----- */
  function select(p) {
    if (ui.sel && ui.sel !== p && ui.sel.started) finish(ui.sel);
    clearBlitzMark(); ui.sel = p; ui.mode = 'move'; refresh(); if (!p) card(null);
  }
  async function guard(fn) {
    if (ui.busy) return; ui.busy = true; buttons();
    try { await fn(); } catch (e) { console.error(e); onLog('Error interno: ' + e.message, 'bad'); }
    ui.busy = false;
    if (ui.phase === 'turn' && (G.turnover || G.td != null)) { endHumanTurn(); return; }
    refresh();
    if (ui.phase === 'turn') msg(ui.sel ? hint() : turnMsg());
  }
  function hint() {
    const s = ui.sel;
    if (ui.mode === 'blitz') return '<b>Blitz.</b> Haz clic en el rival al que quieres golpear para marcarlo; después eliges por dónde llegar. También puedes moverlo antes casilla por casilla.';
    if (ui.mode === 'pass') return '<b>Pase.</b> Mueve al lanzador si quieres y luego haz clic en el compañero que recibe.';
    if (ui.mode === 'handoff') return '<b>Entrega en mano.</b> Mueve al portador y luego haz clic en un compañero adyacente.';
    if (ui.mode === 'foul') return '<b>Falta.</b> Mueve al jugador y luego haz clic en un rival caído adyacente.';
    if (ui.mode === 'ttm') return '<b>Lanzar compañero.</b> Mueve al lanzador si quieres, luego haz clic en un compañero adyacente con Right Stuff y después en la casilla de destino.';
    if (ui.mode === 'punt') return '<b>Despeje.</b> Mueve al jugador si quieres y luego haz clic sobre él para patear el balón. Eliges hacia dónde apunta; el balón sale en esa dirección o en una diagonal, de 1 a 6 casillas.';
    if (ui.mode === 'stab') return '<b>Apuñalar.</b> Haz clic en un rival de pie adyacente: tirada de armadura sin modificar, y herida si se rompe. Para moverte antes, usa Blitz y elige apuñalar.';
    if (ui.mode === 'vomit') return '<b>Vómito.</b> Haz clic en un rival de pie adyacente. Con 2+ sufre una tirada de armadura; con 1 la sufre tu jugador.';
    if (G.ball.carrier === s && !s.started && !G.charge && freeScore(s)) return `<b>${nm(s)}</b> puede anotar sin tirar dados. Si lo activas y no anota, cuenta como <b>Stalling</b> y el público puede derribarlo.`;
    return `<b>${nm(s)}.</b> ${s.rooted ? 'Está enraizado: no puede moverse, pero sí bloquear' : 'Clic en una casilla marcada para mover'}${!s.started && (s.state === 'standing' || has(s, 'Jump Up')) ? ', o en un rival adyacente para bloquear' : ''}.`;
  }
  function endHumanTurn() {
    ui.phase = 'idle'; ui.sel = null; ui.moves = new Map(); refresh(); card(null);
    msg('Juega la IA…');
    const r = ui.turnRes; ui.turnRes = null; if (r) r();
  }
  async function ensureStarted(action) {
    const s = ui.sel; if (s.started) return true;
    const ok = await begin(s, action);
    if (!ok) { ui.sel = null; ui.mode = 'move'; }
    return ok;
  }
  async function confirmBlock(s, e, canStab) {
    if (!canStab && !has(e, 'Foul Appearance')) return 'follow';
    const info = blockDice(s, e, s.st + (ui.mode === 'blitz' && has(s, 'Horns') ? 1 : 0)), fz = has(s, 'Frenzy');
    const who = info.attChooses ? 'eliges tú' : 'elige el rival';
    const notes = (has(s, 'Dauntless') && e.st > s.st ? '<p>Dauntless: antes de tirar puede igualar la fuerza del rival.</p>' : '') + (has(e, 'Foul Appearance') ? '<p>El rival tiene Foul Appearance: con un 1 pierdes la acción.</p>' : '');
    const btn = [{ label: 'Bloquear', value: 'follow', primary: true }];
    if (canStab) btn.push({ label: 'Apuñalar', value: 'stab' });
    btn.push({ label: 'Cancelar', value: null });
    return ask(`<h2>Bloquear a ${nm(e)}</h2><p>${nm(s)} (fuerza ${info.a}) contra ${nm(e)} (fuerza ${info.b}).</p><p><b>${info.n} dado${info.n > 1 ? 's' : ''}</b>, ${who}.</p>${notes}`, btn);
  }
  /* Blitz en dos pasos: primero se marca al rival, después se elige por dónde llegar */
  function clearBlitzMark() { ui.blitzTarget = null; if (ui.hl && ui.hl.blitz) ui.hl = null; }
  function markBlitz(s, q) {
    const mv = computeMoves(s, { reserve: 1, action: 'blitz' }), sq = [];
    for (const [dx, dy] of DIRS) { const n = mv.get(idx(q.x + dx, q.y + dy)); if (n) sq.push([q.x + dx, q.y + dy]); }
    if (!sq.length) { clearBlitzMark(); msg('Ese rival está fuera del alcance del blitz.'); return; }
    ui.blitzTarget = q; ui.hl = { squares: sq, color: '#ffffff66', mark: [q.x, q.y], blitz: true }; draw();
    msg(`<b>Blitz a ${nm(q)} marcado.</b> Elige una casilla blanca, desde donde lo golpearás: tu jugador va hasta ahí y bloquea. También puedes avanzar casilla por casilla. Clic de nuevo en ${nm(q)} para ir por la ruta más segura.`);
  }
  async function runBlitz(s, q, adj, chosen) {
    let best = chosen;
    if (!adj || s.state === 'prone') {
      const mv = computeMoves(s, { reserve: 1, action: 'blitz' });
      if (!best) {
        if (adj && s.state === 'prone' && (s.ma >= 4 || has(s, 'Jump Up'))) best = { prob: 1, rolls: 0, prev: null };
        else {
          const bq = ballLoose() ? idx(G.ball.x, G.ball.y) : -1;
          const better = (a, b) => { const ba = a.i === bq ? 1 : 0, bb = b.i === bq ? 1 : 0; if (ba !== bb) return ba < bb; if (Math.abs(a.prob - b.prob) > 1e-9) return a.prob > b.prob; if (a.rolls !== b.rolls) return a.rolls < b.rolls; return a.steps < b.steps; };
          for (const [dx, dy] of DIRS) { const n = mv.get(idx(q.x + dx, q.y + dy)); if (n && (!best || better(n, best))) best = n; }
        }
      }
      if (!best) { msg('Ese rival está fuera del alcance del blitz.'); return; }
      if (best.prob < 0.999) {
        const ok = await ask(`<h2>Blitz con riesgo</h2><p>Llegar hasta ${nm(q)} pide ${best.rolls} tirada${best.rolls > 1 ? 's' : ''}. Éxito aproximado: <b>${Math.round(best.prob * 100)}%</b>.</p>`, [{ label: 'Ir', value: true, primary: true }, { label: 'Cancelar', value: false }]);
        if (!ok) return;
      }
      if (!(await ensureStarted('blitz'))) return;
      if (best.prev) { const r = await moveAlong(s, pathOf(best)); if (r !== 'ok') { clearBlitzMark(); return; } }
      if (cheb(s.x, s.y, q.x, q.y) !== 1 || q.state !== 'standing') { clearBlitzMark(); return; }
      refresh();
    }
    clearBlitzMark();
    const c = await confirmBlock(s, q, has(s, 'Stab')); if (!c) return;
    if (!(await ensureStarted('blitz'))) return;
    await blitzBlock(s, q, c === 'follow', c === 'stab');
    if (s.state !== 'standing' || s.loc !== 'pitch') { finish(s); ui.sel = null; }
  }
  async function doMove(node) {
    const s = ui.sel;
    if (node.prob < 0.999) {
      const ok = await ask(`<h2>Movimiento con riesgo</h2><p>Llegar ahí pide ${node.rolls} tirada${node.rolls > 1 ? 's' : ''} (esquivar o esprintar). Probabilidad aproximada de éxito: <b>${Math.round(node.prob * 100)}%</b>.</p>`,
        [{ label: 'Mover', value: true, primary: true }, { label: 'Cancelar', value: false }]);
      if (!ok) return;
    }
    if (!(await ensureStarted(ui.mode))) return;
    const r = await moveAlong(s, pathOf(node));
    if (s.action === 'secure' && r !== 'blocked') { finish(s); ui.sel = null; }
  }
  async function clickTurn(x, y, go) {
    const q = playerAt(x, y), s = ui.sel;
    if (q && q === s && ui.mode === 'punt' && G.ball.carrier === s && s.state === 'standing') {
      const dir = await ask(`<h2>Despeje</h2><p>¿Hacia dónde apunta ${nm(s)}? El balón sale recto o en diagonal (D3) y recorre de 1 a 6 casillas. Si lo atrapa un rival o sale del campo, es turnover.</p>`,
        [{ label: 'Hacia la zona rival', value: 'r', primary: true }, { label: 'Hacia tu zona', value: 'l' }, { label: 'Hacia arriba', value: 'u' }, { label: 'Hacia abajo', value: 'd' }, { label: 'Cancelar', value: null }]);
      if (!dir) return;
      if (!(await ensureStarted('punt'))) return;
      const v = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] }[dir];
      await punt(s, v[0], v[1]); ui.sel = null; return;
    }
    if (q && q === s) { showCtx(x, y); return; }
    if (q && q.team === HT) {
      if (s && s !== q && G.ball.carrier === s && ui.mode === 'handoff' && cheb(s.x, s.y, x, y) === 1 && hasTZ(q)) {
        if (!(await ensureStarted('handoff'))) return; await handoff(s, q); ui.sel = null; return;
      }
      if (s && s !== q && G.ball.carrier === s && ui.mode === 'pass') {
        const band = rangeBand(s.x, s.y, x, y);
        if (band < 0) { msg('Ese compañero está fuera de alcance.'); return; }
        if (wx('blizzard') && band > 1) { msg('Con ventisca solo se permiten pases rápidos y cortos.'); return; }
        const need = Math.min(6, Math.max(2, s.pa + band + markers(s).length + (wx('sunny') ? 1 : 0)));
        const ok = await ask(`<h2>Pase a ${nm(q)}</h2><p>Pase ${BAND_NAME[band]}. ${nm(s)} necesita <b>${need}+</b> para un pase preciso.</p>`, [{ label: 'Lanzar', value: true, primary: true }, { label: 'Cancelar', value: false }]);
        if (!ok) return;
        if (!(await ensureStarted('pass'))) return; await pass(s, x, y); ui.sel = null; return;
      }
      if (s && s !== q && ui.mode === 'ttm' && has(s, 'Throw Team-mate') && has(q, 'Right Stuff') && q.state !== 'stunned' && cheb(s.x, s.y, x, y) === 1 && s.state === 'standing') {
        const sqs = [];
        for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) { if (xx === s.x && yy === s.y) continue; const b = rangeBand(s.x, s.y, xx, yy); if (b === 0 || b === 1) sqs.push([xx, yy]); }
        msg(`<b>Lanzar a ${nm(q)}.</b> Elige la casilla de destino entre las marcadas. Clic en el lanzador para cancelar.`);
        ui.hl = { squares: sqs, color: '#6fb6ff55' }; draw();
        const [tx, ty] = await new Promise(res => { ui.pick = { ok: (a, b) => (a === s.x && b === s.y) || sqs.some(k => k[0] === a && k[1] === b), res }; });
        ui.hl = null;
        if (tx === s.x && ty === s.y) return;
        const band = rangeBand(s.x, s.y, tx, ty), need = Math.min(6, Math.max(2, s.pa + band + markers(s).length + (wx('sunny') ? 1 : 0)));
        const ok = await ask(`<h2>Lanzar a ${nm(q)}</h2><p>Lanzamiento ${BAND_NAME[band]}: ${nm(s)} necesita <b>${need}+</b>. El compañero se dispersa 3 casillas desde el destino y luego tiene que aterrizar.</p>`, [{ label: 'Lanzar', value: true, primary: true }, { label: 'Cancelar', value: false }]);
        if (!ok) return;
        if (!(await ensureStarted('ttm'))) return;
        await throwTeammate(s, q, tx, ty); ui.sel = null; return;
      }
      if (!q.used && q.state !== 'stunned' && q !== s) { select(q); return; }
      card(q); return;
    }
    if (!s) { if (q) card(q); return; }
    if (q) {
      const adj = cheb(s.x, s.y, x, y) === 1;
      if (ui.mode === 'foul') {
        if (q.state === 'standing' || !adj || s.state !== 'standing') { msg('La falta es contra un rival caído y adyacente.'); return; }
        if (!(await ensureStarted('foul'))) return; await foul(s, q); ui.sel = null; return;
      }
      if (q.state !== 'standing') return;
      if (ui.mode === 'stab') {
        if (!adj || s.state !== 'standing' || s.started) { msg('Apuñalar es contra un rival de pie adyacente, sin haberse movido.'); return; }
        if (!(await ensureStarted('stab'))) return; await stab(s, q); ui.sel = null; return;
      }
      if (ui.mode === 'vomit') {
        if (!adj || s.state !== 'standing' || s.started) { msg('El Vómito es contra un rival de pie adyacente, sin haberse movido.'); return; }
        if (!(await ensureStarted('vomit'))) return; await vomit(s, q); ui.sel = null; return;
      }
      if (ui.mode === 'blitz') {
        if (s.blitzBlocked) return;
        if (!adj && ui.blitzTarget !== q) { markBlitz(s, q); return; }
        await runBlitz(s, q, adj, null);
        return;
      }
      if (ui.mode === 'move' && !s.started && !go) {
        const items = [], canBlock = adj && (s.state === 'standing' || has(s, 'Jump Up')) && !G.charge;
        if (canBlock) { const bi = blockDice(s, q); items.push([`Bloquear · F${bi.a} vs ${bi.b} · ${bi.n} dado${bi.n > 1 ? 's' : ''}${bi.attChooses ? '' : ' (elige el rival)'}`, () => guard(() => clickTurn(x, y, 'block')), 'pri']); }
        if (!G.blitzUsed && !s.blitzBlocked && !G.charge) {
          let lab = null;
          if (adj && s.state === 'standing') { const bi = blockDice(s, q); lab = `Blitz · F${bi.a} vs ${bi.b} · ${bi.n} dado${bi.n > 1 ? 's' : ''}`; }
          else if (adj && s.state === 'prone') { if (s.ma >= 4 || has(s, 'Jump Up')) lab = 'Blitz (se levanta primero)'; }
          else {
            const mv = computeMoves(s, { reserve: 1, action: 'blitz' }); let pr = -1;
            for (const [dx, dy] of DIRS) { const n = mv.get(idx(x + dx, y + dy)); if (n && n.prob > pr) pr = n.prob; }
            if (pr >= 0) lab = pr >= 0.999 ? 'Blitz · sin tiradas para llegar' : `Blitz · ${Math.round(pr * 100)}% de llegar`;
          }
          if (lab) items.push([lab, () => { ui.mode = 'blitz'; refresh(); guard(() => clickTurn(x, y, 'blitz')); }, canBlock ? '' : 'pri']);
        }
        if (!items.length) { msg(G.blitzUsed ? 'Ese rival no está al lado y ya usaste el Blitz de este turno.' : 'Ese rival está fuera del alcance del Blitz.'); return; }
        items.push(['No hacer nada', () => {}]);
        showMenu(x, y, items); return;
      }
      if (ui.mode === 'move' && !s.started && (s.state === 'standing' || has(s, 'Jump Up')) && adj && !G.charge) {
        const c = await confirmBlock(s, q); if (!c) return;
        if (!(await ensureStarted('block'))) return;
        await block(s, q, c === 'follow'); finish(s); ui.sel = null; return;
      }
      card(q); return;
    }
    const node = ui.moves.get(idx(x, y));
    if (ui.mode === 'blitz' && ui.blitzTarget && node) {
      const t = ui.blitzTarget;
      if (t.loc === 'pitch' && t.state === 'standing' && cheb(x, y, t.x, t.y) === 1) { await runBlitz(s, t, false, node); return; }
      await doMove(node);
      if (ui.sel === s && ui.blitzTarget && t.loc === 'pitch' && t.state === 'standing') { if (cheb(s.x, s.y, t.x, t.y) === 1) { clearBlitzMark(); msg('<b>Blitz.</b> Ya estás al lado: clic en ' + nm(t) + ' para bloquear.'); } else markBlitz(s, t); }
      return;
    }
    if (node && !(s.started && s.action === 'block')) { await doMove(node); return; }
    if (!node && ui.mode === 'pass' && G.ball.carrier === s && s.state === 'standing') {
      const band = rangeBand(s.x, s.y, x, y);
      if (band < 0 || (wx('blizzard') && band > 1)) { msg('Esa casilla está fuera de alcance.'); return; }
      const need = Math.min(6, Math.max(2, s.pa + band + markers(s).length + (wx('sunny') ? 1 : 0)));
      const ok = await ask(`<h2>Pase a una casilla vacía</h2><p>Pase ${BAND_NAME[band]}: ${nm(s)} necesita <b>${need}+</b>. Si nadie de tu equipo se queda con el balón, es turnover.</p>`, [{ label: 'Lanzar', value: true, primary: true }, { label: 'Cancelar', value: false }]);
      if (!ok) return;
      if (!(await ensureStarted('pass'))) return; await pass(s, x, y); ui.sel = null;
    }
  }
  function clickSetup(x, y) {
    const q = playerAt(x, y), s = ui.sel, L = ui.limit;
    if (L) {
      if (q && q.team === HT) { if (L.open.has(q) && (L.moved.has(q) || L.moved.size < L.n)) ui.sel = q; else msg(L.open.has(q) ? `Ya moviste el máximo de ${L.n} jugadores.` : 'Ese jugador no está libre: tiene un rival adyacente.'); }
      else if (s && !q && (ui.phase === 'snap' ? cheb(s.x, s.y, x, y) === 1 && !L.moved.has(s) : inHalf(x, HT))) { s.x = x; s.y = y; L.moved.add(s); ui.sel = null; }
    } else if (q && q.team === HT) {
      if (s && s !== q) { const tx = s.x, ty = s.y; s.x = q.x; s.y = q.y; q.x = tx; q.y = ty; ui.sel = null; }
      else ui.sel = q;
    } else if (s && !q && inHalf(x, HT)) { s.x = x; s.y = y; ui.sel = null; }
    header(); buttons(); draw(); showSel();
  }
  function hideCtx() { $('ctx').hidden = true; }
  async function standAndEnd() {
    const s = ui.sel; if (!s) return;
    if (s.state === 'prone' && !s.started) { if (!(await ensureStarted('move'))) return; }
    if (ui.sel) { finish(ui.sel); ui.sel = null; }
  }
  function showCtx(x, y) {
    const s = ui.sel, items = [];
    const add = (label, fn) => items.push([label, fn]);
    if (s.started) add('Terminar acción', () => guard(async () => { if (ui.sel) { finish(ui.sel); ui.sel = null; } }));
    else {
      if (s.state === 'prone') add('Levantarse y terminar acción', () => guard(standAndEnd));
      add('Terminar acción (no hará nada este turno)', () => guard(async () => { if (ui.sel) { finish(ui.sel); ui.sel = null; } }));
      add('Soltar jugador', () => { ui.sel = null; ui.mode = 'move'; refresh(); msg(turnMsg()); });
    }
    showMenu(x, y, items);
  }
  function showMenu(x, y, items) {
    const el = $('ctx'), r = cv.getBoundingClientRect();
    el.innerHTML = '';
    for (const [label, fn, cls] of items) { const b = document.createElement('button'); b.textContent = label; if (cls) b.className = cls; b.onclick = ev => { ev.stopPropagation(); hideCtx(); fn(); }; el.appendChild(b); }
    el.hidden = false;
    const w = el.offsetWidth, h = el.offsetHeight;
    let left = r.left + (x + 1) * S + 4, top = r.top + y * S;
    if (left + w > window.innerWidth - 8) left = r.left + x * S - w - 4;
    if (top + h > window.innerHeight - 8) top = window.innerHeight - h - 8;
    el.style.left = left + 'px'; el.style.top = top + 'px';
  }
  document.addEventListener('mousedown', ev => { if (!$('ctx').hidden && !$('ctx').contains(ev.target)) hideCtx(); });
  function sqOf(ev) { const r = cv.getBoundingClientRect(); return [Math.floor((ev.clientX - r.left) / S), Math.floor((ev.clientY - r.top) / S)]; }
  cv.addEventListener('click', ev => {
    const [x, y] = sqOf(ev); if (!inPitch(x, y) || !G) return;
    if (fromTouch()) { ui.hover = null; hoverAt(x, y); }
    if (reviewing) { const q = playerAt(x, y); if (q) card(q); return; }
    if (ui.pick) { if (ui.pick.ok(x, y)) { const p = ui.pick; ui.pick = null; p.res([x, y]); } else { const m = $('msg'); m.classList.remove('blink'); void m.offsetWidth; m.classList.add('blink'); } return; }
    if (ui.phase === 'setup' || ui.phase === 'snap') { clickSetup(x, y); return; }
    if (ui.phase === 'turn') guard(() => clickTurn(x, y));
    else { const q = playerAt(x, y); if (q) card(q); }
  });
  let lastTouch = 0; cv.addEventListener('touchstart', () => { lastTouch = Date.now(); }, { passive: true });
  const fromTouch = () => Date.now() - lastTouch < 1000;
  function hoverAt(x, y) {
    if (!G || !inPitch(x, y)) return;
    if (ui.hover && ui.hover[0] === x && ui.hover[1] === y) return;
    ui.hover = [x, y];
    const q = playerAt(x, y);
    if (q) {
      let extra = '';
      if (ui.phase === 'turn' && ui.sel && q.team !== HT && q.state === 'standing' && cheb(ui.sel.x, ui.sel.y, x, y) === 1) { const i = blockDice(ui.sel, q); extra = `Fuerza ${i.a} vs ${i.b}${i.off + i.de ? ` (asistencias +${i.off} / +${i.de}${i.gOff.length + i.gDef.length ? ', con Guard' : ''})` : ''}<br>Bloqueo: <b>${i.n} dado${i.n > 1 ? 's' : ''}</b>, ${i.attChooses ? 'eliges tú' : 'elige el rival'}`; }
      card(q, extra);
    } else if (ui.sel && ui.phase === 'turn') {
      const n = ui.moves.get(idx(x, y));
      showSel(n ? (n.prob >= 0.999 ? 'Movimiento seguro, sin tiradas' : `Éxito aproximado <b>${Math.round(n.prob * 100)}%</b> (${n.rolls} tirada${n.rolls > 1 ? 's' : ''})`) : '');
    }
    draw();
  }
  /* en iPhone el mousemove que cambia contenido se come el clic: con el dedo se ignora y la info se muestra dentro del clic */
  cv.addEventListener('mousemove', ev => { if (fromTouch()) return; const [x, y] = sqOf(ev); hoverAt(x, y); });
  cv.addEventListener('mouseleave', () => { ui.hover = null; draw(); });

  function modeBtn(id, mode) { $(id).onclick = () => { if (ui.busy || !ui.sel || ui.sel.started) return; clearBlitzMark(); ui.mode = ui.mode === mode ? 'move' : mode; refresh(); msg(hint()); }; }
  modeBtn('bBlitz', 'blitz'); modeBtn('bPass', 'pass'); modeBtn('bHand', 'handoff'); modeBtn('bFoul', 'foul'); modeBtn('bTTM', 'ttm'); modeBtn('bVomit', 'vomit'); modeBtn('bStab', 'stab'); modeBtn('bPunt', 'punt');
  $('bSecure').onclick = () => guard(async () => {
    const s = ui.sel, node = ui.moves.get(idx(G.ball.x, G.ball.y)); if (!s || !node || !canSecure(s)) return;
    if (node.prob < 0.999) { const ok = await ask(`<h2>Asegurar balón</h2><p>Llegar al balón pide tiradas. Éxito aproximado: <b>${Math.round(node.prob * 100)}%</b>.</p>`, [{ label: 'Ir', value: true, primary: true }, { label: 'Cancelar', value: false }]); if (!ok) return; }
    if (!(await begin(s, 'secure'))) { ui.sel = null; return; }
    await moveAlong(s, pathOf(node)); finish(s); ui.sel = null;
  });
  $('bStand').onclick = () => guard(async () => { if (ui.sel && !ui.sel.started) await ensureStarted(ui.mode); });
  $('bEndAct').onclick = () => guard(standAndEnd);
  $('bEndTurn').onclick = () => { if (ui.busy || ui.phase !== 'turn') return; if (ui.sel && ui.sel.started) finish(ui.sel); endHumanTurn(); };
  $('bReady').onclick = () => {
    const pr = ui.phase === 'snap' ? null : setupProblem(HT); if (pr) { msg('<b>Formación inválida.</b> ' + pr); return; }
    const r = ui.setupRes; ui.setupRes = null; if (r) r();
  };
  $('speed').onchange = e => { DELAY = +e.target.value; };
  /* ----- revisión de turnos ya jugados: solo lectura, sin tocar la partida en curso ----- */
  async function reviewTurns() {
    const liveG = G, liveStr = snapG(), prev = { phase: ui.phase, sel: ui.sel, mode: ui.mode, moves: ui.moves, hl: ui.hl, pick: ui.pick, hover: ui.hover, msg: $('msg').innerHTML, dfx: $('dfx').style.display };
    const items = hist.concat([{ str: liveStr, now: true, score: liveG.teams[0].score + ' a ' + liveG.teams[1].score, label: 'Ahora (donde va la partida)' }]);
    let i = Math.max(0, items.length - 2);
    const bar = document.createElement('div'); bar.id = 'reviewBar';
    bar.innerHTML = '<div class="rv-t"><b>Modo revisión</b><span>solo lectura</span></div><button id="rvPrev">◀ Anterior</button><div class="rv-m" id="rvInfo"></div><button id="rvNext">Siguiente ▶</button><button id="rvExit" class="primary">Volver a la pausa</button>';
    document.body.appendChild(bar);
    reviewing = true; document.body.classList.add('reviewing'); $('dfx').style.display = 'none';
    const show = () => {
      const it = items[i];
      restoreG(it.str);
      ui.phase = 'review'; ui.sel = null; ui.mode = 'move'; ui.moves = new Map(); ui.hl = null; ui.pick = null; ui.hover = null; dugSig = ['', ''];
      header(); buttons(); draw(); card(null); showSel();
      $('rvInfo').innerHTML = `<b>${it.label}</b><small>${it.now ? '' : 'Estado al empezar ese turno · '}Marcador ${it.score} · ${i + 1} de ${items.length}</small>`;
      $('rvPrev').disabled = i === 0; $('rvNext').disabled = i === items.length - 1;
      msg(it.now ? '<b>Revisión.</b> Esto es la partida tal como está ahora. No se puede cambiar nada desde acá.' : '<b>Revisión.</b> Estás viendo el tablero justo antes de que jugara ese turno. Pasa el cursor sobre un jugador para ver su ficha.');
    };
    await new Promise(done => {
      const go = d => { const n = i + d; if (n >= 0 && n < items.length) { i = n; show(); } };
      const key = ev => { if (ev.key === 'ArrowLeft') go(-1); else if (ev.key === 'ArrowRight') go(1); else if (ev.key === 'Escape') end(); else return; ev.preventDefault(); ev.stopPropagation(); };
      const end = () => { document.removeEventListener('keydown', key, true); done(); };
      $('rvPrev').onclick = () => go(-1); $('rvNext').onclick = () => go(1); $('rvExit').onclick = end;
      document.addEventListener('keydown', key, true);
      show();
    });
    bar.remove(); reviewing = false; document.body.classList.remove('reviewing');
    G = liveG; Object.assign(ui, { phase: prev.phase, sel: prev.sel, mode: prev.mode, moves: prev.moves, hl: prev.hl, pick: prev.pick, hover: prev.hover });
    $('dfx').style.display = prev.dfx; dugSig = ['', '']; header(); buttons(); draw(); card(null); showSel(); msg(prev.msg);
  }
  async function pauseMenu() {
    if (reviewing || !G || G.phase === 'over' || ui.phase === 'menu' || !$('modal').hidden || !lastSnap || !(G.mgr || G.teams[0].ctrl instanceof Human)) return;
    setPause(true);
    const live = ui.phase === 'turn' && !ui.busy && !ui.pick && G.phase === 'turn' && G.active === 0;
    const where = lastSnap.k === 'drive' ? 'la formación de esta entrada' : `el inicio de este turno de ${G.teams[lastSnap.a].name}`;
    const note = live ? 'Se guarda la partida tal como está ahora.' : `Hay una jugada en curso: se guarda desde ${where}.`;
    let c;
    for (;;) {
      c = await ask(`<h2>Pausa</h2><p>${matchDesc()}</p><p class="sub">${note}</p>`,
      [{ label: 'Continuar', value: 'go', primary: true }, { label: 'Ver turnos anteriores', value: 'rev' }, { label: 'Ver tutorial de la pantalla', value: 'tut' }, { label: 'Guardar partida', value: 'save' }, { label: 'Guardar y volver al menú', value: 'savemenu' }, { label: 'Descargar archivo de guardado', value: 'dl' }, { label: 'Salir sin guardar', value: 'quit' }]);
      if (c !== 'rev' && c !== 'tut') break;
      if (c === 'rev') await reviewTurns(); else await tutorial();
    }
    const snap = live ? { k: 'turn', a: 0, str: snapG(), desc: matchDesc() } : lastSnap;
    if (c === 'save' || c === 'savemenu' || c === 'dl') {
      const ok = storeMatch(snap, live);
      if (!ok) { await ask('<h2>No se pudo guardar</h2><p>El navegador no permite guardar en este archivo. Revisa que el almacenamiento local esté habilitado.</p>', [{ label: 'Entendido', value: 1, primary: true }]); setPause(false); return; }
      if (c === 'savemenu') { location.reload(); return; }
      if (c === 'dl') { downloadSave(); onLog('Guardado descargado', 'good'); } else onLog('Partida guardada', 'good');
    } else if (c === 'quit') {
      if (await ask('<h2>Salir sin guardar</h2><p>Se pierde el avance de este partido (el torneo se mantiene en la ronda actual).</p>', [{ label: 'Salir al menú', value: 1, primary: true }, { label: 'Volver', value: 0 }])) { dropMatch(); location.reload(); return; }
    }
    setPause(false);
  }
  $('bPause').onclick = () => pauseMenu();
  document.addEventListener('keydown', ev => { if (ev.key === 'p' || ev.key === 'P') { if (/INPUT|SELECT|TEXTAREA/.test((ev.target || {}).tagName || '')) return; pauseMenu(); } });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && !$('ctx').hidden) { hideCtx(); return; }
    if (ev.key !== 'Escape' || !G || !$('modal').hidden || ui.pick || ui.busy || !ui.sel) return;
    if (ui.phase === 'turn') {
      if (ui.sel.started) { if (ui.mode !== 'move' && ui.sel.action !== ui.mode) { ui.mode = 'move'; refresh(); } msg(`<b>${nm(ui.sel)}</b> ya empezó su activación. Para soltarlo usa "Terminar activación".`); return; }
      ui.sel = null; ui.mode = 'move'; refresh(); card(null); msg(turnMsg());
    } else if (ui.phase === 'setup' || ui.phase === 'snap') { ui.sel = null; header(); buttons(); draw(); showSel(); }
  });
  window.addEventListener('resize', resize);

  const SAVE = 'bb_tdc2_v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(SAVE) || 'null'); } catch (e) { return null; } };
  const save = st => { try { if (st) localStorage.setItem(SAVE, JSON.stringify(st)); else localStorage.removeItem(SAVE); } catch (e) {} };
  const tn = i => TDC.teams[i];
  function standingsHtml(st) {
    const rows = tStandings(st);
    return '<table><tr><th class="n">#</th><th>Equipo</th><th>Entrenador</th><th>Raza</th><th class="n">Pts</th><th class="n">G-E-P</th><th class="n">TD</th><th class="n">Bajas</th></tr>' +
      rows.map((r, k) => `<tr class="${r.i === st.me ? 'me' : ''}"><td class="n">${k + 1}</td><td>${tn(r.i).name}</td><td>${tn(r.i).coach}</td><td>${tn(r.i).race}</td><td class="n">${r.pts}</td><td class="n">${r.w}-${r.d}-${r.l}</td><td class="n">${r.tf}-${r.ta}</td><td class="n">${r.cas}</td></tr>`).join('') + '</table>';
  }
  const pairHtml = (pr, me, res) => '<div class="cols">' + pr.map((p, k) => { const r = res && res[k]; const mine = p[0] === me || p[1] === me; return `<div style="${mine ? 'color:var(--acc);font-weight:700' : ''}">${tn(p[0]).name} ${r ? `<b>${r[2]} - ${r[3]}</b>` : 'vs'} ${tn(p[1]).name}</div>`; }).join('') + '</div>';
  const MSAVE = 'bb_match_v1';
  const loadMatch = () => { try { return JSON.parse(localStorage.getItem(MSAVE) || 'null'); } catch (e) { return null; } };
  const dropMatch = () => { try { localStorage.removeItem(MSAVE); } catch (e) {} };
  /* archivo de guardado: se baja como .json y se vuelve a cargar desde el menú */
  function downloadSave() {
    const g = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
    const o = { app: 'bbchile', v: 1, t: Date.now(), tournament: g(SAVE), match: g(MSAVE), plan: g(PLANKEY) };
    if (!o.tournament && !o.match) return false;
    const d = new Date(), z = n => String(n).padStart(2, '0');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(o)], { type: 'application/json' }));
    a.download = `bbchile-guardado-${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}.json`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return true;
  }
  function pickFile() {
    return new Promise(res => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json';
      i.onchange = () => { const f = i.files && i.files[0]; if (!f) return res(null); const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => res(null); r.readAsText(f); };
      i.addEventListener('cancel', () => res(null)); i.click();
    });
  }
  async function importSave() {
    const txt = await pickFile(); if (txt == null) return;
    let o = null; try { o = JSON.parse(txt); } catch (e) {}
    const okT = o && o.tournament && typeof o.tournament.round === 'number' && Array.isArray(o.tournament.res), okM = o && o.match && typeof o.match.str === 'string' && o.match.k;
    if (!o || o.app !== 'bbchile' || (!okT && !okM)) { await ask('<h2>Archivo no válido</h2><p>Ese archivo no es un guardado de este juego.</p>', [{ label: 'Volver', value: 1, primary: true }]); return; }
    if ((load() || loadMatch()) && !(await ask('<h2>Reemplazar lo guardado</h2><p>Ya hay una partida o un torneo guardado en este navegador. Cargar el archivo los reemplaza.</p>', [{ label: 'Cargar el archivo', value: 1, primary: true }, { label: 'Cancelar', value: 0 }]))) return;
    try {
      localStorage.removeItem(SAVE); localStorage.removeItem(MSAVE);
      if (okT) localStorage.setItem(SAVE, JSON.stringify(o.tournament));
      if (okM) localStorage.setItem(MSAVE, JSON.stringify(o.match));
      if (o.plan) localStorage.setItem(PLANKEY, JSON.stringify(o.plan));
    } catch (e) { await ask('<h2>No se pudo cargar</h2><p>El navegador no permite guardar datos locales.</p>', [{ label: 'Volver', value: 1, primary: true }]); return; }
    await ask('<h2>Guardado cargado</h2><p>Ya puedes continuar desde el menú.</p>', [{ label: 'Aceptar', value: 1, primary: true }]);
  }
  const matchDesc = () => `Mitad ${G.half}: ${G.teams[0].name} ${G.teams[0].score} a ${G.teams[1].score} ${G.teams[1].name}`;
  function storeMatch(snap, live) {
    try { localStorage.setItem(MSAVE, JSON.stringify({ v: 1, mode: curMode, k: snap.k, a: snap.a, live: !!live, str: snap.str, ulog, desc: snap.desc || matchDesc(), t: Date.now() })); return true; } catch (e) { return false; }
  }
  snapHook = (k, a) => { if (SIM || !G || !(G.mgr || G.teams[0].ctrl instanceof Human)) return; lastSnap = { k, a, str: snapG(), desc: matchDesc() }; storeMatch(lastSnap, false); hist.push({ str: lastSnap.str, score: G.teams[0].score + ' a ' + G.teams[1].score, label: k === 'drive' ? `Mitad ${G.half} · formación de una nueva entrada` : `Mitad ${G.half} · turno ${G.turn[a] + 1} de ${G.teams[a].name}` }); if (hist.length > 60) hist.shift(); };


  /* ----- alineación: elegir quién entra a la cancha ----- */
  async function lineupPicker(ti) {
    const t = G.teams[ti];
    const pool = t.players.filter(p => (p.loc === 'pitch' || p.loc === 'reserve') && !p.heat);
    if (pool.length <= 11) return null;
    const need = 11, sel = new Set(pool.filter(p => p.loc === 'pitch').map(p => p.id));
    if (sel.size !== need) {
      sel.clear();
      const lu = t.lineup ? t.lineup.filter(id => pool.some(p => p.id === id)) : [];
      (lu.length === need ? lu : pool.slice().sort((a, b) => pval(b) - pval(a)).slice(0, need).map(p => p.id)).forEach(id => sel.add(id));
    }
    const ord = { big: 0, blitz: 1, los: 2, line: 3, wing: 4, back: 5, sub: 6 };
    const rows = pool.slice().sort((a, b) => ((ord[a.role] ?? 9) - (ord[b.role] ?? 9)) || pval(b) - pval(a));
    const html = `<h2>Alineación</h2><p class="sub">Elige los ${need} jugadores que entran a la cancha. Tienes ${pool.length} disponibles. Los de la derecha con ★ tienen habilidades extra.</p>
      <p id="luCount" style="font-weight:700"></p><div class="lu-list">${rows.map(p => `<label class="lu-row"><input type="checkbox" data-id="${p.id}"${sel.has(p.id) ? ' checked' : ''}><canvas data-c="${p.id}" width="44" height="44"></canvas><span class="lu-n"><b>${p.name}</b> <i>${p.pos}</i></span><span class="lu-s">MA${p.ma} ST${p.st} AG${p.ag}+ AV${p.av}+</span><span class="lu-k">${(p.skList || []).map(k => (p.ex || []).includes(k) ? `<b>★${k}</b>` : k).join(', ')}</span></label>`).join('')}</div>`;
    return new Promise(res => {
      ask(html, [{ label: 'Aceptar', value: 'ok', primary: true }, { label: 'Automático (los mejores)', value: 'auto' }, { label: 'Cancelar', value: null }], true, 'lineup', () => {
        const boxes = [...document.querySelectorAll('.lu-row input')], ok = document.querySelector('#modalBtns button');
        const upd = () => { document.getElementById('luCount').textContent = `Elegidos ${sel.size} de ${need}`; ok.disabled = sel.size !== need; };
        for (const c of document.querySelectorAll('.lu-row canvas')) spriteTo(c, pool.find(p => p.id === +c.dataset.c), 44);
        boxes.forEach(b => { b.onchange = () => { const id = +b.dataset.id; if (b.checked) { if (sel.size >= need) { b.checked = false; return; } sel.add(id); } else sel.delete(id); upd(); }; });
        upd();
      }).then(v => { if (v === 'ok') { t.lineup = [...sel]; res(t.lineup); } else if (v === 'auto') { t.lineup = null; res('auto'); } else res(null); });
    });
  }
  /* aplica la alineación elegida a los jugadores que ya están en la cancha (fase de formación) */
  function applyLineup(ti, r) {
    const t = G.teams[ti];
    if (r === 'auto') { for (const p of t.players) if (p.loc === 'pitch') { p.loc = 'reserve'; p.x = p.y = -1; } autoSetup(ti, ui.kicking); }
    else {
      const want = new Set(r), out = t.players.filter(p => p.loc === 'pitch' && !want.has(p.id)), inn = t.players.filter(p => p.loc === 'reserve' && !p.heat && want.has(p.id));
      inn.forEach((q, i) => { const o = out[i]; if (!o) return; q.loc = 'pitch'; q.state = 'standing'; q.x = o.x; q.y = o.y; o.loc = 'reserve'; o.x = o.y = -1; });
    }
    ui.sel = null; header(); buttons(); draw(); showSel();
  }
  $('bLineup').onclick = async () => { const r = await lineupPicker(HT); if (r) applyLineup(HT, r); };

  /* ----- modo manager: pizarra del entrenador ----- */
  const PLANKEY = 'bb_plan_v1';
  const loadPlan = () => { try { const o = JSON.parse(localStorage.getItem(PLANKEY) || 'null'); if (o && FORMS.def[o.def] && FORMS.att[o.att]) return Object.assign(clone(PRESETS.equil), o); } catch (e) {} return clone(PRESETS.equil); };
  const savePlan = pl => { try { localStorage.setItem(PLANKEY, JSON.stringify(pl)); } catch (e) {} };
  const ROLEC = { L: '#d9d4c4', B: '#e8a317', W: '#4aa8e6', K: '#e0453a', M: '#8e9aa6' };
  function miniForm(kind, key, color) {
    const f = FORMS[kind][key], sl = f.slots || (kind === 'def' ? SLOTS.kick : SLOTS.recv).map(([x, y], k) => [x, y, SLOT_ROLES[k]]);
    let g = '';
    for (const [x, y, r] of sl) g += `<circle cx="${(x + .5) * 10}" cy="${(y + .5) * 10}" r="3.8" fill="${ROLEC[r]}" stroke="#000" stroke-width=".8"/>`;
    return `<svg viewBox="0 0 130 150"><rect width="130" height="150" fill="#2f6b3a"/><rect x="0" y="0" width="130" height="150" fill="none" stroke="#fff" stroke-opacity=".5"/><line x1="130" y1="0" x2="130" y2="150" stroke="#fff" stroke-width="3"/>${g}</svg>`;
  }
  async function coachPanel(why) {
    const me = G.teams[0], op = G.teams[1], pl = me.plan, sc = `${me.name} ${me.score} a ${op.score} ${op.name}`;
    const head = why === 'start' ? `Antes del partido contra ${op.name}. ${G.kicker === 0 ? 'Tu equipo patea primero.' : 'Tu equipo recibe primero.'}`
      : why === 'half' ? `Medio tiempo. ${sc}.` : `Después del touchdown. ${sc}. Turnos usados: ${G.turn[0]} y ${G.turn[1]} de ${TURNS}.`;
    const opt = (o, cur) => Object.entries(o).map(([k, v]) => `<option value="${k}"${k === cur ? ' selected' : ''}>${typeof v === 'string' ? v : v.name}</option>`).join('');
    const html = `<h2>Pizarra del entrenador</h2><p class="sub">${head} Lo que definas rige hasta la próxima pausa.</p>
      <div class="cp-pre" id="cpPre">${Object.entries(PRESETS).map(([k, v]) => `<button type="button" data-p="${k}">${v.name}</button>`).join('')}</div>
      <p class="cp-fd" id="cpPd"></p>
      <div class="cp-grid"><div>
        <label for="cpDef">Defensa (cuando pateas)</label><select id="cpDef">${opt(FORMS.def, pl.def)}</select><p class="cp-fd" id="cpDefD"></p>
        <label for="cpAtt">Ataque (cuando recibes)</label><select id="cpAtt">${opt(FORMS.att, pl.att)}</select><p class="cp-fd" id="cpAttD"></p>
        <label for="cpSty">Estilo</label><input type="range" id="cpSty" min="0" max="100" step="5" value="${pl.style}"><div class="cp-ends"><span>Defensivo</span><span>Ofensivo</span></div>
        <label for="cpRisk">Riesgo</label><input type="range" id="cpRisk" min="0" max="100" step="5" value="${pl.risk}"><div class="cp-ends"><span>Conservador</span><span>Agresivo</span></div>
      </div><div>
        <label for="cpSco">Plan de anotación</label><select id="cpSco">${opt(SCORING, pl.scoring)}</select>
        <label for="cpTar">A quién pegar</label><select id="cpTar">${opt(TARGETS, pl.target)}</select>
        <label for="cpFou">Faltas a jugadores caídos</label><select id="cpFou">${opt(FOULS, pl.fouls)}</select>
        <label for="cpRR">Rerolls de equipo</label><select id="cpRR">${opt(RRPOL, pl.rr)}</select>
        <label class="cp-chk"><input type="checkbox" id="cpAuto"${pl.auto ? ' checked' : ''}><span>Cambiar solo según el marcador: si voy ganando, más defensivo y anotando tarde; si voy perdiendo, más ofensivo y rápido.</span></label>
      </div><div><div class="cp-pitch"><figure id="cpFd"></figure><figure id="cpFa"></figure></div>
      <p class="cp-key">Puntos: blanco = línea, amarillo = blitzer, celeste = ala, rojo = portador o lanzador, gris = medio. Tu equipo juega hacia la derecha; la línea blanca gruesa es el centro del campo.</p></div></div>`;
    const many = me.players.filter(q => (q.loc === 'pitch' || q.loc === 'reserve') && !q.heat).length > 11;
    const p = ask(html, [{ label: 'Listo, seguir', value: 1, primary: true }].concat(many ? [{ label: 'Elegir alineación', value: 2 }] : []), true, 'coach', () => {
      const $$ = id => document.getElementById(id);
      const sync = () => {
        pl.def = $$('cpDef').value; pl.att = $$('cpAtt').value; pl.style = +$$('cpSty').value; pl.risk = +$$('cpRisk').value;
        pl.scoring = $$('cpSco').value; pl.target = $$('cpTar').value; pl.fouls = $$('cpFou').value; pl.rr = $$('cpRR').value; pl.auto = $$('cpAuto').checked;
        $$('cpDefD').textContent = FORMS.def[pl.def].desc; $$('cpAttD').textContent = FORMS.att[pl.att].desc;
        $$('cpFd').innerHTML = miniForm('def', pl.def) + `<figcaption>Defensa: ${FORMS.def[pl.def].name}</figcaption>`;
        $$('cpFa').innerHTML = miniForm('att', pl.att) + `<figcaption>Ataque: ${FORMS.att[pl.att].name}</figcaption>`;
        let match = null;
        for (const [k, v] of Object.entries(PRESETS)) if (['def', 'att', 'style', 'scoring', 'risk', 'target', 'fouls', 'rr', 'auto'].every(f => v[f] === pl[f])) match = k;
        document.querySelectorAll('#cpPre button').forEach(b => b.classList.toggle('on', b.dataset.p === match));
        $$('cpPd').textContent = match ? PRESETS[match].desc : 'Plan personalizado.';
        savePlan(pl);
      };
      const fill = () => { $$('cpDef').value = pl.def; $$('cpAtt').value = pl.att; $$('cpSty').value = pl.style; $$('cpRisk').value = pl.risk; $$('cpSco').value = pl.scoring; $$('cpTar').value = pl.target; $$('cpFou').value = pl.fouls; $$('cpRR').value = pl.rr; $$('cpAuto').checked = pl.auto; };
      document.querySelectorAll('#cpPre button').forEach(b => { b.onclick = () => { Object.assign(pl, clone(PRESETS[b.dataset.p])); delete pl.name; delete pl.desc; fill(); sync(); }; });
      for (const id of ['cpDef', 'cpAtt', 'cpSty', 'cpRisk', 'cpSco', 'cpTar', 'cpFou', 'cpRR', 'cpAuto']) $$(id).oninput = sync;
      sync();
    });
    if ((await p) === 2) { await lineupPicker(0); return coachPanel(why); }
  }
  coachHook = async why => { if (SIM || !G || !G.mgr) return; await coachPanel(why); };


  /* icono del clima y qué implica (toca el icono o el nombre) */
  const SV = (c, body) => `<svg viewBox="0 0 24 24" width="1.25em" height="1.25em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const WXI = {
    heat: ['#d2693a', SV(0, '<path d="M10 4a2 2 0 0 1 4 0v9.2a4 4 0 1 1-4 0z"/><path d="M12 9v6"/><path d="M18 5h3M18 9h3"/>')],
    sunny: ['#c98d12', SV(0, '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>')],
    nice: ['#6b7a45', SV(0, '<circle cx="9" cy="9" r="3.2"/><path d="M9 2.8v1.4M2.8 9h1.4M4.6 4.6l1 1M13.4 4.6l-1 1"/><path d="M8 20h9a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 8.2 14 3 3 0 0 0 8 20z"/>')],
    rain: ['#3f8a86', SV(0, '<path d="M7 15h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8.5 3.3 3.3 0 0 0 7 15z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>')],
    blizzard: ['#5c7fa6', SV(0, '<path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/><path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5"/>')]
  };
  const WXD = {
    heat: ['Calor sofocante', 'Al terminar cada entrada, 1 a 3 jugadores al azar de cada equipo se desmayan y se pierden la entrada siguiente.'],
    sunny: ['Muy soleado', 'Los pases son 1 más difíciles de acertar (se suma 1 a la tirada necesaria).'],
    nice: ['Clima perfecto', 'Sin penalizaciones. Es el clima normal. El balón pateado se dispersa en el aire 3 casillas.'],
    rain: ['Lluvia torrencial', 'El balón está resbaloso: recoger y atrapar el balón es 1 más difícil.'],
    blizzard: ['Ventisca', 'Ir a por todas (GFI) necesita 3+ en vez de 2+, y solo se permiten pases rápidos y cortos.']
  };
  (function wxTip() {
    const clock = $('clock'); let el = null, tm = 0;
    const close = () => { if (el) { el.remove(); el = null; } clearTimeout(tm); };
    const open = () => {
      if (!G) return; close();
      const k = G.weather, [nm, tx] = WXD[k], r = clock.getBoundingClientRect();
      el = document.createElement('div'); el.id = 'wxtip';
      el.innerHTML = `<span class="wxbig" style="color:${WXI[k][0]}">${WXI[k][1]}</span><div><b>${nm}</b><p>${tx}</p></div>`;
      document.body.appendChild(el);
      const w = el.offsetWidth; el.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px'; el.style.top = (r.bottom + 6) + 'px';
      tm = setTimeout(close, 9000);
    };
    clock.addEventListener('click', ev => { ev.stopPropagation(); el ? close() : open(); });
    clock.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); el ? close() : open(); } });
    document.addEventListener('click', ev => { if (el && !ev.target.closest('#wxtip')) close(); }, true);
  })();
  /* ---- tutorial de la interfaz (globos con foco, "Siguiente") ---- */
  const TUT_KEY = 'bbTutorial1';
  function tutSeen() { try { return localStorage.getItem(TUT_KEY) === '1'; } catch (e) { return false; } }
  function tutMark() { try { localStorage.setItem(TUT_KEY, '1'); } catch (e) { /* sin almacenamiento: se mostrará de nuevo */ } }
  function tutSteps(mob) {
    return [
      { sel: ['#mid'], t: 'Marcador', x: 'Arriba ves el marcador, la mitad, el turno y el clima. A los lados, tu equipo (izquierda, azul) y el rival (derecha, rojo) con sus rerolls, apotecario, reservas, KO y bajas.' },
      { sel: ['#msg'], t: 'Barra de mensajes', x: 'Aquí el juego te dice qué toca hacer en cada momento: elegir jugadores, patear, mover, bloquear. Si dudas qué hacer, léela primero.' },
      { sel: ['#bframe'], t: 'La cancha', x: 'Toca (o haz clic en) uno de tus jugadores para seleccionarlo. Se marcan las casillas a las que puede ir, y tocas una para moverlo. Para bloquear, toca al rival al que quieres golpear.' + (mob ? ' En el celular puedes acercar la cancha con los botones + y −, o pellizcando, y moverla arrastrando con un dedo.' : '') },
      mob
        ? { sel: ['#mbar'], t: 'Fichas y registro', x: 'Mi ficha, Rival y Registro abren paneles al costado. Además, cada vez que tocas un jugador aparece un cartel abajo con su equipo y sus habilidades. Toca fuera del panel para cerrarlo.' }
        : { sel: ['#sideL'], t: 'Tu ficha', x: 'Aquí ves la ficha del jugador tuyo que seleccionaste: sus estadísticas y habilidades. Abajo están tus reservas, KO y bajas. Las habilidades con ★ son extras que el entrenador le dio.' },
      ...(mob ? [] : [{ sel: ['#sideR'], t: 'Ficha del rival', x: 'Aquí aparece la ficha del jugador que tienes bajo el cursor, sea tuyo o rival. Así sabes con qué te vas a enfrentar antes de bloquear. Abajo, las reservas y bajas del rival.' }]),
      { sel: ['#ctl'], t: 'Acciones', x: 'Con un jugador seleccionado eliges su acción: Blitz, Pase, Entrega, Falta, Asegurar o Levantarse. "Terminar activación" cierra a ese jugador y "Terminar turno" pasa el turno al rival. Los botones apagados no están disponibles ahora.' },
      mob
        ? { sel: ['#mbar'], t: 'Dados y registro', x: 'Los dados de cada bloqueo aparecen sobre la cancha. En "Registro" queda escrito todo lo que pasó, jugada por jugada.' }
        : { sel: ['#log'], t: 'Dados y registro', x: 'Los dados de cada bloqueo aparecen sobre la cancha. Aquí abajo queda escrito todo lo que pasó, jugada por jugada.' },
      { sel: ['#speed', '#bPause'], t: 'Velocidad y pausa', x: 'La velocidad cambia el ritmo de las jugadas de la IA. Con Pausa (o la tecla P) detienes el partido y puedes ver los turnos anteriores, solo para mirar.' },
      { sel: ['#bPause'], t: 'Guardar la partida', x: 'En la pausa puedes guardar la partida en este navegador o descargar un archivo de guardado, que queda en tu equipo. Ese archivo se carga después desde el menú con "Cargar archivo de guardado", incluso en otro dispositivo.' },
      { sel: null, t: 'En el torneo', x: 'Al comenzar cada ronda ves un banner con tu rival, los cruces y la tabla antes de armar tu plan de juego. Entre rondas el torneo se guarda solo.' },
      { sel: null, t: 'Listo', x: 'Las reglas son las de Blood Bowl de Games Workshop. Puedes volver a ver este recorrido cuando quieras desde Pausa, con "Ver tutorial de la pantalla". ¡Mucha suerte!' }
    ];
  }
  function tutorial() {
    return new Promise(done => {
      delete document.body.dataset.drawer;
      const mob = document.body.classList.contains('mob');
      const steps = tutSteps(mob);
      let i = 0;
      const ov = document.createElement('div'); ov.id = 'tut';
      ov.innerHTML = '<div id="tutHole"></div><div id="tutBox"><div class="tk"></div><h3></h3><p></p><div class="tb"><button data-a="skip" class="ghost">Saltar</button><span class="sp"></span><button data-a="back">Atrás</button><button data-a="next" class="primary">Siguiente</button></div></div>';
      document.body.appendChild(ov);
      const hole = ov.querySelector('#tutHole'), box = ov.querySelector('#tutBox');
      function rectOf(sel) {
        let r = null;
        for (const q of sel || []) {
          const e = document.querySelector(q); if (!e) continue;
          const b = e.getBoundingClientRect(); if (!b.width || !b.height) continue;
          r = r ? { l: Math.min(r.l, b.left), t: Math.min(r.t, b.top), r: Math.max(r.r, b.right), b: Math.max(r.b, b.bottom) } : { l: b.left, t: b.top, r: b.right, b: b.bottom };
        }
        return r;
      }
      function place() {
        const st = steps[i], vw = innerWidth, vh = innerHeight, M = 8, pad = 6;
        box.querySelector('.tk').textContent = `${i + 1} de ${steps.length}`;
        box.querySelector('h3').textContent = st.t; box.querySelector('p').textContent = st.x;
        box.querySelector('[data-a=back]').style.visibility = i ? 'visible' : 'hidden';
        box.querySelector('[data-a=next]').textContent = i === steps.length - 1 ? 'Terminar' : 'Siguiente';
        const r = rectOf(st.sel);
        const bw = box.offsetWidth, bh = box.offsetHeight;
        let x, y;
        if (!r) { hole.style.cssText = 'left:50%;top:50%;width:0;height:0'; x = (vw - bw) / 2; y = (vh - bh) / 2; }
        else {
          const L = Math.max(0, r.l - pad), T = Math.max(0, r.t - pad), W = Math.min(vw, r.r + pad) - L, H = Math.min(vh, r.b + pad) - T;
          hole.style.cssText = `left:${L}px;top:${T}px;width:${W}px;height:${H}px`;
          const fit = (cx, cy) => cx >= M && cy >= M && cx + bw <= vw - M && cy + bh <= vh - M;
          const cand = [[L + W + 12, T], [L - bw - 12, T], [L, T + H + 12], [L, T - bh - 12], [L + W + 12, vh - bh - M], [L - bw - 12, vh - bh - M]];
          const ok = cand.find(c => fit(c[0], c[1]));
          if (ok) [x, y] = ok; else { x = L + (W - bw) / 2; y = T + (H - bh) / 2; }
          x = Math.min(Math.max(M, x), vw - bw - M); y = Math.min(Math.max(M, y), vh - bh - M);
        }
        box.style.left = x + 'px'; box.style.top = y + 'px';
      }
      function end() { removeEventListener('resize', place); removeEventListener('keydown', key, true); ov.remove(); tutMark(); done(); }
      function key(e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); end(); }
        else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); go(1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); go(-1); }
      }
      function go(d) { const n = i + d; if (n < 0) return; if (n >= steps.length) { end(); return; } i = n; place(); }
      ov.addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (!a) return; if (a.dataset.a === 'skip') end(); else go(a.dataset.a === 'next' ? 1 : -1); });
      addEventListener('resize', place); addEventListener('keydown', key, true);
      place();
    });
  }
  async function playMatch(a, b, rs, mgr) {
    hist = [];
    if (rs) { restoreG(rs.str); ulog = (rs.ulog || []).slice(); } else { newGame(a, b); ulog = []; G.mgr = !!mgr; }
    if (G.mgr && !G.teams[0].plan) G.teams[0].plan = loadPlan();
    G.teams[0].ctrl = G.mgr ? new AI2(0) : new Human(0); G.teams[1].ctrl = new AI2(1);
    ui.phase = 'idle'; ui.sel = null; ui.busy = false; ui.pick = null; ui.moves = new Map(); ui.mode = 'move'; ui.hl = null;
    $('log').innerHTML = ''; for (const [t, c] of ulog) addLog(t, c);
    dugSig = ['', '']; card(null); resize(); refresh();
    if (rs) onLog('Partida reanudada', 'hd');
    if (!rs && !tutSeen()) await tutorial();
    if (G.mgr) msg('<b>Modo manager.</b> Tu equipo juega solo según la pizarra. Puedes cambiarla antes del partido, en el medio tiempo y después de cada touchdown. Con P pausas y guardas.');
    await runMatch(rs ? (rs.k === 'drive' ? {} : { a: rs.a, live: rs.live }) : undefined);
    dropMatch();
    ui.phase = 'idle'; refresh();
    msg('<b>Partido terminado.</b>');
  }
  async function quickMatch(rs) {
    curMode = 'quick';
    const opts = sel => RACE_ORDER.map(r => `<option value="${r}"${r === sel ? ' selected' : ''}>${ROSTERS[r].name} (tier ${ROSTERS[r].tier})</option>`).join('');
    const go = rs ? 1 : await ask(`<h2>Partido rápido</h2><p>Un partido suelto contra la IA con alineaciones de ejemplo.</p>
      <label for="selMe">Tu equipo</label><select id="selMe">${opts('human')}</select>
      <label for="selAI">Equipo rival (IA)</label><select id="selAI">${opts('orc')}</select>
      <label>Modo</label><div class="modeopt"><label><input type="radio" name="mode" value="p" checked>Jugador: tú mueves a tu equipo</label><label><input type="radio" name="mode" value="m">Manager: defines la táctica y la IA juega</label></div>`, [{ label: 'Jugar', value: 1, primary: true }, { label: 'Volver', value: 0 }]);
    if (!go) return;
    if (rs) await playMatch(null, null, rs); else await playMatch($('selMe').value, $('selAI').value, null, document.querySelector('input[name=mode]:checked').value === 'm');
    const a = G.teams[0].score, b = G.teams[1].score;
    await ask(`<h2>${a > b ? '¡Ganaste!' : a < b ? 'Ganó la IA' : 'Empate'}</h2><p>${G.teams[0].name} ${a}, ${G.teams[1].name} ${b}</p>`, [{ label: 'Volver al menú', value: 1, primary: true }]);
  }
  /* tres posicionales que representan al equipo: el más fuerte al centro, dos distintos a los lados */
  function trio(t) {
    const weak = /lineman|goblin|rotter|beastmanrunner|hopeful/, by = {};
    for (const p of t.players) { const sc = p.st * 10 + p.sk.length + (weak.test(p.sheet) ? -25 : 0) + (p.ex.length ? 1 : 0); if (!by[p.sheet] || sc > by[p.sheet].sc) by[p.sheet] = { p, sc }; }
    const l = Object.values(by).sort((x, y) => y.sc - x.sc).map(o => o.p);
    if (l.length >= 3) return [l[1], l[0], l[2]];
    if (l.length === 2) return [l[1], l[0], l[1]];
    return [l[0], l[0], l[0]];
  }
  function paintTrio(root) {
    root.querySelectorAll('canvas[data-s]').forEach(c => {
      const sh = IMG[c.dataset.s];
      if (!sh || !sh.ok) { setTimeout(() => paintTrio(root), 150); return; }
      const cw = sh.width / 4, rows = Math.max(1, Math.round(sh.height / cw)), k = Math.max(1, Math.round(+c.dataset.z / cw)), sz = cw * k, g = c.getContext('2d');
      c.width = c.height = sz; g.imageSmoothingEnabled = false;
      g.drawImage(sh, 2 * cw, (+c.dataset.var % rows) * cw, cw, cw, 0, 0, sz, sz);
    });
  }
  const trioHtml = (t, z) => trio(t).map((p, k) => `<canvas data-s="${p.sheet}" data-var="${p.variant}" data-z="${k === 1 ? z * 1.25 : z}" class="tr${k}"></canvas>`).join('');
  /* Tabla oficial del torneo real, antes de elegir equipo */
  function realTableHtml() {
    const med = ['#f2c230', '#c3c7cc', '#cd8a4b'];
    const top = TDC.real.slice(0, 3).map((r, k) => { const t = TDC.teams[r[0]]; return `<div class="rt-c c${k + 1}"><div class="rt-n">${k + 1}º</div><b>${t.name}</b><span>${t.race} · ${t.coach}</span><div class="rt-p">${r[1]} pts · ${r[2]}-${r[3]}-${r[4]}</div></div>`; }).join('');
    const rows = TDC.real.map((r, k) => { if (k < 3) return ''; const t = TDC.teams[r[0]]; return `<tr><td class="n">${k + 1}</td><td>${t.name}</td><td>${t.coach}</td><td>${t.race}</td><td class="n">${r[1]}</td><td class="n">${r[2]}-${r[3]}-${r[4]}</td><td class="n">${r[5]}-${r[6]}</td></tr>`; }).join('');
    return `<h2>Así terminó el ${TDC.name}</h2><p class="sub" style="margin:0 0 10px">Tabla oficial del torneo real, 6 de diciembre de 2025. Ahora te toca intentar superarla.</p>
      <div class="rt-top">${top}</div>
      <table><tr><th class="n">#</th><th>Equipo</th><th>Entrenador</th><th>Raza</th><th class="n">Pts</th><th class="n">G-E-P</th><th class="n">TD</th></tr>${rows}</table>`;
  }
  async function newTournament() {
    if (!(await ask(realTableHtml(), [{ label: 'Elegir mi equipo', value: 1, primary: true }, { label: 'Volver', value: 0 }], true))) return null;
    const rosterHtml = i => { const t = tn(i); return `<div class="tp-hd"><div class="tp-trio" style="background:${bg(i)}">${trioHtml(t, 96)}</div><div><h3>${t.name}</h3><div class="tp-meta">${t.race} · ${t.coach} · TV ${t.tv}</div><p class="sub">${t.rr} rerolls${t.apo ? ' · apotecario' : ''}${t.coaches ? ' · ' + t.coaches + ' ayudantes' : ''}${t.cheer ? ' · ' + t.cheer + ' animadoras' : ''}${t.kegs ? ' · barril de cerveza' : ''}</p></div></div><table><tr><th>Jugador</th><th>Posición</th><th class="n">MA</th><th class="n">ST</th><th class="n">AG</th><th class="n">PA</th><th class="n">AV</th><th>Habilidades</th></tr>` +
      t.players.map(p => `<tr><td>${p.name}</td><td>${p.pos}</td><td class="n">${p.ma}</td><td class="n">${p.st}</td><td class="n">${p.ag}+</td><td class="n">${p.pa ? p.pa + '+' : '-'}</td><td class="n">${p.av}+</td><td>${p.sk.map(k => p.ex.includes(k) ? `<b class="xs">${k} ★</b>` : k).join(', ')}</td></tr>`).join('') + '</table><p class="sub"><b class="xs">★</b> habilidad extra que el entrenador agregó a ese jugador.</p>'; };
    /* equipos con el mismo trío: fondo de otro tono, y orden de la grilla sin repetidos pegados */
    const sig = TDC.teams.map(t => trio(t).map(p => p.sheet).join('|')), seen = {}, tone = TDC.teams.map((t, i) => { const k = seen[sig[i]] = (seen[sig[i]] || 0) + 1; return k - 1; });
    const dupN = {}; sig.forEach(g => { dupN[g] = (dupN[g] || 0) + 1; });
    const TONES = ['', '#0039a61f', '#d52b1e1f', '#f2b6323a'];
    const order = (() => {
      const n = TDC.teams.length, res = Array(n).fill(-1), used = Array(n).fill(false);
      const ok = (pos, i) => !(pos % 4 && sig[res[pos - 1]] === sig[i]) && !(pos >= 4 && sig[res[pos - 4]] === sig[i]);
      const go = pos => { if (pos === n) return true; for (let i = 0; i < n; i++) if (!used[i] && ok(pos, i)) { used[i] = true; res[pos] = i; if (go(pos + 1)) return true; used[i] = false; res[pos] = -1; } return false; };
      return go(0) ? res : TDC.teams.map((t, i) => i);
    })();
    const bg = i => dupN[sig[i]] > 1 ? TONES[tone[i] % TONES.length] : '';
    const first = order[0];
    const cards = order.map(i => { const t = TDC.teams[i]; return `<button class="tc${i === first ? ' on' : ''}" data-t="${i}"><div class="tc-art" style="background:${bg(i)}">${trioHtml(t, 64)}</div><b>${t.name}</b><i>${t.race}</i><em>${t.coach} · TV ${t.tv}</em></button>`; }).join('');
    let cur = first;
    const pr = ask(`<h2>${TDC.name}</h2><p class="sub" style="margin:0 0 10px">Elige uno de los 16 equipos, tal como lo armó su entrenador, e intenta ganar el torneo. ${TDC.rounds} rondas en sistema suizo: la primera usa los cruces reales y las siguientes dependen de tu resultado y de los demás.</p>
      <div class="tp-mode">Modo de juego<div class="modeopt"><label><input type="radio" name="mode" value="p" checked>Jugador: tú mueves a tu equipo</label><label><input type="radio" name="mode" value="m">Manager: defines la táctica y la IA juega</label></div></div>
      <div class="tp"><div class="tp-grid">${cards}</div><div class="tp-side"><div id="rosterPrev">${rosterHtml(first)}</div></div></div>`,
      [{ label: 'Empezar torneo', value: 1, primary: true }, { label: 'Volver', value: 0 }], true, 'teams', () => {
        const box = $('modalBody');
        paintTrio(box);
        box.querySelectorAll('.tc').forEach(el => { el.onclick = () => { cur = +el.dataset.t; box.querySelectorAll('.tc').forEach(x => x.classList.toggle('on', x === el)); $('rosterPrev').innerHTML = rosterHtml(cur); paintTrio($('rosterPrev')); }; });
      });
    if (!(await pr)) return null;
    const st = tNew(cur); st.mgr = document.querySelector('input[name=mode]:checked').value === 'm'; save(st); return st;
  }
  async function tournament(st, rs) {
    while (st.round <= TDC.rounds) {
      if (!st.pair || !st.pair.length) { st.pair = tPairings(st); save(st); }
      const mine = st.pair.find(p => p[0] === st.me || p[1] === st.me), opp = mine[0] === st.me ? mine[1] : mine[0], o = tn(opp);
      const act = rs ? 'play' : await ask(`<h2>${TDC.name}: ronda ${st.round} de ${TDC.rounds}</h2>
        <div class="vsb"><div class="vt me" style="--tc:${tn(st.me).color || '#2f6fdb'}"><small>Tú${st.mgr ? ' (manager)' : ''}</small><b>${tn(st.me).name}</b><span>${tn(st.me).race}</span></div><div class="vsx">VS</div><div class="vt rv" style="--tc:${o.color || '#d52b1e'}"><small>Tu rival en la ronda ${st.round}</small><b>${o.name}</b><span>${o.race} · ${o.coach} · TV ${o.tv}</span></div></div>
        <h3 style="margin:10px 0 4px;font-size:14px">Cruces de la ronda</h3>${pairHtml(st.pair, st.me)}
        ${st.res.length ? '<h3 style="margin:12px 0 0;font-size:14px">Tabla</h3>' + standingsHtml(st) : ''}`,
        [{ label: 'Jugar mi partido', value: 'play', primary: true }, { label: 'Salir al menú (se guarda)', value: 'menu' }, { label: 'Abandonar torneo', value: 'drop' }], true);
      if (act === 'menu') return;
      if (act === 'drop') { save(null); return; }
      curMode = 'tdc'; await playMatch(tn(st.me), tn(opp), rs, st.mgr); rs = null;
      const myRes = tResult(st.me, opp), rd = [];
      msg('Simulando el resto de la ronda…');
      await new Promise(r => setTimeout(r, 30));
      for (const [a, b] of st.pair) {
        if (a === st.me || b === st.me) rd.push(a === st.me ? myRes : [a, b, myRes[3], myRes[2], myRes[5], myRes[4]]);
        else rd.push(await tSimMatch(a, b));
      }
      const shown = st.pair; st.res.push(rd); st.pair = []; st.round++; save(st);
      const mr = rd.find(r => r[0] === st.me || r[1] === st.me), ms = mr[0] === st.me ? [mr[2], mr[3]] : [mr[3], mr[2]];
      await ask(`<h2>Resultados de la ronda ${st.round - 1}</h2><p>${ms[0] > ms[1] ? '¡Ganaste!' : ms[0] < ms[1] ? 'Perdiste.' : 'Empate.'} ${tn(st.me).name} ${ms[0]}, ${o.name} ${ms[1]}.</p>${pairHtml(shown, st.me, rd)}<h3 style="margin:12px 0 0;font-size:14px">Tabla</h3>${standingsHtml(st)}`,
        [{ label: st.round <= TDC.rounds ? 'Siguiente ronda' : 'Ver resultado final', value: 1, primary: true }], true);
    }
    const rows = tStandings(st), rank = rows.findIndex(r => r.i === st.me) + 1, realRank = TDC.real.findIndex(r => r[0] === st.me) + 1, champ = TDC.real[0], rr = TDC.real[realRank - 1];
    const pod = (r, k) => `<div class="pod p${k + 1}${r.i === st.me ? ' me' : ''}"><div class="pod-t">${k === 0 ? '<svg class="pod-cup" viewBox="0 0 64 64"><path d="M18 8h28v14c0 9-6 16-14 16S18 31 18 22Z" fill="#f2c230" stroke="#7a5a00" stroke-width="3"/><path d="M18 12H8c0 10 4 16 12 18M46 12h10c0 10-4 16-12 18" fill="none" stroke="#7a5a00" stroke-width="3"/><rect x="28" y="38" width="8" height="10" fill="#d9a520" stroke="#7a5a00" stroke-width="2"/><rect x="19" y="48" width="26" height="8" rx="2" fill="#f2c230" stroke="#7a5a00" stroke-width="3"/></svg>' : ''}${r.i === st.me ? '<span class="pod-you">Tu equipo</span>' : ''}<b>${tn(r.i).name}</b><i>${tn(r.i).coach} · ${tn(r.i).race}</i><em>${r.pts} pts · ${r.w}-${r.d}-${r.l} · ${r.tf} TD</em></div><div class="pod-b"><span>${k + 1}</span></div></div>`;
    const ladder = rows.map((r, k) => `<span class="lad${k < 3 ? ' t' + (k + 1) : ''}${r.i === st.me ? ' me' : ''}" title="${k + 1}. ${tn(r.i).name}">${k + 1}</span>`).join('');
    await ask(`<h2 style="font-size:32px">${rank === 1 ? '¡Campeón del ' + TDC.name + '!' : tn(rows[0].i).name + ' se lleva el ' + TDC.name}</h2>
      <div class="pod-wrap">${pod(rows[1], 1)}${pod(rows[0], 0)}${pod(rows[2], 2)}</div>
      <p class="pod-me">${rank <= 3 ? 'Tu equipo, ' + tn(st.me).name + ', terminó en el podio: puesto ' + rank + '.' : 'Tu equipo, ' + tn(st.me).name + ', terminó en el puesto ' + rank + ' de ' + rows.length + '.'}</p>
      <div class="lad-row">${ladder}</div>
      <p>En el torneo real, ${tn(st.me).name} de ${tn(st.me).coach} terminó en el puesto ${realRank} (${rr[2]}-${rr[3]}-${rr[4]}), y el campeón fue ${tn(champ[0]).name} de ${tn(champ[0]).coach}.</p>${standingsHtml(st)}`,
      [{ label: 'Volver al menú', value: 1, primary: true }], true);
    save(null);
  }
  async function start() {
    for (;;) {
      const sv = load();
      const ms = loadMatch();
      const btn = [{ label: TDC.name, value: 'new', primary: !sv && !ms }, { label: 'Partido rápido', value: 'quick' }];
      btn.push({ label: 'Cargar archivo de guardado', value: 'imp' }); if (sv || ms) btn.push({ label: 'Descargar guardado', value: 'exp' });
      if (ms) btn.unshift({ label: `Continuar partida (${ms.desc})`, value: 'cm', primary: true });
      if (sv && sv.round <= TDC.rounds) btn.unshift({ label: `Continuar torneo (ronda ${sv.round}, ${tn(sv.me).name})`, value: 'cont', primary: true });
      const c = await ask(`<img class="pst-img" src="${ASSETS.poster}" alt="Afiche del Torneo de Campeones"><div class="pst-side"><div class="pst-k">BB Chile - El desafío</div><p>Juega contra la IA: revive el ${TDC.name} con uno de sus 16 equipos, o juega un partido suelto.</p><div id="modalBtns2"></div></div>`, btn, false, 'poster');
      if (c === 'cm') {
        if (ms.mode === 'tdc') { const t = load(); if (t) await tournament(t, ms); else { dropMatch(); await ask('<h2>Partida no disponible</h2><p>El torneo de esta partida ya no está guardado.</p>', [{ label: 'Volver al menú', value: 1, primary: true }]); } }
        else await quickMatch(ms);
      }
      else if (c === 'imp') await importSave();
      else if (c === 'exp') downloadSave();
      else if (c === 'quick') await quickMatch();
      else if (c === 'cont') await tournament(sv);
      else { if (sv && !(await ask('<h2>Torneo en curso</h2><p>Ya tienes un torneo guardado. Si empiezas uno nuevo se pierde.</p>', [{ label: 'Empezar uno nuevo', value: 1, primary: true }, { label: 'Volver', value: 0 }]))) continue; const st = await newTournament(); if (st) await tournament(st); }
    }
  }
  start();
})();