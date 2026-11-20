  /* =====================================================================
     Modo "Aprender a jugar": lecciones guiadas sobre el mismo motor del juego.
     Cada lección arma una situación, muestra un cartel con pasos y objetivos,
     y se resuelve sola cuando el jugador cumple el objetivo.
     ===================================================================== */
  const tut = { on: false, L: null, i: 0, state: 'idle', timer: null, res: null, hide: false };
  const TP = (team, sheet, x, y) => {
    const p = G.teams[team].players.find(q => q.sheet === sheet && q.loc === 'reserve');
    p.loc = 'pitch'; p.x = x; p.y = y; p.state = 'standing'; return p;
  };
  const giveBall = p => { G.ball.carrier = p; G.ball.x = p.x; G.ball.y = p.y; };
  const looseBall = (x, y) => { G.ball.carrier = null; G.ball.x = x; G.ball.y = y; };
  const at = (p, x, y) => p.loc === 'pitch' && p.x === x && p.y === y;
  const sq = (...a) => a;
  const LESSONS = [
    { title: 'Moverte y esprintar',
      intro: 'Tú eres el equipo azul y juegas hacia la derecha. Cada jugador tiene un valor de <b>Movimiento (MA)</b>: cuántas casillas puede avanzar en su activación. Las casillas <b>verdes</b> se alcanzan sin tirar dados.',
      setup(o) { o.A = TP(0, 'human_lineman', 4, 4); o.B = TP(0, 'human_lineman', 4, 10); },
      steps: [
        { t: 'Haz clic en tu jugador marcado para seleccionarlo. Mira las casillas verdes: llega hasta 6 casillas.', hl: o => [[o.A.x, o.A.y]], ok: o => ui.sel === o.A || o.A.started },
        { t: 'Ahora haz clic en la casilla dorada para moverlo (5 casillas). Puedes ir de a poco, pero en total no más de 6.', hl: o => [[9, 4]], ok: o => o.A.x >= 9 },
        { t: '<b>Esprintar.</b> Este jugador tiene MA 6, pero la meta está a 7 casillas. Puede esprintar: 2 casillas extra por activación, y cada una pide un dado. Con 2+ sale bien; con un 1 se cae y <b>termina tu turno</b>. Las casillas amarillas son las que piden dado. Llévalo a la casilla dorada (si ya lo moviste antes, aprieta Reiniciar).', hl: o => [[11, 10]], ok: o => o.B.x >= 11 && o.B.y === 10 }],
      stuck: o => o.B.started && o.B.x < 11 && o.B.maLeft + 2 - o.B.rushes < 11 - o.B.x,
      done: 'Mover es gratis mientras no salgas de tu MA. Cada casilla extra es un riesgo: esprinta solo cuando valga la pena.' },
    { title: 'Recoger el balón y anotar',
      intro: 'Se anota llevando el balón hasta la <b>última columna</b> del rival (la de la derecha). Al entrar a la casilla del balón se intenta recogerlo con una <b>prueba de Agilidad (AG)</b>.',
      rr: 1,
      stuck: o => o.R.started && o.R.state === 'standing' && o.R.maLeft + 2 - o.R.rushes < 25 - o.R.x,
      setup(o) { o.R = TP(0, 'human_catcher', 17, 7); looseBall(18, 7); },
      steps: [
        { t: 'Mueve a tu Receptor hasta el balón (casilla dorada). Necesita 3+ para recogerlo. Si falla, el juego te ofrece usar un <b>reroll de equipo</b> (tienes 1).', hl: () => [[18, 7]], ok: o => G.ball.carrier === o.R },
        { t: '¡Lo tienes! Ahora lleva el balón a la zona de anotación: cualquier casilla de la última columna.', hl: () => Array.from({ length: 15 }, (_, y) => [25, y]), ok: () => G.td === 0 }],
      done: '¡Touchdown! Si fallas una tirada, es turnover: se acaba tu turno y el rival juega.' },
    { title: 'El bloqueo',
      intro: 'Para bloquear, selecciona un jugador que no se haya movido y haz clic en un rival de pie que esté al lado. Se comparan las <b>Fuerzas (ST)</b>: si son iguales, tiras 1 dado y eliges tú el resultado.',
      rr: 0,
      setup(o) { o.A = TP(0, 'human_lineman', 10, 7); o.E = TP(1, 'orc_lineman', 11, 7); },
      steps: [
        { t: 'Selecciona tu jugador y haz clic en el orco: aparece un menú, elige <b>Bloquear</b>. Fuerza 3 contra 3: 1 dado. Caras: <b>Atacante cae</b> (turnover), <b>Ambos caen</b> (turnover si no tienes Block), <b>Empujón</b>, <b>Tropiezo</b> (cae si no tiene Dodge) y <b>POW</b> (cae).', hl: o => [[o.A.x, o.A.y], [o.E.x, o.E.y]], ok: o => o.A.started }],
      done: 'Cuando alguien cae se tira armadura (2 dados contra su AV) y, si se rompe, una tirada de lesión. Si caes tú o fallas, es turnover.' },
    { title: 'Asistencias',
      intro: 'Los compañeros que marcan al rival suman <b>+1 de Fuerza</b> cada uno (asistencia), siempre que no estén marcados por otro rival. Con más Fuerza que el rival tiras 2 dados y <b>tú eliges</b> el mejor.',
      rr: 0,
      setup(o) { o.A = TP(0, 'human_lineman', 10, 7); o.B = TP(0, 'human_lineman', 11, 6); o.C = TP(0, 'human_lineman', 10, 8); o.E = TP(1, 'orc_lineman', 11, 7); },
      steps: [
        { t: 'Tus compañeros están junto al orco: son 2 asistencias. Selecciona al jugador de la izquierda, haz clic en el orco y elige <b>Bloquear</b>: 5 contra 3, tiras 2 dados (con más del doble de fuerza serían 3) y haces clic en el que prefieras.', hl: o => [[o.A.x, o.A.y], [o.E.x, o.E.y]], ok: o => o.A.started }],
      done: 'Rodear al rival antes de pegarle es la base del juego: más dados, mejores resultados y menos riesgo.' },
    { title: 'Surf: al público',
      intro: 'Si un jugador es empujado fuera del campo cae al público: <b>sale del partido</b>, sufre una tirada de lesión sin armadura y, si tenía el balón, lo suelta. Cerca de la banda, un empujón puede ser mejor que un derribo.',
      rr: 0,
      setup(o) { o.A = TP(0, 'human_lineman', 12, 13); o.B = TP(0, 'human_lineman', 13, 13); o.C = TP(0, 'human_lineman', 11, 13); o.E = TP(1, 'orc_lineman', 12, 14); },
      steps: [
        { t: 'El orco está en la banda de abajo. Selecciona al jugador del medio, haz clic en el orco y elige <b>Bloquear</b>. Tienes 2 asistencias: 2 dados. Elige uno con <b>Empujón</b> (o POW): al empujarlo hacia abajo, se va al público.', hl: o => [[o.A.x, o.A.y], [o.E.x, o.E.y]], ok: o => o.E.loc !== 'pitch' }],
      done: 'Las bandas son armas. Un portador cerca de la banda corre el riesgo de perder el balón y el jugador.' },
    { title: 'Blitz',
      intro: 'Una vez por turno, un jugador puede hacer <b>Blitz</b>: moverse y bloquear en la misma acción. El bloqueo cuesta 1 de movimiento. Es la mejor forma de llegar a un rival lejano.',
      rr: 0,
      setup(o) { o.A = TP(0, 'human_blitzer', 5, 7); o.E = TP(1, 'orc_lineman', 11, 7); },
      steps: [
        { t: 'Selecciona a tu Blitzer y aprieta el botón <b>Blitz</b> de abajo. Después haz clic en el orco para marcarlo y luego en una casilla junto a él (el juego las resalta): se mueve y bloquea. (El Blitzer tiene <i>Block</i>: "Ambos caen" no lo tumba a él.)', hl: o => [[o.A.x, o.A.y], [o.E.x, o.E.y]], ok: () => G.blitzUsed }],
      done: 'Solo se permite un Blitz por turno, así que úsalo donde más duela: sobre el portador rival o para abrir paso.' },
    { title: 'Pase',
      intro: 'Una vez por turno, el portador del balón puede <b>pasar</b> a un compañero. Cuanto más lejos, más difícil. Primero se lanza (prueba de Pase, PA) y luego el compañero intenta <b>atrapar</b> (prueba de AG).',
      rr: 1,
      setup(o) { o.T = TP(0, 'human_thrower', 8, 7); o.R = TP(0, 'human_catcher', 12, 7); giveBall(o.T); },
      steps: [
        { t: 'Selecciona a tu Lanzador (tiene el balón), aprieta <b>Pase</b> y haz clic en el Receptor. El juego te dice cuánto necesitas y pide confirmar.', hl: o => [[o.T.x, o.T.y], [o.R.x, o.R.y]], ok: () => G.passUsed },
        { t: 'Si el Receptor lo atrapa, ¡listo!', hl: o => [[o.R.x, o.R.y]], ok: o => G.ball.carrier === o.R }],
      done: 'Pasar es arriesgado: si falla, es turnover. Úsalo cuando el pase sea claro o necesites sorprender.' }    ,
    { title: 'Avanzar con caja (cage)',
      intro: 'Un <b>cage</b> son 4 jugadores en las <b>diagonales</b> del portador. El rival no puede llegar al balón sin pasar por ellos, y las diagonales evitan que se cuelen. Se avanza en bloque, moviendo a todos.',
      rr: 0,
      setup(o) { o.C = TP(0, 'human_lineman', 7, 7); giveBall(o.C); o.k1 = TP(0, 'human_lineman', 6, 6); o.k2 = TP(0, 'human_lineman', 6, 8); o.k3 = TP(0, 'human_lineman', 8, 6); o.k4 = TP(0, 'human_lineman', 8, 8); TP(1, 'orc_lineman', 14, 6); TP(1, 'orc_lineman', 14, 8); },
      steps: [
        { t: 'Mueve el cage 3 casillas hacia la derecha: el portador a la casilla dorada central y los cuatro jugadores a las esquinas doradas. Todo tu equipo puede moverse; usa el mismo orden que usarías en un partido: primero los de adelante, el portador casi al final.', hl: () => [[10, 7], [9, 6], [9, 8], [11, 6], [11, 8]],
          ok: o => G.ball.carrier === o.C && at(o.C, 10, 7) && [[9, 6], [9, 8], [11, 6], [11, 8]].every(([x, y]) => { const q = playerAt(x, y); return q && q.team === 0; }) }],
      done: 'Con el cage armado, para llegar al portador el rival tiene que romper una esquina. Mantenerlo vivo varios turnos gana partidos.' },
    { title: 'Defender con pantalla (screen)',
      intro: 'Los jugadores marcan las casillas de su alrededor (su <b>zona de defensa</b>). Si los pones <b>escalonados, a 2 casillas</b> de distancia, las zonas se tocan y el rival no tiene dónde pasar sin esquivar o sin ser bloqueado.',
      rr: 0,
      setup(o) { o.D = [TP(0, 'human_lineman', 5, 3), TP(0, 'human_lineman', 5, 6), TP(0, 'human_lineman', 5, 9), TP(0, 'human_lineman', 5, 12)]; const e = TP(1, 'orc_lineman', 15, 7); giveBall(e); TP(1, 'orc_lineman', 16, 6); TP(1, 'orc_lineman', 16, 8); },
      steps: [
        { t: 'El orco con balón viene por el centro. Pon a tus 4 jugadores en las casillas doradas: una línea separada 2 casillas, así sus zonas de defensa cubren todo el ancho.', hl: () => [[10, 3], [10, 6], [10, 9], [10, 12]], ok: o => [[10, 3], [10, 6], [10, 9], [10, 12]].every(([x, y]) => { const q = playerAt(x, y); return q && q.team === 0; }) }],
      done: 'Una pantalla limita por dónde puede correr el rival. Cuanto más ancha y más adelantada, más tiempo ganas para llegar al portador.' }
  ];

  function lessonSteps() { const L = tut.L; return L.steps.map(s => ({ s, ok: !!s.ok(tut.o) })); }
  function tutStatus() {
    if (!tut.on || tut.state !== 'play' || ui.busy) return;
    const L = tut.L, st = lessonSteps();
    const cur = st.findIndex(x => !x.ok);
    if (cur === -1) { tutEnd('won'); return; }
    if (ui.phase !== 'turn') { tutEnd('lost'); return; }
    if (L.stuck && L.stuck(tut.o)) { tutEnd('stuck'); return; }
    if (G.teams[0].players.every(q => q.loc !== 'pitch' || q.used)) { tutEnd('stuck'); return; }
    $('ctStep').innerHTML = `<b>Paso ${cur + 1} de ${st.length}.</b> ${L.steps[cur].t}<div class="ct-sub">¿Te trabaste? Aprieta Reiniciar.</div>`;
    const hl = L.steps[cur].hl(tut.o);
    const key = JSON.stringify(hl);
    if (tut.hlKey !== key) { tut.hlKey = key; ui.tutHl = hl; draw(); }
  }
  function tutEnd(r) {
    tut.state = r; ui.tutHl = null; tut.hlKey = null;
    if (ui.phase === 'turn') { ui.phase = 'idle'; ui.sel = null; ui.moves = new Map(); ui.turnRes = null; refresh(); card(null); }
    if (r === 'won') {
      $('ctStep').innerHTML = `<b class="ct-ok">${G.turnover ? 'Hubo turnover, pero ya viste cómo funciona.' : '¡Muy bien!'}</b> ${tut.L.done}`;
      $('ctNext').hidden = false; $('ctRetry').textContent = 'Repetir';
      msg('<b>Lección completada.</b> Aprieta "Siguiente" en el cartel.');
    } else if (r === 'stuck') {
      $('ctStep').innerHTML = '<b class="ct-bad">Te quedaste sin movimiento para llegar.</b> Cada jugador tiene un máximo por turno (MA, más 2 de esprint). Aprieta <b>Reintentar</b> y avanza de una vez, sin dar pasos de más.';
      $('ctNext').hidden = true; $('ctRetry').textContent = 'Reintentar';
      msg('<b>Sin movimiento.</b> Aprieta "Reintentar" en el cartel.');
    } else {
      $('ctStep').innerHTML = '<b class="ct-bad">Se terminó tu turno sin lograr el objetivo.</b> En Blood Bowl, caerse o fallar una tirada importante es un <b>turnover</b> y el turno termina. Reintenta.';
      $('ctNext').hidden = true; $('ctRetry').textContent = 'Reintentar';
      msg('<b>Turnover.</b> Aprieta "Reintentar" en el cartel.');
    }
    draw();
  }
  function tutSetup() {
    const L = tut.L;
    newGame('human', 'orc');
    G.teams[0].ctrl = new Human(0); G.teams[1].ctrl = new AI2(1);
    G.teams.forEach(t => { t.rerolls = L.rr || 0; t.rrMax = L.rr || 0; t.ff = 3; });
    G.phase = 'turn'; G.active = 0; G.turn = [1, 0]; G.half = 1; G.halfStart = false; G.first = 0; G.kicker = 1;
    tut.o = {}; L.setup(tut.o);
    ui.phase = 'turn'; ui.sel = null; ui.mode = 'move'; ui.busy = false; ui.pick = null; ui.moves = new Map(); ui.hl = null; ui.tutHl = null; ui.turnRes = () => {};
    tut.state = 'play'; tut.hlKey = null;
    $('ctNext').hidden = true; $('ctRetry').textContent = 'Reiniciar';
    $('log').innerHTML = ''; ulog = []; card(null); resize(); refresh();
    msg('<b>Lección.</b> Sigue las indicaciones del cartel.');
    tutStatus();
  }
  function tutCartel() {
    const L = tut.L;
    $('ctK').textContent = `Lección ${tut.i + 1} de ${LESSONS.length}`;
    $('ctT').textContent = L.title; $('ctX').innerHTML = L.intro;
  }
  function runLesson(i) {
    tut.i = i; tut.L = LESSONS[i]; tutCartel(); tutSetup();
    return new Promise(res => { tut.res = res; });
  }
  async function tutorialCourse() {
    curMode = 'tutorial'; tut.on = true; hist = [];
    document.body.classList.add('tut'); $('cartel').hidden = false;
    clearInterval(tut.timer); tut.timer = setInterval(tutStatus, 250);
    $('ctNext').onclick = () => { const r = tut.res; tut.res = null; if (r) r('next'); };
    $('ctRetry').onclick = () => { if (ui.busy) return; tutSetup(); };
    $('ctSkip').onclick = () => { const r = tut.res; tut.res = null; if (r) r('next'); };
    $('ctExit').onclick = () => { const r = tut.res; tut.res = null; if (r) r('exit'); };
    $('ctHide').onclick = () => { $('cartel').classList.toggle('xmin'); };
    $('cartel').classList.toggle('xmin', document.body.classList.contains('mob'));
    let i = 0, out = 'done';
    while (i < LESSONS.length) { const r = await runLesson(i); if (r === 'exit') { out = 'exit'; break; } i++; }
    if (out === 'done') {
      clearInterval(tut.timer); tut.on = false; ui.tutHl = null; document.body.classList.remove('tut'); $('cartel').hidden = true;
      const go = await ask('<h2>¡A jugar medio tiempo!</h2><p>Ya viste lo básico. Ahora juegas <b>una mitad completa</b> (8 turnos) contra la IA: Humanos contra Orcos. Primero elegirás tu formación y se hará la patada inicial. Si dudas, la barra de aviso te dice qué toca.</p>', [{ label: 'Empezar', value: true, primary: true }, { label: 'Volver al menú', value: false }]);
      if (go) {
        curMode = 'tutorial'; await playMatch('human', 'orc', null, false, true);
        const a = G.teams[0].score, b = G.teams[1].score;
        await ask(`<h2>${a > b ? '¡Buen partido, ganaste!' : a < b ? 'Perdiste, pero así se aprende' : 'Empate'}</h2><p>${G.teams[0].name} ${a}, ${G.teams[1].name} ${b}. Ya puedes jugar el Torneo de Campeones o un partido rápido.</p>`, [{ label: 'Volver al menú', value: 1, primary: true }]);
      }
      return out;
    }
    clearInterval(tut.timer); tut.on = false; ui.tutHl = null;
    ui.phase = 'idle'; ui.sel = null; refresh();
    document.body.classList.remove('tut'); $('cartel').hidden = true;
    return out;
  }
