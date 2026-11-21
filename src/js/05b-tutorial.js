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

  /* guía de dados de bloqueo (cartel y glosario) */
  const DICE_INFO = [
    ['skull', 'Atacante cae', 'El atacante cae. Es turnover.', '1 de 6'],
    ['both', 'Ambos caen', 'Caen los dos. Es turnover para ti, salvo que tengas <i>Block</i> (entonces no caes). Si el rival tiene <i>Block</i>, tampoco cae.', '1 de 6'],
    ['push', 'Empujón', 'El rival retrocede una casilla. Nadie cae.', '2 de 6'],
    ['stumble', 'Tropiezo', 'Empujón, y el rival cae salvo que tenga <i>Dodge</i>.', '1 de 6'],
    ['pow', '¡POW!', 'El rival es empujado y cae.', '1 de 6']
  ];
  const diceStrip = () => '<div class="dg">' + DICE_INFO.map(d => `<div><img src="${ASSETS['d_' + d[0]]}" alt="">${d[1]}</div>`).join('') + '</div>';
  const diceGlossary = () => '<h2>Los dados de bloqueo</h2><table><tr><th></th><th>Cara</th><th>Qué pasa</th><th class="n">Por dado</th></tr>' + DICE_INFO.map(d => `<tr><td><img src="${ASSETS['d_' + d[0]]}" alt="" width="30" height="30" style="image-rendering:pixelated"></td><td>${d[1]}</td><td>${d[2]}</td><td class="n">${d[3]}</td></tr>`).join('') + '</table>' +
    '<p><b>Cuántos dados se tiran</b> (se comparan las Fuerzas, con las asistencias ya sumadas):</p><table><tr><td>Fuerzas iguales</td><td>1 dado</td><td>eliges tú</td></tr><tr><td>Atacante más fuerte</td><td>2 dados</td><td>eliges tú</td></tr><tr><td>Atacante con más del doble</td><td>3 dados</td><td>eliges tú</td></tr><tr><td>Atacante más débil</td><td>2 dados</td><td>elige el rival</td></tr><tr><td>Atacante con menos de la mitad</td><td>3 dados</td><td>elige el rival</td></tr></table>' +
    '<p><b>Riesgo de turnover</b> por bloqueo (cae el atacante), sin reroll. Primero evita la calavera, después busca derribar:</p><table><tr><th></th><th class="n">Sin Block</th><th class="n">Con Block</th></tr><tr><td>3 dados, eliges tú</td><td class="n">1 de 27</td><td class="n">1 de 200</td></tr><tr><td>2 dados, eliges tú</td><td class="n">1 de 9</td><td class="n">1 de 36</td></tr><tr><td>1 dado</td><td class="n">1 de 3</td><td class="n">1 de 6</td></tr><tr><td>2 dados, elige el rival</td><td class="n">5 de 9</td><td class="n">3 de 10</td></tr><tr><td>3 dados, elige el rival</td><td class="n">7 de 10</td><td class="n">2 de 5</td></tr></table>' +
    '<p class="sub">Esquivar y recoger: tiras un dado de 6 y necesitas tu Agilidad o más. Cada rival que marque la casilla de destino suma 1 al número que necesitas. Un 6 siempre sale bien y un 1 siempre falla.</p>';
  /* formaciones y demostraciones: se ven armadas en la cancha, con un selector en el cartel */
  const FORM_RULES = 'Al armar la formación se exige tener <b>al menos 3 jugadores en la línea de scrimmage</b> (si tienes) y <b>no más de 2 en cada banda lateral</b> (las franjas de arriba y abajo).';
  const clearT = ti => { for (const p of G.teams[ti].players) if (p.loc === 'pitch') { p.loc = 'reserve'; p.x = p.y = -1; p.state = 'standing'; } };
  function showForm(kind, key) {
    const att = kind === 'att'; clearT(0); clearT(1); autoSetup(1, att);   // si yo ataco, los orcos patean
    if (FORMS[kind][key].slots) planSetup(0, !att, key); else autoSetup(0, !att);
    G.ball.carrier = null; G.ball.x = G.ball.y = -1; refresh(); draw();
  }
  /* demostración con posiciones a mano: humanos, orcos (si no se da, los orcos reciben con su formación normal) */
  function demo(hum, orc) {
    clearT(0); clearT(1); if (orc) orc.forEach(([x, y]) => TPx(1, x, y)); else autoSetup(1, false);
    hum.forEach(([x, y]) => TPx(0, x, y)); G.ball.carrier = null; G.ball.x = G.ball.y = -1; refresh(); draw();
  }
  const formItems = (kind, keys, notes) => keys.map(k => ({ k, name: FORMS[kind][k].name, note: notes[k], show: () => showForm(kind, k) }));
  const INFO_ATT = { items: formItems('att', ['front', 'cage', 'spread', 'flank'], {
    front: 'Todos al frente para pegar en el primer turno. Buena si tu equipo pega más fuerte que el rival.',
    cage: 'Cinco al frente y el resto cerca del portador. La más segura para controlar el balón.',
    spread: 'Línea abierta y receptores en las bandas. Para equipos de pase y velocidad, con más riesgo.',
    flank: 'Ocho jugadores cargan por una banda (la del lado con menos rivales). Rápida.' }),
    tip: 'si dudas, <b>Cage lento</b>. Con un equipo veloz y buenos receptores, prueba <b>Abierto</b>. <b>Frente completo</b> solo si te sobra fuerza.' };
  const INFO_DEF = { items: formItems('def', ['std', 'five', 'chev', 'zigg', 'bunk', 'mixed', 'wall', 'wide', 'open', 'deep'], {
    std: 'Tres en la línea, pantalla ancha a dos casillas y los valiosos atrás. Sirve casi siempre.',
    five: 'El "bote": tres al frente, tres en tercera línea y los cinco más valiosos protegidos. Muy sólida, pero cede las bandas.',
    chev: 'Línea corta al centro y una "V" detrás. Mezcla control, protección y reacción. Depende de que la línea aguante.',
    zigg: 'Como el chevron, con más control del medio campo. Deja sin protección al seguro de la tercera columna.',
    bunk: 'Protege varios seguros y deja solo cuatro expuestos, con control de las bandas. Buena en el primer turno.',
    mixed: 'Línea a un lado y fondo asimétrico. Buena si pateas con Kick y el rival no pasa bien. Se puede invertir.',
    wall: 'Todo compacto al centro. Fuerte de frente, débil por las bandas.',
    wide: 'Línea abierta: al rival le cuesta juntar asistencias, pero deja huecos.',
    open: 'Deja huecos para que no armen un cage. Los obliga a arriesgar el balón.',
    deep: 'Todos lejos del rival. Casi no hay bajas, pero cedes campo.' }),
    tip: 'si dudas, <b>Estándar</b> o el <b>bote</b> (Regla de cinco). Contra un equipo que pega mucho, <b>Retaguardia</b> evita regalar bajas. Contra un cage, <b>Medio abierto</b>. Los <b>búnkers</b> y el <b>chevron</b> son los más usados en el primer turno.' };
  const LOS3 = [[12, 6], [12, 7], [12, 8]];
  const INFO_PRIN = { items: [
    { k: 'line', name: 'Línea y espina', note: 'Todos en la misma fila con dos casillas vacías entre cada uno: sus zonas se tocan y se apoyan con asistencias. Cinco jugadores así (uno al centro, dos a 3 casillas y dos a 6) cubren todo el ancho: es la "espina" de la cancha. En las bandas, no te extiendas si el último jugador se puede empujar fácilmente.', show: () => demo(LOS3.concat([[9, 1], [9, 4], [9, 7], [9, 10], [9, 13]])) },
    { k: 'trap', name: 'Trampa', note: 'Parejas en diagonal. Cubren el mismo ancho que la línea y protegen a quien queda detrás, pero el jugador de adelante está solo si le hacen blitz: nadie lo asiste. Es la base del chevron.', show: () => demo(LOS3.concat([[9, 1], [8, 2], [9, 4], [8, 5], [9, 7], [8, 8], [9, 10], [8, 11]])) },
    { k: 'stack', name: 'Columna', note: 'Parejas una detrás de otra. Es la más difícil de abrir a empujones, pero cubre una casilla menos de ancho, y el de atrás no puede proteger ni vengar al de adelante.', show: () => demo(LOS3.concat([[9, 2], [8, 2], [9, 5], [8, 5], [9, 8], [8, 8], [9, 11], [8, 11]])) },
    { k: 'buddy', name: 'Compañeros', note: 'Que ningún jugador expuesto quede sin un compañero con zona sobre él. Si le hacen blitz y lo sacan, el compañero puede devolver el golpe y el rival se queda con menos opciones. Es una guía, no una regla.', show: () => demo(LOS3.concat([[10, 3], [9, 4], [10, 7], [9, 8], [10, 11], [9, 12]])) }],
    tip: 'una pantalla son dos compañeros con no más de dos casillas vacías entre ellos, de modo que sus zonas se tocan. <b>Un jugador marcado por un rival no cuenta como parte de la pantalla</b>, porque lo pueden tumbar o empujar. Pregúntate siempre: si le hacen blitz a este, ¿qué pasa?' };
  const ORC_BACK = [[16, 5], [16, 7], [16, 9]];
  const INFO_LOS = { items: [
    { k: '101', name: 'Línea 101', note: 'Los tres pegados al centro: la mejor forma de concentrar fuerza y evitar trucos. Para atacarla: un bloqueador frente a cada uno y un jugador de apoyo en cada extremo. Haz un primer golpe por un costado; cuando cae o es empujado, el que golpeó asiste al del medio.', show: () => demo([[12, 5], [12, 6], [12, 7], [12, 8], [12, 9], [10, 6], [10, 7], [10, 8]], [[13, 6], [13, 7], [13, 8]].concat(ORC_BACK)) },
    { k: '202', name: 'Línea 202', note: 'Dos huecos entre cada uno. La ven mucho los novatos y suele ser un error: le da al atacante el máximo de apoyo en cada bloqueo de línea y no controla más territorio.', show: () => demo([[12, 4], [12, 5], [12, 6], [12, 7], [12, 8], [12, 9], [12, 10], [10, 7]], [[13, 5], [13, 7], [13, 9]].concat(ORC_BACK)) },
    { k: '303', name: 'Línea 303', note: 'La más ancha: cubre más cancha, pero los tres quedan separados. Se puede rodear y bloquear a cada uno por su lado. Cuidado con gastar demasiados jugadores en bloqueos de 3 dados solo porque se puede.', show: () => demo([[12, 4], [12, 5], [12, 7], [12, 8], [12, 9], [12, 10], [10, 7]], [[13, 4], [13, 7], [13, 10]].concat(ORC_BACK)) }],
    tip: 'bloquea a los tres de la línea con <b>2 dados como mínimo</b>, mejor con jugadores con <i>Block</i>. Si hay un rival fuerte que no quieres bloquear, deja un jugador "de sacrificio" marcándolo, por si sale <b>Blitz</b>. En la patada, <b>Defensa sólida</b> y <b>Blitz</b> salen 1 de cada 12 y <b>Saque rápido</b> 1 de cada 9: no dejes un camino directo al centro de tu campo.' };
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
      done: 'Rodear al rival antes de pegarle es la base del juego: más dados, mejores resultados y menos riesgo. Ojo: un compañero tocado por otro rival no asiste. En una piña, los apoyos iniciales son los que tocan a un solo rival, casi siempre en los extremos.' },
    { title: 'Los dados de bloqueo', soft: true, rr: 0,
      intro: () => 'Cada bloqueo tira dados especiales con 5 caras. ' + diceStrip() + 'Dos cosas deciden el resultado: <b>qué cara sale</b> y <b>cuántos dados</b> tiras (según la Fuerza de cada uno, ya con asistencias). Si tiras más de uno, <b>elige quien tenga más Fuerza</b>. Tienes el resumen siempre en el botón <b>Dados</b>.',
      setup(o) {
        o.A1 = TP(0, 'human_lineman', 5, 7); o.E1 = TP(1, 'orc_lineman', 6, 7);
        o.A2 = TP(0, 'human_lineman', 5, 3); TP(0, 'human_lineman', 6, 2); o.E2 = TP(1, 'orc_lineman', 6, 3);
        o.A3 = TP(0, 'human_lineman', 5, 11); o.E3 = TP(1, 'orc_lineman', 6, 11); TP(1, 'orc_lineman', 6, 12);
      },
      steps: [
        { t: '<b>1 dado.</b> Tu Línea (Fuerza 3) contra el orco (Fuerza 3): igualdad, 1 dado y decides tú si te sirve. Selecciónalo, haz clic en el orco y elige <b>Bloquear</b>. (Si el turno se termina por un turnover, aprieta <b>Repetir</b>.)', hl: o => [[o.A1.x, o.A1.y], [o.E1.x, o.E1.y]], ok: o => o.A1.started },
        { t: '<b>2 dados, eliges tú.</b> Arriba, un compañero marca al orco y te da una asistencia: 4 contra 3. Tiras 2 dados y haces clic en el que prefieras: <b>Empujón</b> o <b>POW</b> si puedes, evita <b>Atacante cae</b>.', hl: o => [[o.A2.x, o.A2.y], [o.E2.x, o.E2.y]], ok: o => o.A2.started },
        { t: '<b>2 dados, elige el rival.</b> Abajo, el orco tiene un compañero que te marca: 3 contra 4. Tiras 2 dados, pero <b>el rival elige</b> el peor para ti. Es un bloqueo que normalmente se evita. Hazlo solo para verlo.', hl: o => [[o.A3.x, o.A3.y], [o.E3.x, o.E3.y]], ok: o => o.A3.started }],
      done: 'Antes de bloquear mira cuántos dados tiras y quién elige. Con 2 dados a tu favor, el riesgo baja mucho; con 2 dados en contra, mejor busca otro bloqueo. <b>Regla de oro:</b> primero evita la calavera (Atacante cae y Ambos caen), después busca derribar. Caerte es turnover y pierdes el resto del turno. El botón <b>Dados</b> tiene la tabla de riesgo.' },
    { title: 'Esquivar (dodge)', soft: true, rr: 1,
      intro: 'Un jugador que está al lado de un rival está <b>marcado</b>. Si se mueve a otra casilla, tiene que <b>esquivar</b>: tira un dado y necesita su <b>Agilidad (AG)</b> o más. Cada rival que marque la <b>casilla de destino</b> suma 1 al número que necesitas. Si falla, cae y es turnover. Un 6 siempre sale bien y un 1 siempre falla. El juego te muestra el número en cada casilla.',
      setup(o) {
        o.R = TP(0, 'human_lineman', 10, 7); TP(1, 'orc_lineman', 11, 7); TP(1, 'orc_lineman', 8, 5);
        o.L2 = TP(0, 'human_lineman', 10, 11); TP(1, 'orc_lineman', 11, 11); TP(1, 'orc_lineman', 8, 10);
      },
      steps: [
        { t: 'El orco marca a tu Línea de arriba. Selecciónalo y mira los números de las casillas: las doradas necesitan <b>3+</b> (su AG); la de la esquina necesita <b>4+</b> porque queda junto a otro orco. Haz clic en una dorada y confirma el riesgo. Si falla, el juego te ofrece un <b>reroll de equipo</b>.', hl: () => [[9, 7], [9, 8]], ok: o => o.R.started && (o.R.x !== 10 || o.R.y !== 7) },
        { t: 'Ahora el Línea de abajo: tiene un orco al lado y otro cerca. La única casilla que queda libre de marcas es la dorada (<b>3+</b>); las demás piden 4+ o más. <b>Mira los números antes de elegir</b> y haz clic en la dorada.', hl: () => [[9, 12]], ok: o => o.L2.started && (o.L2.x !== 10 || o.L2.y !== 11) }],
      done: 'Salir de una marca cuesta una tirada. Antes de esquivar piensa si hay otra opción: bloquear al marcador, o dejar al jugador donde está y mover a otros. Y siempre elige el destino con el número más bajo.' },
    { title: 'Skills clave', soft: true, rr: 0,
      intro: 'Las <b>habilidades (skills)</b> cambian las reglas para un jugador. Cinco que verás todo el tiempo: <b>Block</b> (no cae con "Ambos caen"), <b>Dodge</b> (repite una esquivada fallida, una vez por turno, y no cae con "Tropiezo"), <b>Sure Hands</b> (repite una recogida fallida), <b>Catch</b> (repite una atrapada fallida) y <b>Pass</b> (repite un pase fallido). Se usan solas, sin gastar reroll de equipo. <b>Block</b> es el rey: 2 dados con Block fallan 1 de cada 36, más seguro que 3 dados sin Block (1 de 27).',
      setup(o) { o.C = TP(0, 'human_catcher', 10, 5); TP(1, 'orc_lineman', 11, 5); o.T = TP(0, 'human_thrower', 8, 7); o.B = TP(0, 'human_blitzer', 8, 9); },
      steps: [
        { t: 'Selecciona al <b>Receptor</b> y mira su ficha: tiene <b>Catch</b> y <b>Dodge</b>. Atrapa mejor los pases y esquiva con un reintento.', hl: o => [[o.C.x, o.C.y]], ok: o => o.seen.has(o.C) },
        { t: 'Ahora el <b>Lanzador</b>: tiene <b>Pass</b> y <b>Sure Hands</b>. Es el que debería llevar el balón y pasar.', hl: o => [[o.T.x, o.T.y]], ok: o => o.seen.has(o.T) },
        { t: 'Y el <b>Blitzer</b>: tiene <b>Block</b> (y Tackle). Es el mejor para el Blitz, porque "Ambos caen" no lo tumba.', hl: o => [[o.B.x, o.B.y]], ok: o => o.seen.has(o.B) },
        { t: 'Ahora pon a prueba el <b>Dodge</b>: mueve al Receptor (marcado por el orco) a cualquier casilla y mira qué pasa si falla la esquivada: <b>repite solo</b>, sin gastar reroll.', hl: o => [[o.C.x, o.C.y]], ok: o => o.C.started && (o.C.x !== 10 || o.C.y !== 5) }],
      done: 'Mira siempre la ficha del jugador antes de decidir. Una habilidad bien aprovechada vale más que un reroll: da una segunda oportunidad gratis.' },
    { title: 'Elegir el bloqueo seguro', soft: true, rr: 0,
      intro: 'Casi nunca tienes un solo bloqueo posible. Antes de tirar, <b>compara</b> y elige el de menor riesgo: más dados a tu favor, menos dados en contra. Aquí hay <b>tres bloqueos posibles</b> contra tres orcos, todos con tus Líneas (sin <i>Block</i>). Haz solo <b>uno</b>: el más seguro.',
      setup(o) {
        o.A1 = TP(0, 'human_lineman', 5, 3); o.E1 = TP(1, 'orc_lineman', 6, 3);
        o.A2 = TP(0, 'human_lineman', 5, 7); TP(0, 'human_lineman', 6, 6); o.E2 = TP(1, 'orc_lineman', 6, 7);
        o.A3 = TP(0, 'human_lineman', 5, 11); o.E3 = TP(1, 'orc_lineman', 6, 11); TP(1, 'orc_lineman', 6, 12);
      },
      steps: [
        { t: 'Mira cuántos dados saldría en cada uno (el juego te lo dice al elegir <b>Bloquear</b>, y también quién decide el dado) y haz el <b>más seguro</b>. Pista: cuenta las asistencias de cada lado.', hl: o => [[o.A1.x, o.A1.y], [o.A2.x, o.A2.y], [o.A3.x, o.A3.y]], ok: o => o.A1.started || o.A2.started || o.A3.started }],
      judge: o => o.A2.started ? null : '<b class="ct-bad">Había uno mejor.</b> ' + (o.A1.started ? 'Arriba era 1 dado (3 contra 3): falla 1 de cada 3.' : 'Abajo eran 2 dados en contra (3 contra 4, elige el rival): falla 5 de cada 9.') + ' El del medio tenía una asistencia a favor: 2 dados que eliges tú, falla 1 de cada 9. Reintenta y compara antes de bloquear.',
      done: 'Eso es leer la cancha: <b>2 dados que eliges tú</b> (1 de 9 de turnover) contra 1 dado (1 de 3) o 2 dados en contra (5 de 9). Antes de cada bloqueo pregúntate: ¿hay otro con más dados o más asistencias? Y si puedes, haz primero los más seguros.' },
    { title: 'Seguir o no seguir', soft: true, rr: 0,
      intro: 'Cuando <b>empujas</b> a un rival, el juego te pregunta si quieres <b>seguirlo</b> (ocupar su casilla). No es gratis: seguir te acerca, pero te deja pegado a sus compañeros. La regla práctica: <b>si lo derribaste, síguelo</b> (puedes bloquearlo otra vez si se levanta); <b>si solo lo empujaste, quédate</b>, salvo que vayas a apoyar otro bloqueo.',
      setup(o) { o.A = TP(0, 'human_lineman', 10, 7); TP(0, 'human_lineman', 11, 6); TP(0, 'human_lineman', 10, 8); o.E = TP(1, 'orc_lineman', 11, 7); TP(1, 'orc_lineman', 13, 6); TP(1, 'orc_lineman', 13, 8); o.followed = undefined; },
      steps: [
        { t: 'Bloquea al orco con tu Línea de la izquierda (2 dados). Si sale <b>Empujón</b>, <b>Tropiezo</b> o <b>POW</b>, el juego te preguntará si seguir: decide con la regla del cartel. (Si el turno se acaba por un turnover, aprieta <b>Repetir</b>.)', hl: o => [[o.A.x, o.A.y], [o.E.x, o.E.y]], ok: o => o.A.started }],
      done: o => {
        const fell = o.E.loc !== 'pitch' || o.E.state !== 'standing', f = o.followed;
        if (f === undefined) return 'No hubo empujón, así que no hubo qué decidir. Aprieta <b>Repetir</b> para probar otra vez. Recuerda: derribado, síguelo; solo empujado, quédate.';
        if (fell) return f ? 'Bien: el orco quedó en el suelo y lo seguiste. Si se levanta, lo bloqueas de nuevo con ventaja, y mientras está tumbado no te puede bloquear.' : 'El orco quedó en el suelo: podías haberlo <b>seguido</b>, es gratis. Así, si se levanta, ya estás pegado para bloquearlo otra vez.';
        return f ? 'Seguiste a un orco que sigue de pie: ahora te puede bloquear a ti, sin tus compañeros cerca. Solo conviene si vas a apoyar a otro bloqueo.' : 'Bien: solo lo empujaste y te quedaste con tus compañeros. Así mantienes las asistencias y no le regalas un bloqueo.';
      } },
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
    ,
    { title: 'La línea de scrimmage', info: INFO_LOS, intro: 'La <b>línea de scrimmage</b> es la fila pegada al centro. Quien patea debe poner al menos 3 jugadores ahí, y se nombran por su separación: <b>101</b> (pegados), <b>202</b> y <b>303</b> (lo más abiertos posible). Aquí ves cómo se arma tu ataque contra cada una, <b>en la cancha</b>: toca una para verla.', steps: [], setup() {}, done: '' },
    { title: 'Formaciones de ataque', info: INFO_ATT, intro: 'Una formación es cómo ubicas a tus 11 jugadores antes de la patada. Aquí tienes las de ataque que ofrece el juego, <b>armadas en la cancha</b>: toca una para verla. Cuando <b>recibes</b>, la formación decide si podrás armar un cage, pasar o pegar. ' + FORM_RULES, steps: [], setup() {}, done: '' },
    { title: 'Principios de defensa', info: INFO_PRIN, intro: 'Casi toda defensa se basa en la <b>pantalla</b>: dos compañeros con no más de dos casillas vacías entre ellos, de modo que sus zonas de defensa se tocan o se cruzan. Hay tres formas de combinarlas, más la regla de los compañeros. Toca cada una para verla <b>en la cancha</b>.', steps: [], setup() {}, done: '' },
    { title: 'Formaciones de defensa', info: INFO_DEF, intro: 'Aquí ves las defensas que ofrece el juego, <b>armadas en la cancha</b>: toca una para verla. Cuando <b>pateas</b>, la formación decide cuánto campo cedes y qué tan difícil es llegar al portador. ' + FORM_RULES, steps: [], setup() {}, done: '' }
  ];

  function lessonSteps() { const L = tut.L; return L.steps.map(s => ({ s, ok: !!s.ok(tut.o) })); }
  function tutStatus() {
    if (!tut.on || tut.state !== 'play' || ui.busy) return;
    const L = tut.L;
    if (ui.sel) tut.o.seen.add(ui.sel);
    if (L.info) {
      const I = L.info, k = tut.fKey || I.items[0].k;
      if (tut.fShown !== k) {
        tut.fShown = k; const it = I.items.find(x => x.k === k);
        $('ctStep').innerHTML = '<div class="fch">' + I.items.map(x => `<button data-f="${x.k}" class="${x.k === k ? 'on' : ''}">${x.name}</button>`).join('') + `</div><div><b>${it.name}.</b> ${it.note}</div><div style="margin-top:4px"><b>Recomendación:</b> ${I.tip}</div><div class="ct-sub">Cuando termines, aprieta Siguiente.</div>`;
      }
      $('ctNext').hidden = false; return;
    }
    if (L.turns) {
      if (ui.phase !== 'turn' || tut.aiRun) return;
      $('ctStep').innerHTML = `<b>Turno ${tut.round} de ${L.turns}.</b> ${L.turnText(tut.o, tut.round)}<div class="ct-sub">¿Te trabaste? Aprieta Reiniciar.</div>`;
      const h = L.hl(tut.o, tut.round), k = JSON.stringify(h);
      if (tut.hlKey !== k) { tut.hlKey = k; ui.tutHl = h; draw(); }
      return;
    }
    const st = lessonSteps();
    const cur = st.findIndex(x => !x.ok);
    if (cur === -1) { const v = L.judge && L.judge(tut.o); if (v) tutEnd('fail', v); else tutEnd('won'); return; }
    if (ui.phase !== 'turn') { tutEnd(L.soft && st.some(x => x.ok) ? 'won' : 'lost'); return; }
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
      $('ctStep').innerHTML = `<b class="ct-ok">${G.turnover ? 'Hubo turnover, pero ya viste cómo funciona.' : '¡Muy bien!'}</b> ${typeof tut.L.done === 'function' ? tut.L.done(tut.o) : tut.L.done}`;
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
    tut.o = { seen: new Set() }; L.setup(tut.o);
    ui.phase = 'turn'; ui.sel = null; ui.mode = 'move'; ui.busy = false; ui.pick = null; ui.moves = new Map(); ui.hl = null; ui.tutHl = null; ui.turnRes = () => {};
    tut.state = 'play'; tut.hlKey = null; tut.gen = (tut.gen || 0) + 1; tut.aiRun = false; tut.round = 1; ui.tutBands = !!L.bands;
    $('ctNext').hidden = true; $('ctRetry').textContent = 'Reiniciar';
    $('log').innerHTML = ''; ulog = []; card(null); resize(); refresh();
    msg('<b>Lección.</b> Sigue las indicaciones del cartel.');
    if (L.turns) { const g = tut.gen; (async () => { await playTurn(0, true); if (g === tut.gen) tutRounds(g); })(); }
    if (L.info) { ui.phase = 'idle'; tut.fShown = null; tut.fKey = L.info.items[0].k; L.info.items[0].show(); msg('<b>Demostración.</b> Toca una opción en el cartel para verla en la cancha.'); }
    tutStatus();
  }
  function tutCartel() {
    const L = tut.L;
    $('ctK').textContent = `Lección ${tut.i + 1} de ${LESSONS.length}`;
    if (!document.body.classList.contains('mob')) $('cartel').classList.remove('xmin');
    $('ctT').textContent = L.title; $('ctX').innerHTML = typeof L.intro === 'function' ? L.intro() : L.intro;
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
    $('ctStep').onclick = e => { const b = e.target.closest('button[data-f]'); if (b && tut.L && tut.L.info) { const it = tut.L.info.items.find(x => x.k === b.dataset.f); if (it) { tut.fKey = it.k; tut.fShown = null; it.show(); if (!document.body.classList.contains('mob')) $('cartel').classList.add('xmin'); } } };
    $('ctGlos').onclick = () => { if (ui.busy || tut.aiRun) return; ask(diceGlossary(), [{ label: 'Cerrar', value: 1, primary: true }], true); };
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
