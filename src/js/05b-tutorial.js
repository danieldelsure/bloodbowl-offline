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
  const TPx = (team, x, y) => { const p = G.teams[team].players.find(q => q.loc === 'reserve' && !q.big); p.loc = 'pitch'; p.x = x; p.y = y; p.state = 'standing'; return p; };
  const giveBall = p => { G.ball.carrier = p; G.ball.x = p.x; G.ball.y = p.y; };
  const looseBall = (x, y) => { G.ball.carrier = null; G.ball.x = x; G.ball.y = y; };
  const at = (p, x, y) => p.loc === 'pitch' && p.x === x && p.y === y;
  const sq = (...a) => a;
  const LESSONS = [
    { title: 'Moverte y esprintar',
      intro: 'Tú eres el equipo azul y juegas hacia la derecha. Cada jugador tiene un valor de <b>Movimiento (MA)</b>: cuántas casillas puede avanzar en su activación. Las casillas <b>verdes</b> se alcanzan sin tirar dados.',
      setup(o) { o.A = TP(0, 'human_lineman', 4, 7); },
      steps: [
        { t: 'Haz clic en tu jugador marcado para seleccionarlo. Mira las casillas verdes: llega hasta 6 casillas, su MA.', hl: o => [[o.A.x, o.A.y]], ok: o => ui.sel === o.A || o.A.started },
        { t: 'Haz clic en la última casilla dorada: son las 6 casillas de su Movimiento (MA 6), sin tirar dados.', hl: () => [[5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7]], ok: o => o.A.x >= 10 },
        { t: '<b>Esprintar.</b> Ya gastó todo su MA, pero aún puede esprintar: 2 casillas extra por activación, y cada una pide un dado. Con 2+ sale bien; con un 1 se cae y <b>termina tu turno</b>. Son las casillas amarillas. Haz clic en la segunda casilla dorada (confirma el riesgo).', hl: () => [[11, 7], [12, 7]], ok: o => o.A.x >= 12 }],
      stuck: o => o.A.started && o.A.x < 12 && o.A.maLeft + 2 - o.A.rushes < 12 - o.A.x,
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
        { t: 'Selecciona a tu Blitzer y aprieta el botón <b>Blitz</b> de abajo. Haz clic en el orco para marcarlo y luego en la casilla dorada, justo delante de él: se mueve y bloquea. <b>Después del golpe</b>, si lo empujas, el juego te pregunta si quieres <b>seguirlo</b> (ocupar su casilla): decides tú. Seguir te acerca y puede darte otro golpe, pero te deja más expuesto. (El Blitzer tiene <i>Block</i>: "Ambos caen" no lo tumba a él.)', hl: o => (ui.blitzTarget === o.E ? [[o.E.x - 1, o.E.y]] : [[o.A.x, o.A.y]]), ok: () => G.blitzUsed }],
      done: 'Solo se permite un Blitz por turno, así que úsalo donde más duela: sobre el portador rival o para abrir paso.' },
    { title: 'Pase',
      intro: 'Una vez por turno, el portador del balón puede <b>pasar</b> a un compañero. Cuanto más lejos, más difícil. Primero se lanza (prueba de Pase, PA) y luego el compañero intenta <b>atrapar</b> (prueba de AG). Al marcar el pase, el campo se pinta por distancia: <span class="bd" style="background:#3fbf5f"></span> <b>rápido</b>, <span class="bd" style="background:#ffd23f"></span> <b>corto</b>, <span class="bd" style="background:#ff9a2f"></span> <b>largo</b> y <span class="bd" style="background:#e04a3a"></span> <b>bomba larga</b>. Más lejos, más difícil.',
      rr: 1, bands: true,
      setup(o) { o.T = TP(0, 'human_thrower', 8, 7); o.R = TP(0, 'human_catcher', 12, 7); giveBall(o.T); },
      steps: [
        { t: 'Selecciona a tu Lanzador (tiene el balón) y aprieta <b>Pase</b>: verás las franjas de distancia. Haz clic en el Receptor. El juego te dice cuánto necesitas según la franja y pide confirmar.', hl: o => [[o.T.x, o.T.y], [o.R.x, o.R.y]], ok: () => G.passUsed },
        { t: 'Si el Receptor lo atrapa, ¡listo!', hl: o => [[o.R.x, o.R.y]], ok: o => G.ball.carrier === o.R }],
      done: 'Pasar es arriesgado: si falla, es turnover. Úsalo cuando el pase sea claro o necesites sorprender.' }    ,
    { title: 'Avanzar con caja (cage)', turns: 3, rr: 0,
      intro: 'Un <b>cage</b> son 4 jugadores en las <b>diagonales</b> del portador. El rival no puede llegar al balón sin pasar por ellos, y las diagonales evitan que se cuelen. Se avanza en bloque, moviendo a todos. Aquí tienes <b>3 turnos</b> y la IA juega entre medio: llega a la columna dorada con el balón.',
      setup(o) { o.goal = 14; o.C = TP(0, 'human_lineman', 4, 7); giveBall(o.C); [[3, 6], [3, 8], [5, 6], [5, 8]].forEach(([x, y]) => TP(0, 'human_lineman', x, y)); TPx(0, 2, 6); TPx(0, 2, 8); TPx(1, 11, 5); TPx(1, 11, 9); TPx(1, 13, 7); },
      hl: o => Array.from({ length: 15 }, (_, y) => [o.goal, y]),
      turnText: (o, r) => r === 1 ? 'Arma el cage y avanza con todo el bloque: el portador al centro y los cuatro jugadores en las diagonales. Mueve primero a los de adelante y deja al portador casi al final. No esprintes si no es necesario. Al terminar, aprieta <b>Terminar turno</b>.' : 'Sigue avanzando con el cage cerrado. Si un orco rompe una esquina, tapa el hueco con otro jugador (tienes dos de apoyo) antes de mover al portador. Meta: la columna dorada antes de que termine el turno 3.',
      afterHuman(o, r) { const c = G.ball.carrier; if (G.td === 0) return 'won'; if (!c || c.team !== 0) return ['fail', '<b class="ct-bad">Perdiste el balón.</b> Un cage roto deja al portador solo y el rival lo aprovecha. Cierra las esquinas antes de avanzar y reintenta.']; if (r === 3) return c.x >= o.goal ? 'won' : ['fail', '<b class="ct-bad">No alcanzaste la columna dorada en 3 turnos.</b> Avanza todo lo que puedas cada turno sin romper el cage. Reintenta.']; return null; },
      afterAI(o, r) { const c = G.ball.carrier; if (!c || c.team !== 0) return ['fail', '<b class="ct-bad">Los orcos te quitaron el balón.</b> Cierra las esquinas del cage y reintenta.']; return null; },
      done: 'Con el cage armado, para llegar al portador el rival tiene que romper una esquina. Mantenerlo vivo varios turnos gana partidos.' },
    { title: 'Defender con pantalla (screen)', turns: 3, rr: 0,
      intro: 'Los jugadores marcan las casillas de su alrededor (su <b>zona de defensa</b>). Si los pones en una línea con <b>un hueco entre cada uno</b>, las zonas se tocan y el rival no tiene dónde pasar sin esquivar o sin ser bloqueado. Aquí defiendes con <b>8 jugadores</b> durante <b>3 turnos</b> de la IA: que no anote.',
      setup(o) { o.gold = [0, 2, 4, 6, 8, 10, 12, 14].map(y => [9, y]); [[6, 5], [6, 6], [6, 7], [6, 8], [6, 9], [7, 6], [7, 7], [7, 8]].forEach(([x, y]) => TPx(0, x, y)); const e = TPx(1, 17, 7); giveBall(e); TPx(1, 18, 5); TPx(1, 18, 9); TPx(1, 19, 7); },
      hl: (o, r) => r === 1 ? o.gold : [],
      turnText: (o, r) => r === 1 ? 'El orco con balón viene por el centro. Pon a tus 8 jugadores en las casillas doradas: una línea con un hueco entre cada uno, así sus zonas de defensa cubren todo el ancho. Al terminar, aprieta <b>Terminar turno</b>.' : 'La IA intentó pasar. Reordena la línea: mantén los huecos cubiertos y, si el portador rival quedó cerca, bloquéalo (mejor con asistencias). Si anota, pierdes la lección: aguanta sus 3 turnos.',
      afterHuman(o, r) { if (r === 1 && !o.gold.every(([x, y]) => { const q = playerAt(x, y); return q && q.team === 0; })) return ['fail', '<b class="ct-bad">La pantalla no estaba armada.</b> Antes de terminar el turno, pon a tus 8 jugadores en las casillas doradas: así el rival no tiene por dónde pasar. Reintenta.']; return null; },
      afterAI(o, r) { if (G.td === 1) return ['fail', '<b class="ct-bad">La IA anotó.</b> Se coló por un hueco de la línea. Mantén las zonas de defensa solapadas y bloquea al portador cuando se acerque. Reintenta.']; return r === 3 ? 'won' : null; },
      done: 'Una pantalla limita por dónde puede correr el rival. Cuanto más ancha y más adelantada, más tiempo ganas para llegar al portador.' }
  ];

  function lessonSteps() { const L = tut.L; return L.steps.map(s => ({ s, ok: !!s.ok(tut.o) })); }
  function tutStatus() {
    if (!tut.on || tut.state !== 'play' || ui.busy) return;
    const L = tut.L;
    if (L.turns) {
      if (ui.phase !== 'turn' || tut.aiRun) return;
      $('ctStep').innerHTML = `<b>Turno ${tut.round} de ${L.turns}.</b> ${L.turnText(tut.o, tut.round)}<div class="ct-sub">¿Te trabaste? Aprieta Reiniciar.</div>`;
      const h = L.hl(tut.o, tut.round), k = JSON.stringify(h);
      if (tut.hlKey !== k) { tut.hlKey = k; ui.tutHl = h; draw(); }
      return;
    }
    const st = lessonSteps();
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
  function tutEnd(r, txt) {
    tut.state = r; ui.tutHl = null; tut.hlKey = null;
    if (ui.phase === 'turn') { ui.phase = 'idle'; ui.sel = null; ui.moves = new Map(); ui.turnRes = null; refresh(); card(null); }
    if (r === 'won') {
      (async () => {
        if (G.td != null) await fxBanner('say', null, { title: '¡Touchdown!', text: G.teams[G.td].name + ' anota', c: G.teams[G.td].color, ms: 1300 });
        await fxBanner('say', null, { title: '¡Lección superada!', text: tut.L.title, c: '#ffd23f', ms: 1500 });
      })();
      $('ctStep').innerHTML = `<b class="ct-ok">${G.turnover ? 'Hubo turnover, pero ya viste cómo funciona.' : '¡Muy bien!'}</b> ${tut.L.done}`;
      $('ctNext').hidden = false; $('ctRetry').textContent = 'Repetir';
      msg('<b>Lección completada.</b> Aprieta "Siguiente" en el cartel.');
    } else if (r === 'fail') {
      $('ctStep').innerHTML = txt; $('ctNext').hidden = true; $('ctRetry').textContent = 'Reintentar';
      msg('<b>Lección no superada.</b> Aprieta "Reintentar" en el cartel.');
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
  async function tutRounds(g) {
    const L = tut.L, fin = v => (v === 'won' ? tutEnd('won') : tutEnd('fail', v[1]));
    let r = tut.round;
    for (;;) {
      let v = L.afterHuman(tut.o, r); if (v) return fin(v);
      tut.aiRun = true; ui.tutHl = null; tut.hlKey = null; $('ctStep').innerHTML = '<b>Juega la IA…</b> Mira cómo responde.'; draw();
      await playTurn(1, false); tut.aiRun = false; if (g !== tut.gen) return;
      v = L.afterAI(tut.o, r); if (v) return fin(v);
      tut.round = ++r;
      await playTurn(0, false); if (g !== tut.gen) return;
    }
  }
  const TIPS = [
    { t: 'Tira los menos dados posibles', x: 'Cada tirada es una chance de fallar y de provocar un turnover. Los buenos entrenadores operan como cirujanos: no hacen ninguna tirada que no sea necesaria.' },
    { t: 'Primero lo que no necesita dados', x: 'Haz antes todos los movimientos sin tirada. Si defiendes, presiona primero al portador. Y supón que cada tirada va a fallar: deja el terreno preparado antes de arriesgarte.' },
    { t: 'Bloquea de más dados a menos', x: 'Primero los bloqueos de 2 dados, luego los de 1. Con <i>Block</i> o <i>Wrestle</i> fallas menos. Un bloqueo de 2 dados sin Block es mejor que uno de 1 dado con Block. Y haz el Blitz con quien tenga Block.' },
    { t: 'Cubre el balón', x: 'Si atacas, imagina qué pasa si fallas la recogida y pon a uno o dos jugadores cerca para cubrirla. Con el receptor igual: rodéalo, así lo proteges de los Blitz.' },
    { t: 'Que maneje el balón quien tiene Agilidad', x: 'Usa a los de AG alta. Si el balón debe llegar a alguien torpe, prefiere una entrega (menos dados). Limpia de rivales la zona antes de mover el balón. Quien tiene Pase, pasa; quien tiene Catch, atrapa.' },
    { t: 'No esprintes, salvo que sea vital', x: 'Si tienes que esprintar, hazlo al final y asume que va a fallar. Un esprint fallido puede costarte a tu mejor jugador y el turno entero.' },
    { t: 'Complícale la vida al rival', x: 'Marca al portador: para escapar tiene que esquivar o bloquear, y cada tirada es una chance de que falle. Cada zona de defensa sobre el balón también le dificulta recogerlo.' },
    { t: 'Controla la cancha', x: 'Cada jugador marca las 8 casillas a su alrededor: tres escalonados cubren más que tres pegados. Evita las bandas (te empujan al público) y empuja al rival que se ponga ahí, pero nunca a costa de dejar de pegarle al portador.' }
  ];
  const TIPS_END = [
    { t: 'Se gana anotando', x: 'No pierdas el objetivo. A veces conviene dejar anotar rápido a un equipo lento y empatar después. Perder tiempo (stalling) también es táctica válida.' },
    { t: 'Arriesga cuando valga la pena', x: 'Conoce las probabilidades (aprox. 1 de 3, 1 de 2) y qué ganas si sale bien. El riesgo es mejor cuando es bajo o cuando es tu último jugador del turno: ya no hay turnover que temer.' },
    { t: 'Disfruta y acepta la mala suerte', x: 'Hasta tu mejor jugador morirá algún día. No te quejes de la suerte ni la presumas: con tantos partidos jugados, cualquier racha ocurre.' }
  ];
  function tutTip() {
    const i = Math.max(0, (G.turn[0] || 1) - 1) % TIPS.length, tip = TIPS[i], c = $('cartel');
    c.hidden = false; c.classList.add('tip'); c.classList.remove('xmin');
    $('ctK').textContent = `Consejo del entrenador ${i + 1} de ${TIPS.length}`;
    $('ctT').textContent = tip.t; $('ctX').innerHTML = tip.x + '<div class="ct-sub">Basado en "The Touch of Blood Bowl", de FUMBBL.</div>'; $('ctStep').innerHTML = '';
    $('ctNext').hidden = false; $('ctNext').textContent = 'Entendido'; $('ctNext').onclick = tutTipHide;
  }
  function tutTipHide() { const c = $('cartel'); c.hidden = true; c.classList.remove('tip'); }
  function tutSetup() {
    const L = tut.L;
    newGame('human', 'orc');
    G.teams[0].ctrl = new Human(0); G.teams[1].ctrl = new AI2(1);
    G.teams.forEach(t => { t.rerolls = L.rr || 0; t.rrMax = L.rr || 0; t.ff = 3; });
    G.phase = 'turn'; G.active = 0; G.turn = [1, 0]; G.half = 1; G.halfStart = false; G.first = 0; G.kicker = 1;
    tut.o = {}; L.setup(tut.o);
    ui.phase = 'turn'; ui.sel = null; ui.mode = 'move'; ui.busy = false; ui.pick = null; ui.moves = new Map(); ui.hl = null; ui.tutHl = null; ui.turnRes = () => {};
    tut.state = 'play'; tut.hlKey = null; tut.gen = (tut.gen || 0) + 1; tut.aiRun = false; tut.round = 1; ui.tutBands = !!L.bands;
    $('ctNext').hidden = true; $('ctRetry').textContent = 'Reiniciar';
    $('log').innerHTML = ''; ulog = []; card(null); resize(); refresh();
    msg('<b>Lección.</b> Sigue las indicaciones del cartel.');
    if (L.turns) { const g = tut.gen; (async () => { await playTurn(0, true); if (g === tut.gen) tutRounds(g); })(); }
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
    curMode = 'tutorial'; tut.on = true; hist = []; $('ctNext').textContent = 'Siguiente'; $('cartel').classList.remove('tip');
    document.body.classList.add('tut'); $('cartel').hidden = false;
    clearInterval(tut.timer); tut.timer = setInterval(tutStatus, 250);
    $('ctNext').onclick = () => { const r = tut.res; tut.res = null; if (r) r('next'); };
    $('ctRetry').onclick = () => { if (ui.busy || tut.aiRun) return; tutSetup(); };
    $('ctSkip').onclick = () => { if (tut.aiRun) return; const r = tut.res; tut.res = null; if (r) r('next'); };
    $('ctExit').onclick = () => { if (tut.aiRun) return; const r = tut.res; tut.res = null; if (r) r('exit'); };
    $('ctHide').onclick = () => { $('cartel').classList.toggle('xmin'); };
    $('cartel').classList.toggle('xmin', document.body.classList.contains('mob'));
    let i = 0, out = 'done';
    while (i < LESSONS.length) { const r = await runLesson(i); if (r === 'exit') { out = 'exit'; break; } i++; }
    if (out === 'done') {
      clearInterval(tut.timer); tut.on = false; ui.tutHl = null; ui.tutBands = false; document.body.classList.remove('tut'); $('cartel').hidden = true;
      const go = await ask('<h2>¡A jugar medio tiempo!</h2><p>Ya viste lo básico. Ahora juegas <b>una mitad completa</b> (8 turnos) contra la IA: Humanos contra Orcos. Primero elegirás tu formación y se hará la patada inicial. Si dudas, la barra de aviso te dice qué toca.</p>', [{ label: 'Empezar', value: true, primary: true }, { label: 'Volver al menú', value: false }]);
      if (go) {
        curMode = 'tutorial'; await playMatch('human', 'orc', null, false, true); tutTipHide();
        const a = G.teams[0].score, b = G.teams[1].score;
        await ask(`<h2>${a > b ? '¡Buen partido, ganaste!' : a < b ? 'Perdiste, pero así se aprende' : 'Empate'}</h2><p>${G.teams[0].name} ${a}, ${G.teams[1].name} ${b}. Ya puedes jugar el Torneo de Campeones o un partido rápido.</p><p><b>Para llevarte:</b> ${TIPS_END.map(q => `<b>${q.t}.</b> ${q.x}`).join(' ')}</p>`, [{ label: 'Volver al menú', value: 1, primary: true }]);
      }
      return out;
    }
    clearInterval(tut.timer); tut.on = false; ui.tutHl = null;
    ui.phase = 'idle'; ui.sel = null; ui.tutBands = false; refresh();
    document.body.classList.remove('tut'); $('cartel').hidden = true;
    return out;
  }
